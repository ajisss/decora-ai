let authToken = null

export function setAuthToken(token) {
  authToken = token
}

async function request(path, options) {
  const headers = { 'Content-Type': 'application/json', ...options?.headers }
  if (authToken) headers.Authorization = `Bearer ${authToken}`

  let res
  try {
    res = await fetch(`/api${path}`, { ...options, headers })
  } catch {
    throw { code: 'connectivity', message: 'Server tidak bisa dihubungi. Cek koneksimu.' }
  }
  if (res.status === 204) return null
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw body?.error ?? { code: 'unknown', message: 'Terjadi kesalahan. Coba lagi.' }
  }
  return body
}

export const api = {
  listProjects: () => request('/projects'),
  getProject: (id) => request(`/projects/${id}`),
  saveProject: (project) =>
    request(`/projects/${project.id}`, { method: 'PUT', body: JSON.stringify({ project }) }),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),

  generate: ({ projectId, prompt, modificationNote, referenceImageId, referenceGenerationImageId }) =>
    request('/generate', {
      method: 'POST',
      body: JSON.stringify({ projectId, prompt, modificationNote, referenceImageId, referenceGenerationImageId }),
    }),

  cancelGenerate: ({ projectId, generationId }) =>
    request('/generate/cancel', { method: 'POST', body: JSON.stringify({ projectId, generationId }) }),

  plan: ({ projectId, message }) =>
    request('/plan', { method: 'POST', body: JSON.stringify({ projectId, message }) }),

  analyze: ({ projectId, generationId }) =>
    request('/analyze', { method: 'POST', body: JSON.stringify({ projectId, generationId }) }),

  // Share: owner mints a signed, expiring link (auth); public read is
  // token-gated (no auth) — routes/share.js verifies the token server-side.
  share: {
    create: ({ projectId, generationId }) =>
      request(`/share/${projectId}/${generationId}`, { method: 'POST' }),
    get: ({ projectId, generationId, token }) =>
      request(`/share/${projectId}/${generationId}?t=${encodeURIComponent(token)}`),
  },

  previewPrompt: (setup) => request('/prompt/preview', { method: 'POST', body: JSON.stringify({ setup }) }),

  generateItemImage: ({ projectId, generationId, itemId, customPrompt }) =>
    request('/item-image', {
      method: 'POST',
      body: JSON.stringify({ projectId, generationId, itemId, customPrompt }),
    }),

  cancelItemImage: ({ projectId, generationId, itemId }) =>
    request('/item-image/cancel', { method: 'POST', body: JSON.stringify({ projectId, generationId, itemId }) }),

  itemInsight: ({ projectId, generationId, itemId }) =>
    request('/item-insight', { method: 'POST', body: JSON.stringify({ projectId, generationId, itemId }) }),

  // Composer reference image: POSTs the data URL and gets back a stored id.
  // StudioPage has always called this; it just never existed here, so every
  // upload threw TypeError into a catch that silently generated without the
  // reference — the "+ Referensi" attachment did nothing.
  upload: (dataUrl) => request('/uploads', { method: 'POST', body: JSON.stringify({ dataUrl }) }),

  auth: {
    register: ({ name, email, password }) =>
      request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
    login: ({ email, password }) =>
      request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    google: ({ idToken }) =>
      request('/auth/google', { method: 'POST', body: JSON.stringify({ idToken }) }),
    me: () => request('/auth/me'),
    survey: ({ usageGoal }) =>
      request('/auth/survey', { method: 'POST', body: JSON.stringify({ usageGoal }) }),
  },
}
