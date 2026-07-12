import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { put } from '@vercel/blob'
import { sql } from './db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// Still used by lib/mockAi.js for its on-disk Wikimedia cache (dev-only concern).
export const DATA_DIR = path.join(__dirname, '..', 'data')

// Rows come back with jsonb columns already parsed and timestamptz columns as
// Date objects — normalize dates to ISO strings so callers (e.g. generate.js's
// `g.createdAt.slice(0, 10)`) see exactly the shape the old file-based store gave them.
function toGeneration(row) {
  return {
    id: row.id,
    createdAt: new Date(row.created_at).toISOString(),
    prompt: row.prompt,
    modificationNote: row.modification_note,
    status: row.status,
    imageId: row.image_id,
    error: row.error,
    analysis: row.analysis,
  }
}

function toProject(row, generations) {
  return {
    id: row.id,
    name: row.name,
    prompt: row.prompt,
    setup: row.setup,
    messages: row.messages ?? [],
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
    generations,
  }
}

export async function listProjects(userId) {
  const projectRows = await sql`SELECT * FROM projects WHERE user_id = ${userId} ORDER BY updated_at DESC`
  if (projectRows.length === 0) return []
  const ids = projectRows.map((row) => row.id)
  const genRows = await sql`SELECT * FROM generations WHERE project_id = ANY(${ids}) ORDER BY created_at DESC`
  const byProject = new Map()
  for (const row of genRows) {
    const list = byProject.get(row.project_id) ?? []
    list.push(toGeneration(row))
    byProject.set(row.project_id, list)
  }
  return projectRows.map((row) => toProject(row, byProject.get(row.id) ?? []))
}

// Scoped to `userId` so a project can't be fetched by guessing/knowing its
// id alone — a missing owner match looks identical to a missing project.
export async function getProject(id, userId) {
  const projectRows = await sql`SELECT * FROM projects WHERE id = ${id} AND user_id = ${userId}`
  if (projectRows.length === 0) return null
  const genRows = await sql`SELECT * FROM generations WHERE project_id = ${id} ORDER BY created_at DESC`
  return toProject(projectRows[0], genRows.map(toGeneration))
}

// Replaces the project row and its entire generations set in one atomic
// transaction — readers (e.g. a background generation job re-reading the
// project) must never observe a state where generations were deleted but not
// yet reinserted. The ON CONFLICT's WHERE guards against a (practically
// impossible, ids are nanoid) cross-user id collision silently overwriting
// someone else's project instead of erroring.
export async function saveProject(project, userId) {
  const generations = project.generations ?? []
  const setup = JSON.stringify(project.setup ?? {})
  const messages = JSON.stringify(project.messages ?? [])

  const queries = [
    sql`
      INSERT INTO projects (id, user_id, name, prompt, setup, messages, created_at, updated_at)
      VALUES (${project.id}, ${userId}, ${project.name}, ${project.prompt ?? null}, ${setup}::jsonb, ${messages}::jsonb, ${project.createdAt}, ${project.updatedAt})
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        prompt = EXCLUDED.prompt,
        setup = EXCLUDED.setup,
        messages = EXCLUDED.messages,
        updated_at = EXCLUDED.updated_at
      WHERE projects.user_id = EXCLUDED.user_id
    `,
    sql`DELETE FROM generations WHERE project_id = ${project.id}`,
    ...generations.map((g) => {
      const analysis = g.analysis ? JSON.stringify(g.analysis) : null
      return sql`
        INSERT INTO generations (id, project_id, created_at, prompt, modification_note, status, image_id, error, analysis)
        VALUES (${g.id}, ${project.id}, ${g.createdAt}, ${g.prompt ?? null}, ${g.modificationNote ?? null}, ${g.status}, ${g.imageId ?? null}, ${g.error ?? null}, ${analysis}::jsonb)
      `
    }),
  ]
  await sql.transaction(queries)
  return project
}

export async function deleteProject(id, userId) {
  await sql`DELETE FROM projects WHERE id = ${id} AND user_id = ${userId}`
}

// imageId / referenceImageId are now full Vercel Blob URLs — opaque to callers,
// served directly by Blob's CDN (no more Express static proxy).
export async function saveImage(id, buffer) {
  const blob = await put(`images/${id}.png`, buffer, {
    access: 'public',
    contentType: 'image/png',
    addRandomSuffix: false,
  })
  return blob.url
}

export async function readImage(imageUrl) {
  const res = await fetch(imageUrl)
  if (!res.ok) throw new Error(`image fetch failed (${res.status})`)
  return Buffer.from(await res.arrayBuffer())
}

const EXT_MIME = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }

export async function saveUpload(id, buffer, ext) {
  const blob = await put(`uploads/${id}.${ext}`, buffer, {
    access: 'public',
    contentType: EXT_MIME[ext] ?? 'application/octet-stream',
    addRandomSuffix: false,
  })
  return blob.url
}

export async function readUpload(uploadUrl) {
  const res = await fetch(uploadUrl)
  if (!res.ok) throw new Error(`upload fetch failed (${res.status})`)
  const buffer = Buffer.from(await res.arrayBuffer())
  const ext = uploadUrl.split('.').pop().split('?')[0]
  return { buffer, mime: EXT_MIME[ext] ?? 'image/png' }
}
