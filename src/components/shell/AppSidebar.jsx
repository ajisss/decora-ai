import { NavLink, useNavigate } from 'react-router-dom'
import { content } from '../../content.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { StepIcon } from '../icons.jsx'

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
export default function AppSidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-paper-line bg-paper-soft">
      <div className="p-4">
        <NavLink to="/" className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
          <span className="text-clay">✦</span> {content.brand}
        </NavLink>
      </div>

      <div className="px-4">
        <button type="button" onClick={() => navigate('/projects/new')} className="btn-primary w-full !py-2.5 text-sm">
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
              className="shrink-0 rounded-md p-1.5 text-ink-muted opacity-0 transition-opacity hover:bg-paper-line hover:text-danger group-hover:opacity-100"
            >
              <StepIcon name="logout" className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
