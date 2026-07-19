// Per-item "Item Editor" image generation — post-MVP feature (plan.md originally
// deferred this; user asked for it directly). Generates a standalone image for
// a single checklist item, styled consistently with its parent design.
//
// Shares the same MOCK_AI toggle as the main design generation (server/lib/mockAi.js)
// so there's a single on/off switch for "spend real credits" instead of two.
// When mocked, it fetches a real, freely-licensed stock photo per decoration
// category (Wikimedia Commons — cached in memory, falls back to the parent
// design's own image if the fetch fails) instead of calling Gemini.
const USE_MOCK = process.env.MOCK_AI === 'true'

// One real photo per taxonomy category (ux-spec §8.2's fixed list), sourced
// from Wikimedia Commons (freely licensed, stable hotlink via Special:FilePath).
// Categories without a clean dedicated match reuse the closest visual fit.
const MOCK_CATEGORY_IMAGES = {
  Stage: 'Wedding_stage_decoration_in_thrissur_kerala.jpg',
  Backdrop: 'Indoor_wedding_stage_decoration_in_Kerala.jpg',
  Chairs: 'Outdoor_Wedding_Chairs_2816px.jpg',
  Tables: 'Outdoor_Wedding_Chairs_2816px.jpg',
  Flowers: 'Tropical_flower_arrangement_wedding.jpg',
  Lighting: "(Venice)_Ca'_Rezzonico_ballroom_chandelier.jpg",
  Walkway: 'Wedding_stage_decoration_in_thrissur_kerala.jpg',
  'Reception Desk': 'Indoor_wedding_stage_decoration_in_Kerala.jpg',
  'Ceiling Decoration': "(Venice)_Ca'_Rezzonico_ballroom_chandelier.jpg",
  'LED Screen': 'Wedding_stage_decoration_in_thrissur_kerala.jpg',
  Other: 'Tropical_flower_arrangement_wedding.jpg',
}

const mockImageCache = new Map() // category -> Buffer, populated lazily

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Builds a prompt that demands fidelity to the parent design image rather
// than a loosely-inspired new photo — the item image should look like a
// close-up crop of the exact same piece, not a reinterpretation. Without an
// explicit "match the reference exactly" instruction, the model tends to
// treat the reference as a mood board and invent an unrelated stock-like
// photo instead (observed: random vendor watermarks bleeding through).
export function buildItemPrompt({ setup, item, customPrompt }) {
  const context = [
    setup?.theme && `${setup.theme} theme`,
    setup?.style,
    setup?.colorPalette?.length ? `color palette: ${setup.colorPalette.join(', ')}` : null,
  ]
    .filter(Boolean)
    .join(', ')

  const base = `Using the reference photo, isolate and re-render only the "${item.name}" (${item.category}) exactly as it appears there — same design, material, color, and details. Do not invent a new or different design.${
    context ? ` Wedding context: ${context}.` : ''
  } ${item.description ?? ''} Close-up product photo, plain neutral background, no people, no text, no watermark, no logo.`
    .replace(/\s+/g, ' ')
    .trim()
  return customPrompt?.trim() ? `${base} ${customPrompt.trim()}` : base
}

async function fetchMockImage(category, parentImageBuffer) {
  if (mockImageCache.has(category)) return mockImageCache.get(category)

  const filename = MOCK_CATEGORY_IMAGES[category] ?? MOCK_CATEGORY_IMAGES.Other
  const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=700`
  try {
    // The whole point of the mock is to be fast — never let a slow/rate-limited
    // third party make it feel like a real generation. 3s ceiling, then fall back.
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) })
    if (!res.ok) throw new Error(`fetch failed (${res.status})`)
    const buffer = Buffer.from(await res.arrayBuffer())
    mockImageCache.set(category, buffer)
    return buffer
  } catch {
    return parentImageBuffer // graceful fallback — never block the mock on a flaky network
  }
}

// Mock: a real category-relevant stock photo, cached after first fetch. Free,
// no kie.ai credits, but still shows a distinct, plausible image per item.
async function mockGenerate(category, parentImageBuffer) {
  await delay(1000 + Math.random() * 1000)
  return fetchMockImage(category, parentImageBuffer)
}

// Real: image-to-image using the parent design as the reference, so the item
// image is a close-up of that exact piece (same Gemini model as R3/R4, but
// with a square ratio — R3/R4 wants creative reinterpretation, this wants the
// opposite: minimal drift from the reference, which the prompt itself enforces).
async function realGenerate(prompt, parentImageBuffer) {
  const { editImage } = await import('./googleImage.js')
  return editImage(prompt, parentImageBuffer, 'image/png', { ratio: '1:1' })
}

export async function generateItemImage({ prompt, category, parentImageBuffer }) {
  if (USE_MOCK) return mockGenerate(category, parentImageBuffer)
  return realGenerate(prompt, parentImageBuffer)
}

export const ITEM_IMAGE_MOCK_ENABLED = USE_MOCK
