async function request(path, options) {
  let res
  try {
    res = await fetch(`/api${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
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

  upload: (dataUrl) => request('/uploads', { method: 'POST', body: JSON.stringify({ dataUrl }) }),

  previewPrompt: (setup) => request('/prompt/preview', { method: 'POST', body: JSON.stringify({ setup }) }),

  generateItemImage: ({ projectId, generationId, itemId, customPrompt }) =>
    request('/item-image', {
      method: 'POST',
      body: JSON.stringify({ projectId, generationId, itemId, customPrompt }),
    }),

  cancelItemImage: ({ projectId, generationId, itemId }) =>
    request('/item-image/cancel', { method: 'POST', body: JSON.stringify({ projectId, generationId, itemId }) }),
}
