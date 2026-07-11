import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { content } from '../content.js'
import { useAuth } from '../context/AuthContext.jsx'
import GoogleSignInButton from '../components/auth/GoogleSignInButton.jsx'

// Login/register — one card, mode driven by the route path (/login or /register).
export default function LoginPage() {
  const { user, login, register, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const a = content.app.auth

  const mode = location.pathname === '/register' ? 'register' : 'login'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const from = location.state?.from ?? '/projects'

  if (user) return <Navigate to={from} replace />

  const submit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return setError('Isi emailmu dulu, ya.')
    if (!password.trim()) return setError('Isi kata sandimu dulu, ya.')
    if (mode === 'register') {
      if (!name.trim()) return setError('Isi namamu dulu, ya.')
      if (password.length < 8) return setError('Kata sandi minimal 8 karakter.')
      if (password !== confirmPassword) return setError('Konfirmasi kata sandi tidak cocok.')
    }
    setError(null)
    setSubmitting(true)
    try {
      if (mode === 'register') {
        await register(name, email, password)
        navigate('/survey', { replace: true, state: { from } })
      } else {
        await login(email, password)
        navigate(from, { replace: true })
      }
    } catch (err) {
      setSubmitting(false)
      setError(
        err.code === 'email_taken'
          ? 'Email ini sudah terdaftar. Coba masuk, atau pakai email lain.'
          : err.code === 'invalid_credentials'
            ? 'Email atau kata sandi salah.'
            : (err.message ?? 'Terjadi kesalahan. Coba lagi.'),
      )
    }
  }

  const handleGoogleCredential = async (idToken) => {
    setSubmitting(true)
    try {
      const { isNewUser } = await loginWithGoogle(idToken)
      if (isNewUser) navigate('/survey', { replace: true, state: { from } })
      else navigate(from, { replace: true })
    } catch (err) {
      setSubmitting(false)
      setError(
        err.code === 'config'
          ? 'Google Sign-In belum dikonfigurasi di server.'
          : 'Gagal masuk dengan Google. Coba lagi.',
      )
    }
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
                    onChange={(e) => {
                      setName(e.target.value)
                      setError(null)
                    }}
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
              {mode === 'register' && (
                <div>
                  <label htmlFor="auth-confirm-password" className="mb-1.5 block text-sm font-medium text-ink-soft">
                    {a.confirmPasswordLabel}
                  </label>
                  <input
                    id="auth-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      setError(null)
                    }}
                    className="h-10 w-full rounded-lg border border-paper-line bg-paper px-3 text-sm focus:border-clay focus:outline-none focus-visible:ring-2 focus-visible:ring-clay/40"
                  />
                </div>
              )}

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

            <GoogleSignInButton
              label={a.google}
              disabled={submitting}
              onCredential={handleGoogleCredential}
              onError={setError}
            />

            <Link
              to={mode === 'login' ? '/register' : '/login'}
              state={location.state}
              onClick={() => setError(null)}
              className="mt-5 block w-full text-center text-sm font-medium text-clay-deep hover:underline"
            >
              {mode === 'login' ? a.toRegister : a.toLogin}
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
