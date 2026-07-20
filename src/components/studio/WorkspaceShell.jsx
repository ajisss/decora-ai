import { useRef, useState } from 'react'
import { StepIcon } from '../icons.jsx'
import AppSidebar from '../shell/AppSidebar.jsx'
import useMediaQuery from '../../lib/useMediaQuery.js'
import useFocusTrap from '../../lib/useFocusTrap.js'
import { content } from '../../content.js'

const t = content.app.studio

// Immersive shell for the Design Workspace. Deliberately NOT AppShell:
//   - no app breadcrumb header, so the canvas gets the full viewport height
//     (this also removes the duplicated project name and SyncIndicator, which
//     the workspace header now owns)
//   - heights are derived by flex the whole way down, so nothing depends on a
//     hardcoded `calc(100vh - 56px)` matching some other component's h-14
//
// Layout invariants worth preserving if this is ever edited:
//   * `overflow-hidden` appears exactly once, on the root. Scrolling belongs to
//     leaves (version list, inspector body, checklist body, filmstrip).
//   * every flex child that scrolls carries `min-h-0`; every horizontal one
//     carries `min-w-0`. Without these, a child's content sets the floor and
//     the panel silently clips instead of scrolling.
//   * the rail and inspector LEAVE the flow at their breakpoints rather than
//     shrinking, so the canvas can never be squeezed toward zero width.
// `header` is a render function so the shell can hand it the breakpoint facts
// it already computes. Without that the header would have to re-run the same
// media queries, and the two could disagree about whether a panel is docked —
// which is exactly how you end up with an undockable panel and no way to
// reopen it.
export default function WorkspaceShell({
  rail,
  header,
  children,
  inspector,
  railOpen,
  onOpenRail,
  onCloseRail,
  inspectorOpen,
  onCloseInspector,
}) {
  const railDocked = useMediaQuery('(min-width: 1024px)')
  const inspectorDocked = useMediaQuery('(min-width: 1280px)')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-paper">
      <AppSidebar forceCollapsed open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {railDocked ? (
        <aside aria-label={t.panelRail} className="flex h-full w-[280px] shrink-0 flex-col border-r border-paper-line bg-paper-soft">{rail}</aside>
      ) : (
        <SlideOver side="left" open={railOpen} onClose={onCloseRail} label={t.panelRail} width="w-[280px]">
          {rail}
        </SlideOver>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {header({
          showSidebarToggle: !railDocked,
          onOpenSidebar: () => setSidebarOpen(true),
          showRailToggle: !railDocked,
          onOpenRail,
          showInspectorToggle: !inspectorDocked,
          metaInline: railDocked,
        })}
        <div className="flex min-h-0 flex-1">
          <main className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</main>
          {inspectorDocked ? (
            <aside aria-label={t.panelInspector} className="flex h-full w-[360px] shrink-0 flex-col border-l border-paper-line bg-paper-soft">
              {inspector}
            </aside>
          ) : (
            <SlideOver
              side="right"
              open={inspectorOpen}
              onClose={onCloseInspector}
              label={t.panelInspector}
              width="w-[360px]"
            >
              {inspector}
            </SlideOver>
          )}
        </div>
      </div>
    </div>
  )
}

// Off-canvas panel for the rail/inspector below their docked breakpoints.
//
// It's a modal surface, so it gets the full contract via useFocusTrap: focus
// moves in on open, Tab stays inside, Escape closes, and focus returns to the
// trigger on close. That last part matters more than it looks — selecting a
// version or a nav section closes the drawer from *inside*, and the button
// that was just clicked then sits in an `inert` subtree, so without the
// restore the browser drops focus to <body> on every single selection.
function SlideOver({ side, open, onClose, label, width, children }) {
  const isLeft = side === 'left'
  const panelRef = useRef(null)
  useFocusTrap({ open, onClose, containerRef: panelRef })

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-ink/30" onClick={onClose} aria-hidden="true" />}
      <aside
        ref={panelRef}
        inert={open ? undefined : ''}
        role="dialog"
        aria-modal={open ? 'true' : undefined}
        aria-label={label}
        tabIndex={-1}
        className={`fixed inset-y-0 z-50 flex ${width} max-w-[85vw] flex-col bg-paper-soft outline-none transition-transform duration-200 ${
          isLeft ? 'left-0 border-r' : 'right-0 border-l'
        } border-paper-line ${open ? 'translate-x-0' : isLeft ? '-translate-x-full' : 'translate-x-full'}`}
      >
        <div className="flex shrink-0 items-center justify-end p-2">
          <button
            type="button"
            onClick={onClose}
            aria-label={`${t.lightboxClose} ${label}`}
            className="rounded-md p-1.5 text-ink-muted hover:bg-paper hover:text-ink"
          >
            <StepIcon name="close" className="h-4 w-4" />
          </button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </aside>
    </>
  )
}
