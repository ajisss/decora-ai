import { Router } from 'express'
import { getProject } from '../lib/store.js'
import { getItemInsight } from '../lib/vision.js'
import { requireAuth } from '../middleware/requireAuth.js'

const router = Router()
router.use(requireAuth)

// Object Properties panel (Design Workspace Inspector): AI suggestions + a
// rough cost estimate for one checklist item. Ephemeral — not persisted to
// the project; the client applies estimatedCost into the item itself (via
// the existing PUT /api/projects/:id) only if the user clicks "Terapkan".
router.post('/', async (req, res) => {
  const { projectId, generationId, itemId } = req.body ?? {}
  if (!projectId || !generationId || !itemId) {
    return res.status(400).json({ error: { message: 'projectId, generationId, and itemId are required', code: 'bad_request' } })
  }

  const project = await getProject(projectId, req.user.id)
  if (!project) return res.status(404).json({ error: { message: 'Project not found', code: 'not_found' } })

  const generation = project.generations.find((g) => g.id === generationId)
  const item = generation?.analysis?.items?.find((i) => i.id === itemId)
  if (!item) return res.status(404).json({ error: { message: 'Item not found', code: 'not_found' } })

  try {
    const insight = await getItemInsight(item, project.setup)
    res.json(insight)
  } catch (err) {
    console.error('[item-insight] failed:', err.code, err.message)
    res.status(502).json({ error: { message: 'Saran belum bisa dibuat. Coba lagi, ya.', code: 'upstream' } })
  }
})

export default router
