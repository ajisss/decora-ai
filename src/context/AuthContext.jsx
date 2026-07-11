import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api, setAuthToken } from '../api/client.js'

// Real backend-verified auth: session (user + token) lives in localStorage,
// the token also gets handed to the api client so every request carries it.
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

function writeSession(session) {
  try {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    else localStorage.removeItem(SESSION_KEY)
  } catch {
    /* private mode — session lives in memory for this tab only */
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession)
  const user = session?.user ?? null

  useEffect(() => {
    setAuthToken(session?.token ?? null)
  }, [session])

  // Local-only patch — Settings' name/email/plan edits, and applying the
  // fresh user object /me and /survey return. Never itself calls the backend.
  const updateProfile = useCallback((patch) => {
    setSession((current) => {
      if (!current) return current
      const next = { ...current, user: { ...current.user, ...patch } }
      writeSession(next)
      return next
    })
  }, [])

  // Verify the cached session against the backend once on mount — catches an
  // expired token or an account deleted server-side. Optimistic: the cached
  // user renders immediately, this just confirms or clears it.
  useEffect(() => {
    if (!session?.token) return
    api.auth
      .me()
      .then(({ user: fresh }) => updateProfile(fresh))
      .catch(() => {
        setSession(null)
        writeSession(null)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const persist = useCallback((next) => {
    setSession(next)
    writeSession(next)
  }, [])

  const login = useCallback(
    async (email, password) => {
      const { user, token } = await api.auth.login({ email, password })
      persist({ user, token })
      return user
    },
    [persist],
  )

  const register = useCallback(
    async (name, email, password) => {
      const { user, token } = await api.auth.register({ name, email, password })
      persist({ user, token })
      return user
    },
    [persist],
  )

  const loginWithGoogle = useCallback(
    async (idToken) => {
      const { user, token, isNewUser } = await api.auth.google({ idToken })
      persist({ user, token })
      return { user, isNewUser }
    },
    [persist],
  )

  const submitSurvey = useCallback(
    async (usageGoal) => {
      const { user: updated } = await api.auth.survey({ usageGoal })
      updateProfile(updated)
      return updated
    },
    [updateProfile],
  )

  const logout = useCallback(() => persist(null), [persist])

  return (
    <AuthContext.Provider
      value={{ user, login, register, loginWithGoogle, submitSurvey, updateProfile, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
