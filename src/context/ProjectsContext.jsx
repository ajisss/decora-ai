import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { nanoid } from 'nanoid'
import { api } from '../api/client.js'

const ProjectsContext = createContext(null)
const STORAGE_KEY = 'decor-ai:projects'

function readLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeLocal(byId) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(byId))
  } catch {
    /* private mode / quota — server sync still applies (P4) */
  }
}

export function ProjectsProvider({ children }) {
  const [byId, setById] = useState(readLocal)
  const [syncState, setSyncState] = useState('idle') // idle | saving | saved | error
  const saveTimers = useRef({})
  const deletedBackup = useRef({})

  // Hydrate from backend in the background; server wins on conflict (wireflow §3.8).
  useEffect(() => {
    api
      .listProjects()
      .then(({ projects }) => {
        setById((prev) => {
          const serverIds = new Set(projects.map((p) => p.id))
          const next = {}
          // Prune ghosts: a local project the server has never heard of and
          // that isn't brand new (10s grace period covers a create-then-
          // hydrate race) is stale — deleted elsewhere or from a dev session
          // that never finished syncing. Server is the source of truth.
          for (const [id, local] of Object.entries(prev)) {
            const isFresh = Date.now() - new Date(local.createdAt).getTime() < 10000
            if (serverIds.has(id) || isFresh) next[id] = local
          }
          for (const p of projects) {
            const local = next[p.id]
            if (!local || new Date(p.updatedAt) >= new Date(local.updatedAt)) next[p.id] = p
          }
          writeLocal(next)
          return next
        })
        setSyncState('saved')
      })
      .catch(() => setSyncState('error'))
  }, [])

  // Multi-tab last-write-wins (ux-spec §10.2).
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) setById(readLocal())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const persistLocal = useCallback((next) => {
    setById(next)
    writeLocal(next)
  }, [])

  const syncToServer = useCallback((project) => {
    clearTimeout(saveTimers.current[project.id])
    setSyncState('saving')
    saveTimers.current[project.id] = setTimeout(async () => {
      try {
        await api.saveProject(project)
        setSyncState('saved')
      } catch {
        setSyncState('error')
      }
    }, 1000)
  }, [])

  const updateProject = useCallback(
    (id, updater) => {
      setById((prev) => {
        const current = prev[id]
        if (!current) return prev
        const updated = { ...updater(current), updatedAt: new Date().toISOString() }
        const next = { ...prev, [id]: updated }
        writeLocal(next)
        syncToServer(updated)
        return next
      })
    },
    [syncToServer],
  )

  const createProject = useCallback(
    ({ name, setup, prompt }) => {
      const now = new Date().toISOString()
      const project = {
        id: nanoid(),
        name: name?.trim() || 'Pernikahan tanpa judul',
        createdAt: now,
        updatedAt: now,
        setup,
        prompt,
        generations: [],
        messages: [], // Plan-mode advisory conversation (text-only, spend-free)
      }
      const next = { ...byId, [project.id]: project }
      persistLocal(next)
      api.saveProject(project).catch(() => setSyncState('error'))
      return project
    },
    [byId, persistLocal],
  )

  const deleteProject = useCallback(
    (id) => {
      deletedBackup.current[id] = byId[id]
      const next = { ...byId }
      delete next[id]
      persistLocal(next)
      return () => {
        clearTimeout(saveTimers.current[`delete-${id}`])
      }
    },
    [byId, persistLocal],
  )

  const commitDelete = useCallback((id) => {
    delete deletedBackup.current[id]
    api.deleteProject(id).catch(() => {})
  }, [])

  const undoDelete = useCallback(
    (id) => {
      const project = deletedBackup.current[id]
      if (!project) return
      delete deletedBackup.current[id]
      persistLocal({ ...byId, [id]: project })
    },
    [byId, persistLocal],
  )

  const duplicateProject = useCallback(
    (id) => {
      const source = byId[id]
      if (!source) return null
      const existingCopies = Object.values(byId).filter((p) => p.name.startsWith(`${source.name} (copy`))
      const suffix = existingCopies.length === 0 ? '' : ` ${existingCopies.length + 1}`
      const now = new Date().toISOString()
      const copy = {
        ...source,
        id: nanoid(),
        name: `${source.name} (copy${suffix})`,
        createdAt: now,
        updatedAt: now,
        generations: source.generations.filter((g) => g.status === 'done'), // P3: exclude pending
      }
      const next = { ...byId, [copy.id]: copy }
      persistLocal(next)
      api.saveProject(copy).catch(() => setSyncState('error'))
      return copy
    },
    [byId, persistLocal],
  )

  const runGeneration = useCallback(
    async (projectId, { prompt, modificationNote, referenceImageId, referenceGenerationImageId }) => {
      const pendingId = nanoid()
      const optimisticEntry = {
        id: pendingId,
        createdAt: new Date().toISOString(),
        prompt,
        modificationNote: modificationNote?.trim() || null,
        status: 'pending',
        imageId: null,
        error: null,
        analysis: null,
      }
      updateProject(projectId, (p) => ({ ...p, generations: [optimisticEntry, ...p.generations] }))

      try {
        const { generation } = await api.generate({
          projectId,
          prompt,
          modificationNote,
          referenceImageId,
          referenceGenerationImageId,
        })
        updateProject(projectId, (p) => ({
          ...p,
          generations: [generation, ...p.generations.filter((g) => g.id !== pendingId)],
        }))

        // Generation now runs server-side in the background (kie.ai can take
        // minutes) — poll until this specific entry leaves "pending".
        const deadline = Date.now() + 12 * 60 * 1000
        const poll = async () => {
          if (Date.now() > deadline) return
          try {
            const { project: latest } = await api.getProject(projectId)
            const current = latest?.generations.find((g) => g.id === generation.id)
            if (current && current.status !== 'pending') {
              setById((prev) => {
                const next = { ...prev, [projectId]: latest }
                writeLocal(next)
                return next
              })
              return
            }
          } catch {
            /* offline — retry on the next tick */
          }
          setTimeout(poll, 4000)
        }
        setTimeout(poll, 4000)
      } catch (err) {
        const message =
          err.code === 'cap'
            ? `Batas desain harian proyek ini tercapai (${err.limit}). Coba lagi besok.`
            : err.code === 'concurrent'
              ? null // UI already disables the button; surfaced as no-op
              : 'Layanan desain tidak bisa dihubungi. Promptmu aman — coba lagi.'
        if (message) {
          updateProject(projectId, (p) => ({
            ...p,
            generations: p.generations.map((g) =>
              g.id === pendingId ? { ...g, status: 'error', error: message, errorCode: err.code } : g,
            ),
          }))
        }
      }
    },
    [updateProject],
  )

  // Plan mode: a spend-free advisory turn. The server chat endpoint is
  // synchronous, so no polling — optimistically show the user's message plus a
  // pending advisor bubble, then swap in the authoritative message list. The
  // optimistic step writes local only (no server sync) so a debounced PUT can't
  // land mid-request and clobber the server's saved reply.
  const runPlan = useCallback(
    async (projectId, text) => {
      const message = text.trim()
      if (!message) return
      const pendingId = nanoid()
      const now = new Date().toISOString()

      setById((prev) => {
        const current = prev[projectId]
        if (!current) return prev
        const messages = [
          ...(current.messages ?? []),
          { id: nanoid(), role: 'user', text: message, createdAt: now },
          { id: pendingId, role: 'assistant', text: null, status: 'pending', createdAt: now },
        ]
        const next = { ...prev, [projectId]: { ...current, messages } }
        writeLocal(next)
        return next
      })

      try {
        const { messages } = await api.plan({ projectId, message })
        updateProject(projectId, (p) => ({ ...p, messages }))
      } catch (err) {
        const errorMessage =
          err.code === 'config'
            ? 'Layanan rencana belum dikonfigurasi.'
            : 'Layanan rencana tidak bisa dihubungi. Coba lagi.'
        setById((prev) => {
          const current = prev[projectId]
          if (!current) return prev
          const messages = (current.messages ?? []).map((m) =>
            m.id === pendingId ? { ...m, status: 'error', error: errorMessage } : m,
          )
          const next = { ...prev, [projectId]: { ...current, messages } }
          writeLocal(next)
          return next
        })
      }
    },
    [updateProject],
  )

  // Cancellation is client-visible only — the background job on the server
  // can't truly abort an in-flight Imaginer request. Marking the entry
  // 'cancelled' server-side (so a late job result won't resurrect it) plus an
  // optimistic local update is enough: the existing poll loop above already
  // stops as soon as it sees a status other than 'pending'.
  const cancelGeneration = useCallback(
    async (projectId, generationId) => {
      updateProject(projectId, (p) => ({
        ...p,
        generations: p.generations.map((g) => (g.id === generationId ? { ...g, status: 'cancelled' } : g)),
      }))
      try {
        await api.cancelGenerate({ projectId, generationId })
      } catch {
        /* best-effort — local state already reflects the cancellation */
      }
    },
    [updateProject],
  )

  // Recovery path for a pending generation that outlived the tab (refresh, G12):
  // re-fetch the project from the backend, which is the source of truth for status.
  const refreshProject = useCallback(async (id) => {
    try {
      const { project } = await api.getProject(id)
      if (!project) return
      setById((prev) => {
        const next = { ...prev, [id]: project }
        writeLocal(next)
        return next
      })
    } catch {
      /* offline — pending entry stays pending until connectivity returns */
    }
  }, [])

  const runAnalysis = useCallback(
    async (projectId, generationId) => {
      try {
        const { analysis } = await api.analyze({ projectId, generationId })
        updateProject(projectId, (p) => ({
          ...p,
          generations: p.generations.map((g) => (g.id === generationId ? { ...g, analysis } : g)),
        }))
        return { ok: true }
      } catch (err) {
        return { ok: false, error: err }
      }
    },
    [updateProject],
  )

  // Item Editor (post-MVP, user-requested): generates a standalone image for
  // one checklist item, mirroring runGeneration's optimistic + poll pattern
  // but scoped to a single item's itemImage field instead of the feed.
  const runItemImage = useCallback(
    async (projectId, generationId, itemId, customPrompt) => {
      const mutateItem = (patch) =>
        updateProject(projectId, (p) => ({
          ...p,
          generations: p.generations.map((g) =>
            g.id !== generationId
              ? g
              : {
                  ...g,
                  analysis: {
                    ...g.analysis,
                    items: g.analysis.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)),
                  },
                },
          ),
        }))

      mutateItem({ itemImage: { status: 'pending', imageId: null, prompt: null, error: null } })

      try {
        const { item } = await api.generateItemImage({ projectId, generationId, itemId, customPrompt })
        mutateItem({ itemImage: item.itemImage })

        const deadline = Date.now() + 5 * 60 * 1000
        const poll = async () => {
          if (Date.now() > deadline) return
          try {
            const { project: latest } = await api.getProject(projectId)
            const gen = latest?.generations.find((g) => g.id === generationId)
            const current = gen?.analysis?.items.find((i) => i.id === itemId)
            if (current && current.itemImage?.status !== 'pending') {
              setById((prev) => {
                const next = { ...prev, [projectId]: latest }
                writeLocal(next)
                return next
              })
              return
            }
          } catch {
            /* offline — retry on the next tick */
          }
          setTimeout(poll, 4000)
        }
        setTimeout(poll, 4000)
      } catch (err) {
        if (err.code === 'concurrent') return // UI already disables the button
        mutateItem({
          itemImage: { status: 'error', imageId: null, prompt: null, error: 'Gambar item ini belum bisa dibuat. Coba lagi, ya.' },
        })
      }
    },
    [updateProject],
  )

  // Same client-visible cancellation approach as cancelGeneration, scoped to
  // a single checklist item's image instead of the main feed entry.
  const cancelItemImage = useCallback(
    async (projectId, generationId, itemId) => {
      updateProject(projectId, (p) => ({
        ...p,
        generations: p.generations.map((g) =>
          g.id !== generationId
            ? g
            : {
                ...g,
                analysis: {
                  ...g.analysis,
                  items: g.analysis.items.map((it) =>
                    it.id === itemId ? { ...it, itemImage: { ...it.itemImage, status: 'cancelled' } } : it,
                  ),
                },
              },
        ),
      }))
      try {
        await api.cancelItemImage({ projectId, generationId, itemId })
      } catch {
        /* best-effort — local state already reflects the cancellation */
      }
    },
    [updateProject],
  )

  const value = {
    projects: Object.values(byId).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
    getProject: (id) => byId[id] ?? null,
    createProject,
    updateProject,
    deleteProject,
    commitDelete,
    undoDelete,
    duplicateProject,
    runGeneration,
    runPlan,
    cancelGeneration,
    runAnalysis,
    runItemImage,
    cancelItemImage,
    refreshProject,
    syncState,
  }

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>
}

export function useProjects() {
  const ctx = useContext(ProjectsContext)
  if (!ctx) throw new Error('useProjects must be used within ProjectsProvider')
  return ctx
}
