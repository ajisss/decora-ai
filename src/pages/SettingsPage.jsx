import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/shell/AppShell.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import { content } from '../content.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function SettingsPage() {
  const s = content.app.settings
  const b = content.app.billing
  const { user, updateProfile, logout } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const plan = user?.plan ?? 'free'

  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [saved, setSaved] = useState(false)

  const save = () => {
    updateProfile({ name: name.trim() || user.name, email: email.trim() || user.email })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-[640px] px-6 py-12">
        <h1 className="font-display text-3xl font-semibold text-ink">{s.title}</h1>

        <section className="mt-8 rounded-xl2 border border-paper-line bg-paper p-6">
          <h2 className="font-display text-xl font-semibold text-ink">{s.profile}</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="settings-name" className="mb-1.5 block text-sm font-medium text-ink-soft">
                {s.nameLabel}
              </label>
              <input
                id="settings-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 w-full rounded-lg border border-paper-line bg-paper px-3 text-sm focus:border-clay focus:outline-none focus-visible:ring-2 focus-visible:ring-clay/40"
              />
            </div>
            <div>
              <label htmlFor="settings-email" className="mb-1.5 block text-sm font-medium text-ink-soft">
                {s.emailLabel}
              </label>
              <input
                id="settings-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 w-full rounded-lg border border-paper-line bg-paper px-3 text-sm focus:border-clay focus:outline-none focus-visible:ring-2 focus-visible:ring-clay/40"
              />
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={save} className="btn-primary !px-4 !py-2 text-sm">
                {s.save}
              </button>
              {saved && <span className="text-sm text-success">{s.saved}</span>}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-xl2 border border-paper-line bg-paper p-6">
          <h2 className="font-display text-xl font-semibold text-ink">{b.title}</h2>
          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-ink-muted">{b.current}</p>
              <p className="mt-0.5 font-display text-lg font-semibold text-ink">
                {plan === 'plus' ? b.plus : b.free}
                {plan === 'plus' && (
                  <span className="ml-2 rounded-full bg-clay-soft px-2 py-0.5 text-xs font-semibold text-clay-deep">✦</span>
                )}
              </p>
              <p className="mt-1 text-sm text-ink-muted">{plan === 'plus' ? b.plusDesc : b.freeDesc}</p>
            </div>
            {plan === 'plus' ? (
              <button
                type="button"
                onClick={() => {
                  updateProfile({ plan: 'free' })
                  showToast(b.downgraded)
                }}
                className="btn-ghost shrink-0 !px-4 !py-2 text-sm"
              >
                {b.downgrade}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  updateProfile({ plan: 'plus' })
                  showToast(b.upgraded)
                }}
                className="btn-primary shrink-0 !px-4 !py-2 text-sm"
              >
                {b.upgrade}
              </button>
            )}
          </div>
          <p className="mt-3 text-xs text-ink-muted">{b.demoNote}</p>
        </section>

        <section className="mt-6 rounded-xl2 border border-paper-line bg-paper p-6">
          <h2 className="font-display text-xl font-semibold text-ink">{s.appInfo}</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-ink-muted">{s.dailyCap}</dt>
              <dd className="font-medium text-ink">20</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-ink-muted">{s.language}</dt>
              <dd className="font-medium text-ink">{s.languageValue}</dd>
            </div>
          </dl>
        </section>

        <button
          type="button"
          onClick={() => {
            logout()
            navigate('/')
          }}
          className="mt-6 rounded-full border border-danger/30 px-6 py-3 text-sm font-semibold text-danger transition-colors hover:bg-danger-soft"
        >
          {s.logout}
        </button>
      </div>
    </AppShell>
  )
}
