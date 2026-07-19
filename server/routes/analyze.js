import { Router } from 'express'
import { getProject, saveProject, readImage } from '../lib/store.js'
import { analyzeImage } from '../lib/vision.js'
import { requireAuth } from '../middleware/requireAuth.js'

const router = Router()
router.use(requireAuth)

router.post('/', async (req, res) => {
  const { projectId, generationId } = req.body ?? {}
  const project = await getProject(projectId, req.user.id)
  if (!project) return res.status(404).json({ error: { message: 'Project not found', code: 'not_found' } })

  const generation = project.generations.find((g) => g.id === generationId)
  if (!generation || generation.status !== 'done') {
    return res.status(400).json({ error: { message: 'Generation is not ready to analyze', code: 'bad_request' } })
  }

  try {
    // Analisis selalu pakai kie.ai asli (gemini-2.5-flash — sangat murah);
    // MOCK_AI hanya memengaruhi generate gambar. Keputusan user eksplisit.
    const buffer = await readImage(generation.imageId)
    // A3: malformed JSON from the model is usually a one-off — retry a
    // handful of times before giving up (was a single retry; that wasn't
    // always enough).
    let result
    let lastErr
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        result = await analyzeImage(buffer)
        lastErr = null
        break
      } catch (err) {
        lastErr = err
        if (err.code !== 'parse') break
      }
    }
    if (lastErr) throw lastErr

    const previousManual = generation.analysis?.items?.filter((i) => i.isManual) ?? []
    const detected = (result.items ?? []).map((item) => ({
      id: `${generationId}-${item.category}-${Math.random().toString(36).slice(2, 8)}`,
      ...item,
      included: true,
      note: '',
      isManual: false,
    }))

    generation.analysis = { analyzedAt: new Date().toISOString(), items: [...detected, ...previousManual] }
    project.updatedAt = new Date().toISOString()
    await saveProject(project, req.user.id)
    res.json({ analysis: generation.analysis })
  } catch (err) {
    console.error('[analyze] failed:', err.code, err.message)
    res.status(502).json({ error: { message: 'Desain ini belum bisa dianalisis. Coba lagi, ya.', code: 'upstream' } })
  }
})

export default router
