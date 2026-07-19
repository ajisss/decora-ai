import { StepIcon } from '../icons.jsx'
import { content } from '../../content.js'

const t = content.app.studio

// Quick-switch strip under the canvas. Same versions array as the rail — this
// is a shortcut, not a second source of truth.
export default function VersionFilmstrip({ generations, activeVersionId, onSelect, versionOf, onNewVersion }) {
  if (generations.length === 0) return null

  return (
    <div className="flex shrink-0 items-center gap-2 border-t border-paper-line px-4 py-2">
      <div className="flex flex-1 items-center gap-2 overflow-x-auto">
        {generations.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => onSelect(g.id)}
            title={g.favoriteName || `${t.design} ${versionOf(g)}`}
            aria-pressed={g.id === activeVersionId}
            className={`h-12 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
              g.id === activeVersionId ? 'border-clay' : 'border-transparent hover:border-paper-line'
            }`}
          >
            {g.imageId ? (
              <img src={g.imageId} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-paper-soft">
                <StepIcon name="image" className="h-3.5 w-3.5 text-ink-muted" />
              </div>
            )}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onNewVersion}
        aria-label={t.generate}
        title={t.generate}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-dashed border-paper-line text-ink-muted transition-colors hover:border-clay/40 hover:text-clay-deep"
      >
        <StepIcon name="plus" className="h-4 w-4" />
      </button>
    </div>
  )
}
