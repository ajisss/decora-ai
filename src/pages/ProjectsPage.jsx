import { Link, useNavigate } from 'react-router-dom'
import AppShell from '../components/shell/AppShell.jsx'
import { StepIcon } from '../components/icons.jsx'
import DropdownMenu from '../components/ui/DropdownMenu.jsx'
import Dialog from '../components/ui/Dialog.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import { useProjects } from '../context/ProjectsContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { content } from '../content.js'
import { useState } from 'react'

const DAILY_CAP = 20 // cocok dengan GENERATION_DAILY_CAP default di server

export default function ProjectsPage() {
  const t = content.app.library
  const { projects, deleteProject, commitDelete, undoDelete, duplicateProject, updateProject, syncState } =
    useProjects()
  const { user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [renamingId, setRenamingId] = useState(null)

  const plan = user?.plan ?? 'free'
  const todayKey = new Date().toISOString().slice(0, 10)
  const allGenerations = projects.flatMap((p) => p.generations)
  const stats = {
    projects: projects.length,
    designs: allGenerations.length,
    favorites: allGenerations.filter((g) => g.favorite).length,
    today: allGenerations.filter((g) => g.createdAt?.slice(0, 10) === todayKey).length,
  }
  const mostRecent = projects[0] // sudah terurut by updatedAt desc dari context
  const mostRecentThumb = mostRecent?.generations.find((g) => g.status === 'done')

  const handleDelete = (project) => {
    setConfirmDelete(null)
    deleteProject(project.id)
    showToast(t.deleted(project.name), {
      action: {
        label: t.undo,
        duration: 6000,
        onClick: () => undoDelete(project.id),
      },
    })
    setTimeout(() => commitDelete(project.id), 6000)
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-[1152px] px-6 py-12">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-ink-muted">{t.welcome(user?.name?.split(' ')[0] ?? '')}</p>
            <h1 className="mt-0.5 font-display text-3xl font-semibold text-ink">{t.title}</h1>
          </div>
          <button type="button" onClick={() => navigate('/projects/new')} className="btn-primary">
            {t.newProject}
          </button>
        </div>

        {syncState === 'error' && (
          <p className="mt-4 rounded-lg bg-paper-soft px-4 py-3 text-sm text-ink-muted">{t.degraded}</p>
        )}

        {projects.length > 0 && (
          <>
            {/* Dashboard: ringkasan pemakaian + paket — pola SaaS umum (uiuxcontext:
                "terasa seperti SaaS proper"), bukan sekadar grid kartu kosong. */}
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard icon="folder" label={t.statProjects} value={stats.projects} />
              <StatCard icon="image" label={t.statDesigns} value={stats.designs} />
              <StatCard icon="star" label={t.statFavorites} value={stats.favorites} />
              <StatCard
                icon="spark"
                label={t.statToday}
                value={`${stats.today}/${DAILY_CAP}`}
                warn={stats.today >= DAILY_CAP}
                action={
                  plan === 'free' ? (
                    <button
                      type="button"
                      onClick={() => navigate('/settings')}
                      className="text-xs font-semibold text-clay-deep hover:underline"
                    >
                      {t.planFree} · {t.planUpgrade}
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-clay-deep">✦ {t.planPlus}</span>
                  )
                }
              />
            </div>

            {mostRecent && (
              <Link
                to={`/studio/${mostRecent.id}`}
                className="mt-6 flex items-center gap-4 rounded-xl2 border border-paper-line bg-paper p-4 transition-colors hover:border-clay/30"
              >
                {mostRecentThumb ? (
                  <img
                    src={`/images/${mostRecentThumb.imageId}`}
                    alt=""
                    className="h-16 w-20 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-lg bg-paper-soft text-ink-muted">
                    <StepIcon name="image" className="h-6 w-6" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{t.continueTitle}</p>
                  <p className="truncate font-display text-lg font-semibold text-ink">{mostRecent.name}</p>
                  <p className="text-xs text-ink-muted">
                    {t.continueUpdated} {new Date(mostRecent.updatedAt).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-clay-deep">{t.continueCta}</span>
              </Link>
            )}
          </>
        )}

        {projects.length === 0 ? (
          <EmptyState
            illustration="canvas"
            title={t.emptyTitle}
            body={t.emptyBody}
            cta={t.newProject}
            onCta={() => navigate('/projects/new')}
          />
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <button
              type="button"
              onClick={() => navigate('/projects/new')}
              className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-xl2 border border-dashed border-paper-line text-ink-muted transition-colors hover:border-clay/40 hover:text-clay-deep"
            >
              <StepIcon name="plus" className="h-6 w-6" />
              {t.newProject}
            </button>
            {projects.map((project) => {
              const thumb = project.generations.find((g) => g.status === 'done')
              return (
                <div key={project.id} className="group rounded-xl2 border border-paper-line bg-paper">
                  <Link to={`/studio/${project.id}`}>
                    {thumb ? (
                      <ProjectThumbnail src={`/images/${thumb.imageId}`} />
                    ) : (
                      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-t-xl2 bg-paper-soft text-ink-muted">
                        <StepIcon name="image" className="h-8 w-8" />
                      </div>
                    )}
                  </Link>
                  <div className="flex items-start justify-between gap-2 p-4">
                    <div className="min-w-0">
                      {renamingId === project.id ? (
                        <input
                          autoFocus
                          defaultValue={project.name}
                          onFocus={(e) => e.target.select()}
                          onBlur={(e) => {
                            if (e.target.value.trim()) updateProject(project.id, (p) => ({ ...p, name: e.target.value.trim() }))
                            setRenamingId(null)
                          }}
                          onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                          className="w-full rounded border border-clay px-1 text-sm"
                        />
                      ) : (
                        <p className="truncate text-sm font-semibold text-ink">{project.name}</p>
                      )}
                      <p className="mt-0.5 text-xs text-ink-muted">
                        {project.generations.length} {t.designCount} · {t.updated}{' '}
                        {new Date(project.updatedAt).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <DropdownMenu
                      trigger={<StepIcon name="chevronDown" className="h-4 w-4" />}
                      items={[
                        { label: t.rename, onSelect: () => setRenamingId(project.id) },
                        { label: t.duplicate, onSelect: () => duplicateProject(project.id) },
                        { divider: true },
                        { label: t.delete, destructive: true, onSelect: () => setConfirmDelete(project) },
                      ]}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Dialog
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        title={confirmDelete ? t.deleteTitle(confirmDelete.name) : ''}
        footer={
          <>
            <button type="button" onClick={() => setConfirmDelete(null)} className="btn-ghost">
              {t.cancel}
            </button>
            <button
              type="button"
              onClick={() => handleDelete(confirmDelete)}
              className="rounded-full bg-danger px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
            >
              {t.delete}
            </button>
          </>
        }
      >
        <p className="text-sm text-ink-soft">{t.deleteBody(confirmDelete?.generations.length ?? 0)}</p>
      </Dialog>
    </AppShell>
  )
}

function StatCard({ icon, label, value, action, warn }) {
  return (
    <div className="rounded-xl2 border border-paper-line bg-paper p-4">
      <div className="flex items-center gap-2 text-ink-muted">
        <StepIcon name={icon} className="h-4 w-4" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className={`mt-1.5 font-display text-2xl font-semibold ${warn ? 'text-danger' : 'text-ink'}`}>{value}</p>
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}

// File gambar bisa hilang dari server (data test yang dibersihkan, dsb) — jangan
// biarkan ikon broken-image bawaan browser tampil; jatuh ke placeholder yang sama
// seperti "belum ada desain" (P6 wireflow: image-missing tetap dapat state jelas).
function ProjectThumbnail({ src }) {
  const [broken, setBroken] = useState(false)
  if (broken) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-t-xl2 bg-paper-soft text-ink-muted">
        <StepIcon name="image" className="h-8 w-8" />
      </div>
    )
  }
  return (
    <img
      src={src}
      alt=""
      onError={() => setBroken(true)}
      className="aspect-[4/3] w-full rounded-t-xl2 object-cover"
    />
  )
}
