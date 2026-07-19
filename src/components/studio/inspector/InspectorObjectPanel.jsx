import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { StepIcon } from '../../icons.jsx'
import NameDialog from '../../ui/NameDialog.jsx'
import ConfirmDialog from '../../ui/ConfirmDialog.jsx'
import useAnalysisController from '../analysis/useAnalysisController.js'
import { useToast } from '../../ui/Toast.jsx'
import { api } from '../../../api/client.js'
import { content } from '../../../content.js'

const t = content.app.studio
const ta = content.app.analyze

// Inspector's "an object is selected" state: the item's own properties, the
// actions that apply to it, and AI suggestions + a cost estimate from
// /api/item-insight (ephemeral — only "Terapkan estimasi" writes anything).
export default function InspectorObjectPanel({ projectId, version, item, onBack }) {
  const { editItem, removeManual, generateItemImage } = useAnalysisController(projectId, version)
  const { showToast } = useToast()
  const [renaming, setRenaming] = useState(false)
  const [pendingPrompt, setPendingPrompt] = useState(null)
  const [insight, setInsight] = useState(null)
  const [loadingInsight, setLoadingInsight] = useState(false)
  const [insightError, setInsightError] = useState(null)

  // Insight belongs to one item — drop it when the selection moves, otherwise
  // the panel shows the previous object's suggestions under a new heading.
  useEffect(() => {
    setInsight(null)
    setInsightError(null)
  }, [item.id])

  const loadInsight = async () => {
    setLoadingInsight(true)
    setInsightError(null)
    try {
      setInsight(await api.itemInsight({ projectId, generationId: version.id, itemId: item.id }))
    } catch {
      setInsightError(t.insightError)
    } finally {
      setLoadingInsight(false)
    }
  }

  const applyEstimate = () => {
    if (!insight?.estimatedCost) return
    editItem(item.id, { estimatedCost: String(insight.estimatedCost) })
    showToast(ta.complete)
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-xs font-medium text-ink-muted hover:text-clay-deep"
      >
        <StepIcon name="chevronRight" className="h-3 w-3 rotate-180" />
        {ta.title}
      </button>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-muted">{t.objectProperties}</p>
        {item.itemImage?.imageId && (
          <img src={item.itemImage.imageId} alt={item.name} className="mt-2 h-28 w-full rounded-xl2 object-cover" />
        )}
        <div className="mt-2 flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-ink">{item.name}</p>
          {typeof item.confidence === 'number' && (
            <span className="shrink-0 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
              {item.confidence}%
            </span>
          )}
        </div>
        <p className="text-xs text-ink-muted">{ta.categoryLabels[item.category] ?? item.category}</p>
        {item.description && <p className="mt-1.5 text-xs text-ink-soft">{item.description}</p>}
        {item.estimatedQuantity && <p className="mt-1 text-xs text-ink-muted">{item.estimatedQuantity}</p>}
        {item.estimatedCost && (
          <p className="mt-1 text-xs text-ink-muted">
            {ta.costLabel}: Rp {Number(item.estimatedCost).toLocaleString('id-ID')}
          </p>
        )}
      </div>

      <div className="space-y-1.5 border-t border-paper-line pt-3">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-muted">{t.objectActions}</p>
        <div className="flex flex-wrap gap-1.5">
          <ActionChip icon="pencil" label={t.editObject} onClick={() => setRenaming(true)} />
          <ActionChip
            icon="spark"
            label={t.swapItem}
            onClick={() => setPendingPrompt(`A different design for the ${item.name}.`)}
          />
          <ActionChip
            icon="duplicate"
            label={t.generateSimilar}
            onClick={() => setPendingPrompt(`A similar but slightly different ${item.name}.`)}
          />
          {item.isManual && (
            <ActionChip
              icon="trash"
              label={t.removeObject}
              danger
              onClick={() => {
                removeManual(item.id)
                onBack()
              }}
            />
          )}
          <Link
            to="/vendors"
            className="inline-flex items-center gap-1 rounded-full border border-paper-line px-2.5 py-1 text-xs text-ink-soft hover:border-clay/40 hover:text-clay-deep"
          >
            <StepIcon name="store" className="h-3 w-3" />
            {t.viewVendor}
          </Link>
        </div>
      </div>

      <div className="space-y-2 border-t border-paper-line pt-3">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-ink-muted">
          <StepIcon name="spark" className="h-3.5 w-3.5 text-clay-deep" />
          {t.aiSuggestions}
        </p>
        {!insight && !loadingInsight && !insightError && (
          <button type="button" onClick={loadInsight} className="btn-primary w-full !py-1.5 text-xs">
            {t.aiSuggestions}
          </button>
        )}
        {loadingInsight && <p className="text-xs text-ink-muted">{t.insightLoading}</p>}
        {insightError && (
          <div className="text-xs text-danger">
            {insightError}
            <button type="button" onClick={loadInsight} className="ml-2 font-medium text-clay-deep hover:underline">
              {ta.retry}
            </button>
          </div>
        )}
        {insight && (
          <div className="space-y-2">
            <ul className="list-disc space-y-1 pl-4 text-xs text-ink-soft">
              {insight.suggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
            {insight.estimatedCost > 0 && (
              <div className="flex items-center justify-between gap-2 rounded-lg bg-paper px-2.5 py-1.5 text-xs">
                <span className="text-ink-muted">
                  {t.estimateCost}:{' '}
                  <span className="font-semibold text-ink">Rp {insight.estimatedCost.toLocaleString('id-ID')}</span>
                </span>
                <button
                  type="button"
                  onClick={applyEstimate}
                  className="shrink-0 font-medium text-clay-deep hover:underline"
                >
                  {t.applyEstimate}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <NameDialog
        open={renaming}
        title={t.renameObjectTitle}
        label={ta.title}
        initialName={item.name}
        onClose={() => setRenaming(false)}
        onSave={(name) => {
          editItem(item.id, { name })
          setRenaming(false)
        }}
      />

      {/* Regenerating an object image costs credits, so it goes through the
          same confirmation the checklist row uses. */}
      <ConfirmDialog
        open={Boolean(pendingPrompt)}
        onClose={() => setPendingPrompt(null)}
        onConfirm={() => generateItemImage(item.id, pendingPrompt)}
        title={ta.confirmItemTitle}
        body={ta.confirmItemBody}
        confirmLabel={ta.confirmItemCta}
      />
    </div>
  )
}

function ActionChip({ icon, label, onClick, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full border border-paper-line px-2.5 py-1 text-xs transition-colors ${
        danger ? 'text-ink-soft hover:border-danger/40 hover:text-danger' : 'text-ink-soft hover:border-clay/40 hover:text-clay-deep'
      }`}
    >
      <StepIcon name={icon} className="h-3 w-3" />
      {label}
    </button>
  )
}
