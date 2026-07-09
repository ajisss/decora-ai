import { Router } from 'express'
import { nanoid } from 'nanoid'
import { getProject, saveProject, saveImage, readImage } from '../lib/store.js'
import { generateItemImage, buildItemPrompt } from '../lib/itemImage.js'

const router = Router()

function publicUrlFor(pathname) {
  const base = process.env.PUBLIC_BASE_URL
  return base ? `${base.replace(/\/$/, '')}${pathname}` : null
}

async function runItemImageInBackground(projectId, generationId, itemId, prompt, category) {
  let status = 'done'
  let imageId = null
  let error = null

  try {
    const project = await getProject(projectId)
    const generation = project?.generations.find((g) => g.id === generationId)
    if (!generation) return
    const parentImageBuffer = await readImage(generation.imageId)

    const buffer = await generateItemImage({
      prompt,
      category,
      parentImageBuffer,
      parentImageUrl: publicUrlFor(`/images/${generation.imageId}`),
    })
    imageId = await saveImage(`${generationId}-item-${itemId}-${nanoid()}`, buffer)
  } catch (err) {
    console.error('[item-image] failed:', err.code, err.message)
    status = 'error'
    error = 'Gambar item ini belum bisa dibuat. Coba lagi, ya.'
  }

  // Re-read so this doesn't clobber unrelated edits made while generating.
  const latest = await getProject(projectId)
  if (!latest) return
  const generation = latest.generations.find((g) => g.id === generationId)
  const item = generation?.analysis?.items.find((i) => i.id === itemId)
  if (!item) return
  item.itemImage = { status, imageId, prompt, error }
  latest.updatedAt = new Date().toISOString()
  await saveProject(latest)
}

router.post('/', async (req, res) => {
  const { projectId, generationId, itemId, customPrompt } = req.body ?? {}
  const project = await getProject(projectId)
  if (!project) return res.status(404).json({ error: { message: 'Project not found', code: 'not_found' } })

  const generation = project.generations.find((g) => g.id === generationId)
  if (!generation || generation.status !== 'done') {
    return res.status(400).json({ error: { message: 'Generation is not ready', code: 'bad_request' } })
  }

  const item = generation.analysis?.items.find((i) => i.id === itemId)
  if (!item) return res.status(404).json({ error: { message: 'Item not found', code: 'not_found' } })

  // Concurrency guard, mirroring G1 for the main generation feed.
  if (item.itemImage?.status === 'pending') {
    return res.status(409).json({ error: { message: 'Already generating an image for this item', code: 'concurrent' } })
  }

  const prompt = buildItemPrompt({ setup: project.setup, item, customPrompt })
  item.itemImage = { status: 'pending', imageId: item.itemImage?.imageId ?? null, prompt, error: null }
  project.updatedAt = new Date().toISOString()
  await saveProject(project)

  res.json({ item })

  runItemImageInBackground(projectId, generationId, itemId, prompt, item.category)
})

export default router
