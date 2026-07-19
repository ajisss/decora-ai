import { useEffect, useRef, useState } from 'react'
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
  onQuickPng,
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
      {/* Row 1: version identity (left) and the version-scoped actions
          (right). Row 2: the project's fixed parameters, always their own
          line — they read as a subtitle to the version, not as more buttons
          crowding the title row. */}
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

        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <h1 className="truncate font-display text-lg font-semibold text-ink">{versionName}</h1>
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

        <div className="flex shrink-0 items-center gap-2">
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
          <ExportMenu activeVersion={activeVersion} onExport={onExport} onQuickPng={onQuickPng} />
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

      {/* Inline on wide screens; below that it collapses into one popover so
          this row can never wrap and steal canvas height. `metaInline`
          reflects the same breakpoint the shell used to dock the rail. */}
      <div className="mt-1">
        {metaInline ? <ProjectMetaChips project={project} inline /> : <ProjectMetaChips project={project} />}
      </div>
    </header>
  )
}

// Split button: the main action opens the full export dialog (PNG / PDF brief
// / share link), the caret offers the one-click PNG so the common case skips
// a dialog. Both paths hit code that already existed.
function ExportMenu({ activeVersion, onExport, onQuickPng }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDocClick = (e) => !ref.current?.contains(e.target) && setOpen(false)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDocClick)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="relative flex shrink-0" ref={ref}>
      <button
        type="button"
        onClick={onExport}
        disabled={!activeVersion}
        className="btn-primary !rounded-r-none !px-3 !py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-50"
      >
        <StepIcon name="download" className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{t.export}</span>
      </button>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={!activeVersion}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t.export}
        className="btn-primary !rounded-l-none !border-l !border-white/25 !px-1.5 !py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <StepIcon name="chevronDown" className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-30 mt-1.5 w-44 rounded-lg border border-paper-line bg-paper py-1 shadow-lg">
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onQuickPng()
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-ink-soft hover:bg-paper-soft"
          >
            <StepIcon name="image" className="h-3.5 w-3.5" />
            {t.exportPng}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onExport()
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-ink-soft hover:bg-paper-soft"
          >
            <StepIcon name="filePdf" className="h-3.5 w-3.5" />
            {t.exportPdf}
          </button>
        </div>
      )}
    </div>
  )
}
