import { StepIcon } from '../icons.jsx'
import { content } from '../../content.js'

const t = content.app.studio

// Level 3 "VERSI DESAIN" list — one row per generation, selecting a row
// drives the Canvas + Inspector. Row actions all reuse existing business
// logic 1:1 (favorite/compare/rename already existed; duplicate/delete are
// thin new wrappers around the same whole-project `updateProject` save).
export default function VersionExplorer({
  generations,
  selectedVersionId,
  onSelect,
  versionOf,
  onRename,
  onDuplicate,
  onDelete,
  onToggleFavorite,
  onToggleCompare,
  compareIds,
  onNewVersion,
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between px-3 pb-2 pt-3">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-muted">{t.versionsHeading}</p>
        <button
          type="button"
          onClick={onNewVersion}
          aria-label={t.generate}
          title={t.generate}
          className="flex h-6 w-6 items-center justify-center rounded-md text-ink-muted hover:bg-paper hover:text-clay-deep"
        >
          <StepIcon name="plus" className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-2">
        {generations.length === 0 && <p className="px-2 py-4 text-center text-xs text-ink-muted">{t.historyEmpty}</p>}
        {generations.map((g, i) => {
          const versionNumber = versionOf(g)
          const name = g.favoriteName || (versionNumber === 1 ? t.original : `${t.design} ${versionNumber}`)
          const active = g.id === selectedVersionId
          return (
            <div
              key={g.id}
              className={`group rounded-lg border p-2 transition-colors ${
                active ? 'border-clay bg-clay-soft' : 'border-transparent hover:border-paper-line hover:bg-paper'
              }`}
            >
              <button type="button" onClick={() => onSelect(g.id)} className="flex w-full items-center gap-2.5 text-left">
                {g.imageId ? (
                  <img src={g.imageId} alt="" className="h-11 w-11 shrink-0 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-paper-line">
                    {g.status === 'pending' ? (
                      <Spinner />
                    ) : (
                      <StepIcon name="image" className="h-4 w-4 text-ink-muted" />
                    )}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1 truncate text-sm font-medium text-ink">
                    {name}
                    {g.favorite && <StepIcon name="star" className="h-3 w-3 shrink-0 fill-clay text-clay" />}
                    {active && (
                      <span className="ml-auto shrink-0 rounded-full bg-clay-soft px-1.5 py-0.5 text-[10px] font-semibold text-clay-deep">
                        Aktif
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-ink-muted">
                    {g.status === 'error'
                      ? t.designFailed
                      : new Date(g.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) +
                        ' · ' +
                        new Date(g.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </button>

              <div className="mt-1 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                <RowAction icon="pencil" label={t.renameVersion} onClick={() => onRename(g)} />
                <RowAction icon="duplicate" label={t.duplicateVersion} onClick={() => onDuplicate(g)} />
                <RowAction
                  icon="star"
                  label={g.favorite ? content.app.favorite.remove : content.app.favorite.add}
                  active={g.favorite}
                  onClick={() => onToggleFavorite(g)}
                />
                <RowAction
                  icon="compare"
                  label={content.app.compare.action}
                  active={compareIds.includes(g.id)}
                  onClick={() => onToggleCompare(g)}
                />
                <RowAction icon="trash" label={t.deleteVersion} danger onClick={() => onDelete(g)} />
              </div>
            </div>
          )
        })}
      </div>

      {compareIds.length > 0 && (
        <div className="border-t border-paper-line p-2">
          <p className="px-1 text-xs text-ink-muted">{content.app.compare.bar(compareIds.length)}</p>
        </div>
      )}
    </div>
  )
}

function RowAction({ icon, label, onClick, active, danger }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      aria-label={label}
      title={label}
      className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
        active ? 'text-clay' : danger ? 'text-ink-muted hover:text-danger' : 'text-ink-muted hover:text-clay-deep'
      } hover:bg-paper`}
    >
      <StepIcon name={icon} className={`h-3.5 w-3.5 ${active && icon === 'star' ? 'fill-clay' : ''}`} />
    </button>
  )
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin text-clay-deep" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
