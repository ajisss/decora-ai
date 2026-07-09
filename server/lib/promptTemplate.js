const VENUE_LABELS = {
  'indoor ballroom': 'an elegant indoor ballroom',
  'garden / outdoor': 'an outdoor garden venue',
  beach: 'a beachfront venue',
  rooftop: 'a rooftop venue',
  'traditional hall': 'a traditional hall',
  'tent / marquee': 'a tent or marquee venue',
}

const SIZE_LABELS = {
  small: 'an intimate scale',
  medium: 'a medium scale',
  large: 'a grand, large scale',
}

const BUDGET_LABELS = {
  economy: 'simple, tasteful, and cost-conscious',
  standard: 'polished and well-appointed',
  premium: 'premium and lavish',
  luxury: 'ultra-luxurious, no expense spared',
}

function lookup(map, value) {
  return map[value?.toLowerCase()] ?? value
}

function venueLabel(venueType) {
  return lookup(VENUE_LABELS, venueType)
}

function sizeLabel(venueSize) {
  return lookup(SIZE_LABELS, venueSize)
}

function budgetLabel(budgetTier) {
  return lookup(BUDGET_LABELS, budgetTier)
}

// Pure function: wizard setup -> natural-language image generation prompt.
// Deterministic string assembly, not an LLM call (see plan.md Design Principles).
export function compilePrompt(setup) {
  const {
    theme,
    style,
    venueType,
    venueSize,
    guestCapacity,
    budgetTier,
    colorPalette = [],
    notes,
  } = setup

  const parts = []

  parts.push(
    `A professional, photorealistic wedding decoration concept photo, ${theme} theme` +
      (style ? `, ${style} style` : '') +
      '.',
  )

  parts.push(
    `The venue is ${venueLabel(venueType)}, decorated at ${sizeLabel(venueSize)} for about ${guestCapacity} guests.`,
  )

  parts.push(`The overall look should feel ${budgetLabel(budgetTier)}.`)

  if (colorPalette.length > 0) {
    parts.push(`Color palette: ${colorPalette.join(', ')}.`)
  }

  if (notes && notes.trim()) {
    parts.push(notes.trim())
  }

  parts.push(
    'Show the full decorated space (stage or altar, seating, florals, lighting) in one wide establishing shot, no people, no text overlays.',
  )

  return parts.join(' ')
}
