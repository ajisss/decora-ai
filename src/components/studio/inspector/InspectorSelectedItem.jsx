import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StepIcon } from '../../icons.jsx'
import NameDialog from '../../ui/NameDialog.jsx'
import ConfirmDialog from '../../ui/ConfirmDialog.jsx'
import useAnalysisController from '../analysis/useAnalysisController.js'
import { useToast } from '../../ui/Toast.jsx'
import { api } from '../../../api/client.js'
import { content } from '../../../content.js'

const t = content.app.studio
const ta = content.app.analyze

// "Selected Item" — stacks under the analysis tree rather than replacing it.
// Properties, then the actions that apply to this object, then AI suggestions
// and a cost estimate from /api/item-insight (ephemeral until applied).
export default function InspectorSelectedItem({ projectId, version, item, onClear }) {
  const { editItem, removeManual, generateItemImage } = useAnalysisController(projectId, version)
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [renaming, setRenaming] = useState(false)
  const [pendingPrompt, setPendingPrompt] = useState(null)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [insight, setInsight] = useState(null)
  const [loadingInsight, setLoadingInsight] = useState(false)
  const [insightError, setInsightError] = useState(null)

  const rootRef = useRef(null)

  // Insight belongs to one item — drop it when the selection moves, or the
  // panel shows the previous object's suggestions under a new heading.
  // Also pull this panel into view: it stacks below a tree that can be long
  // enough to leave the actions off-screen, which reads as "nothing happened".
  useEffect(() => {
    setInsight(null)
    setInsightError(null)
    rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
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

  // The mockup's "12 pcs • Fresh Flower • Tinggi 180 cm" line, built from the
  // fields we actually have rather than invented ones.
  const metaParts = [
    item.estimatedQuantity,
    ta.categoryLabels[item.category] ?? item.category,
    item.estimatedCost ? `Rp ${Number(item.estimatedCost).toLocaleString('id-ID')}` : null,
  ].filter(Boolean)

  return (
    <div ref={rootRef} className="border-t border-paper-line bg-paper p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-ink">{t.selectedItem}</p>
        <button
          type="button"
          onClick={onClear}
          aria-label={t.clearSelection}
          title={t.clearSelection}
          className="rounded-md p-1 text-ink-muted hover:bg-paper-soft hover:text-ink"
        >
          <StepIcon name="close" className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex items-start gap-2.5">
        {item.itemImage?.imageId ? (
          <img src={item.itemImage.imageId} alt={item.name} className="h-12 w-12 shrink-0 rounded-lg object-cover" />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-paper-soft">
            <StepIcon name="image" className="h-4 w-4 text-ink-muted" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{item.name}</p>
          {metaParts.length > 0 && <p className="truncate text-xs text-ink-muted">{metaParts.join(' • ')}</p>}
        </div>
        {typeof item.confidence === 'number' && (
          <span className="flex shrink-0 flex-col items-end leading-tight">
            <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
              {item.confidence}%
            </span>
            <span className="mt-0.5 text-[9px] text-ink-muted">{t.confidenceLabel}</span>
          </span>
        )}
      </div>

      {item.description && <p className="mt-2 text-xs text-ink-soft">{item.description}</p>}

      <p className="mb-1.5 mt-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
        {t.objectActions}
      </p>
      <div className="grid grid-cols-3 gap-1.5">
        <Action icon="pencil" label={t.editObject} onClick={() => setRenaming(true)} />
        <Action
          icon="spark"
          label={t.swapItem}
          onClick={() => setPendingPrompt(`A different design for the ${item.name}.`)}
        />
        <Action
          icon="trash"
          label={t.removeObject}
          danger
          disabled={!item.isManual}
          title={item.isManual ? undefined : t.removeManualOnly}
          onClick={() => setConfirmRemove(true)}
        />
        <Action
          className="col-span-2"
          icon="duplicate"
          label={t.generateSimilar}
          onClick={() => setPendingPrompt(`A similar but slightly different ${item.name}.`)}
        />
        <Action icon="store" label={t.viewVendor} onClick={() => navigate('/vendors')} />
        <Action
          className="col-span-3"
          icon="checklist"
          label={loadingInsight ? t.insightLoading : t.estimateCost}
          disabled={loadingInsight}
          onClick={loadInsight}
        />
      </div>

      {insightError && (
        <div className="mt-2 text-xs text-danger">
          {insightError}
          <button type="button" onClick={loadInsight} className="ml-2 font-medium text-clay-deep hover:underline">
            {ta.retry}
          </button>
        </div>
      )}

      {insight && (
        <div className="mt-3 space-y-2 border-t border-paper-line pt-3">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
            <StepIcon name="spark" className="h-3 w-3 text-clay-deep" />
            {t.aiSuggestions}
          </p>
          <ul className="list-disc space-y-1 pl-4 text-xs text-ink-soft">
            {insight.suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
          {insight.estimatedCost > 0 && (
            <div className="flex items-center justify-between gap-2 rounded-lg bg-paper-soft px-2.5 py-1.5 text-xs">
              <span className="text-ink-muted">
                {t.estimateCost}:{' '}
                <span className="font-semibold text-ink">Rp {insight.estimatedCost.toLocaleString('id-ID')}</span>
              </span>
              <button type="button" onClick={applyEstimate} className="shrink-0 font-medium text-clay-deep hover:underline">
                {t.applyEstimate}
              </button>
            </div>
          )}
        </div>
      )}

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

      <ConfirmDialog
        open={confirmRemove}
        onClose={() => setConfirmRemove(false)}
        onConfirm={() => {
          removeManual(item.id)
          onClear()
        }}
        title={t.removeObjectTitle}
        body={t.removeObjectBody}
        confirmLabel={t.removeObject}
      />
    </div>
  )
}

function Action({ icon, label, onClick, danger, disabled, title, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title ?? label}
      className={`flex items-center justify-center gap-1 rounded-lg border border-paper-line px-2 py-1.5 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        danger
          ? 'text-ink-soft hover:border-danger/40 hover:text-danger'
          : 'text-ink-soft hover:border-clay/40 hover:text-clay-deep'
      } ${className}`}
    >
      <StepIcon name={icon} className="h-3 w-3 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  )
}
