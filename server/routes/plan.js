import { Router } from 'express'
import { nanoid } from 'nanoid'
import { getProject, saveProject } from '../lib/store.js'
import { planReply } from '../lib/planner.js'
import { requireAuth } from '../middleware/requireAuth.js'

const router = Router()
router.use(requireAuth)

// Plan mode: a free-text advisory turn. Unlike /generate this is synchronous and
// spend-free — the chat endpoint returns in seconds — so no background job or
// polling. Appends the user turn + the advisor reply to project.messages and
// returns the full message list (authoritative; the client replaces its
// optimistic copy with this).
router.post('/', async (req, res) => {
  const { projectId, message } = req.body ?? {}
  if (!projectId || !message?.trim()) {
    return res.status(400).json({ error: { message: 'projectId and message are required', code: 'bad_request' } })
  }

  const project = await getProject(projectId, req.user.id)
  if (!project) return res.status(404).json({ error: { message: 'Project not found', code: 'not_found' } })

  const now = new Date().toISOString()
  const messages = project.messages ?? []
  const userMessage = { id: nanoid(), role: 'user', text: message.trim(), createdAt: now }
  const history = [...messages, userMessage]

  let reply
  try {
    reply = await planReply(project.setup, history)
  } catch (err) {
    console.error('[plan] failed:', err.code, err.message)
    const code = err.code === 'config' ? 'config' : 'upstream'
    return res.status(code === 'config' ? 503 : 502).json({
      error: {
        code,
        message:
          code === 'config'
            ? 'Layanan rencana belum dikonfigurasi. Cek API key di server.'
            : 'Layanan rencana tidak bisa dihubungi. Coba lagi.',
      },
    })
  }

  const assistantMessage = { id: nanoid(), role: 'assistant', text: reply, createdAt: new Date().toISOString() }
  project.messages = [...history, assistantMessage]
  project.updatedAt = new Date().toISOString()
  await saveProject(project, req.user.id)

  res.json({ messages: project.messages })
})

export default router
