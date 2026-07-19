import { useRef } from 'react'
import { StepIcon } from '../icons.jsx'
import { content } from '../../content.js'

const t = content.app.studio

// Quick-switch strip under the canvas. Same versions array as the rail — this
// is a shortcut, not a second source of truth. Arrows appear only when the
// strip actually overflows, so they never sit there doing nothing.
export default function VersionFilmstrip({ generations, activeVersionId, onSelect, versionOf, onNewVersion }) {
  const scrollRef = useRef(null)

  if (generations.length === 0) return null

  const scrollBy = (delta) => scrollRef.current?.scrollBy({ left: delta, behavior: 'smooth' })
  const overflows = generations.length > 6

  return (
    <div className="flex max-w-full items-center gap-2 rounded-xl2 border border-paper-line bg-paper/95 p-2 shadow-lg backdrop-blur">
      {overflows && (
        <ArrowButton icon="chevronRight" flip label={t.filmstripPrev} onClick={() => scrollBy(-240)} />
      )}

      <div ref={scrollRef} className="flex flex-1 items-center gap-2 overflow-x-auto scroll-smooth">
        {generations.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => onSelect(g.id)}
            title={g.favoriteName || `${t.design} ${versionOf(g)}`}
            aria-pressed={g.id === activeVersionId}
            className={`relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
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
            {g.favorite && (
              <StepIcon name="star" className="absolute right-0.5 top-0.5 h-3 w-3 fill-clay text-clay drop-shadow" />
            )}
          </button>
        ))}
      </div>

      {overflows && <ArrowButton icon="chevronRight" label={t.filmstripNext} onClick={() => scrollBy(240)} />}

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

function ArrowButton({ icon, flip, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-paper-line bg-paper text-ink-soft hover:text-clay-deep"
    >
      <StepIcon name={icon} className={`h-3.5 w-3.5 ${flip ? 'rotate-180' : ''}`} />
    </button>
  )
}
