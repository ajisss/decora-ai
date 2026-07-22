import { nanoid } from 'nanoid'
import { sql, USE_LOCAL_DB, withDbRetry } from './db.js'
import * as local from './localStore.js'

const L = USE_LOCAL_DB ? local : null

function toUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    googleId: row.google_id,
    usageGoal: row.usage_goal,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  }
}

async function cloudCreateUser({ name, email, passwordHash = null, googleId = null }) {
  const id = nanoid()
  const rows = await sql`
    INSERT INTO users (id, name, email, password_hash, google_id)
    VALUES (${id}, ${name}, ${email.toLowerCase()}, ${passwordHash}, ${googleId})
    RETURNING *
  `
  return toUser(rows[0])
}

async function cloudFindUserByEmail(email) {
  const rows = await sql`SELECT * FROM users WHERE email = ${email.toLowerCase()}`
  return rows[0] ? toUser(rows[0]) : null
}

async function cloudFindUserByGoogleId(googleId) {
  const rows = await sql`SELECT * FROM users WHERE google_id = ${googleId}`
  return rows[0] ? toUser(rows[0]) : null
}

async function cloudFindUserById(id) {
  const rows = await sql`SELECT * FROM users WHERE id = ${id}`
  return rows[0] ? toUser(rows[0]) : null
}

async function cloudUpdateUser(id, patch) {
  const current = await cloudFindUserById(id)
  if (!current) return null
  const merged = { ...current, ...patch }
  const rows = await sql`
    UPDATE users SET
      name = ${merged.name},
      email = ${merged.email.toLowerCase()},
      password_hash = ${merged.passwordHash},
      google_id = ${merged.googleId},
      usage_goal = ${merged.usageGoal},
      updated_at = ${new Date().toISOString()}
    WHERE id = ${id}
    RETURNING *
  `
  return toUser(rows[0])
}

export const createUser = L ? L.createUser : withDbRetry(cloudCreateUser)
export const findUserByEmail = L ? L.findUserByEmail : withDbRetry(cloudFindUserByEmail)
export const findUserByGoogleId = L ? L.findUserByGoogleId : withDbRetry(cloudFindUserByGoogleId)
export const findUserById = L ? L.findUserById : withDbRetry(cloudFindUserById)
export const updateUser = L ? L.updateUser : withDbRetry(cloudUpdateUser)
