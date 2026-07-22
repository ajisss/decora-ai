import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomBytes } from 'node:crypto'
import express from 'express'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Local dev convenience: if no JWT secret is configured we mint an ephemeral
// one so register/login work with zero setup. Real deployments set
// AUTH_JWT_SECRET (verified by the auth lib, which still throws when unset).
// Must run BEFORE ./app.js imports the auth lib, so the env is in place first.
if (!process.env.AUTH_JWT_SECRET) {
  process.env.AUTH_JWT_SECRET = randomBytes(32).toString('hex')
  console.warn('[auth] AUTH_JWT_SECRET unset — using an ephemeral dev secret (set it for real deployments).')
}

const { app } = await import('./app.js')
const { migrate, withDbRetry } = await import('./lib/db.js')

const DATA_DIR = path.join(__dirname, 'data')
const port = process.env.API_PORT ? Number(process.env.API_PORT) : 4489

// migrate() runs a dozen+ raw DDL statements outside the store layer's retry
// wrapper — one Neon connection blip here used to take the whole process
// down at startup (unhandled top-level rejection) instead of just failing a
// request. Retrying the whole thing is safe: every statement is IF NOT
// EXISTS / ADD COLUMN IF NOT EXISTS, so re-running it from scratch is a no-op
// past the first successful run.
await withDbRetry(migrate)()

// Local fallback: serve generated images + uploads from disk so <img src> works
// without Vercel Blob. Unused on Vercel (Blob serves those directly).
app.use('/images', express.static(path.join(DATA_DIR, 'images')))
app.use('/uploads', express.static(path.join(DATA_DIR, 'uploads')))

app.listen(port, () => {
  console.log(`Decor-AI API listening on http://localhost:${port}`)
})
