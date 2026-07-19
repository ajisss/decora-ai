// Google AI Studio (Gemini) image generation client — replaces Imaginer.
// Uses gemini-2.5-flash-image ("Nano Banana"), a synchronous multimodal
// generateContent call: no submit/poll cycle like Imaginer's task API, the
// image comes back inline in the same response.
// https://ai.google.dev/gemini-api/docs/image-generation
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta'
const MODEL_ID = 'gemini-2.5-flash-image'

function apiKey() {
  const key = process.env.GOOGLE_API_KEY
  if (!key) throw Object.assign(new Error('GOOGLE_API_KEY is not configured'), { code: 'config' })
  return key
}

async function withRetry(fn, { attempts = 3, delayMs = 2000 } = {}) {
  let lastErr
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err
      if (i < attempts - 1) {
        console.log(`[googleImage] request failed (attempt ${i + 1}/${attempts}): ${err.message} — retrying`)
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }
    }
  }
  throw lastErr
}

async function generateContent(parts, ratio) {
  return withRetry(async () => {
    const res = await fetch(`${GEMINI_BASE}/models/${MODEL_ID}:generateContent`, {
      method: 'POST',
      headers: {
        'x-goog-api-key': apiKey(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: {
          responseModalities: ['IMAGE'],
          imageConfig: { aspectRatio: ratio },
        },
      }),
    })
    const body = await res.json().catch(() => null)
    if (!res.ok) {
      throw Object.assign(new Error(body?.error?.message ?? `Gemini request failed (${res.status})`), { code: 'upstream' })
    }
    const candidate = body?.candidates?.[0]
    const imagePart = candidate?.content?.parts?.find((p) => p.inlineData?.data)
    if (!imagePart) {
      // No image back — usually a safety block or a text-only refusal instead of an image.
      const textPart = candidate?.content?.parts?.find((p) => p.text)?.text
      const reason = candidate?.finishReason
      throw Object.assign(
        new Error(textPart || `Gemini did not return an image${reason ? ` (${reason})` : ''}`),
        { code: 'generation_failed' },
      )
    }
    return Buffer.from(imagePart.inlineData.data, 'base64')
  })
}

// Text-to-image.
export async function generateImage(prompt, { ratio = '3:2' } = {}) {
  return generateContent([{ text: prompt }], ratio)
}

// Image-to-image: the reference image rides along as inline data in the same
// request — no separate upload step like Imaginer required.
export async function editImage(prompt, referenceBuffer, referenceMime = 'image/png', { ratio = '3:2' } = {}) {
  return generateContent(
    [{ text: prompt }, { inlineData: { mimeType: referenceMime, data: referenceBuffer.toString('base64') } }],
    ratio,
  )
}
