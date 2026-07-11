import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { nanoid } from 'nanoid'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const USERS_DIR = path.join(__dirname, '..', 'data', 'users')

async function ensureDir() {
  await fs.mkdir(USERS_DIR, { recursive: true })
}
await ensureDir()

function userPath(id) {
  return path.join(USERS_DIR, `${id}.json`)
}

async function atomicWriteJson(filePath, data) {
  const tmpPath = `${filePath}.tmp`
  await fs.writeFile(tmpPath, JSON.stringify(data, null, 2), 'utf-8')
  await fs.rename(tmpPath, filePath)
}

async function readAllUsers() {
  await ensureDir()
  const files = await fs.readdir(USERS_DIR)
  return Promise.all(
    files
      .filter((f) => f.endsWith('.json'))
      .map(async (f) => JSON.parse(await fs.readFile(path.join(USERS_DIR, f), 'utf-8'))),
  )
}

export async function createUser({ name, email, passwordHash = null, googleId = null }) {
  const now = new Date().toISOString()
  const user = {
    id: nanoid(),
    name,
    email: email.toLowerCase(),
    passwordHash,
    googleId,
    usageGoal: null,
    createdAt: now,
    updatedAt: now,
  }
  await atomicWriteJson(userPath(user.id), user)
  return user
}

export async function findUserByEmail(email) {
  const users = await readAllUsers()
  return users.find((u) => u.email === email.toLowerCase()) ?? null
}

export async function findUserByGoogleId(googleId) {
  const users = await readAllUsers()
  return users.find((u) => u.googleId === googleId) ?? null
}

export async function findUserById(id) {
  try {
    return JSON.parse(await fs.readFile(userPath(id), 'utf-8'))
  } catch (err) {
    if (err.code === 'ENOENT') return null
    throw err
  }
}

export async function updateUser(id, patch) {
  const current = await findUserById(id)
  if (!current) return null
  const updated = { ...current, ...patch, updatedAt: new Date().toISOString() }
  await atomicWriteJson(userPath(id), updated)
  return updated
}
