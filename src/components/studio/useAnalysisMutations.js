import { useProjects } from '../../context/ProjectsContext.jsx'

// Shared checklist-item mutations — extracted from AnalyzePanel so the new
// Inspector's Object Properties panel can edit/remove the same item without
// duplicating the update logic. All routes through the existing whole-project
// `updateProject` (PUT /api/projects/:id) — no new API surface.
export default function useAnalysisMutations(projectId, generationId) {
  const { updateProject } = useProjects()

  const mutateItems = (updater) =>
    updateProject(projectId, (p) => ({
      ...p,
      generations: p.generations.map((g) =>
        g.id === generationId ? { ...g, analysis: { ...g.analysis, items: updater(g.analysis.items) } } : g,
      ),
    }))

  const toggleItem = (id) =>
    mutateItems((items) => items.map((it) => (it.id === id ? { ...it, included: !it.included } : it)))

  const editItem = (id, patch) => mutateItems((items) => items.map((it) => (it.id === id ? { ...it, ...patch } : it)))

  const removeManual = (id) => mutateItems((items) => items.filter((it) => it.id !== id))

  const addManualItem = (category) =>
    mutateItems((items) => [
      ...items,
      {
        id: `manual-${Math.random().toString(36).slice(2, 8)}`,
        category,
        name: 'Item baru',
        description: '',
        estimatedQuantity: null,
        included: true,
        note: '',
        isManual: true,
      },
    ])

  return { editItem, toggleItem, removeManual, addManualItem }
}
