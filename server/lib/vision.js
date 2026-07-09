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
        },
        required: ['category', 'name', 'description', 'estimatedQuantity'],
        additionalProperties: false,
      },
    },
  },
  required: ['items'],
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
            'or an empty string if not applicable. Be concise. If nothing decoration-related is visible, return an empty items array.',
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
  const raw = data?.choices?.[0]?.message?.content
  try {
    const parsed = JSON.parse(raw)
    // Normalize the empty-string convention back to null for the app's data model.
    parsed.items = (parsed.items ?? []).map((item) => ({
      ...item,
      estimatedQuantity: item.estimatedQuantity || null,
    }))
    return parsed
  } catch {
    throw Object.assign(new Error('Malformed analysis response'), { code: 'parse' })
  }
}
