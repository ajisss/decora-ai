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
import { DATA_DIR } from './lib/store.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const port = process.env.API_PORT ? Number(process.env.API_PORT) : 4489

const app = express()
app.use(cors())
app.use(express.json({ limit: '2mb' }))

app.use('/api/projects', projectsRouter)
app.use('/api/generate', generateRouter)
app.use('/api/plan', planRouter)
app.use('/api/analyze', analyzeRouter)
app.use('/api/uploads', uploadsRouter)
app.use('/api/prompt', promptRouter)
app.use('/api/item-image', itemImageRouter)

app.use('/images', express.static(path.join(DATA_DIR, 'images')))
app.use('/uploads', express.static(path.join(DATA_DIR, 'uploads')))

app.get('/api/health', (_req, res) => res.json({ ok: true }))

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

app.listen(port, () => {
  console.log(`Decor-AI API listening on http://localhost:${port}`)
})
