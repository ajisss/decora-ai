import { useEffect, useRef, useState } from 'react'
import { nanoid } from 'nanoid'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import AppShell from '../components/shell/AppShell.jsx'
import { StepIcon } from '../components/icons.jsx'
import ProjectRail from '../components/studio/ProjectRail.jsx'
import DesignCanvas from '../components/studio/DesignCanvas.jsx'
import Inspector from '../components/studio/Inspector.jsx'
import AnalyzePanel from '../components/analyzer/AnalyzePanel.jsx'
import BookmarkNameDialog from '../components/studio/BookmarkNameDialog.jsx'
import ExportDialog from '../components/export/ExportDialog.jsx'
import { downloadPng } from '../components/export/buildBriefPdf.js'
import { shareVersion } from '../components/export/shareLink.js'
import { useProjects } from '../context/ProjectsContext.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import { api } from '../api/client.js'
import { content } from '../content.js'

const t = content.app.studio
const tc = content.app.compare

// Per-project feed scroll offsets, kept for the life of the tab so navigating
// away and back (wireflow §7 scroll restoration) doesn't dump the user at the bottom.
const feedScrollMemory = new Map()

export default function StudioPage() {
  const { projectId } = useParams()
  const location = useLocation()
  const { state } = location
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { getProject, runGeneration, runPlan, cancelGeneration, refreshProject, updateProject, runItemImage } = useProjects()
  const { showToast } = useToast()
  const project = getProject(projectId)

  const [note, setNote] = useState('')
  const [mode, setMode] = useState('generate') // 'generate' = bikin gambar · 'plan' = ngobrol matangkan ide (gratis)
  const [modeMenuOpen, setModeMenuOpen] = useState(false)
  const modeMenuRef = useRef(null)
  const [composerImage, setComposerImage] = useState(null) // data URL — freshly uploaded reference, distinct from "Jadikan referensi" on a past design
  // Store ids, not the generation objects themselves — the objects go stale
  // the moment context updates (e.g. an item-image finishing while the panel
  // is open), so panels must always look the current one up live by id.
  const [lightboxId, setLightboxId] = useState(null)
  const [analyzeTargetId, setAnalyzeTargetId] = useState(null)
  const [exportTargetId, setExportTargetId] = useState(null)
  // Design Workspace: which project-nav section is showing (Ringkasan/Informasi
  // Acara/Checklist & Brief), and which version the Version Explorer has
  // selected — the latter tracks analyzeTargetId for now (both mean "the
  // active version"); DesignCanvas/Inspector read it once built.
  const [navSection, setNavSection] = useState('summary')
  const [deleteVersionTarget, setDeleteVersionTarget] = useState(null)
  // Object Properties (Inspector, Level 4): which checklist item is selected —
  // drives the Canvas pin highlight, the Inspector's detail view, and the AI
  // Copilot composer's scoping ("modify only this object" vs. the whole design).
  const [selectedObjectId, setSelectedObjectId] = useState(null)
  // Cosmetic-only: has the user opened Export at least once this session —
  // feeds the derived stepper's "Export" step. Not persisted.
  const [exportedOnce, setExportedOnce] = useState(false)
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
  const composerRef = useRef(null)
  const prevTimelineCount = useRef(null)
  const genParamHandled = useRef(false)
  const prevStatuses = useRef(new Map())
  // Generations already pending when this tab opened (e.g. a refresh mid-generation,
  // wireflow §5.3) — these outlived their originating fetch and need recovery polling,
  // as opposed to ones this tab itself just started via runGeneration.
  const [orphanedPendingIds] = useState(
    () => new Set((project?.generations ?? []).filter((g) => g.status === 'pending').map((g) => g.id)),
  )

  const generations = project?.generations ?? []
  const messages = project?.messages ?? []
  const isPending = generations.some((g) => g.status === 'pending')
  const isPlanPending = messages.some((m) => m.status === 'pending')
  // True when every generation has failed (e.g. mock/network down right after
  // an autorun) and none succeeded — surface a dedicated recovery empty state
  // instead of leaving the user staring at a lone error card.
  const allErrored = generations.length > 0 && generations.every((g) => g.status === 'error')
  // Unified oldest-first feed (chat convention: latest at the bottom) — generation
  // cards and plan-mode turns interleaved by timestamp so the conversation reads
  // as one thread. `generations`/`messages` themselves stay newest-first (version
  // numbering, latestDoneId, etc. all key off that order — see versionOf below).
  const timeline = [
    ...generations.map((g) => ({ kind: 'gen', id: g.id, createdAt: g.createdAt, data: g })),
    ...messages.map((m) => ({ kind: 'msg', id: m.id, createdAt: m.createdAt, data: m })),
  ].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  const lightbox = generations.find((g) => g.id === lightboxId) ?? null
  const analyzeTarget = generations.find((g) => g.id === analyzeTargetId) ?? null
  const exportTarget = generations.find((g) => g.id === exportTargetId) ?? null
  const latestDoneId = generations.find((g) => g.status === 'done')?.id ?? null

  const scrollToEntry = (id) => {
    entryRefs.current.get(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setFlashId(id)
    setTimeout(() => setFlashId((f) => (f === id ? null : f)), 600)
  }

  // The Inspector always shows the active version's analysis — the Analisis
  // CTA on a design bubble/lightbox/export just refocuses which one that is.
  const focusAnalysis = (id) => {
    setAnalyzeTargetId(id)
    setSelectedObjectId(null)
  }

  useEffect(() => {
    if (!analyzeTargetId && latestDoneId) setAnalyzeTargetId(latestDoneId)
  }, [analyzeTargetId, latestDoneId])

  useEffect(() => {
    if (compareOpen) setComparePct(50)
  }, [compareOpen])

  // Mode dropdown (Buat gambar / Rencana): close on outside click / Escape.
  useEffect(() => {
    if (!modeMenuOpen) return
    const onDocClick = (e) => !modeMenuRef.current?.contains(e.target) && setModeMenuOpen(false)
    const onKey = (e) => e.key === 'Escape' && setModeMenuOpen(false)
    document.addEventListener('mousedown', onDocClick)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      window.removeEventListener('keydown', onKey)
    }
  }, [modeMenuOpen])

  useEffect(() => {
    if (!project || !state?.autorun || autorunFired.current) return
    autorunFired.current = true
    runGeneration(project.id, { prompt: project.prompt })
    // `autorun` lives in window.history.state, which survives a hard refresh —
    // clear it immediately so reloading this page doesn't re-fire the same
    // generation (autorunFired alone isn't enough: it's an in-memory ref that
    // resets on every fresh mount, including the one right after a refresh).
    navigate(location.pathname + location.search, { replace: true, state: { ...state, autorun: false } })
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
      const next = e.key === 'ArrowRight' ? doneEntries[i - 1] : doneEntries[i + 1] // generations array is newest-first
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
  // No saved offset (fresh tab) defaults to the bottom — latest is newest-message-first
  // chat convention, so that's where a visitor expects to land.
  useEffect(() => {
    const el = mainRef.current
    if (!el) return
    el.scrollTop = feedScrollMemory.get(projectId) ?? el.scrollHeight
    return () => feedScrollMemory.set(projectId, el.scrollTop)
  }, [projectId])

  // T5: a newly inserted entry only pulls the feed to the bottom if the user was
  // already reading near the bottom — never yank scroll from someone reviewing history.
  useEffect(() => {
    const el = mainRef.current
    if (!el) return
    const total = generations.length + messages.length
    if (prevTimelineCount.current !== null && total > prevTimelineCount.current) {
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= 100
      if (nearBottom) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    }
    prevTimelineCount.current = total
  }, [generations.length, messages.length])

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

  // Plan mode: spend-free, no confirm gate — send straight to the advisor.
  const handlePlanSend = () => {
    if (isPlanPending || !note.trim()) return
    runPlan(project.id, note)
    setNote('')
  }

  // AI Copilot context-awareness: with an object selected, "send" scopes the
  // edit to just that checklist item (existing runItemImage — the same call
  // ChecklistRow's "Kustomisasi" already makes) instead of regenerating the
  // whole design. No new business logic, just a different entry point.
  const handleComposerGenerate = () => {
    if (selectedObjectId && analyzeTarget) {
      if (!note.trim()) return
      runItemImage(project.id, analyzeTarget.id, selectedObjectId, note)
      setNote('')
      return
    }
    handleGenerate()
  }

  const handleShare = () => {
    if (!analyzeTarget) return
    shareVersion(project, analyzeTarget, showToast)
  }

  // "Pakai brief ini": drop the advisor's proposed brief into the composer and
  // flip to Generate so the next send actually draws it.
  const handleUseBrief = (brief) => {
    setNote(brief)
    setMode('generate')
    composerRef.current?.focus()
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

  // Favoriting is one click — save immediately with a default name (the
  // design's version), no forced naming dialog. Renaming stays available
  // later via the Favorit tab's rename affordance (see FavoriteCard.onRename).
  const handleToggleFavorite = (entry) => {
    if (entry.favorite) {
      updateProject(project.id, (p) => ({
        ...p,
        generations: p.generations.map((g) => (g.id === entry.id ? { ...g, favorite: false } : g)),
      }))
      return
    }
    const defaultName = `${t.design} ${versionOf(entry)}`
    updateProject(project.id, (p) => ({
      ...p,
      generations: p.generations.map((g) =>
        g.id === entry.id ? { ...g, favorite: true, favoriteName: defaultName } : g,
      ),
    }))
    showToast(t.favoriteSaved)
  }

  // Naming any version (Version Explorer's rename) vs. renaming an existing
  // favorite (FavoriteCard) share this one dialog — the only difference is
  // whether it should also flip `favorite` on. A version renamed here that
  // wasn't already favorited stays not-favorited (renaming shouldn't have
  // the side effect of starring it).
  const saveBookmarkName = (name) => {
    if (!bookmarkTarget) return
    const wasFavorite = bookmarkTarget.favorite
    updateProject(project.id, (p) => ({
      ...p,
      generations: p.generations.map((g) => (g.id === bookmarkTarget.id ? { ...g, favoriteName: name } : g)),
    }))
    showToast(wasFavorite ? t.favoriteRenamed : t.versionRenamed)
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

  // Version Explorer: duplicate clones a done generation's image/analysis
  // into a brand-new entry (fresh id, no favorite/name carried over) — no
  // new endpoint, this rides the same whole-project PUT every other edit
  // here already uses.
  const handleDuplicateVersion = (entry) => {
    const copy = {
      ...entry,
      id: nanoid(),
      createdAt: new Date().toISOString(),
      favorite: false,
      favoriteName: null,
    }
    updateProject(project.id, (p) => ({ ...p, generations: [copy, ...p.generations] }))
    showToast(t.versionDuplicated)
  }

  // Confirmed via ConfirmDialog (deleteVersionTarget) below — removes the
  // entry from the generations array; the backend already replaces the whole
  // array on save, so no delete-single-generation endpoint is needed.
  const confirmDeleteVersion = () => {
    if (!deleteVersionTarget) return
    updateProject(project.id, (p) => ({
      ...p,
      generations: p.generations.filter((g) => g.id !== deleteVersionTarget.id),
    }))
    if (analyzeTargetId === deleteVersionTarget.id) setAnalyzeTargetId(null)
    if (referenceEntry?.id === deleteVersionTarget.id) setReferenceEntry(null)
    showToast(t.versionDeleted)
    setDeleteVersionTarget(null)
  }

  // Sorted oldest-first regardless of click order, so the slider always reads
  // left = before (older), right = after (newer) — not "first clicked".
  const compareEntries = compareIds
    .map((id) => generations.find((g) => g.id === id))
    .filter(Boolean)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))


  return (
    <AppShell projectName={project.name}>
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>
      <div className="flex h-[calc(100vh-56px)]">
        <ProjectRail
          project={project}
          onEditSetup={() => navigate('/projects/new', { state: { editProjectId: project.id } })}
          navSection={navSection}
          onNavSectionChange={setNavSection}
          versionExplorerProps={{
            generations,
            selectedVersionId: analyzeTargetId,
            onSelect: (id) => {
              setAnalyzeTargetId(id)
              setSelectedObjectId(null)
            },
            versionOf,
            onRename: (entry) => setBookmarkTarget(entry),
            onDuplicate: handleDuplicateVersion,
            onDelete: (entry) => setDeleteVersionTarget(entry),
            onToggleFavorite: handleToggleFavorite,
            onToggleCompare: handleToggleCompare,
            compareIds,
            onNewVersion: () => composerRef.current?.focus(),
          }}
        />
        {navSection === 'checklist' ? (
          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-[720px]">
              <h1 className="mb-4 font-display text-lg font-semibold text-ink">{t.navChecklist}</h1>
              <AnalyzePanel
                projectId={project.id}
                generation={analyzeTarget}
                versionNumber={analyzeTarget ? versionOf(analyzeTarget) : 0}
                onExport={(gen) => {
                  setExportedOnce(true)
                  setExportTargetId(gen.id)
                }}
              />
            </div>
          </div>
        ) : (
        <DesignCanvas
          project={project}
          selectedVersion={analyzeTarget}
          versionNumber={analyzeTarget ? versionOf(analyzeTarget) : 0}
          generations={generations}
          onSelectVersion={(id) => {
            setAnalyzeTargetId(id)
            setSelectedObjectId(null)
          }}
          versionOf={versionOf}
          selectedObjectId={selectedObjectId}
          onSelectObject={setSelectedObjectId}
          onFullscreen={() => analyzeTarget && setLightboxId(analyzeTarget.id)}
          onShare={handleShare}
          onExportClick={() => {
            if (!analyzeTarget) return
            setExportedOnce(true)
            setExportTargetId(analyzeTarget.id)
          }}
          onRegenerate={() => analyzeTarget && handleRetry(analyzeTarget)}
          onToggleFavorite={handleToggleFavorite}
          exported={exportedOnce}
          analyzing={Boolean(analyzeTarget) && !analyzeTarget.analysis}
          composerProps={{
            mode,
            onModeChange: setMode,
            modeMenuOpen,
            onModeMenuOpenChange: setModeMenuOpen,
            modeMenuRef,
            composerImage,
            onComposerImageChange: setComposerImage,
            referenceEntry,
            onRemoveReference: () => setReferenceEntry(null),
            referenceVersionNumber: referenceEntry ? versionOf(referenceEntry) : 0,
            note,
            onNoteChange: setNote,
            composerRef,
            isPending,
            isPlanPending,
            onGenerate: handleComposerGenerate,
            onPlanSend: handlePlanSend,
            placeholder:
              selectedObjectId && mode === 'generate'
                ? t.copilotPlaceholderObject(
                    analyzeTarget?.analysis?.items.find((i) => i.id === selectedObjectId)?.name ?? '',
                  )
                : mode === 'generate'
                  ? t.copilotPlaceholderWhole
                  : undefined,
          }}
          conversationProps={{
            timeline,
            generations,
            allErrored,
            entryRefs,
            onOpenLightbox: (g) => setLightboxId(g.id),
            onAnalyze: (g) => focusAnalysis(g.id),
            onExport: (g) => setExportTargetId(g.id),
            onRetry: handleRetry,
            onCancel: handleCancel,
            onUseAsReference: handleUseAsReference,
            onReply: handleReply,
            onUseBrief: handleUseBrief,
            referenceEntry,
            latestDoneId,
            analyzeTargetId,
            isAnalysisFocused: true,
            flashId,
            onToggleFavorite: handleToggleFavorite,
            onToggleCompare: handleToggleCompare,
            compareIds,
          }}
        />
        )}

        <Inspector
          project={project}
          selectedVersion={analyzeTarget}
          versionNumber={analyzeTarget ? versionOf(analyzeTarget) : 0}
          selectedObjectId={selectedObjectId}
          onSelectObject={setSelectedObjectId}
          onEditSetup={() => navigate('/projects/new', { state: { editProjectId: project.id } })}
          onRenameVersion={(entry) => setBookmarkTarget(entry)}
          onExportVersion={(entry) => {
            setExportedOnce(true)
            setExportTargetId(entry.id)
          }}
        />
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
            src={lightbox.imageId}
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
                src={compareEntries[0].imageId}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                draggable={false}
              />
              <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - comparePct}% 0 0)` }}>
                <img
                  src={compareEntries[1].imageId}
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
              <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
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

      <ConfirmDialog
        open={Boolean(deleteVersionTarget)}
        onClose={() => setDeleteVersionTarget(null)}
        onConfirm={confirmDeleteVersion}
        title={t.deleteVersionConfirmTitle}
        body={t.deleteVersionConfirmBody}
        confirmLabel={t.deleteVersionCta}
      />

      <BookmarkNameDialog
        open={Boolean(bookmarkTarget)}
        title={bookmarkTarget?.favorite ? t.bookmarkRenameTitle : t.renameVersionTitle}
        initialName={bookmarkTarget?.favoriteName ?? ''}
        onClose={() => setBookmarkTarget(null)}
        onSave={saveBookmarkName}
      />
    </AppShell>
  )
}
