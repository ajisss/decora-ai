import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { content } from '../content.js'
import { useAuth } from '../context/AuthContext.jsx'
import { StepIcon } from '../components/icons.jsx'

// Mock login/register — one card, mode toggle. Any credentials accepted (demo).
export default function LoginPage() {
  const { user, login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const a = content.app.auth

  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const from = location.state?.from ?? '/projects'

  if (user) return <Navigate to={from} replace />

  const submit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return setError('Isi emailmu dulu, ya.')
    if (!password.trim()) return setError('Isi kata sandimu dulu, ya.')
    setError(null)
    setSubmitting(true)
    await login(email, password, mode === 'register' ? name : undefined)
    navigate(from, { replace: true })
  }

  const google = async () => {
    setSubmitting(true)
    await loginWithGoogle()
    navigate(from, { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper-soft">
      <header className="flex h-14 items-center px-6">
        <Link to="/" className="font-display text-lg font-semibold text-ink">
          <span className="text-clay">✦</span> {content.brand}
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 pb-16">
        <div className="w-full max-w-[400px]">
          <div className="rounded-xl2 border border-paper-line bg-paper p-8">
            <h1 className="font-display text-2xl font-semibold text-ink">
              {mode === 'login' ? a.title : a.registerTitle}
            </h1>
            <p className="mt-1.5 text-sm text-ink-muted">{mode === 'login' ? a.sub : a.registerSub}</p>

            <form onSubmit={submit} className="mt-6 space-y-4">
              {mode === 'register' && (
                <div>
                  <label htmlFor="auth-name" className="mb-1.5 block text-sm font-medium text-ink-soft">
                    {a.nameLabel}
                  </label>
                  <input
                    id="auth-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-10 w-full rounded-lg border border-paper-line bg-paper px-3 text-sm focus:border-clay focus:outline-none focus-visible:ring-2 focus-visible:ring-clay/40"
                  />
                </div>
              )}
              <div>
                <label htmlFor="auth-email" className="mb-1.5 block text-sm font-medium text-ink-soft">
                  {a.emailLabel}
                </label>
                <input
                  id="auth-email"
                  type="email"
                  autoFocus
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError(null)
                  }}
                  placeholder="kamu@contoh.com"
                  className="h-10 w-full rounded-lg border border-paper-line bg-paper px-3 text-sm focus:border-clay focus:outline-none focus-visible:ring-2 focus-visible:ring-clay/40"
                />
              </div>
              <div>
                <label htmlFor="auth-password" className="mb-1.5 block text-sm font-medium text-ink-soft">
                  {a.passwordLabel}
                </label>
                <input
                  id="auth-password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError(null)
                  }}
                  className="h-10 w-full rounded-lg border border-paper-line bg-paper px-3 text-sm focus:border-clay focus:outline-none focus-visible:ring-2 focus-visible:ring-clay/40"
                />
              </div>

              {error && <p className="text-xs text-danger">{error}</p>}

              <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
                {submitting ? a.submitting : mode === 'login' ? a.submit : a.registerSubmit}
              </button>
            </form>

            <div className="my-5 flex items-center gap-3 text-xs text-ink-muted">
              <span className="h-px flex-1 bg-paper-line" />
              {a.or}
              <span className="h-px flex-1 bg-paper-line" />
            </div>

            <button type="button" onClick={google} disabled={submitting} className="btn-ghost w-full disabled:opacity-60">
              <GoogleMark />
              {a.google}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode((m) => (m === 'login' ? 'register' : 'login'))
                setError(null)
              }}
              className="mt-5 w-full text-center text-sm font-medium text-clay-deep hover:underline"
            >
              {mode === 'login' ? a.toRegister : a.toLogin}
            </button>
          </div>

          <p className="mt-4 text-center text-xs text-ink-muted">{a.note}</p>
        </div>
      </main>
    </div>
  )
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.1h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.9c2.3-2.1 3.7-5.1 3.7-8.6z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.7-2.9c-1 .7-2.4 1.2-4.2 1.2-3.2 0-5.9-2.1-6.9-5l-3.9 3C3.3 21.3 7.3 24 12 24z"
      />
      <path fill="#FBBC05" d="M5.1 14.4a7 7 0 0 1 0-4.7l-3.9-3a12 12 0 0 0 0 10.7l3.9-3z" />
      <path
        fill="#EA4335"
        d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17 1.1 15.2 0 12 0 7.3 0 3.3 2.7 1.2 6.7l3.9 3c1-2.9 3.7-5 6.9-5z"
      />
    </svg>
  )
}
