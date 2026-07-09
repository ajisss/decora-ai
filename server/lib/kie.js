// kie.ai gpt-image-2 client — async task-based API (create task, poll for result),
// unlike OpenAI's synchronous Images API. See https://kie.ai/model/gpt-image-2-text-to-image.md
// and https://kie.ai/model/gpt-image-2-image-to-image.md.
const KIE_BASE = 'https://api.kie.ai/api/v1'

function apiKey() {
  const key = process.env.KIE_API_KEY
  if (!key) throw Object.assign(new Error('KIE_API_KEY is not configured'), { code: 'config' })
  return key
}

async function createTask(model, input) {
  const res = await fetch(`${KIE_BASE}/jobs/createTask`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, input }),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok || body?.code !== 200) {
    throw Object.assign(new Error(body?.msg ?? `kie.ai request failed (${res.status})`), { code: 'upstream' })
  }
  return body.data.taskId
}

// Generation now runs in the background (server/routes/generate.js), not inline
// in an HTTP request, so a generous ceiling is safe — observed kie.ai latency
// has ranged from under a minute to several minutes.
async function pollTask(taskId, { intervalMs = 4000, timeoutMs = 600000 } = {}) {
  const deadline = Date.now() + timeoutMs
  let lastState = null
  while (Date.now() < deadline) {
    const res = await fetch(`${KIE_BASE}/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`, {
      headers: { Authorization: `Bearer ${apiKey()}` },
    })
    const body = await res.json().catch(() => null)
    if (!res.ok || body?.code !== 200) {
      throw Object.assign(new Error(body?.msg ?? `kie.ai status check failed (${res.status})`), { code: 'upstream' })
    }
    const { state, resultJson, failMsg } = body.data
    if (state !== lastState) {
      console.log(`[kie] task=${taskId} state=${state}`)
      lastState = state
    }
    if (state === 'success') {
      const url = JSON.parse(resultJson ?? '{}').resultUrls?.[0]
      if (!url) throw Object.assign(new Error('No image URL in kie.ai result'), { code: 'upstream' })
      return url
    }
    if (state === 'fail') {
      throw Object.assign(new Error(failMsg || 'Generation failed'), { code: 'generation_failed' })
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }
  throw Object.assign(new Error('kie.ai generation timed out'), { code: 'upstream' })
}

async function downloadImage(url) {
  const res = await fetch(url)
  if (!res.ok) throw Object.assign(new Error('Could not download the generated image'), { code: 'upstream' })
  return Buffer.from(await res.arrayBuffer())
}

// Text-to-image. 4:3 matches the app's feed/lightbox image treatment.
export async function generateImage(prompt) {
  const taskId = await createTask('gpt-image-2-text-to-image', {
    prompt,
    aspect_ratio: '4:3',
    resolution: '1K',
  })
  const url = await pollTask(taskId)
  return downloadImage(url)
}

// Image-to-image (R3/R4). kie.ai fetches the reference from a public URL — it
// cannot reach a localhost dev server, so the caller must resolve `referenceUrl`
// via a publicly reachable PUBLIC_BASE_URL first.
export async function editImage(prompt, referenceUrl) {
  const taskId = await createTask('gpt-image-2-image-to-image', {
    prompt,
    input_urls: [referenceUrl],
    aspect_ratio: '4:3',
    resolution: '1K',
  })
  const url = await pollTask(taskId)
  return downloadImage(url)
}
