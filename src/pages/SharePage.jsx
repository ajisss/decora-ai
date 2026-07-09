import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { content } from '../content.js'
import { api } from '../api/client.js'
import EmptyState from '../components/ui/EmptyState.jsx'

const t = content.app.share
const ta = content.app.analyze

// Halaman berbagi lihat-saja (publik, tanpa gate) — mock share link:
// siapa pun yang punya URL bisa melihat desain + checklist, tanpa kontrol akses.
export default function SharePage() {
  const { projectId, generationId } = useParams()
  const [project, setProject] = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    api
      .getProject(projectId)
      .then(({ project }) => setProject(project))
      .catch(() => setFailed(true))
  }, [projectId])

  const generation = project?.generations.find((g) => g.id === generationId && g.status === 'done')
  const items = generation?.analysis?.items.filter((i) => i.included) ?? []

  return (
    <div className="min-h-screen bg-paper-soft">
      <header className="flex h-14 items-center justify-between border-b border-paper-line bg-paper px-6">
        <Link to="/" className="font-display text-lg font-semibold text-ink">
          <span className="text-clay">✦</span> {content.brand}
        </Link>
        <Link to="/" className="btn-primary !px-4 !py-2 text-sm">
          {t.pageCta}
        </Link>
      </header>

      <main className="mx-auto max-w-[720px] px-6 py-10">
        {failed || (project && !generation) ? (
          <EmptyState illustration="canvas" title={t.notFound} />
        ) : !project ? (
          <div className="aspect-[4/3] animate-pulse rounded-xl2 bg-paper-line" />
        ) : (
          <>
            <p className="eyebrow">{t.pageTitle}</p>
            <h1 className="mt-1 font-display text-3xl font-semibold text-ink">{project.name}</h1>

            <img
              src={`/images/${generation.imageId}`}
              alt={project.name}
              className="mt-6 w-full rounded-xl2 border border-paper-line object-cover"
            />

            {items.length > 0 && (
              <section className="mt-8 rounded-xl2 border border-paper-line bg-paper p-6">
                <h2 className="font-display text-xl font-semibold text-ink">{ta.title}</h2>
                <ul className="mt-4 space-y-2 text-sm">
                  {items.map((item) => (
                    <li key={item.id} className="flex items-start gap-2">
                      <span className="mt-0.5 text-clay">✓</span>
                      <span>
                        <span className="text-ink-muted">{ta.categoryLabels[item.category] ?? item.category}:</span>{' '}
                        <span className="font-medium text-ink">{item.name}</span>
                        {item.estimatedQuantity && <span className="text-ink-muted"> ({item.estimatedQuantity})</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <p className="mt-6 text-center text-xs text-ink-muted">{t.pageNote}</p>
          </>
        )}
      </main>
    </div>
  )
}
