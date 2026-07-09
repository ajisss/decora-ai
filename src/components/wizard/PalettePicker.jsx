import { useState } from 'react'

const CURATED = [
  { label: 'Gold + Sage', colors: ['#c9a04a', '#8a9a6e'] },
  { label: 'Blush + Ivory', colors: ['#e7b7bd', '#f5f0e6'] },
  { label: 'Burgundy + Gold', colors: ['#6b1f2a', '#c9a04a'] },
  { label: 'Sage + Cream', colors: ['#8a9a6e', '#f2ead9'] },
  { label: 'Navy + Blush', colors: ['#233a5e', '#e7b7bd'] },
  { label: 'Terracotta + Cream', colors: ['#c05f3c', '#f2ead9'] },
  { label: 'Emerald + Gold', colors: ['#2f5d4f', '#c9a04a'] },
  { label: 'Lavender + Silver', colors: ['#a793c7', '#cfd2d6'] },
]

const MAX_SELECTIONS = 3

// Multi-select swatch-pair chips + custom hex (ux-spec §6.1). Zero selections is valid.
export default function PalettePicker({ value = [], onChange }) {
  const [limitNote, setLimitNote] = useState(false)
  const [customOpen, setCustomOpen] = useState(false)
  const [customHex, setCustomHex] = useState('#')

  const toggle = (label) => {
    const set = new Set(value)
    if (set.has(label)) {
      set.delete(label)
      setLimitNote(false)
    } else if (set.size >= MAX_SELECTIONS) {
      setLimitNote(true)
      return
    } else {
      set.add(label)
      setLimitNote(false)
    }
    onChange([...set])
  }

  const addCustom = () => {
    if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(customHex)) return
    if (value.length >= MAX_SELECTIONS) {
      setLimitNote(true)
      return
    }
    onChange([...value, customHex])
    setCustomHex('#')
    setCustomOpen(false)
  }

  return (
    <div>
      <span className="mb-2 block text-sm font-medium text-ink-soft">Palet warna (opsional)</span>
      <div className="flex flex-wrap gap-2">
        {CURATED.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => toggle(p.label)}
            className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
              value.includes(p.label)
                ? 'border-clay bg-clay-soft text-clay-deep'
                : 'border-paper-line bg-paper text-ink-soft hover:border-ink/20 hover:text-ink'
            }`}
          >
            <span className="flex h-4 w-8 overflow-hidden rounded-sm">
              <span className="flex-1" style={{ background: p.colors[0] }} />
              <span className="flex-1" style={{ background: p.colors[1] }} />
            </span>
            {p.label}
          </button>
        ))}
        {value.filter((v) => v.startsWith('#')).map((hex) => (
          <button
            key={hex}
            type="button"
            onClick={() => onChange(value.filter((v) => v !== hex))}
            className="flex items-center gap-2 rounded-full border border-clay bg-clay-soft px-3 py-2 text-sm font-medium text-clay-deep"
          >
            <span className="h-4 w-4 rounded-full" style={{ background: hex }} />
            {hex}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setCustomOpen((o) => !o)}
          className="rounded-full border border-paper-line bg-paper px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-ink/20 hover:text-ink"
        >
          Kustom
        </button>
      </div>
      {customOpen && (
        <div className="mt-2 flex items-center gap-2">
          <input
            type="text"
            value={customHex}
            onChange={(e) => setCustomHex(e.target.value)}
            placeholder="#c05f3c"
            className="h-9 w-32 rounded-lg border border-paper-line bg-paper px-3 text-sm focus:border-clay focus:outline-none"
          />
          <button type="button" onClick={addCustom} className="btn-ghost !px-4 !py-1.5 text-xs">
            Tambah
          </button>
        </div>
      )}
      {limitNote && <p className="mt-1.5 text-xs text-ink-muted">Maksimal 3 warna biar desainnya tetap serasi.</p>}
    </div>
  )
}
