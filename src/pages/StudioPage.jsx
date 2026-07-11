import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import AppShell from '../components/shell/AppShell.jsx'
import SegmentedControl from '../components/wizard/SegmentedControl.jsx'
import { StepIcon } from '../components/icons.jsx'
import GenerationEntry from '../components/generator/GenerationEntry.jsx'
import AnalyzePanel from '../components/analyzer/AnalyzePanel.jsx'
import FavoriteCard from '../components/studio/FavoriteCard.jsx'
import BookmarkNameDialog from '../components/studio/BookmarkNameDialog.jsx'
import ExportDialog from '../components/export/ExportDialog.jsx'
import { downloadPng } from '../components/export/buildBriefPdf.js'
import { useProjects } from '../context/ProjectsContext.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import ReferenceImageInput from '../components/generator/ReferenceImageInput.jsx'
import { api } from '../api/client.js'
import { content } from '../content.js'

const t = content.app.studio
const tc = content.app.compare

// Per-project feed scroll offsets, kept for the life of the tab so navigating
// away and back (wireflow §7 scroll restoration) doesn't dump the user at the top.
const feedScrollMemory = new Map()

export default function StudioPage() {
  const { projectId } = useParams()
  const { state } = useLocation()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { getProject, runGeneration, cancelGeneration, refreshProject, updateProject } = useProjects()
  const { showToast } = useToast()
  const project = getProject(projectId)

  const [note, setNote] = useState('')
  const [composerImage, setComposerImage] = useState(null) // data URL — freshly uploaded reference, distinct from "Jadikan referensi" on a past design
  const [rightTab, setRightTab] = useState('informasi')
  const [favoriteQuery, setFavoriteQuery] = useState('')
  // Store ids, not the generation objects themselves — the objects go stale
  // the moment context updates (e.g. an item-image finishing while the panel
  // is open), so panels must always look the current one up live by id.
  const [lightboxId, setLightboxId] = useState(null)
  const [analyzeTargetId, setAnalyzeTargetId] = useState(null)
  const [exportTargetId, setExportTargetId] = useState(null)
  const [referenceEntry, setReferenceEntry] = useState(null)
  const [compareIds, setCompareIds] = useState([]) // maks 2 id desain untuk dibandingkan
  const [compareOpen, setCompareOpen] = useState(false)
  const [comparePct, setComparePct] = useState(50) // posisi garis before/after slider (%)
  const [flashId, setFlashId] = useState(null)
  const [announcement, setAnnouncement] = useState('')
  // Holds the action to run once the spend-confirmation dialog is accepted —
  // every path that fires a paid image generation goes through this gate.
  const [confirmGenerate, setConfirmGenerate] = useState(null)
  // The generation currently being named/renamed as a favorite — null closes
  // the dialog. Its own .favorite flag tells the dialog/save handler whether
  // this is a first-time bookmark or a rename of an existing one.
  const [bookmarkTarget, setBookmarkTarget] = useState(null)
  const autorunFired = useRef(false)
  const mainRef = useRef(null)
  const entryRefs = useRef(new Map())
  const analysisSectionRef = useRef(null)
  const composerRef = useRef(null)
  const prevGenerationCount = useRef(null)
  const genParamHandled = useRef(false)
  const prevStatuses = useRef(new Map())
  // Generations already pending when this tab opened (e.g. a refresh mid-generation,
  // wireflow §5.3) — these outlived their originating fetch and need recovery polling,
  // as opposed to ones this tab itself just started via runGeneration.
  const [orphanedPendingIds] = useState(
    () => new Set((project?.generations ?? []).filter((g) => g.status === 'pending').map((g) => g.id)),
  )

  const generations = project?.generations ?? []
  const isPending = generations.some((g) => g.status === 'pending')
  const lightbox = generations.find((g) => g.id === lightboxId) ?? null
  const analyzeTarget = generations.find((g) => g.id === analyzeTargetId) ?? null
  const exportTarget = generations.find((g) => g.id === exportTargetId) ?? null
  const latestDoneId = generations.find((g) => g.status === 'done')?.id ?? null

  const scrollToEntry = (id) => {
    entryRefs.current.get(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setFlashId(id)
    setTimeout(() => setFlashId((f) => (f === id ? null : f)), 600)
  }

  // Informasi's Analisis section always shows a target — the Analisis CTA on a
  // design bubble/lightbox/export just refocuses it and jumps the right panel there.
  const focusAnalysis = (id) => {
    setAnalyzeTargetId(id)
    setRightTab('informasi')
    setTimeout(() => analysisSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  useEffect(() => {
    if (!analyzeTargetId && latestDoneId) setAnalyzeTargetId(latestDoneId)
  }, [analyzeTargetId, latestDoneId])

  useEffect(() => {
    if (compareOpen) setComparePct(50)
  }, [compareOpen])

  useEffect(() => {
    if (!project || !state?.autorun || autorunFired.current) return
    autorunFired.current = true
    runGeneration(project.id, { prompt: project.prompt })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id])

  useEffect(() => {
    if (!project || orphanedPendingIds.size === 0) return
    const stillPending = () =>
      project.generations.some((g) => orphanedPendingIds.has(g.id) && g.status === 'pending')
    if (!stillPending()) return
    const t = setInterval(() => {
      if (!stillPending()) return clearInterval(t)
      refreshProject(project.id)
    }, 5000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.generations])

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e) => {
      if (e.key === 'Escape') return setLightboxId(null)
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
      const doneEntries = generations.filter((g) => g.status === 'done')
      const i = doneEntries.findIndex((g) => g.id === lightbox.id)
      if (i === -1) return
      const next = e.key === 'ArrowRight' ? doneEntries[i - 1] : doneEntries[i + 1] // feed is newest-first
      if (next) setLightboxId(next.id)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox, generations])

  useEffect(() => {
    if (state?.setupUpdated) showToast(t.setupUpdated)
    if (state?.autorun) showToast(t.projectSaved)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // T5: restore this project's feed scroll offset on mount, save it on the way out.
  useEffect(() => {
    const el = mainRef.current
    if (!el) return
    el.scrollTop = feedScrollMemory.get(projectId) ?? 0
    return () => feedScrollMemory.set(projectId, el.scrollTop)
  }, [projectId])

  // T5: a newly inserted entry only pulls the feed to the top if the user was
  // already reading near the top — never yank scroll from someone reviewing history.
  useEffect(() => {
    const el = mainRef.current
    if (!el) return
    if (prevGenerationCount.current !== null && generations.length > prevGenerationCount.current) {
      if (el.scrollTop <= 100) el.scrollTo({ top: 0, behavior: 'smooth' })
    }
    prevGenerationCount.current = generations.length
  }, [generations.length])

  // Q2: aria-live announcements for the generation lifecycle (ux-spec §12).
  useEffect(() => {
    generations.forEach((g, i) => {
      const versionNumber = generations.length - i
      const prev = prevStatuses.current.get(g.id)
      if (prev === undefined && g.status === 'pending') {
        setAnnouncement(`${t.generatingElapsed} ${versionNumber}…`)
      } else if (prev === 'pending' && g.status === 'done') {
        setAnnouncement(`${t.design} ${versionNumber}: ${t.designReady}`)
        showToast(t.designReady)
      } else if (prev === 'pending' && g.status === 'error') {
        setAnnouncement(`${t.design} ${versionNumber}: ${t.designFailed}`)
      }
      prevStatuses.current.set(g.id, g.status)
    })
  }, [generations])

  // T3: ?gen=:id deep link scrolls to and flashes that entry once it's rendered; invalid ids are ignored.
  useEffect(() => {
    const genId = searchParams.get('gen')
    if (!genId || genParamHandled.current || !generations.some((g) => g.id === genId)) return
    genParamHandled.current = true
    const t = setTimeout(() => scrollToEntry(genId), 50)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generations, searchParams])

  if (!project) {
    return (
      <AppShell>
        <div className="flex h-[70vh] flex-col items-center justify-center gap-4 text-center">
          <h1 className="font-display text-2xl text-ink">{t.notFound}</h1>
          <Link to="/projects" className="btn-primary">
            {t.backToProjects}
          </Link>
        </div>
      </AppShell>
    )
  }

  const versionOf = (entry) => generations.length - generations.indexOf(entry)

  const handleGenerate = () => {
    if (isPending || !note.trim()) return
    const noteAtConfirm = note
    const imageAtConfirm = composerImage
    setConfirmGenerate(() => async () => {
      let referenceImageId
      if (imageAtConfirm) {
        try {
          ;({ referenceImageId } = await api.upload(imageAtConfirm))
        } catch {
          /* upload failure: proceed without it rather than blocking generation */
        }
      }
      runGeneration(project.id, {
        prompt: project.prompt,
        modificationNote: noteAtConfirm,
        referenceImageId,
        referenceGenerationImageId: referenceEntry?.imageId,
      })
      setNote('')
      setComposerImage(null)
    })
  }

  const handleRetry = (entry) => {
    if (isPending) return
    setConfirmGenerate(() => () => {
      runGeneration(project.id, { prompt: entry.prompt, referenceGenerationImageId: referenceEntry?.imageId })
    })
  }

  const handleCancel = (entry) => cancelGeneration(project.id, entry.id)

  // R4: only one reference at a time; picking a new one silently replaces the old.
  const handleUseAsReference = (entry) =>
    setReferenceEntry((current) => (current?.id === entry.id ? null : entry))

  // Reply = set as reference + jump focus straight to the composer, so
  // adjusting off a specific design is a single click instead of two.
  const handleReply = (entry) => {
    setReferenceEntry(entry)
    composerRef.current?.focus()
  }

  // Marking a design favorite requires naming it first (the dialog); removing
  // one doesn't — un-favoriting is reversible and needs no ceremony.
  const handleToggleFavorite = (entry) => {
    if (entry.favorite) {
      updateProject(project.id, (p) => ({
        ...p,
        generations: p.generations.map((g) => (g.id === entry.id ? { ...g, favorite: false } : g)),
      }))
      return
    }
    setBookmarkTarget(entry)
  }

  const saveBookmarkName = (name) => {
    if (!bookmarkTarget) return
    const wasFavorite = bookmarkTarget.favorite
    updateProject(project.id, (p) => ({
      ...p,
      generations: p.generations.map((g) => (g.id === bookmarkTarget.id ? { ...g, favorite: true, favoriteName: name } : g)),
    }))
    showToast(wasFavorite ? t.favoriteRenamed : t.favoriteSaved)
    setBookmarkTarget(null)
  }

  // M5: pilih maksimal 2 desain; memilih yang ke-2 langsung membuka perbandingan.
  const handleToggleCompare = (entry) =>
    setCompareIds((ids) => {
      if (ids.includes(entry.id)) return ids.filter((id) => id !== entry.id)
      const next = [...ids, entry.id].slice(-2)
      if (next.length === 2) setCompareOpen(true)
      return next
    })

  // Sorted oldest-first regardless of click order, so the slider always reads
  // left = before (older), right = after (newer) — not "first clicked".
  const compareEntries = compareIds
    .map((id) => generations.find((g) => g.id === id))
    .filter(Boolean)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

  const favoriteEntries = generations.filter((g) => g.favorite)
  const favoriteQueryLower = favoriteQuery.trim().toLowerCase()
  const filteredFavorites = favoriteQueryLower
    ? favoriteEntries.filter(
        (g) =>
          (g.favoriteName ?? '').toLowerCase().includes(favoriteQueryLower) ||
          (g.modificationNote ?? '').toLowerCase().includes(favoriteQueryLower) ||
          g.prompt.toLowerCase().includes(favoriteQueryLower),
      )
    : favoriteEntries

  return (
    <AppShell projectName={project.name}>
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>
      <div className="flex h-[calc(100vh-56px)]">
        <div className="flex min-h-0 flex-1 flex-col">
          <main ref={mainRef} className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto mb-6 flex max-w-[720px] items-center justify-between">
              <div>
                <h1 className="font-display text-xl font-semibold text-ink">{project.name}</h1>
                <p className="text-xs text-ink-muted">
                  {generations.length} {t.design.toLowerCase()} ·{' '}
                  {new Date(project.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
            {generations.length === 0 ? (
              <div className="flex items-center justify-center py-10">
                <EmptyState illustration="canvas" title={t.emptyTitle} body={t.emptyBody} />
              </div>
            ) : (
              <div className="mx-auto max-w-[720px] space-y-4">
                {generations.map((entry, i) => (
                  <div
                    key={entry.id}
                    ref={(el) => {
                      if (el) entryRefs.current.set(entry.id, el)
                      else entryRefs.current.delete(entry.id)
                    }}
                    >
                    <GenerationEntry
                      entry={entry}
                      index={i}
                      total={generations.length}
                      onOpenLightbox={(g) => setLightboxId(g.id)}
                      onAnalyze={(g) => focusAnalysis(g.id)}
                      onExport={(g) => setExportTargetId(g.id)}
                      onRetry={handleRetry}
                      onCancel={handleCancel}
                      onUseAsReference={handleUseAsReference}
                      onReply={handleReply}
                      isReference={referenceEntry?.id === entry.id}
                      isLatestDone={entry.id === latestDoneId}
                      isBeingAnalyzed={rightTab === 'informasi' && analyzeTargetId === entry.id}
                      flashed={flashId === entry.id}
                      focused={rightTab === 'informasi' && analyzeTargetId === entry.id && flashId !== entry.id}
                      onToggleFavorite={handleToggleFavorite}
                      onToggleCompare={handleToggleCompare}
                      isCompareSelected={compareIds.includes(entry.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </main>

          {compareIds.length > 0 && !compareOpen && (
            <div className="shrink-0 border-t border-paper-line bg-clay-soft px-3 py-2">
              <div className="mx-auto flex max-w-[720px] items-center justify-between gap-2 text-sm text-clay-deep">
                <span>
                  {tc.bar(compareIds.length)}
                  {compareIds.length === 1 && <span className="ml-1 text-clay-deep/70">· {tc.barHint}</span>}
                </span>
                <div className="flex gap-2">
                  {compareIds.length === 2 && (
                    <button type="button" onClick={() => setCompareOpen(true)} className="btn-primary !px-3 !py-1.5 text-xs">
                      {tc.open}
                    </button>
                  )}
                  <button type="button" onClick={() => setCompareIds([])} className="btn-ghost !px-3 !py-1.5 text-xs">
                    {tc.clear}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="shrink-0 px-4 pb-4 pt-2">
            <div className="mx-auto flex max-w-[720px] items-end gap-2 rounded-2xl border border-paper-line bg-paper p-2 shadow-lg shadow-ink/5">
              <ReferenceImageInput value={composerImage} onChange={setComposerImage} compact />
              {referenceEntry && (
                <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-paper-line bg-paper-soft py-1 pl-1 pr-2">
                  <img
                    src={`/images/${referenceEntry.imageId}`}
                    alt=""
                    className="h-7 w-7 rounded-full object-cover"
                  />
                  <span className="text-xs text-ink-soft">{t.refChip} {versionOf(referenceEntry)}</span>
                  <button
                    type="button"
                    onClick={() => setReferenceEntry(null)}
                    className="text-ink-muted hover:text-ink"
                    aria-label={t.removeRef}
                  >
                    <StepIcon name="close" className="h-3 w-3" />
                  </button>
                </div>
              )}
              <textarea
                ref={composerRef}
                rows={1}
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 300))}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleGenerate()
                }}
                placeholder={t.composerPlaceholder}
                className="max-h-24 flex-1 resize-none bg-transparent px-2 py-2 text-sm focus:outline-none"
              />
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isPending || !note.trim()}
                aria-label={isPending ? t.generating : t.generate}
                title={isPending ? t.generating : t.generate}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-clay text-white transition-colors hover:bg-clay-deep disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
                    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                ) : (
                  <StepIcon name="arrow" className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        <aside className="hidden w-96 shrink-0 flex-col border-l border-paper-line bg-paper-soft lg:flex">
          <div className="p-3">
            <SegmentedControl
              options={[
                { value: 'informasi', label: t.tabInformasi },
                { value: 'history', label: t.tabHistory },
                { value: 'favorit', label: t.tabFavorite },
              ]}
              value={rightTab}
              onChange={setRightTab}
            />
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {rightTab === 'informasi' ? (
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-muted">
                    {t.informasiDetailHeading}
                  </p>
                  <dl className="space-y-3 rounded-xl2 border border-paper-line bg-paper p-4 text-sm">
                    {[
                      [t.setupTheme, project.setup.theme],
                      [t.setupStyle, project.setup.style || '—'],
                      [t.setupVenue, project.setup.venueType],
                      [t.setupSize, project.setup.venueSize],
                      [t.setupGuests, project.setup.guestCapacity],
                      [t.setupBudget, project.setup.budgetTier],
                      [t.setupPalette, project.setup.colorPalette?.join(', ') || '—'],
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-start justify-between gap-3">
                        <dt className="shrink-0 text-xs text-ink-muted">{label}</dt>
                        <dd className="text-right font-medium text-ink-soft">{value}</dd>
                      </div>
                    ))}
                  </dl>
                  <button
                    type="button"
                    onClick={() => navigate('/projects/new', { state: { editProjectId: project.id } })}
                    className="btn-ghost w-full !py-2 text-sm"
                  >
                    <StepIcon name="pencil" className="h-3.5 w-3.5" />
                    {t.editSetup}
                  </button>
                </div>

                <div ref={analysisSectionRef} className="space-y-3 border-t border-paper-line pt-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-muted">
                    {t.informasiAnalysisHeading}
                  </p>
                  <AnalyzePanel
                    projectId={project.id}
                    generation={analyzeTarget}
                    versionNumber={analyzeTarget ? versionOf(analyzeTarget) : 0}
                    onJumpToFeed={() => analyzeTarget && scrollToEntry(analyzeTarget.id)}
                    onExport={(gen) => {
                      setExportTargetId(gen.id)
                    }}
                  />
                </div>
              </div>
            ) : rightTab === 'history' ? (
              <div className="space-y-1.5">
                {generations.length === 0 && <p className="py-4 text-center text-sm text-ink-muted">{t.historyEmpty}</p>}
                {generations.map((g, i) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => scrollToEntry(g.id)}
                    className="flex w-full items-center gap-2.5 rounded-lg p-2 text-left transition-colors hover:bg-paper"
                  >
                    {g.imageId ? (
                      <img src={`/images/${g.imageId}`} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-paper-line">
                        <StepIcon name="image" className="h-4 w-4 text-ink-muted" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1 text-sm text-ink">
                        {t.design} {generations.length - i}
                        {g.favorite && <StepIcon name="star" className="h-3 w-3 fill-clay text-clay" />}
                      </p>
                      <p className="truncate text-xs text-ink-muted">
                        {new Date(g.createdAt).toLocaleTimeString('id-ID')}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {favoriteEntries.length === 0 ? (
                  <EmptyState illustration="canvas" compact title={t.favoritesEmptyTitle} body={t.favoritesEmptyBody} />
                ) : (
                  <>
                    <div className="relative">
                      <StepIcon
                        name="search"
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
                      />
                      <input
                        type="text"
                        value={favoriteQuery}
                        onChange={(e) => setFavoriteQuery(e.target.value)}
                        placeholder={t.favoritesSearchPlaceholder}
                        className="h-9 w-full rounded-lg border border-paper-line bg-paper pl-9 pr-3 text-sm focus:border-clay focus:outline-none focus-visible:ring-2 focus-visible:ring-clay/40"
                      />
                    </div>
                    {filteredFavorites.length === 0 ? (
                      <EmptyState illustration="canvas" compact title={t.favoritesNoMatchTitle} body={t.favoritesNoMatchBody} />
                    ) : (
                      filteredFavorites.map((g) => (
                        <FavoriteCard
                          key={g.id}
                          entry={g}
                          versionNumber={versionOf(g)}
                          projectId={project.id}
                          onJumpToFeed={() => scrollToEntry(g.id)}
                          onExport={(gen) => setExportTargetId(gen.id)}
                          onRename={() => setBookmarkTarget(g)}
                        />
                      ))
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxId(null)}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-3 bg-ink/90 p-6"
        >
          <button
            onClick={() => setLightboxId(null)}
            aria-label={t.lightboxClose}
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <StepIcon name="close" className="h-5 w-5" />
          </button>
          <img
            src={`/images/${lightbox.imageId}`}
            alt=""
            className="max-h-[70vh] max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex w-full max-w-[720px] items-center justify-between gap-3 rounded-xl2 bg-white/10 px-4 py-3 text-sm text-white"
          >
            <p className="truncate">
              {t.design} {versionOf(lightbox)} · {lightbox.prompt}
            </p>
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => downloadPng(lightbox, project, versionOf(lightbox))}
                aria-label={t.lightboxDownload}
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/20"
              >
                <StepIcon name="download" className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  focusAnalysis(lightbox.id)
                  setLightboxId(null)
                }}
                aria-label={t.lightboxAnalyze}
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/20"
              >
                <StepIcon name="checklist" className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {compareOpen && compareEntries.length === 2 && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setCompareOpen(false)}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-ink/90 p-6"
        >
          <div className="w-full max-w-[720px]" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-lg text-white">{tc.title}</h2>
            <p className="mt-1 text-sm text-white/70">{tc.hint}</p>

            <div className="relative mt-4 aspect-[4/3] w-full select-none overflow-hidden rounded-xl2 bg-white/5">
              <img
                src={`/images/${compareEntries[0].imageId}`}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                draggable={false}
              />
              <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - comparePct}% 0 0)` }}>
                <img
                  src={`/images/${compareEntries[1].imageId}`}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  draggable={false}
                />
              </div>

              <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white">
                {tc.before} · {t.design} {versionOf(compareEntries[0])}
              </span>
              <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white">
                {tc.after} · {t.design} {versionOf(compareEntries[1])}
              </span>

              <div
                className="pointer-events-none absolute inset-y-0 w-0.5 bg-white"
                style={{ left: `${comparePct}%` }}
              />
              <div
                className="pointer-events-none absolute top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-sm"
                style={{ left: `${comparePct}%` }}
              >
                <StepIcon name="compare" className="h-4 w-4 text-ink" />
              </div>

              <input
                type="range"
                min={0}
                max={100}
                value={comparePct}
                onChange={(e) => setComparePct(Number(e.target.value))}
                aria-label={tc.hint}
                className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
              />
            </div>

            <div className="mt-4 rounded-xl2 bg-white/5 p-4 text-white">
              <p className="text-sm font-semibold">{tc.diffTitle}</p>
              <div className="mt-2 grid grid-cols-2 gap-4">
                {compareEntries.map((g, i) => (
                  <div key={g.id}>
                    <p className="flex items-center gap-1 text-xs text-white/60">
                      {i === 0 ? tc.before : tc.after} · {t.design} {versionOf(g)}
                      {g.favorite && <StepIcon name="star" className="h-3 w-3 fill-clay text-clay" />}
                    </p>
                    <p className="mt-1 text-sm text-white/90">
                      {g.modificationNote ? `↳ ${g.modificationNote}` : tc.noNote}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setCompareOpen(false)
                  setCompareIds([])
                }}
                className="btn-ghost"
              >
                {tc.close}
              </button>
            </div>
          </div>
        </div>
      )}

      <ExportDialog
        project={project}
        generation={exportTarget}
        versionNumber={exportTarget ? versionOf(exportTarget) : 0}
        onClose={() => setExportTargetId(null)}
        onAnalyzeFirst={() => {
          focusAnalysis(exportTargetId)
          setExportTargetId(null)
        }}
      />

      <ConfirmDialog
        open={Boolean(confirmGenerate)}
        onClose={() => setConfirmGenerate(null)}
        onConfirm={() => confirmGenerate?.()}
        title={t.confirmGenerateTitle}
        body={t.confirmGenerateBody}
        confirmLabel={t.confirmGenerateCta}
      />

      <BookmarkNameDialog
        open={Boolean(bookmarkTarget)}
        title={bookmarkTarget?.favorite ? t.bookmarkRenameTitle : t.bookmarkDialogTitle}
        initialName={bookmarkTarget?.favoriteName ?? ''}
        onClose={() => setBookmarkTarget(null)}
        onSave={saveBookmarkName}
      />
    </AppShell>
  )
}
