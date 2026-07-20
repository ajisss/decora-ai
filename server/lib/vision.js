// Decoration analysis via kie.ai's OpenAI-compatible chat completions proxy
// (not the async jobs/createTask API used for image generation — this endpoint
// is synchronous, per https://kie.ai/gemini-2.5-flash — model: gemini-2.5-flash).
const CHAT_URL = 'https://api.kie.ai/gemini-2.5-flash/v1/chat/completions'

function apiKey() {
  const key = process.env.KIE_API_KEY
  if (!key) throw Object.assign(new Error('KIE_API_KEY is not configured'), { code: 'config' })
  return key
}

const TAXONOMY = [
  'Stage',
  'Backdrop',
  'Chairs',
  'VIP Chairs',
  'Tables',
  'Flowers',
  'Lighting',
  'Walkway',
  'Reception Desk',
  'Ceiling Decoration',
  'LED Screen',
  'Other',
]

// Note: this schema validator rejects union types (e.g. ["string", "null"]) —
// estimatedQuantity uses an empty string instead of null for "not applicable".
//
// `position`/`confidence` power the Design Canvas's object pins (Studio
// workspace) — approximate center point of the item in the photo, as a
// percentage of image width/height, plus the model's confidence 0-100.
// Older, already-saved analyses predate these fields and simply have no pin
// (the client only renders a pin when `position` is present) — no migration.
const ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          category: { type: 'string', enum: TAXONOMY },
          name: { type: 'string' },
          description: { type: 'string' },
          estimatedQuantity: { type: 'string' },
          confidence: { type: 'number' },
          position: {
            type: 'object',
            properties: { x: { type: 'number' }, y: { type: 'number' } },
            required: ['x', 'y'],
            additionalProperties: false,
          },
        },
        required: ['category', 'name', 'description', 'estimatedQuantity', 'confidence', 'position'],
        additionalProperties: false,
      },
    },
  },
  required: ['items'],
  additionalProperties: false,
}

// Note: same union-type restriction as above — estimatedCost uses 0 instead
// of null for "no reasonable estimate".
const ITEM_INSIGHT_SCHEMA = {
  type: 'object',
  properties: {
    suggestions: { type: 'array', items: { type: 'string' } },
    estimatedCost: { type: 'number' },
  },
  required: ['suggestions', 'estimatedCost'],
  additionalProperties: false,
}

async function parseError(res) {
  const body = await res.json().catch(() => null)
  const message = body?.msg ?? body?.error?.message ?? `Vision request failed (${res.status})`
  if (res.status === 401) return Object.assign(new Error(message), { code: 'config' })
  return Object.assign(new Error(message), { code: 'upstream' })
}

// Analyzes a decoration image into a structured item checklist via vision + JSON schema.
export async function analyzeImage(imageBuffer) {
  const b64 = imageBuffer.toString('base64')
  const res = await fetch(CHAT_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gemini-2.5-flash',
      messages: [
        {
          role: 'system',
          content:
            'You identify wedding decoration items in a photo. Only use these categories: ' +
            `${TAXONOMY.join(', ')}. Estimate quantities as approximate strings (e.g. "~300") ` +
            'or an empty string if not applicable. For each item, also give a confidence score ' +
            '0-100, and its approximate position as {x, y} percentages (0-100) of the image ' +
            "width/height, measured from the top-left, at the item's visual center. " +
            'Be concise. If nothing decoration-related is visible, return an empty items array.',
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'List the decoration items visible in this wedding concept image.' },
            { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
          ],
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'decoration_checklist', strict: true, schema: ANALYSIS_SCHEMA },
      },
    }),
  })
  if (!res.ok) throw await parseError(res)
  const data = await res.json()
  const parsed = extractJson(data?.choices?.[0]?.message?.content)
  // Normalize the empty-string convention back to null for the app's data model.
  parsed.items = (parsed.items ?? []).map((item) => ({
    ...item,
    estimatedQuantity: item.estimatedQuantity || null,
  }))
  return parsed
}

// Despite response_format enforcing json_schema, gemini-2.5-flash sometimes
// still wraps its output in a markdown code fence (```json ... ```) or adds
// stray prose before/after the JSON — strip a fence, then as a last resort
// extract the outermost {...} span, instead of treating it as malformed.
// Shared by analyzeImage and getItemInsight (same upstream quirk either way).
function extractJson(raw) {
  const fenceStripped = raw?.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim()
  const braceStart = fenceStripped?.indexOf('{')
  const braceEnd = fenceStripped?.lastIndexOf('}')
  const candidates = [fenceStripped]
  if (braceStart > -1 && braceEnd > braceStart) candidates.push(fenceStripped.slice(braceStart, braceEnd + 1))

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate)
    } catch {
      /* try the next candidate */
    }
  }
  // Logged (not surfaced to the user) so a Vercel-only parse failure can
  // actually be diagnosed instead of guessed at — this is the whole reason
  // decoration analysis kept failing in production while working locally.
  console.error('[vision] unparseable response:', JSON.stringify(raw)?.slice(0, 2000))
  throw Object.assign(new Error('Malformed analysis response'), { code: 'parse' })
}

// Per-item AI insight (Object Properties panel in the Design Workspace):
// a few short actionable suggestions plus a rough cost estimate, given the
// item's own detected fields and the project's wedding setup for context.
// Text-only (no image re-upload needed) — cheap, same chat-completions
// endpoint as analyzeImage. Not persisted server-side; the client decides
// whether to apply the estimate into the item's own estimatedCost field.
export async function getItemInsight(item, setup) {
  const contextLine = setup
    ? `Wedding context: theme ${setup.theme ?? '-'}, style ${setup.style ?? '-'}, venue ${setup.venueType ?? '-'}, budget tier ${setup.budgetTier ?? '-'}, guests ${setup.guestCapacity ?? '-'}.`
    : ''
  const res = await fetch(CHAT_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gemini-2.5-flash',
      messages: [
        {
          role: 'system',
          content:
            'You are a wedding decoration vendor advisor. Given one decoration item, give 2-3 short, ' +
            'concrete, actionable suggestions (alternatives, upgrades, or things to ask a vendor about) ' +
            'and a rough cost estimate in Indonesian Rupiah (a single number, no currency symbol/commas) ' +
            'for sourcing that item in Indonesia. Be concise, no more than one sentence per suggestion.',
        },
        {
          role: 'user',
          content:
            `Item: "${item.name}" (${item.category}). ${item.description ?? ''} ` +
            `Estimated quantity: ${item.estimatedQuantity ?? 'unknown'}. ${contextLine}`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'item_insight', strict: true, schema: ITEM_INSIGHT_SCHEMA },
      },
    }),
  })
  if (!res.ok) throw await parseError(res)
  const data = await res.json()
  const parsed = extractJson(data?.choices?.[0]?.message?.content)
  return { suggestions: parsed.suggestions ?? [], estimatedCost: parsed.estimatedCost || null }
}
