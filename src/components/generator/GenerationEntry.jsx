import { useEffect, useState } from 'react'
import { StepIcon } from '../icons.jsx'
import { content } from '../../content.js'

const t = content.app.studio

function useElapsed(active) {
  const [seconds, setSeconds] = useState(0)
  useEffect(() => {
    if (!active) return
    setSeconds(0)
    const t = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [active])
  return seconds
}

function formatElapsed(s) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

// One card in the Studio feed: pending / done / error states (ux-spec §7.2).
export default function GenerationEntry({
  entry,
  index,
  total,
  onOpenLightbox,
  onAnalyze,
  onExport,
  onRetry,
  onCancel,
  onUseAsReference,
  isReference,
  isLatestDone,
  isBeingAnalyzed,
  onToggleFavorite,
  onToggleCompare,
  isCompareSelected,
}) {
  const versionNumber = total - index // oldest = 1, stable
  const elapsed = useElapsed(entry.status === 'pending')
  const [promptOpen, setPromptOpen] = useState(false)

  return (
    <div className="space-y-2">
      {entry.modificationNote && (
        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-2xl rounded-br-md bg-clay px-4 py-2.5 text-sm text-white sm:max-w-[70%]">
            {entry.modificationNote}
          </div>
        </div>
      )}
      <div className="flex items-start gap-2">
        <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-clay-soft text-clay-deep">
          <StepIcon name="spark" className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0 flex-1 rounded-xl2 rounded-tl-md border border-paper-line bg-paper p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm font-medium text-ink">
          {t.design} {versionNumber}
          {entry.favorite && <StepIcon name="star" className="h-3.5 w-3.5 fill-clay text-clay" />}
          {isBeingAnalyzed && (
            <span className="inline-flex items-center gap-1 rounded-full bg-clay-soft px-2 py-0.5 text-xs font-semibold text-clay-deep">
              <StepIcon name="checklist" className="h-3 w-3" />
              {t.analyzingBadge}
            </span>
          )}
        </span>
        <div className="flex items-center gap-2">
          {entry.status === 'done' && (
            <button
              type="button"
              onClick={() => onToggleFavorite(entry)}
              aria-label={entry.favorite ? content.app.favorite.remove : content.app.favorite.add}
              title={entry.favorite ? content.app.favorite.remove : content.app.favorite.add}
              className={entry.favorite ? 'text-clay' : 'text-ink-muted hover:text-clay'}
            >
              <StepIcon name="star" className={`h-4 w-4 ${entry.favorite ? 'fill-clay' : ''}`} />
            </button>
          )}
          <span className="text-xs text-ink-muted" title={new Date(entry.createdAt).toLocaleString()}>
            {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {entry.status === 'pending' && (
        <div>
          <div className="aspect-[4/3] animate-pulse rounded-lg bg-paper-soft" />
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-paper-soft">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-clay" />
          </div>
          <p className="mt-2 text-xs text-ink-muted">{t.generatingElapsed} {formatElapsed(elapsed)}</p>
          {elapsed > 30 && <p className="text-xs text-ink-muted">{t.patience}</p>}
          <button type="button" onClick={() => onCancel(entry)} className="btn-ghost mt-3 !px-3 !py-1.5 text-xs">
            {t.cancelGenerating}
          </button>
        </div>
      )}

      {entry.status === 'cancelled' && (
        <div className="rounded-lg bg-paper-soft p-4">
          <p className="text-sm text-ink-muted">{t.cancelled}</p>
          <button type="button" onClick={() => onRetry(entry)} className="btn-ghost mt-3 !px-3 !py-1.5 text-xs">
            {t.retry}
          </button>
        </div>
      )}

      {entry.status === 'done' && (
        <div>
          <button
            type="button"
            onClick={() => onOpenLightbox(entry)}
            className="block w-full overflow-hidden rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-clay/40"
          >
            <img
              src={`/images/${entry.imageId}`}
              alt={`Konsep dekorasi pernikahan, ${t.design.toLowerCase()} ${versionNumber}`}
              className="aspect-[4/3] w-full object-cover"
            />
          </button>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {/* uiuxcontext §5.6: satu aksi utama per layar — Analisis di desain
                terbaru tampil sebagai tombol primer, sisanya ghost. */}
            <button
              type="button"
              onClick={() => onAnalyze(entry)}
              className={
                isLatestDone && !entry.analysis
                  ? 'btn-primary !px-3 !py-1.5 text-xs'
                  : 'btn-ghost !px-3 !py-1.5 text-xs'
              }
            >
              <StepIcon name="checklist" className="h-3.5 w-3.5" />
              {entry.analysis ? (
                <span className="inline-flex items-center gap-1 text-success">
                  <StepIcon name="checkCircle" className="h-3.5 w-3.5" /> {t.viewChecklist}
                </span>
              ) : (
                t.analyze
              )}
            </button>
            <button type="button" onClick={() => onExport(entry)} className="btn-ghost !px-3 !py-1.5 text-xs">
              <StepIcon name="download" className="h-3.5 w-3.5" /> {t.export}
            </button>
            <button
              type="button"
              onClick={() => onUseAsReference(entry)}
              className={`btn-ghost !px-3 !py-1.5 text-xs ${isReference ? '!border-clay !text-clay-deep' : ''}`}
            >
              <StepIcon name="image" className="h-3.5 w-3.5" /> {isReference ? t.isReference : t.useAsReference}
            </button>
            <button
              type="button"
              onClick={() => onToggleCompare(entry)}
              className={`btn-ghost !px-3 !py-1.5 text-xs ${isCompareSelected ? '!border-clay !text-clay-deep' : ''}`}
            >
              <StepIcon name="compare" className="h-3.5 w-3.5" />{' '}
              {isCompareSelected ? content.app.compare.selected : content.app.compare.action}
            </button>
          </div>
        </div>
      )}

      {entry.status === 'error' && (
        <div className="rounded-lg bg-danger-soft p-4">
          <div className="flex items-start gap-2">
            <StepIcon name="warningTriangle" className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
            <p className="text-sm text-danger">{entry.error}</p>
          </div>
          {entry.errorCode !== 'cap' && (
            <button type="button" onClick={() => onRetry(entry)} className="btn-ghost mt-3 !px-3 !py-1.5 text-xs">
              {t.retry}
            </button>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setPromptOpen((o) => !o)}
        className="mt-3 flex items-center gap-1 text-xs text-ink-muted hover:text-ink"
      >
        <StepIcon name={promptOpen ? 'chevronDown' : 'chevronRight'} className="h-3 w-3" />
        {t.prompt}
      </button>
      {promptOpen && <p className="mt-1 text-xs text-ink-muted">{entry.prompt}</p>}
        </div>
      </div>
    </div>
  )
}
