import { verifyToken } from '../lib/auth.js'
import { findUserById } from '../lib/userStore.js'

// Verifies the `Authorization: Bearer <token>` header, attaches the
// authenticated user (password hash stripped) to `req.user`. 401s otherwise.
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  const payload = token ? verifyToken(token) : null
  if (!payload) return res.status(401).json({ error: { message: 'Not authenticated', code: 'unauthorized' } })

  const user = await findUserById(payload.sub)
  if (!user) return res.status(401).json({ error: { message: 'Not authenticated', code: 'unauthorized' } })

  const { passwordHash, ...safeUser } = user
  req.user = safeUser
  next()
}
