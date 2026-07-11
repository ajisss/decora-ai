// Labeled on/off pill switch (rounded-full, clay accent when on) — matches
// the pill-shaped interactive-element convention (DESIGN.md).
export default function Switch({ checked, onChange, label, hint, id }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        id={id}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-clay/40 ${
          checked ? 'bg-clay' : 'bg-paper-line'
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-[22px]' : 'translate-x-0'
          }`}
        />
      </button>
      <span className="text-sm">
        <span className="block font-medium text-ink-soft">{label}</span>
        {hint && <span className="block text-xs text-ink-muted">{hint}</span>}
      </span>
    </label>
  )
}
