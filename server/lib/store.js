import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const DATA_DIR = path.join(__dirname, '..', 'data')
const PROJECTS_DIR = path.join(DATA_DIR, 'projects')
const IMAGES_DIR = path.join(DATA_DIR, 'images')
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads')

async function ensureDirs() {
  await fs.mkdir(PROJECTS_DIR, { recursive: true })
  await fs.mkdir(IMAGES_DIR, { recursive: true })
  await fs.mkdir(UPLOADS_DIR, { recursive: true })
}
await ensureDirs()

function projectPath(id) {
  return path.join(PROJECTS_DIR, `${id}.json`)
}

async function atomicWriteJson(filePath, data) {
  const tmpPath = `${filePath}.tmp`
  await fs.writeFile(tmpPath, JSON.stringify(data, null, 2), 'utf-8')
  await fs.rename(tmpPath, filePath)
}

export async function listProjects() {
  await ensureDirs()
  const files = await fs.readdir(PROJECTS_DIR)
  const projects = await Promise.all(
    files
      .filter((f) => f.endsWith('.json'))
      .map(async (f) => JSON.parse(await fs.readFile(path.join(PROJECTS_DIR, f), 'utf-8'))),
  )
  return projects.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
}

export async function getProject(id) {
  try {
    return JSON.parse(await fs.readFile(projectPath(id), 'utf-8'))
  } catch (err) {
    if (err.code === 'ENOENT') return null
    throw err
  }
}

export async function saveProject(project) {
  await atomicWriteJson(projectPath(project.id), project)
  return project
}

export async function deleteProject(id) {
  try {
    await fs.unlink(projectPath(id))
  } catch (err) {
    if (err.code !== 'ENOENT') throw err
  }
}

export async function saveImage(id, buffer) {
  await fs.writeFile(path.join(IMAGES_DIR, `${id}.png`), buffer)
  return `${id}.png`
}

export async function readImage(imageId) {
  return fs.readFile(path.join(IMAGES_DIR, imageId))
}

export async function saveUpload(id, buffer, ext) {
  const filename = `${id}.${ext}`
  await fs.writeFile(path.join(UPLOADS_DIR, filename), buffer)
  return filename
}

export function uploadPath(filename) {
  return path.join(UPLOADS_DIR, filename)
}

const EXT_MIME = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }

export async function readUpload(filename) {
  const buffer = await fs.readFile(uploadPath(filename))
  const ext = filename.split('.').pop()
  return { buffer, mime: EXT_MIME[ext] ?? 'image/png' }
}
