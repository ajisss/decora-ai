import { Router } from 'express'
import { compilePrompt } from '../lib/promptTemplate.js'

const router = Router()

// Compiles a wizard setup into a prompt for the editable preview step, before a project exists.
router.post('/preview', (req, res) => {
  const setup = req.body?.setup
  if (!setup) return res.status(400).json({ error: { message: 'setup is required', code: 'bad_request' } })
  res.json({ prompt: compilePrompt(setup) })
})

export default router
