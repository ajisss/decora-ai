import { api } from '../../api/client.js'
import { content } from '../../content.js'

// Mints a signed, expiring share link for one generation and copies it —
// shared by ExportDialog's "share" option and the Design Canvas's "Bagikan"
// toolbar button so the logic only lives once.
export async function shareVersion(project, generation, showToast) {
  try {
    const { url } = await api.share.create({ projectId: project.id, generationId: generation.id })
    await navigator.clipboard.writeText(`${window.location.origin}${url}`)
    showToast(content.app.share.copied)
  } catch {
    const url = `${window.location.origin}/share/${project.id}/${generation.id}`
    window.prompt(content.app.share.copyFailed, url)
  }
}
