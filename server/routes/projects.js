import { Router } from 'express'
import { listProjects, getProject, saveProject, deleteProject } from '../lib/store.js'
import { requireAuth } from '../middleware/requireAuth.js'

const router = Router()

router.use(requireAuth)

router.get('/', async (req, res) => {
  res.json({ projects: await listProjects(req.user.id) })
})

router.get('/:id', async (req, res) => {
  const project = await getProject(req.params.id, req.user.id)
  if (!project) return res.status(404).json({ error: { message: 'Project not found', code: 'not_found' } })
  res.json({ project })
})

router.put('/:id', async (req, res) => {
  const incoming = req.body?.project
  if (!incoming || incoming.id !== req.params.id) {
    return res.status(400).json({ error: { message: 'Project payload mismatch', code: 'bad_request' } })
  }
  const project = { ...incoming, updatedAt: new Date().toISOString() }
  await saveProject(project, req.user.id)
  res.json({ project })
})

router.delete('/:id', async (req, res) => {
  await deleteProject(req.params.id, req.user.id)
  res.status(204).end()
})

export default router
