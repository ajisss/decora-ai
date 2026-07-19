import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { content } from '../../content.js'
import { StepIcon } from '../icons.jsx'
import AppSidebar from './AppSidebar.jsx'
import SyncIndicator from './SyncIndicator.jsx'

const SECTION_LABELS = [
  { prefix: '/vendors', to: '/vendors', label: 'Vendor' },
  { prefix: '/settings', to: '/settings', label: 'Pengaturan' },
]

// Shell aplikasi: sidebar navigasi persisten (kiri) + top bar tipis untuk
// breadcrumb kontekstual (kanan). Dipakai di /projects, /projects/new,
// /studio/*, /settings, /vendors (ux-spec §2.2, diperluas dengan AppSidebar).
// Di bawah lg, sidebar jadi off-canvas drawer dibuka lewat hamburger di header.
export default function AppShell({ projectName, children }) {
  const s = content.app.shell
  const { pathname } = useLocation()
  const section = SECTION_LABELS.find((s) => pathname.startsWith(s.prefix))
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // The Design Workspace needs maximum horizontal space, so the sidebar
  // auto-collapses to icon-only there. `manualOverride` lets the user flip
  // that for the current route; it resets to the route's default (collapsed
  // in Studio, expanded elsewhere) on every navigation, per spec — the
  // behavior is scoped to where you are, not a sticky global preference.
  const autoCollapse = pathname.startsWith('/studio/')
  const [manualOverride, setManualOverride] = useState(null)
  useEffect(() => setManualOverride(null), [pathname])
  const collapsed = manualOverride ?? autoCollapse

  return (
    <div className="flex h-screen bg-paper-line">
      <AppSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setManualOverride(!collapsed)}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-tl-xl rounded-bl-xl bg-paper shadow-sm shadow-ink/5">
        <header className="sticky top-0 z-30 h-14 shrink-0 border-b border-paper-line bg-paper">
          <div className="flex h-full items-center gap-2 px-3 sm:px-6">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Buka menu"
              className="-ml-1 shrink-0 rounded-md p-2 text-ink-soft transition-colors hover:bg-paper-soft hover:text-ink lg:hidden"
            >
              <StepIcon name="menu" className="h-5 w-5" />
            </button>
            <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-ink-soft">
                <Link to={section?.to ?? '/projects'} className="shrink-0 transition-colors hover:text-ink">
                  {section?.label ?? s.projects}
                </Link>
                {projectName && (
                  <>
                    <span className="shrink-0 text-paper-line">/</span>
                    <span className="truncate text-ink">{projectName}</span>
                  </>
                )}
              </div>
              <SyncIndicator />
            </div>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
