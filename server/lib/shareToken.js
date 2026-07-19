// Signed, time-limited share tokens for the public /share/:pid/:gid view-only
// page. Keeps a shared wedding plan from being opened by anyone who guesses
// the URL — a link is only valid if it carries a token we actually issued,
// and only until it expires. No new DB table: the token is a compact
// HMAC of (projectId|generationId|expiry) verified against AUTH_JWT_SECRET
// (or the local ephemeral secret set in server/index.js).
import crypto from 'node:crypto'

const SECRET = process.env.AUTH_JWT_SECRET ?? 'decor-ai-local-dev-share-secret'
const TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

// URL-safe base64 (no padding) so it sits cleanly in a query param.
function b64url(buf) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function signShareToken(projectId, generationId) {
  const expiry = Date.now() + TTL_MS
  const payload = `${projectId}|${generationId}|${expiry}`
  const mac = crypto.createHmac('sha256', SECRET).update(payload).digest()
  return `${b64url(mac)}.${expiry}`
}

// Returns true only for a token we issued for this exact project+generation
// that hasn't expired yet. Replay on a different target fails (payload-bound).
export function verifyShareToken(token, projectId, generationId) {
  if (!token || typeof token !== 'string') return false
  const [macB64, expiryStr] = token.split('.')
  if (!macB64 || !expiryStr) return false
  const expiry = Number(expiryStr)
  if (!Number.isFinite(expiry) || Date.now() > expiry) return false
  const payload = `${projectId}|${generationId}|${expiry}`
  const expected = crypto.createHmac('sha256', SECRET).update(payload).digest()
  const given = Buffer.from(macB64.replace(/-/g, '+').replace(/_/g, '/'), 'base64')
  // constant-time compare
  if (given.length !== expected.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i++) diff |= given[i] ^ expected[i]
  return diff === 0
}
