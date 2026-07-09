import { Router } from 'express'
import { listProjects, getProject, saveProject, deleteProject } from '../lib/store.js'

const router = Router()

router.get('/', async (_req, res) => {
  res.json({ projects: await listProjects() })
})

router.get('/:id', async (req, res) => {
  const project = await getProject(req.params.id)
  if (!project) return res.status(404).json({ error: { message: 'Project not found', code: 'not_found' } })
  res.json({ project })
})

router.put('/:id', async (req, res) => {
  const incoming = req.body?.project
  if (!incoming || incoming.id !== req.params.id) {
    return res.status(400).json({ error: { message: 'Project payload mismatch', code: 'bad_request' } })
  }
  const project = { ...incoming, updatedAt: new Date().toISOString() }
  await saveProject(project)
  res.json({ project })
})

router.delete('/:id', async (req, res) => {
  await deleteProject(req.params.id)
  res.status(204).end()
})

export default router
