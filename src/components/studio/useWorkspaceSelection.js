import { useCallback, useEffect, useRef, useState } from 'react'

// Single owner of "what is the user looking at" in the Design Workspace.
//
// Previously `analyzeTargetId` doubled as the active version, which meant the
// canvas, filmstrip, rail and inspector each re-derived the same thing and
// could disagree. Here the version id is the only stored selection, the
// resolved objects are derived, and `inspectorMode` falls out of the pair —
// so the Inspector can never show a different state than the canvas.
export default function useWorkspaceSelection({ generations }) {
  const [navSection, setNavSection] = useState('summary') // 'summary' | 'event' | 'checklist'
  const [activeVersionId, setActiveVersionId] = useState(null)
  const [selectedObjectId, setSelectedObjectId] = useState(null)

  const activeVersion = generations.find((g) => g.id === activeVersionId) ?? null
  const latestDoneId = generations.find((g) => g.status === 'done')?.id ?? null
  const selectedObject = activeVersion?.analysis?.items.find((i) => i.id === selectedObjectId) ?? null

  // Land on the newest finished design, and re-home after the active one is
  // deleted (confirmDeleteVersion clears the id and this picks the next).
  useEffect(() => {
    if (!activeVersionId && latestDoneId) setActiveVersionId(latestDoneId)
  }, [activeVersionId, latestDoneId])

  // Jump to a freshly started generation so its pending state (spinner,
  // skeleton, elapsed timer) is visible on the canvas — otherwise the stage
  // just keeps showing whatever was selected before, with nothing on screen
  // to indicate a new design is being built. Keyed off the newest entry's id
  // (generations is newest-first) rather than status, so it fires once per
  // new arrival instead of re-stealing selection on every render.
  const newestId = generations[0]?.id ?? null
  const prevNewestId = useRef(newestId)
  useEffect(() => {
    if (newestId !== prevNewestId.current) {
      if (generations[0]?.status === 'pending') setActiveVersionId(newestId)
      prevNewestId.current = newestId
    }
  }, [newestId, generations])

  // Re-analysis mints fresh item ids, so a held selection can point at an item
  // that no longer exists. Without this the Inspector silently drops back to
  // version mode while the canvas still believes an object is selected.
  useEffect(() => {
    if (selectedObjectId && !selectedObject) setSelectedObjectId(null)
  }, [selectedObjectId, selectedObject])

  const selectVersion = useCallback((id) => {
    setActiveVersionId(id)
    setSelectedObjectId(null)
  }, [])

  // Re-selecting the same object clears it, so clicking a pin twice deselects.
  const selectObject = useCallback((id) => {
    setSelectedObjectId((current) => (current === id ? null : id))
  }, [])

  return {
    navSection,
    setNavSection,
    activeVersionId,
    activeVersion,
    selectVersion,
    selectedObjectId,
    selectedObject,
    selectObject,
    inspectorMode: selectedObject ? 'object' : activeVersion ? 'version' : 'project',
  }
}
