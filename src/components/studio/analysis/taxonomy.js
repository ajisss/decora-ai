// Pure grouping helpers for decoration analysis. Lives on its own so both
// analysis surfaces — the Inspector's compact tree and the full Checklist &
// Brief panel — share one ordering/labelling source and can't drift apart.
// (Previously TAXONOMY_ORDER lived in AnalyzePanel.jsx, which forced the tree
// to import the panel just to read a constant.)

export const TAXONOMY_ORDER = [
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

// Groups items into taxonomy order, dropping empty categories. An optional
// query filters by item name (case-insensitive) before grouping, so a search
// that matches nothing collapses the whole tree rather than showing empty
// category headers.
export function groupItems(items, query = '') {
  const list = items ?? []
  const needle = query.trim().toLowerCase()
  const matching = needle ? list.filter((i) => i.name?.toLowerCase().includes(needle)) : list
  return TAXONOMY_ORDER.map((cat) => ({ cat, items: matching.filter((i) => i.category === cat) })).filter(
    (g) => g.items.length > 0,
  )
}

// M3: rough total from the cost field the user filled in — checked items only.
// Non-numeric characters are stripped because the field accepts free text.
export function sumIncludedCost(items) {
  return (items ?? [])
    .filter((i) => i.included && i.estimatedCost)
    .reduce((sum, i) => sum + (Number(String(i.estimatedCost).replace(/[^0-9]/g, '')) || 0), 0)
}
