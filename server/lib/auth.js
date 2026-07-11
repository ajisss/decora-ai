import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library'

const SALT_ROUNDS = 10
const TOKEN_EXPIRY = '30d'

function jwtSecret() {
  const secret = process.env.AUTH_JWT_SECRET
  if (!secret) throw Object.assign(new Error('AUTH_JWT_SECRET is not configured'), { code: 'config' })
  return secret
}

export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash)
}

export function signToken(user) {
  return jwt.sign({ sub: user.id }, jwtSecret(), { expiresIn: TOKEN_EXPIRY })
}

export function verifyToken(token) {
  const secret = jwtSecret()
  try {
    return jwt.verify(token, secret)
  } catch {
    return null // expired, tampered, or otherwise invalid
  }
}

function googleClientId() {
  // .trim() guards against a stray trailing newline/space from copy-pasting
  // the value into a dashboard env var field — that would silently make the
  // audience check below fail (the token's `aud` claim has no whitespace).
  const clientId = process.env.VITE_GOOGLE_CLIENT_ID?.trim()
  if (!clientId) throw Object.assign(new Error('VITE_GOOGLE_CLIENT_ID is not configured'), { code: 'config' })
  return clientId
}

// Verifies a Google Identity Services credential (ID token) and returns the
// claims we care about. Throws {code: 'config'} if unconfigured, or
// {code: 'invalid_token'} if the token is malformed/expired/wrong audience.
export async function verifyGoogleIdToken(idToken) {
  const clientId = googleClientId()
  const client = new OAuth2Client(clientId)
  let ticket
  try {
    ticket = await client.verifyIdToken({ idToken, audience: clientId })
  } catch (err) {
    // Logged (not surfaced to the user) so a real config mismatch — wrong
    // audience, expired token, wrong issuer — is diagnosable instead of
    // guessed at behind the generic "invalid_token" response.
    console.error('[auth] Google ID token verification failed:', err.message)
    throw Object.assign(new Error('Invalid Google ID token'), { code: 'invalid_token' })
  }
  const payload = ticket.getPayload()
  return { googleId: payload.sub, email: payload.email, name: payload.name }
}
