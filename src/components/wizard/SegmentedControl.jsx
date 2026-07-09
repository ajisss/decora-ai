// 2–4 segment single-select control (ux-spec §6.1, §6.4).
export default function SegmentedControl({ label, options, value, onChange, helper }) {
  return (
    <div>
      {label && <span className="mb-2 block text-sm font-medium text-ink-soft">{label}</span>}
      <div className="inline-flex rounded-full border border-paper-line bg-paper-soft p-1">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              value === opt ? 'bg-paper text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {helper && <p className="mt-1.5 text-xs text-ink-muted">{helper}</p>}
    </div>
  )
}
