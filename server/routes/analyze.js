import { Router } from 'express'
import { getProject, saveProject, readImage } from '../lib/store.js'
import { analyzeImage } from '../lib/vision.js'

const router = Router()

router.post('/', async (req, res) => {
  const { projectId, generationId } = req.body ?? {}
  const project = await getProject(projectId)
  if (!project) return res.status(404).json({ error: { message: 'Project not found', code: 'not_found' } })

  const generation = project.generations.find((g) => g.id === generationId)
  if (!generation || generation.status !== 'done') {
    return res.status(400).json({ error: { message: 'Generation is not ready to analyze', code: 'bad_request' } })
  }

  try {
    // Analisis selalu pakai kie.ai asli (gemini-2.5-flash — sangat murah);
    // MOCK_AI hanya memengaruhi generate gambar. Keputusan user eksplisit.
    const buffer = await readImage(generation.imageId)
    let result
    try {
      result = await analyzeImage(buffer)
    } catch (err) {
      if (err.code === 'parse') result = await analyzeImage(buffer) // A3: one retry on malformed JSON
      else throw err
    }

    const previousManual = generation.analysis?.items.filter((i) => i.isManual) ?? []
    const detected = (result.items ?? []).map((item) => ({
      id: `${generationId}-${item.category}-${Math.random().toString(36).slice(2, 8)}`,
      ...item,
      included: true,
      note: '',
      isManual: false,
    }))

    generation.analysis = { analyzedAt: new Date().toISOString(), items: [...detected, ...previousManual] }
    project.updatedAt = new Date().toISOString()
    await saveProject(project)
    res.json({ analysis: generation.analysis })
  } catch (err) {
    console.error('[analyze] failed:', err.code, err.message)
    res.status(502).json({ error: { message: 'Desain ini belum bisa dianalisis. Coba lagi, ya.', code: 'upstream' } })
  }
})

export default router
