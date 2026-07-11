import express from 'express'
import cors from 'cors'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import projectsRouter from './routes/projects.js'
import generateRouter from './routes/generate.js'
import planRouter from './routes/plan.js'
import analyzeRouter from './routes/analyze.js'
import uploadsRouter from './routes/uploads.js'
import promptRouter from './routes/prompt.js'
import itemImageRouter from './routes/itemImage.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const app = express()
app.use(cors())
app.use(express.json({ limit: '2mb' }))

app.use('/api/projects', projectsRouter)
app.use('/api/generate', generateRouter)
app.use('/api/plan', planRouter)
app.use('/api/analyze', analyzeRouter)
app.use('/api/uploads', uploadsRouter)
app.use('/api/prompt', promptRouter)
app.use('/api/item-image', itemImageRouter)

app.get('/api/health', (_req, res) => res.json({ ok: true }))

// Single-process prod mode only (`node server/index.js` after `npm run build`).
// On Vercel, static files are served by the platform itself — this path is
// simply never reached there since only /api/* is rewritten to the function.
const distDir = path.join(__dirname, '..', 'dist')
app.use(express.static(distDir))
app.use((req, res, next) => {
  if (
    req.method !== 'GET' ||
    req.path.startsWith('/api') ||
    req.path.startsWith('/images') ||
    req.path.startsWith('/uploads')
  )
    return next()
  res.sendFile(path.join(distDir, 'index.html'), (err) => err && next())
})
