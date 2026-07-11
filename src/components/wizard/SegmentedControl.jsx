// 2–4 segment single-select control (ux-spec §6.1, §6.4). Single shared impl —
// used by wizard fields and the Studio right-panel tabs alike, so the pill
// treatment (container radius, active shadow-sm) never diverges by screen.
export default function SegmentedControl({ label, options, value, onChange, helper, optionHelpers }) {
  const activeHelper = optionHelpers ? optionHelpers[value] : helper
  return (
    <div>
      {label && <span className="mb-2 block text-sm font-medium text-ink-soft">{label}</span>}
      <div className="inline-flex rounded-full border border-paper-line bg-paper-soft p-1">
        {options.map((opt) => {
          const optValue = typeof opt === 'string' ? opt : opt.value
          const optLabel = typeof opt === 'string' ? opt : opt.label
          return (
            <button
              key={optValue}
              type="button"
              onClick={() => onChange(optValue)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                value === optValue ? 'bg-paper text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
              }`}
            >
              {optLabel}
            </button>
          )
        })}
      </div>
      {activeHelper && <p className="mt-1.5 text-xs text-ink-muted">{activeHelper}</p>}
    </div>
  )
}
