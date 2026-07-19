import { useState } from 'react'
import { useProjects } from '../../../context/ProjectsContext.jsx'
import { useToast } from '../../ui/Toast.jsx'
import useAnalysisMutations from './useAnalysisMutations.js'
import { groupItems, sumIncludedCost } from './taxonomy.js'
import { content } from '../../../content.js'

const t = content.app.analyze

// Single owner of decoration-analysis behavior, shared by every surface that
// shows the checklist (the Inspector's compact tree, the full Checklist &
// Brief panel, and the Inspector's analyze CTA).
//
// Every hook here runs unconditionally and the hook itself never branches on
// `generation` — consumers render their own "no design yet" empty state. That
// is deliberate: AnalyzePanel used to call useAnalysisMutations *after* an
// early `if (!generation) return`, which changes hook order between renders
// and is a genuine React violation. Keeping the branch in the consumer makes
// that mistake structurally impossible rather than merely fixed once.
export default function useAnalysisController(projectId, generation) {
  const { runAnalysis, runItemImage, cancelItemImage } = useProjects()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const mutations = useAnalysisMutations(projectId, generation?.id)

  const analysis = generation?.analysis ?? null

  const analyze = async () => {
    if (!generation) return
    setLoading(true)
    setError(null)
    const result = await runAnalysis(projectId, generation.id)
    setLoading(false)
    if (!result.ok) setError(t.error)
    else showToast(t.complete)
  }

  return {
    analysis,
    groups: analysis ? groupItems(analysis.items) : [],
    totalCost: sumIncludedCost(analysis?.items),
    loading,
    error,
    analyze,
    ...mutations,
    generateItemImage: (itemId, customPrompt) => runItemImage(projectId, generation?.id, itemId, customPrompt),
    cancelItemImage: (itemId) => cancelItemImage(projectId, generation?.id, itemId),
  }
}
