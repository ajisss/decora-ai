// Imaginer (Mirava) image generation client — async task-based API (submit,
// poll for result), same shape as the kie.ai client it replaces. See
// https://docs-imaginer.mirava.studio/api-reference. Uses the GPT Image 2 model.
const IMAGINER_BASE = 'https://imaginer.mirava.studio'
const MODEL_ID = 'gpt-image-2'

function apiKey() {
  const key = process.env.IMAGINER_API_KEY
  if (!key) throw Object.assign(new Error('IMAGINER_API_KEY is not configured'), { code: 'config' })
  return key
}

// Imaginer's API occasionally rejects a perfectly valid request with a
// transient-looking error (observed directly: "Internal server error", and a
// bogus "Model/quality cost not configured for gpt-image-2 (medium)" that
// disappeared on an identical retry seconds later) — so a single bad response
// doesn't necessarily mean the request itself was invalid. Retry a few times
// with backoff before surfacing the failure.
async function withRetry(fn, { attempts = 3, delayMs = 2000 } = {}) {
  let lastErr
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err
      if (i < attempts - 1) {
        console.log(`[imaginer] request failed (attempt ${i + 1}/${attempts}): ${err.message} — retrying`)
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }
    }
  }
  throw lastErr
}

// Reference images are uploaded as raw bytes (unlike kie.ai, which required a
// publicly reachable URL) — no PUBLIC_BASE_URL workaround needed.
async function uploadReference(buffer, mime = 'image/png') {
  return withRetry(async () => {
    const form = new FormData()
    form.append('image', new Blob([buffer], { type: mime }), 'reference.png')
    const res = await fetch(`${IMAGINER_BASE}/api/public/v1/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey()}` },
      body: form,
    })
    const body = await res.json().catch(() => null)
    if (!res.ok || !body?.image_id) {
      throw Object.assign(new Error(body?.message ?? `Imaginer upload failed (${res.status})`), { code: 'upstream' })
    }
    return body.image_id
  })
}

async function createGeneration({ prompt, refImageIds, ratio = '3:2', quality = 'medium', style } = {}) {
  return withRetry(async () => {
    const res = await fetch(`${IMAGINER_BASE}/api/public/v1/generate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model_id: MODEL_ID,
        prompt,
        ratio,
        quality,
        ...(style ? { style } : {}),
        ...(refImageIds?.length ? { ref_image_ids: refImageIds } : {}),
      }),
    })
    const body = await res.json().catch(() => null)
    if (!res.ok || !body?.generation_id) {
      throw Object.assign(new Error(body?.error ?? `Imaginer request failed (${res.status})`), { code: 'upstream' })
    }
    return body.generation_id
  })
}

// Generation runs in the background (server/routes/generate.js), not inline in
// an HTTP request, so a generous ceiling is safe.
//
// The status-check endpoint itself occasionally blips with a bare
// `{"error":"Internal server error"}` (observed directly, transient — a retry
// a few seconds later succeeds normally) even while the underlying generation
// task is still fine. Only give up on that after several consecutive bad
// polls in a row; a `status: failed`/`cancelled` result (the task itself
// actually failing) still fails immediately, since that's not transient.
async function pollGeneration(generationId, { intervalMs = 4000, timeoutMs = 600000, maxConsecutiveErrors = 5 } = {}) {
  const deadline = Date.now() + timeoutMs
  let lastStatus = null
  let consecutiveErrors = 0
  while (Date.now() < deadline) {
    const res = await fetch(`${IMAGINER_BASE}/api/public/v1/generate/${encodeURIComponent(generationId)}`, {
      headers: { Authorization: `Bearer ${apiKey()}` },
    })
    const body = await res.json().catch(() => null)
    if (!res.ok || !body?.status) {
      consecutiveErrors += 1
      if (consecutiveErrors >= maxConsecutiveErrors) {
        throw Object.assign(new Error(body?.error ?? `Imaginer status check failed (${res.status})`), { code: 'upstream' })
      }
      console.log(`[imaginer] generation=${generationId} status-check blip (${consecutiveErrors}/${maxConsecutiveErrors}): ${body?.error ?? res.status}`)
      await new Promise((resolve) => setTimeout(resolve, intervalMs))
      continue
    }
    consecutiveErrors = 0
    const { status } = body
    if (status !== lastStatus) {
      console.log(`[imaginer] generation=${generationId} status=${status}`)
      lastStatus = status
    }
    if (status === 'success') {
      const url = body.urls?.[0]
      if (!url) throw Object.assign(new Error('No image URL in Imaginer result'), { code: 'upstream' })
      return url
    }
    if (status === 'failed' || status === 'cancelled') {
      throw Object.assign(new Error(body.error || 'Generation failed'), { code: 'generation_failed' })
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }
  throw Object.assign(new Error('Imaginer generation timed out'), { code: 'upstream' })
}

async function downloadImage(url) {
  const res = await fetch(url)
  if (!res.ok) throw Object.assign(new Error('Could not download the generated image'), { code: 'upstream' })
  return Buffer.from(await res.arrayBuffer())
}

// Text-to-image.
export async function generateImage(prompt) {
  const generationId = await createGeneration({ prompt })
  const url = await pollGeneration(generationId)
  return downloadImage(url)
}

// Image-to-image (R3/R4, item images): upload the reference bytes first, then
// reference it via ref_image_ids. `opts` lets callers override ratio/quality/
// style — item-image extraction wants a tighter, less "creative" render than
// a full design regeneration does.
export async function editImage(prompt, referenceBuffer, referenceMime = 'image/png', opts = {}) {
  const imageId = await uploadReference(referenceBuffer, referenceMime)
  const generationId = await createGeneration({ prompt, refImageIds: [imageId], ...opts })
  const url = await pollGeneration(generationId)
  return downloadImage(url)
}
