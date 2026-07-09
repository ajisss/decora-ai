import { Router } from 'express'
import { nanoid } from 'nanoid'
import { saveUpload } from '../lib/store.js'

const router = Router()

const ALLOWED_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
const MAX_BYTES = 8 * 1024 * 1024

// Accepts a base64 data URL from the client (no multipart parsing dependency needed at this scale).
router.post('/', async (req, res) => {
  const { dataUrl } = req.body ?? {}
  const match = /^data:(image\/[a-z]+);base64,(.+)$/.exec(dataUrl ?? '')
  if (!match || !ALLOWED_TYPES[match[1]]) {
    return res.status(400).json({ error: { message: 'Use a JPG, PNG, or WebP image', code: 'bad_type' } })
  }
  const buffer = Buffer.from(match[2], 'base64')
  if (buffer.byteLength > MAX_BYTES) {
    return res.status(400).json({ error: { message: 'Keep it under 8 MB', code: 'too_large' } })
  }
  const id = nanoid()
  const filename = await saveUpload(id, buffer, ALLOWED_TYPES[match[1]])
  res.json({ referenceImageId: filename })
})

export default router
