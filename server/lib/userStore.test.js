import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { nanoid } from 'nanoid'
import { createUser, findUserByEmail, findUserByGoogleId, findUserById, updateUser } from './userStore.js'
import { sql } from './db.js'

const createdIds = []

after(async () => {
  if (createdIds.length) await sql`DELETE FROM users WHERE id = ANY(${createdIds})`
})

function uniqueEmail() {
  return `test-${nanoid(8)}@example.com`
}

test('createUser persists a user with a generated id and null usageGoal', async () => {
  const email = uniqueEmail()
  const user = await createUser({ name: 'Test User', email, passwordHash: 'hashed' })
  createdIds.push(user.id)
  assert.ok(user.id)
  assert.equal(user.email, email.toLowerCase())
  assert.equal(user.usageGoal, null)
})

test('findUserByEmail is case-insensitive and returns null when not found', async () => {
  const email = uniqueEmail()
  const created = await createUser({ name: 'Case Test', email })
  createdIds.push(created.id)
  const found = await findUserByEmail(email.toUpperCase())
  assert.equal(found.id, created.id)
  assert.equal(await findUserByEmail(uniqueEmail()), null)
})

test('findUserByGoogleId finds a user by their googleId', async () => {
  const googleId = `google-${nanoid(8)}`
  const created = await createUser({ name: 'Google Test', email: uniqueEmail(), googleId })
  createdIds.push(created.id)
  const found = await findUserByGoogleId(googleId)
  assert.equal(found.id, created.id)
})

test('findUserById returns null for a missing id', async () => {
  assert.equal(await findUserById('does-not-exist'), null)
})

test('updateUser merges a patch and bumps updatedAt', async () => {
  const created = await createUser({ name: 'Update Test', email: uniqueEmail() })
  createdIds.push(created.id)
  await new Promise((resolve) => setTimeout(resolve, 5))
  const updated = await updateUser(created.id, { usageGoal: 'vendor' })
  assert.equal(updated.usageGoal, 'vendor')
  assert.notEqual(updated.updatedAt, created.updatedAt)
})
