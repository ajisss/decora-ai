import { app } from '../server/app.js'
import { migrate } from '../server/lib/db.js'

// Runs once per warm serverless instance, not per request — CREATE TABLE IF
// NOT EXISTS is cheap but there's no reason to re-run it on every invocation.
let migrated = null

export default async function handler(req, res) {
  migrated ??= migrate()
  await migrated
  app(req, res)
}
