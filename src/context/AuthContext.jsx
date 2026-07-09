import { createContext, useCallback, useContext, useState } from 'react'

// Mock auth (proper-SaaS shell without a real backend): any credentials are
// accepted, the session lives in localStorage. Swap the internals of login/
// loginWithGoogle for real API calls later — the component contract stays.
const AuthContext = createContext(null)
const SESSION_KEY = 'decor-ai:session'

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function nameFromEmail(email) {
  const local = email.split('@')[0] ?? ''
  return local
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim() || 'Pengguna'
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSession)

  const persist = useCallback((session) => {
    setUser(session)
    try {
      if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session))
      else localStorage.removeItem(SESSION_KEY)
    } catch {
      /* private mode — session lives in memory for this tab only */
    }
  }, [])

  const login = useCallback(
    async (email, _password, name) => {
      await delay(600) // let the button show its loading state
      const session = { name: name?.trim() || nameFromEmail(email), email: email.trim() }
      persist(session)
      return session
    },
    [persist],
  )

  const loginWithGoogle = useCallback(async () => {
    await delay(600)
    const session = { name: 'Pengguna Google', email: 'pengguna@gmail.com', provider: 'google' }
    persist(session)
    return session
  }, [persist])

  const updateProfile = useCallback(
    (patch) => {
      setUser((current) => {
        if (!current) return current
        const next = { ...current, ...patch }
        try {
          localStorage.setItem(SESSION_KEY, JSON.stringify(next))
        } catch {
          /* ignore */
        }
        return next
      })
    },
    [],
  )

  const logout = useCallback(() => persist(null), [persist])

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
