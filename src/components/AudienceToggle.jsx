import { AUDIENCES } from '../content.js'

export default function AudienceToggle({ audience, setAudience, size = 'md' }) {
  const pad = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-5 py-2.5 text-sm'
  return (
    <div
      role="tablist"
      aria-label="Pilih segmen"
      className="inline-flex rounded-full border border-paper-line bg-white p-1 shadow-sm"
    >
      {Object.values(AUDIENCES).map((a) => {
        const active = audience === a.id
        return (
          <button
            key={a.id}
            role="tab"
            aria-selected={active}
            onClick={() => setAudience(a.id)}
            className={`${pad} rounded-full font-semibold transition-colors ${
              active
                ? 'bg-ink text-white'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            {size === 'sm' ? a.short : a.label}
          </button>
        )
      })}
    </div>
  )
}
