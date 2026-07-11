import { Link, useLocation } from 'react-router-dom'
import { content } from '../../content.js'
import AppSidebar from './AppSidebar.jsx'
import SyncIndicator from './SyncIndicator.jsx'

const SECTION_LABELS = [
  { prefix: '/vendors', to: '/vendors', label: 'Vendor' },
  { prefix: '/settings', to: '/settings', label: 'Pengaturan' },
]

// Shell aplikasi: sidebar navigasi persisten (kiri) + top bar tipis untuk
// breadcrumb kontekstual (kanan). Dipakai di /projects, /projects/new,
// /studio/*, /settings, /vendors (ux-spec §2.2, diperluas dengan AppSidebar).
export default function AppShell({ projectName, children }) {
  const s = content.app.shell
  const { pathname } = useLocation()
  const section = SECTION_LABELS.find((s) => pathname.startsWith(s.prefix))

  return (
    <div className="flex h-screen bg-paper">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-tl-xl rounded-bl-xl shadow-sm shadow-ink/5">
        <header className="sticky top-0 z-40 h-14 shrink-0 border-b border-paper-line bg-paper">
          <div className="flex h-full items-center justify-between px-6">
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
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
