import { Router } from 'express'
import { nanoid } from 'nanoid'
import { waitUntil } from '@vercel/functions'
import { getProject, saveProject, saveImage, readImage } from '../lib/store.js'
import { analyzeImage } from '../lib/vision.js'
import { generateItemImage, buildItemPrompt } from '../lib/itemImage.js'
import { requireAuth } from '../middleware/requireAuth.js'

const router = Router()
router.use(requireAuth)

// Runs after analyze responds: generates every item's breakdown photo in
// waves of 3 concurrent requests. Vercel's function has a hard 300s ceiling
// (vercel.json) — 7-9 items done fully sequentially (~40-60s each) routinely
// blew past that and left the tail of the batch stuck 'pending' forever.
// Full parallel was tried and measured worse: Imaginer enforces a ~3-request
// concurrency cap on this account, so firing everything at once produced a
// wave of "Too Many Requests (Concurrency limit exceeded)" that even the
// per-call retry (server/lib/imaginer.js's withRetry) couldn't fully absorb
// — half the items came back 'error' in testing. 3-at-a-time keeps every
// individual request inside Imaginer's real capacity while still finishing
// a 9-item batch in ~3 waves (well under the 300s ceiling).
//
// Writes happen once, after every item across all waves settles — not one
// save per item — because saveProject rewrites the whole generations set;
// concurrent per-item saves would race and clobber each other's results.
const ITEM_IMAGE_CONCURRENCY = 3

async function runItemImageBatch(projectId, userId, generationId, itemIds) {
  const project = await getProject(projectId, userId)
  if (!project) return
  const generation = project.generations.find((g) => g.id === generationId)
  if (!generation) return
  const parentImageBuffer = await readImage(generation.imageId)

  const results = []
  for (let i = 0; i < itemIds.length; i += ITEM_IMAGE_CONCURRENCY) {
    const wave = itemIds.slice(i, i + ITEM_IMAGE_CONCURRENCY)
    const waveResults = await Promise.all(
      wave.map(async (itemId) => {
        const item = generation.analysis?.items?.find((i) => i.id === itemId)
        if (!item) return null
        try {
          const buffer = await generateItemImage({ prompt: item.itemImage.prompt, category: item.category, parentImageBuffer })
          const imageId = await saveImage(`${generationId}-item-${itemId}-${nanoid()}`, buffer)
          return { itemId, status: 'done', imageId, error: null }
        } catch (err) {
          console.error('[analyze] item-image batch failed:', err.code, err.message)
          return { itemId, status: 'error', imageId: null, error: 'Gambar item ini belum bisa dibuat. Coba lagi, ya.' }
        }
      }),
    )
    results.push(...waveResults)
  }

  const latest = await getProject(projectId, userId)
  if (!latest) return
  const latestGeneration = latest.generations.find((g) => g.id === generationId)
  if (!latestGeneration) return
  for (const result of results) {
    if (!result) continue
    const latestItem = latestGeneration.analysis?.items?.find((i) => i.id === result.itemId)
    if (!latestItem || latestItem.itemImage?.status === 'cancelled') continue
    latestItem.itemImage = { status: result.status, imageId: result.imageId, prompt: latestItem.itemImage?.prompt, error: result.error }
  }
  latest.updatedAt = new Date().toISOString()
  await saveProject(latest, userId)
}

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

    // Every item — freshly detected or carried-over manual — gets its
    // breakdown photo regenerated. Marking them 'pending' here (rather than
    // in the background job) means the response the client gets back already
    // shows every row spinning, matching the existing per-item pending UI.
    const items = [...detected, ...previousManual].map((item) => ({
      ...item,
      itemImage: { status: 'pending', imageId: null, prompt: buildItemPrompt({ setup: project.setup, item }), error: null },
    }))
    generation.analysis = { analyzedAt: new Date().toISOString(), items }
    project.updatedAt = new Date().toISOString()
    await saveProject(project, req.user.id)
    res.json({ analysis: generation.analysis })

    waitUntil(
      runItemImageBatch(projectId, req.user.id, generationId, items.map((i) => i.id)).catch((err) =>
        console.error('[analyze] item-image batch job failed:', err),
      ),
    )
  } catch (err) {
    console.error('[analyze] failed:', err.code, err.message)
    res.status(502).json({ error: { message: 'Desain ini belum bisa dianalisis. Coba lagi, ya.', code: 'upstream' } })
  }
})

export default router
