import { Router } from 'express'
import { createUser, findUserByEmail, findUserByGoogleId, updateUser } from '../lib/userStore.js'
import { hashPassword, verifyPassword, signToken, verifyGoogleIdToken } from '../lib/auth.js'
import { requireAuth } from '../middleware/requireAuth.js'

const router = Router()
const USAGE_GOALS = ['calon_pengantin', 'vendor']

function sanitize(user) {
  const { passwordHash, ...safe } = user
  return safe
}

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body ?? {}
  if (!name?.trim() || !email?.trim() || !password) {
    return res.status(400).json({ error: { message: 'Nama, email, dan kata sandi wajib diisi.', code: 'bad_request' } })
  }
  if (password.length < 8) {
    return res.status(400).json({ error: { message: 'Kata sandi minimal 8 karakter.', code: 'weak_password' } })
  }

  const existing = await findUserByEmail(email)
  if (existing) {
    return res.status(409).json({ error: { message: 'Email ini sudah terdaftar.', code: 'email_taken' } })
  }

  const passwordHash = await hashPassword(password)
  const user = await createUser({ name: name.trim(), email, passwordHash })
  res.status(201).json({ user: sanitize(user), token: signToken(user) })
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {}
  if (!email?.trim() || !password) {
    return res.status(400).json({ error: { message: 'Email dan kata sandi wajib diisi.', code: 'bad_request' } })
  }

  const user = await findUserByEmail(email)
  const valid = user?.passwordHash ? await verifyPassword(password, user.passwordHash) : false
  if (!valid) {
    return res.status(401).json({ error: { message: 'Email atau kata sandi salah.', code: 'invalid_credentials' } })
  }

  res.json({ user: sanitize(user), token: signToken(user) })
})

router.post('/google', async (req, res) => {
  const { idToken } = req.body ?? {}
  if (!idToken) {
    return res.status(400).json({ error: { message: 'idToken wajib diisi.', code: 'bad_request' } })
  }

  let payload
  try {
    payload = await verifyGoogleIdToken(idToken)
  } catch (err) {
    const code = err.code === 'config' ? 'config' : 'invalid_token'
    return res.status(code === 'config' ? 503 : 401).json({
      error: {
        code,
        message:
          code === 'config'
            ? 'Google Sign-In belum dikonfigurasi di server.'
            : 'Gagal masuk dengan Google. Coba lagi.',
      },
    })
  }

  let user = await findUserByGoogleId(payload.googleId)
  let isNewUser = false

  if (!user) {
    const byEmail = await findUserByEmail(payload.email)
    if (byEmail) {
      // Existing manual account signing in with Google for the first time —
      // attach the googleId, don't create a duplicate account.
      user = await updateUser(byEmail.id, { googleId: payload.googleId })
    } else {
      user = await createUser({ name: payload.name, email: payload.email, googleId: payload.googleId })
      isNewUser = true
    }
  }

  res.json({ user: sanitize(user), token: signToken(user), isNewUser })
})

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user })
})

router.post('/survey', requireAuth, async (req, res) => {
  const { usageGoal } = req.body ?? {}
  if (!USAGE_GOALS.includes(usageGoal)) {
    return res.status(400).json({ error: { message: 'usageGoal tidak valid.', code: 'bad_request' } })
  }
  const updated = await updateUser(req.user.id, { usageGoal })
  res.json({ user: sanitize(updated) })
})

export default router
