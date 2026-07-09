import { useState } from 'react'

// Single/multi-select pill chips with a Custom option that reveals a text input
// (ux-spec §3.2, §6.1). `mode="single"` behaves like a radiogroup.
export default function ChipGroup({
  label,
  options,
  value,
  onChange,
  mode = 'single',
  allowCustom = false,
  customValue = '',
  onCustomChange,
  error,
}) {
  const [customOpen, setCustomOpen] = useState(Boolean(customValue))

  const isSelected = (opt) => (mode === 'single' ? value === opt : value?.includes(opt))

  const toggle = (opt) => {
    if (mode === 'single') return onChange(opt)
    const set = new Set(value ?? [])
    set.has(opt) ? set.delete(opt) : set.add(opt)
    onChange([...set])
  }

  return (
    <div>
      {label && <span className="mb-2 block text-sm font-medium text-ink-soft">{label}</span>}
      <div role={mode === 'single' ? 'radiogroup' : 'group'} className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            role={mode === 'single' ? 'radio' : undefined}
            aria-checked={mode === 'single' ? isSelected(opt) : undefined}
            aria-pressed={mode === 'multi' ? isSelected(opt) : undefined}
            onClick={() => toggle(opt)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              isSelected(opt)
                ? 'border-clay bg-clay-soft text-clay-deep'
                : 'border-paper-line bg-paper text-ink-soft hover:border-ink/20 hover:text-ink'
            }`}
          >
            {opt}
          </button>
        ))}
        {allowCustom && (
          <button
            type="button"
            onClick={() => {
              setCustomOpen(true)
              toggle('Custom…')
            }}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              customOpen
                ? 'border-clay bg-clay-soft text-clay-deep'
                : 'border-paper-line bg-paper text-ink-soft hover:border-ink/20 hover:text-ink'
            }`}
          >
            Custom…
          </button>
        )}
      </div>
      {allowCustom && customOpen && (
        <input
          type="text"
          value={customValue}
          onChange={(e) => onCustomChange(e.target.value)}
          placeholder="Tuliskan sendiri"
          className="mt-2 h-10 w-full rounded-lg border border-paper-line bg-paper px-3 text-sm focus:border-clay focus:outline-none focus-visible:ring-2 focus-visible:ring-clay/40"
        />
      )}
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  )
}
