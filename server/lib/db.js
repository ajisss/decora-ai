import { neon } from '@neondatabase/serverless'

// Local fallback (no cloud creds): when DATABASE_URL is unset we skip Neon
// entirely and the store layer falls back to file-based JSON (server/data/*).
// The cloud path stays untouched for team/Vercel deployments.
export const USE_LOCAL_DB = !process.env.DATABASE_URL

export const sql = USE_LOCAL_DB ? null : neon(process.env.DATABASE_URL)

// Neon's HTTP driver occasionally throws a bare "fetch failed" (transient
// connection blip, not a query error) — observed directly, repeatedly, on
// this box. Retrying the whole store call is safe: reads are naturally
// idempotent, and the one multi-statement write (cloudSaveProject) rebuilds
// its query list from scratch on every call, so a retry re-issues a clean
// transaction rather than replaying stale query objects.
export function withDbRetry(fn, { attempts = 5, delayMs = 700 } = {}) {
  return async (...args) => {
    let lastErr
    for (let i = 0; i < attempts; i++) {
      try {
        return await fn(...args)
      } catch (err) {
        lastErr = err
        if (!/fetch failed|ETIMEDOUT|ECONNRESET|EHOSTUNREACH/.test(err?.message ?? '')) throw err
        if (i < attempts - 1) await new Promise((resolve) => setTimeout(resolve, delayMs))
      }
    }
    throw lastErr
  }
}

export async function migrate() {
  // No-op locally — the local store creates its own JSON files on first write.
  if (USE_LOCAL_DB) return
  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      prompt TEXT,
      setup JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS generations (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL,
      prompt TEXT,
      modification_note TEXT,
      status TEXT NOT NULL,
      image_id TEXT,
      error TEXT,
      analysis JSONB
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS generations_project_id_idx ON generations (project_id)`
  await sql`CREATE INDEX IF NOT EXISTS generations_status_idx ON generations (status)`

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT,
      google_id TEXT UNIQUE,
      usage_goal TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `

  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE`
  await sql`CREATE INDEX IF NOT EXISTS projects_user_id_idx ON projects (user_id)`
  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS messages JSONB NOT NULL DEFAULT '[]'::jsonb`
  // Favorites were only ever persisted by the local store — on a Neon deploy
  // every save round-trip silently erased them.
  await sql`ALTER TABLE generations ADD COLUMN IF NOT EXISTS favorite BOOLEAN NOT NULL DEFAULT false`
  await sql`ALTER TABLE generations ADD COLUMN IF NOT EXISTS favorite_name TEXT`
}
