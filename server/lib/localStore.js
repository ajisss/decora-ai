// File-based local fallback used when DATABASE_URL is unset (no Neon/cloud).
// Mirrors the cloud store's shapes exactly: project.setup / messages come back
// as parsed objects, dates as ISO strings — so callers can't tell the
// difference. Writes are atomic (temp file + rename). Gitignored (server/data).
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const DATA_DIR = path.join(__dirname, '..', 'data')
const PROJECTS_DIR = path.join(DATA_DIR, 'projects')
const IMAGES_DIR = path.join(DATA_DIR, 'images')
const USERS_DIR = path.join(DATA_DIR, 'users')
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads')

async function ensureDirs() {
  await fs.mkdir(PROJECTS_DIR, { recursive: true })
  await fs.mkdir(IMAGES_DIR, { recursive: true })
  await fs.mkdir(USERS_DIR, { recursive: true })
  await fs.mkdir(UPLOADS_DIR, { recursive: true })
}
ensureDirs()

async function readJson(file) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'))
  } catch {
    return null
  }
}

async function writeJson(file, data) {
  await fs.mkdir(path.dirname(file), { recursive: true })
  const tmp = `${file}.tmp`
  await fs.writeFile(tmp, JSON.stringify(data, null, 2))
  await fs.rename(tmp, file)
}

// --- projects + generations ---

// Old rows (pre-dating the /images/ prefix in saveImage) stored a bare
// filename — normalize on read so the <img> tag still resolves.
function normalizeImageId(imageId) {
  if (!imageId) return null
  return imageId.startsWith('/') || imageId.startsWith('http') ? imageId : `/images/${imageId}`
}

function normalizeAnalysis(analysis) {
  if (!analysis?.items) return analysis
  return {
    ...analysis,
    items: analysis.items.map((item) =>
      item.itemImage
        ? { ...item, itemImage: { ...item.itemImage, imageId: normalizeImageId(item.itemImage.imageId) } }
        : item,
    ),
  }
}

function toGeneration(row) {
  return {
    id: row.id,
    createdAt: row.createdAt,
    prompt: row.prompt ?? null,
    modificationNote: row.modificationNote ?? null,
    status: row.status,
    imageId: normalizeImageId(row.imageId),
    error: row.error ?? null,
    analysis: normalizeAnalysis(row.analysis),
    favorite: row.favorite ?? false,
    favoriteName: row.favoriteName ?? null,
  }
}

function toProject(row, generations) {
  return {
    id: row.id,
    name: row.name,
    prompt: row.prompt ?? null,
    setup: row.setup ?? {},
    messages: row.messages ?? [],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    generations,
  }
}

export async function listProjects(userId) {
  const files = await fs.readdir(PROJECTS_DIR).catch(() => [])
  const projects = []
  for (const f of files) {
    if (!f.endsWith('.json')) continue
    const row = await readJson(path.join(PROJECTS_DIR, f))
    if (row && row.userId === userId) projects.push(row)
  }
  projects.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
  return projects.map((row) =>
    toProject(row, (row.generations ?? []).map(toGeneration)),
  )
}

export async function getProject(id, userId) {
  const row = await readJson(path.join(PROJECTS_DIR, `${id}.json`))
  // __public__ = token-gated share read (routes/share.js already verified the
  // signed token); skip the owner check so the shared generation is readable.
  if (!row || (row.userId !== userId && userId !== '__public__')) return null
  return toProject(row, (row.generations ?? []).map(toGeneration))
}

export async function saveProject(project, userId) {
  const file = path.join(PROJECTS_DIR, `${project.id}.json`)
  const existing = await readJson(file)
  const row = {
    id: project.id,
    userId,
    name: project.name,
    prompt: project.prompt ?? null,
    setup: project.setup ?? {},
    messages: project.messages ?? [],
    createdAt: project.createdAt ?? existing?.createdAt ?? new Date().toISOString(),
    updatedAt: project.updatedAt ?? new Date().toISOString(),
    generations: (project.generations ?? []).map((g) => ({
      id: g.id,
      createdAt: g.createdAt,
      prompt: g.prompt ?? null,
      modificationNote: g.modificationNote ?? null,
      status: g.status,
      imageId: g.imageId ?? null,
      error: g.error ?? null,
      analysis: g.analysis ?? null,
      favorite: g.favorite ?? false,
      favoriteName: g.favoriteName ?? null,
    })),
  }
  await writeJson(file, row)
  return project
}

export async function deleteProject(id, userId) {
  const row = await readJson(path.join(PROJECTS_DIR, `${id}.json`))
  if (!row || row.userId !== userId) return
  await fs.rm(file, { force: true })
  async function rmImage(g) {
    if (g?.imageId?.startsWith('/images/')) {
      await fs.rm(path.join(IMAGES_DIR, path.basename(g.imageId)), { force: true })
    }
  }
  for (const g of row.generations ?? []) await rmImage(g)
}

// --- images / uploads ---

export async function saveImage(id, buffer) {
  const file = path.join(IMAGES_DIR, `${id}.png`)
  await fs.writeFile(file, buffer)
  return `/images/${id}.png` // relative path served by Express static + Vite proxy
}

export async function readImage(imagePath) {
  return fs.readFile(path.join(IMAGES_DIR, path.basename(imagePath)))
}

export async function saveUpload(id, buffer, ext) {
  const file = path.join(UPLOADS_DIR, `${id}.${ext}`)
  await fs.writeFile(file, buffer)
  return `/uploads/${id}.${ext}`
}

export async function readUpload(uploadPath) {
  const file = path.join(UPLOADS_DIR, path.basename(uploadPath))
  const buffer = await fs.readFile(file)
  const ext = uploadPath.split('.').pop().split('?')[0]
  return { buffer, mime: { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }[ext] ?? 'image/png' }
}

// --- users ---

function toUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.passwordHash ?? null,
    googleId: row.googleId ?? null,
    usageGoal: row.usageGoal ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export async function createUser({ name, email, passwordHash = null, googleId = null }) {
  const crypto = await import('node:crypto')
  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  const row = { id, name, email: email.toLowerCase(), passwordHash, googleId, usageGoal: null, createdAt: now, updatedAt: now }
  await writeJson(path.join(USERS_DIR, `${id}.json`), row)
  return toUser(row)
}

async function findUser(predicate) {
  const files = await fs.readdir(USERS_DIR).catch(() => [])
  for (const f of files) {
    if (!f.endsWith('.json')) continue
    const row = await readJson(path.join(USERS_DIR, f))
    if (row && predicate(row)) return row
  }
  return null
}

export async function findUserByEmail(email) {
  const row = await findUser((r) => r.email === email.toLowerCase())
  return row ? toUser(row) : null
}
export async function findUserByGoogleId(googleId) {
  const row = await findUser((r) => r.googleId === googleId)
  return row ? toUser(row) : null
}
export async function findUserById(id) {
  const row = await readJson(path.join(USERS_DIR, `${id}.json`))
  return row ? toUser(row) : null
}
export async function updateUser(id, patch) {
  const file = path.join(USERS_DIR, `${id}.json`)
  const current = await readJson(file)
  if (!current) return null
  const merged = { ...current, ...patch, updatedAt: new Date().toISOString() }
  await writeJson(file, merged)
  return toUser(merged)
}
