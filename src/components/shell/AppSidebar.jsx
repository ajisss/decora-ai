import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { content } from '../../content.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { StepIcon } from '../icons.jsx'

const mqMobile = '(max-width: 1023px)'
const WIDE = 240
const NARROW = 72

function initials(name) {
  return (
    name
      ?.split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase() || '?'
  )
}

const NAV_ITEMS = [
  { to: '/projects', icon: 'folder', label: 'Proyek', end: false },
  { to: '/vendors', icon: 'store', label: 'Vendor', end: false },
  { to: '/settings', icon: 'settings', label: 'Pengaturan', end: false },
]

// Sidebar navigasi persisten — pola SaaS modern (Linear/Notion/Framer): brand
// di atas, aksi utama di bawahnya, nav berlabel dengan active state jelas,
// profil pengguna di footer. Menggantikan rail ikon-tanpa-label sebelumnya
// yang bikin navigasi app tidak jelas (uiuxcontext §9 IA, "navigasi jelas").
//
// Di bawah lg, sidebar jadi off-canvas drawer (dibuka lewat hamburger di
// AppShell) alih-alih selalu tampil dan mendesak konten di layar sempit.
//
// Di lg+, `collapsed` (dikendalikan AppShell — auto di Design Workspace)
// menciutkan sidebar jadi ikon-saja. Selalu `fixed` + spacer terpisah
// (bukan `lg:static`) supaya hover-to-expand bisa overlay konten tanpa
// reflow layout di baliknya.
export default function AppSidebar({ open = false, onClose = () => {}, collapsed = false, onToggleCollapse = () => {} }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobile, setMobile] = useState(() => window.matchMedia(mqMobile).matches)
  const [hoverExpanded, setHoverExpanded] = useState(false)

  useEffect(() => {
    const m = window.matchMedia(mqMobile)
    const on = () => setMobile(m.matches)
    on()
    m.addEventListener?.('change', on)
    return () => m.removeEventListener?.('change', on)
  }, [])

  const narrow = !mobile && collapsed && !hoverExpanded
  const width = mobile ? WIDE : narrow ? NARROW : WIDE

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-ink/30 lg:hidden" onClick={onClose} aria-hidden="true" />}
      {/* Spacer: reserves flow space so the fixed aside doesn't overlap content. */}
      <div className="hidden shrink-0 transition-[width] duration-200 lg:block" style={{ width }} aria-hidden="true" />
      <aside
        inert={mobile && !open ? '' : undefined}
        onMouseEnter={() => !mobile && collapsed && setHoverExpanded(true)}
        onMouseLeave={() => setHoverExpanded(false)}
        style={{ width: mobile ? WIDE : width }}
        className={`fixed inset-y-0 left-0 z-50 flex h-screen shrink-0 flex-col border-r border-paper-line bg-paper-soft transition-[transform,width] duration-200 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center gap-2 p-4">
          <NavLink
            to="/"
            onClick={onClose}
            className="flex min-w-0 items-center gap-2 font-display text-lg font-semibold text-ink"
          >
            <span className="shrink-0 text-clay">✦</span>
            {!narrow && <span className="truncate">{content.brand}</span>}
          </NavLink>
        </div>

        <div className="px-3">
          <button
            type="button"
            onClick={() => {
              onClose()
              navigate('/projects/new')
            }}
            title="Proyek baru"
            className={`btn-primary w-full !py-2.5 text-sm ${narrow ? '!px-0 justify-center' : ''}`}
          >
            <StepIcon name="plus" className="h-4 w-4 shrink-0" />
            {!narrow && 'Proyek baru'}
          </button>
        </div>

        <nav className="mt-6 flex-1 space-y-1 px-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              title={narrow ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  narrow ? 'justify-center px-0' : ''
                } ${isActive ? 'bg-clay-soft text-clay-deep' : 'text-ink-soft hover:bg-white hover:text-ink'}`
              }
            >
              <StepIcon name={item.icon} className="h-5 w-5 shrink-0" />
              {!narrow && item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-2">
          <button
            type="button"
            onClick={onToggleCollapse}
            title={collapsed ? 'Perluas menu' : 'Minimalkan menu'}
            className={`hidden w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-ink-muted transition-colors hover:bg-white hover:text-ink lg:flex ${
              narrow ? 'justify-center px-0' : ''
            }`}
          >
            <StepIcon name="chevronRight" className={`h-3.5 w-3.5 shrink-0 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
            {!narrow && 'Minimalkan menu'}
          </button>
        </div>

        {user && (
          <div className="border-t border-paper-line p-3">
            <div className={`group relative flex items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-white ${narrow ? 'justify-center' : ''}`}>
              <span
                title={narrow ? `${user.name} · ${user.email}` : undefined}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-clay text-xs font-semibold text-white"
              >
                {initials(user.name)}
              </span>
              {!narrow && (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{user.name}</p>
                    <p className="truncate text-xs text-ink-muted">{user.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      logout()
                      navigate('/')
                    }}
                    aria-label={content.app.shell.logout}
                    title={content.app.shell.logout}
                    className="shrink-0 rounded-md p-1.5 text-ink-muted opacity-100 transition-opacity hover:bg-paper-line hover:text-danger lg:opacity-0 lg:group-hover:opacity-100"
                  >
                    <StepIcon name="logout" className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
