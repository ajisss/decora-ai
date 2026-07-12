import { neon } from '@neondatabase/serverless'

export const sql = neon(process.env.DATABASE_URL)

export async function migrate() {
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

  // `projects` predates auth — this table already existed with no owner
  // column, so ADD COLUMN IF NOT EXISTS instead of folding it into the
  // CREATE TABLE above (which only runs for a brand-new table).
  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE`
  await sql`CREATE INDEX IF NOT EXISTS projects_user_id_idx ON projects (user_id)`
  // Plan mode (routes/plan.js) predates this table's normalization too —
  // it wrote project.messages, which store.js silently dropped since it
  // had no column to land in.
  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS messages JSONB NOT NULL DEFAULT '[]'::jsonb`
}
