// Per-item "Item Editor" image generation — post-MVP feature (plan.md originally
// deferred this; user asked for it directly). Generates a standalone image for
// a single checklist item, styled consistently with its parent design.
//
// USE_MOCK is on by default: it fetches a real, freely-licensed stock photo
// per decoration category (Wikimedia Commons — cached in memory per category,
// falls back to the parent design's own image if the fetch fails) instead of
// calling kie.ai, so the pending/done UI can be built and demoed for free.
// Flip it to false once real credits are available — the real path is
// already wired to kie.ai's image-to-image model (same one used for R3/R4
// reference generation).
const USE_MOCK = true

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

// Builds a prompt that ties the item back to its parent design's theme/style/
// palette, so a regenerated item image stays visually consistent.
export function buildItemPrompt({ setup, item, customPrompt }) {
  const context = [
    setup?.theme && `${setup.theme} theme`,
    setup?.style,
    setup?.colorPalette?.length ? `color palette: ${setup.colorPalette.join(', ')}` : null,
  ]
    .filter(Boolean)
    .join(', ')

  const base = `A close-up product photo of "${item.name}" (${item.category}) for a wedding decoration, ${context}. ${item.description ?? ''}`.trim()
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
// image inherits its lighting/palette/style (same kie.ai model as R3/R4).
async function realGenerate(prompt, parentImageUrl) {
  const { editImage } = await import('./kie.js')
  return editImage(prompt, parentImageUrl)
}

export async function generateItemImage({ prompt, category, parentImageBuffer, parentImageUrl }) {
  if (USE_MOCK) return mockGenerate(category, parentImageBuffer)
  return realGenerate(prompt, parentImageUrl)
}

export const ITEM_IMAGE_MOCK_ENABLED = USE_MOCK
