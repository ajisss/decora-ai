import { test } from 'node:test'
import assert from 'node:assert/strict'
import { compilePrompt } from './promptTemplate.js'

const base = {
  theme: 'Rustic',
  style: '',
  venueType: 'Garden / outdoor',
  venueSize: 'Medium',
  guestCapacity: 200,
  budgetTier: 'Standard',
  colorPalette: [],
  notes: '',
}

test('includes theme and venue', () => {
  const prompt = compilePrompt(base)
  assert.match(prompt, /Rustic theme/)
  assert.match(prompt, /outdoor garden venue/)
  assert.match(prompt, /200 guests/)
})

test('omits style when empty', () => {
  const prompt = compilePrompt(base)
  assert.doesNotMatch(prompt, /, style/)
})

test('includes style when present', () => {
  const prompt = compilePrompt({ ...base, style: 'Romantic' })
  assert.match(prompt, /Romantic style/)
})

test('falls back to the raw label for a custom theme not in the curated maps', () => {
  const prompt = compilePrompt({ ...base, theme: 'Steampunk carnival', venueType: 'A rented warehouse' })
  assert.match(prompt, /Steampunk carnival theme/)
  assert.match(prompt, /venue is A rented warehouse/)
})

test('omits palette line when empty, includes it when present', () => {
  assert.doesNotMatch(compilePrompt(base), /Color palette/)
  const withPalette = compilePrompt({ ...base, colorPalette: ['Gold + Sage', '#c05f3c'] })
  assert.match(withPalette, /Color palette: Gold \+ Sage, #c05f3c\./)
})

test('appends trimmed notes', () => {
  const prompt = compilePrompt({ ...base, notes: '  lots of fairy lights  ' })
  assert.match(prompt, /lots of fairy lights/)
  assert.doesNotMatch(prompt, /  lots of fairy lights  /)
})

test('is case-insensitive when matching curated venue/size/budget labels', () => {
  const prompt = compilePrompt({ ...base, venueSize: 'medium', budgetTier: 'standard' })
  assert.match(prompt, /a medium scale/)
  assert.match(prompt, /polished and well-appointed/)
})

test('always ends with the no-people, no-text instruction', () => {
  const prompt = compilePrompt(base)
  assert.match(prompt, /no people, no text overlays\.$/)
})
