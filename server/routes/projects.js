import { Router } from 'express'
import { listProjects, getProject, saveProject, deleteProject } from '../lib/store.js'
import { isSafeId } from '../lib/localStore.js'
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

// Rejects a payload before it can reach the store. The store enforces
// ownership too, but the shapes matter here: generations arrive verbatim from
// the client and are later read by the generate/analyze paths, which assume
// `createdAt` is a string and `analysis.items` is an array.
function validateProject(incoming, paramId) {
  if (!incoming || typeof incoming !== 'object') return 'Project payload missing'
  if (incoming.id !== paramId) return 'Project payload mismatch'
  if (!isSafeId(incoming.id)) return 'Invalid project id'
  if (typeof incoming.name !== 'string' || incoming.name.length > 200) return 'Invalid project name'
  if (incoming.setup !== undefined && (typeof incoming.setup !== 'object' || incoming.setup === null))
    return 'Invalid setup'
  if (incoming.messages !== undefined && !Array.isArray(incoming.messages)) return 'Invalid messages'
  const gens = incoming.generations
  if (gens !== undefined) {
    if (!Array.isArray(gens) || gens.length > 500) return 'Invalid generations'
    for (const g of gens) {
      if (!g || typeof g !== 'object') return 'Invalid generation entry'
      if (!isSafeId(g.id)) return 'Invalid generation id'
      if (typeof g.status !== 'string') return 'Invalid generation status'
      // generate.js slices this to derive the daily cap — a non-string 500s it.
      if (typeof g.createdAt !== 'string' || Number.isNaN(Date.parse(g.createdAt)))
        return 'Invalid generation createdAt'
      if (g.analysis != null) {
        if (typeof g.analysis !== 'object') return 'Invalid analysis'
        if (g.analysis.items !== undefined && !Array.isArray(g.analysis.items)) return 'Invalid analysis items'
      }
    }
  }
  return null
}

router.put('/:id', async (req, res) => {
  const incoming = req.body?.project
  const invalid = validateProject(incoming, req.params.id)
  if (invalid) return res.status(400).json({ error: { message: invalid, code: 'bad_request' } })

  const project = { ...incoming, updatedAt: new Date().toISOString() }
  try {
    await saveProject(project, req.user.id)
  } catch (err) {
    if (err.code === 'forbidden') {
      return res.status(403).json({ error: { message: 'Project belongs to another user', code: 'forbidden' } })
    }
    if (err.code === 'bad_request') {
      return res.status(400).json({ error: { message: 'Invalid project id', code: 'bad_request' } })
    }
    throw err
  }
  res.json({ project })
})

router.delete('/:id', async (req, res) => {
  await deleteProject(req.params.id, req.user.id)
  res.status(204).end()
})

export default router
