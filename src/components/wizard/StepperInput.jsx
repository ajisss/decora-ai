import { useState } from 'react'

// Number input with +/- steppers, free typing, clamp-on-blur (ux-spec §6.1, wireflow W4).
export default function StepperInput({ label, value, onChange, step = 50, min = 10, max = 5000 }) {
  const [clampedNote, setClampedNote] = useState(false)
  const [raw, setRaw] = useState(String(value))

  const commit = (n) => {
    const clamped = Math.min(max, Math.max(min, n))
    setClampedNote(clamped !== n)
    onChange(clamped)
    setRaw(String(clamped))
  }

  return (
    <div>
      {label && <span className="mb-2 block text-sm font-medium text-ink-soft">{label}</span>}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => commit(value - step)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-paper-line text-ink-soft transition-colors hover:border-ink/20 hover:text-ink"
          aria-label="Decrease"
        >
          −
        </button>
        <input
          type="text"
          inputMode="numeric"
          value={raw}
          onChange={(e) => setRaw(e.target.value.replace(/[^0-9]/g, ''))}
          onBlur={() => commit(Number(raw) || min)}
          className="h-9 w-24 rounded-lg border border-paper-line bg-paper text-center text-sm focus:border-clay focus:outline-none"
        />
        <button
          type="button"
          onClick={() => commit(value + step)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-paper-line text-ink-soft transition-colors hover:border-ink/20 hover:text-ink"
          aria-label="Increase"
        >
          +
        </button>
        <span className="text-sm text-ink-muted">tamu</span>
      </div>
      {clampedNote && <p className="mt-1.5 text-xs text-ink-muted">Dijaga antara {min} dan {max}.</p>}
    </div>
  )
}
