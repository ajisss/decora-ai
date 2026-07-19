import { Router } from 'express'
import { getProject } from '../lib/store.js'
import { signShareToken, verifyShareToken } from '../lib/shareToken.js'
import { requireAuth } from '../middleware/requireAuth.js'

const router = Router()

// Issue a time-limited share link for one generation. Auth required so only
// the project owner can mint links; the resulting URL is then openable by
// anyone who has it (view-only), but only until the token expires.
router.post('/:projectId/:generationId', requireAuth, async (req, res) => {
  const { projectId, generationId } = req.params
  const project = await getProject(projectId, req.user.id)
  if (!project) return res.status(404).json({ error: { message: 'Project not found', code: 'not_found' } })
  // Only a finished design is readable through the public route below, so
  // minting a link for anything else hands back a URL that always 404s.
  const generation = project.generations.find((g) => g.id === generationId)
  if (!generation) return res.status(404).json({ error: { message: 'Generation not found', code: 'not_found' } })
  if (generation.status !== 'done') {
    return res.status(400).json({ error: { message: 'Desain ini belum selesai dibuat.', code: 'not_ready' } })
  }
  const token = signShareToken(projectId, generationId)
  res.json({ url: `/share/${projectId}/${generationId}?t=${token}` })
})

// Public, token-gated read. No auth — the token proves the link was issued
// by the owner. Returns the project only if the token is valid + unexpired
// and matches this exact project+generation.
router.get('/:projectId/:generationId', async (req, res) => {
  const { projectId, generationId } = req.params
  const token = req.query.t
  if (!verifyShareToken(token, projectId, generationId)) {
    return res.status(403).json({ error: { message: 'Link berbagi tidak valid atau sudah kedaluwarsa.', code: 'forbidden' } })
  }
  const project = await getProject(projectId, '__public__')
  if (!project) return res.status(404).json({ error: { message: 'Project not found', code: 'not_found' } })
  const generation = project.generations.find((g) => g.id === generationId && g.status === 'done')
  if (!generation) return res.status(404).json({ error: { message: 'Generation not found', code: 'not_found' } })

  // The token is scoped to ONE generation, so the response must be too.
  // Returning the whole project handed every holder of a single link the
  // owner's other designs, their failed attempts, and the full plan-mode chat
  // transcript — including anything added after the link was shared.
  res.json({
    project: {
      id: project.id,
      name: project.name,
      setup: project.setup,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      generations: [generation],
      messages: [],
    },
  })
})

export default router
