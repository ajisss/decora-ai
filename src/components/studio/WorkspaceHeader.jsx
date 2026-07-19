import { StepIcon } from '../icons.jsx'
import SyncIndicator from '../shell/SyncIndicator.jsx'
import ProjectMetaChips from './ProjectMetaChips.jsx'
import { content } from '../../content.js'

const t = content.app.studio

// Spans the Canvas + Inspector region (the rail and global sidebar run full
// height beside it). Carries version identity on the left, the wedding's fixed
// parameters in the middle, and the version-scoped actions on the right.
//
// The autosave state renders here as a status chip — the mockup's "Simpan"
// button position. There is no manual save: writes are already debounced and
// automatic, so a button would either duplicate that or lie about it.
export default function WorkspaceHeader({
  project,
  activeVersion,
  versionName,
  onToggleFavorite,
  onShare,
  onExport,
  metaInline,
  showSidebarToggle,
  onOpenSidebar,
  showRailToggle,
  onOpenRail,
  showInspectorToggle,
  onOpenInspector,
}) {
  return (
    <header className="shrink-0 border-b border-paper-line bg-paper px-4 py-2.5">
      <div className="flex items-center gap-3">
        {showSidebarToggle && (
          <button
            type="button"
            onClick={onOpenSidebar}
            aria-label={content.app.shell.projects}
            title={content.app.shell.projects}
            className="-ml-1 shrink-0 rounded-md p-1.5 text-ink-soft hover:bg-paper-soft hover:text-ink"
          >
            <StepIcon name="menu" className="h-4 w-4" />
          </button>
        )}
        {showRailToggle && (
          <button
            type="button"
            onClick={onOpenRail}
            aria-label={t.panelRail}
            title={t.panelRail}
            className="shrink-0 rounded-md p-1.5 text-ink-soft hover:bg-paper-soft hover:text-ink"
          >
            <StepIcon name="folder" className="h-4 w-4" />
          </button>
        )}

        <div className="flex min-w-0 shrink-0 items-center gap-1.5">
          <h1 className="truncate font-display text-base font-semibold text-ink">{versionName}</h1>
          {activeVersion && (
            <button
              type="button"
              onClick={() => onToggleFavorite(activeVersion)}
              aria-label={activeVersion.favorite ? content.app.favorite.remove : content.app.favorite.add}
              title={activeVersion.favorite ? content.app.favorite.remove : content.app.favorite.add}
              className={activeVersion.favorite ? 'text-clay' : 'text-ink-muted hover:text-clay'}
            >
              <StepIcon name="star" className={`h-4 w-4 ${activeVersion.favorite ? 'fill-clay' : ''}`} />
            </button>
          )}
        </div>

        {/* Inline chips only where there's room for them; below that (and on
            narrow screens) the same fields collapse into one popover so the
            header never wraps and steals canvas height. */}
        {metaInline ? (
          <div className="hidden min-w-0 flex-1 lg:block">
            <ProjectMetaChips project={project} inline />
          </div>
        ) : (
          <div className="min-w-0 flex-1" />
        )}

        <div className="flex shrink-0 items-center gap-2">
          {!metaInline && <ProjectMetaChips project={project} />}
          <SyncIndicator />
          <button
            type="button"
            onClick={onShare}
            disabled={!activeVersion}
            className="btn-ghost !px-3 !py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-50"
          >
            <StepIcon name="external" className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t.shareLink}</span>
          </button>
          <button
            type="button"
            onClick={onExport}
            disabled={!activeVersion}
            className="btn-primary !px-3 !py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-50"
          >
            <StepIcon name="download" className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t.export}</span>
          </button>
          {showInspectorToggle && (
            <button
              type="button"
              onClick={onOpenInspector}
              aria-label={t.panelInspector}
              title={t.panelInspector}
              className="shrink-0 rounded-md p-1.5 text-ink-soft hover:bg-paper-soft hover:text-ink"
            >
              <StepIcon name="checklist" className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
