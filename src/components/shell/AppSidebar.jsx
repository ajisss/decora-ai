import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { content } from '../../content.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { StepIcon } from '../icons.jsx'

const mqMobile = '(max-width: 1023px)'

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
export default function AppSidebar({ open = false, onClose = () => {} }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobile, setMobile] = useState(() => window.matchMedia(mqMobile).matches)

  useEffect(() => {
    const m = window.matchMedia(mqMobile)
    const on = () => setMobile(m.matches)
    on()
    m.addEventListener?.('change', on)
    return () => m.removeEventListener?.('change', on)
  }, [])

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-ink/30 lg:hidden" onClick={onClose} aria-hidden="true" />}
      <aside
        inert={mobile && !open ? '' : undefined}
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-60 shrink-0 flex-col border-r border-paper-line bg-paper-soft transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4">
          <NavLink to="/" onClick={onClose} className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
            <span className="text-clay">✦</span> {content.brand}
          </NavLink>
        </div>

        <div className="px-4">
          <button
            type="button"
            onClick={() => {
              onClose()
              navigate('/projects/new')
            }}
            className="btn-primary w-full !py-2.5 text-sm"
          >
            <StepIcon name="plus" className="h-4 w-4" />
            Proyek baru
          </button>
        </div>

        <nav className="mt-6 flex-1 space-y-1 px-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-clay-soft text-clay-deep' : 'text-ink-soft hover:bg-white hover:text-ink'
                }`
              }
            >
              <StepIcon name={item.icon} className="h-5 w-5 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {user && (
          <div className="border-t border-paper-line p-3">
            <div className="group relative flex items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-white">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-clay text-xs font-semibold text-white">
                {initials(user.name)}
              </span>
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
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
