import { test } from 'node:test'
import assert from 'node:assert/strict'
import jwt from 'jsonwebtoken'
import { hashPassword, verifyPassword, signToken, verifyToken, verifyGoogleIdToken } from './auth.js'

process.env.AUTH_JWT_SECRET = 'test-secret-do-not-use-in-prod'

test('hashPassword produces a hash that verifyPassword accepts', async () => {
  const hash = await hashPassword('correct horse battery staple')
  assert.equal(await verifyPassword('correct horse battery staple', hash), true)
})

test('verifyPassword rejects a wrong password', async () => {
  const hash = await hashPassword('correct horse battery staple')
  assert.equal(await verifyPassword('wrong password', hash), false)
})

test('signToken produces a token verifyToken can decode back to the same user id', () => {
  const token = signToken({ id: 'user-123' })
  const payload = verifyToken(token)
  assert.equal(payload.sub, 'user-123')
})

test('verifyToken returns null for a tampered token', () => {
  const token = signToken({ id: 'user-123' })
  assert.equal(verifyToken(token + 'tampered'), null)
})

test('verifyToken returns null for an expired token', () => {
  const expired = jwt.sign({ sub: 'user-123' }, process.env.AUTH_JWT_SECRET, { expiresIn: '-10s' })
  assert.equal(verifyToken(expired), null)
})

test('signToken throws a config error when AUTH_JWT_SECRET is unset', () => {
  const original = process.env.AUTH_JWT_SECRET
  delete process.env.AUTH_JWT_SECRET
  assert.throws(() => signToken({ id: 'user-123' }), (err) => err.code === 'config')
  process.env.AUTH_JWT_SECRET = original
})

test('verifyGoogleIdToken throws a config error when VITE_GOOGLE_CLIENT_ID is unset', async () => {
  const original = process.env.VITE_GOOGLE_CLIENT_ID
  delete process.env.VITE_GOOGLE_CLIENT_ID
  await assert.rejects(() => verifyGoogleIdToken('fake-token'), (err) => err.code === 'config')
  if (original) process.env.VITE_GOOGLE_CLIENT_ID = original
})
