import { Router } from 'express'
import { nanoid } from 'nanoid'
import { getProject, saveProject, saveImage } from '../lib/store.js'
import { generateImage, editImage } from '../lib/kie.js'
import { mockGenerateImage, MOCK_AI_ENABLED } from '../lib/mockAi.js'

const router = Router()
const DAILY_CAP = process.env.GENERATION_DAILY_CAP ? Number(process.env.GENERATION_DAILY_CAP) : 20

function todayCount(project) {
  const today = new Date().toISOString().slice(0, 10)
  return project.generations.filter((g) => g.createdAt.slice(0, 10) === today).length
}

// kie.ai's image-to-image model fetches the reference from a public URL — it
// can't reach a localhost dev server. Only attempt it when PUBLIC_BASE_URL is
// configured (e.g. a deployed instance or an ngrok tunnel); otherwise a
// reference image is silently ignored and generation falls back to text-to-image.
function publicUrlFor(pathname) {
  const base = process.env.PUBLIC_BASE_URL
  return base ? `${base.replace(/\/$/, '')}${pathname}` : null
}

// kie.ai's task can take anywhere from ~30s to several minutes (observed), far
// past what's reasonable to hold an HTTP request open for. Generation runs in
// the background; the client discovers completion via GET /api/projects/:id
// polling — the same recovery path that already handles a page refresh
// mid-generation (wireflow §5.3 / tasks.md G12).
async function runGenerationInBackground(projectId, generationId, effectivePrompt, referenceUrl, hasReference) {
  let status = 'done'
  let imageId = null
  let error = null

  try {
    const buffer = MOCK_AI_ENABLED
      ? await mockGenerateImage()
      : hasReference && referenceUrl
        ? await editImage(effectivePrompt, referenceUrl)
        : await generateImage(effectivePrompt)
    imageId = await saveImage(generationId, buffer)
  } catch (err) {
    console.error('[generate] failed:', err.code, err.message)
    status = 'error'
    error =
      err.code === 'config'
        ? 'Layanan gambar belum dikonfigurasi. Cek API key di server.'
        : err.code === 'generation_failed'
          ? 'Permintaan ini ditolak layanan gambar. Coba ubah kata-kata catatanmu.'
          : 'Layanan desain tidak bisa dihubungi. Promptmu aman — coba lagi.'
  }

  // Re-read the project so this update doesn't clobber unrelated edits
  // (checklist changes, rename, etc.) made while generation was in flight.
  const latest = await getProject(projectId)
  if (!latest) return // project deleted mid-generation
  const generation = latest.generations.find((g) => g.id === generationId)
  if (!generation) return
  generation.status = status
  generation.imageId = imageId
  generation.error = error
  latest.updatedAt = new Date().toISOString()
  await saveProject(latest)

  console.log(`[generate] project=${projectId} status=${status} today=${todayCount(latest)}/${DAILY_CAP}`)
}

router.post('/', async (req, res) => {
  const { projectId, prompt, modificationNote, referenceImageId, referenceGenerationImageId } = req.body ?? {}
  if (!projectId || !prompt) {
    return res.status(400).json({ error: { message: 'projectId and prompt are required', code: 'bad_request' } })
  }

  const project = await getProject(projectId)
  if (!project) return res.status(404).json({ error: { message: 'Project not found', code: 'not_found' } })

  // G1: one generation at a time per project.
  if (project.generations.some((g) => g.status === 'pending')) {
    return res.status(409).json({ error: { message: 'A generation is already in progress', code: 'concurrent' } })
  }

  // G2: server-enforced daily cap per project.
  if (todayCount(project) >= DAILY_CAP) {
    return res.status(429).json({ error: { message: 'Daily generation limit reached', code: 'cap', limit: DAILY_CAP } })
  }

  const effectivePrompt = modificationNote?.trim()
    ? `${prompt} Modification request: ${modificationNote.trim()}`
    : prompt

  const generation = {
    id: nanoid(),
    createdAt: new Date().toISOString(),
    prompt: effectivePrompt,
    modificationNote: modificationNote?.trim() || null,
    status: 'pending',
    imageId: null,
    error: null,
    analysis: null,
  }
  project.generations.unshift(generation)
  project.updatedAt = new Date().toISOString()
  await saveProject(project)

  // R3/R4: a reference image (wizard upload, or a prior "Use as reference" design)
  // guides generation via the image-to-image model instead of plain text-to-image.
  const referenceUrl = referenceGenerationImageId
    ? publicUrlFor(`/images/${referenceGenerationImageId}`)
    : publicUrlFor(`/uploads/${referenceImageId ?? project.setup?.referenceImageId ?? ''}`)
  const hasReference = Boolean(referenceGenerationImageId || referenceImageId || project.setup?.referenceImageId)
  if (hasReference && !referenceUrl) {
    console.warn('[generate] reference image ignored — PUBLIC_BASE_URL is not configured')
  }

  // Respond immediately with the pending entry; the client polls for the result.
  res.json({ generation, project })

  runGenerationInBackground(projectId, generation.id, effectivePrompt, referenceUrl, hasReference)
})

export default router
