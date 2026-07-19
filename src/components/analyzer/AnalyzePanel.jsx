import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { StepIcon } from '../icons.jsx'
import Skeleton from '../ui/Skeleton.jsx'
import { useProjects } from '../../context/ProjectsContext.jsx'
import useAnalysisMutations from '../studio/useAnalysisMutations.js'
import { useToast } from '../ui/Toast.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import ConfirmDialog from '../ui/ConfirmDialog.jsx'
import ImageLightbox from '../ui/ImageLightbox.jsx'
import { content } from '../../content.js'

const t = content.app.analyze

export const TAXONOMY_ORDER = [
  'Stage',
  'Backdrop',
  'Chairs',
  'VIP Chairs',
  'Tables',
  'Flowers',
  'Lighting',
  'Walkway',
  'Reception Desk',
  'Ceiling Decoration',
  'LED Screen',
  'Other',
]

// Inline in the Studio right-side panel — not a drawer/overlay — since
// analyzing is a main-journey step (uiuxcontext.md §7 Canvas → Analyze →
// Export), not a peripheral action. One generation at a time.
export default function AnalyzePanel({ projectId, generation, versionNumber, onJumpToFeed, onExport, hideImage = false }) {
  const { runAnalysis, runItemImage, cancelItemImage } = useProjects()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [confirmReanalyze, setConfirmReanalyze] = useState(false)
  const [zoomSrc, setZoomSrc] = useState(null)
  const { editItem, toggleItem, removeManual, addManualItem } = useAnalysisMutations(projectId, generation?.id)

  if (!generation) {
    return (
      <div className="flex items-center justify-center py-10">
        <EmptyState illustration="checklist" compact title={t.noDesignTitle} body={t.noDesignBody} />
      </div>
    )
  }

  const analysis = generation.analysis
  // Q2: aria-live status for the analysis lifecycle.
  const liveMessage = loading ? t.analyzing : error ? t.error : analysis ? t.complete : ''

  const analyze = async () => {
    setLoading(true)
    setError(null)
    const result = await runAnalysis(projectId, generation.id)
    setLoading(false)
    if (!result.ok) setError(t.error)
    else showToast(t.complete)
  }

  const groups = analysis
    ? TAXONOMY_ORDER.map((cat) => ({ cat, items: analysis.items.filter((i) => i.category === cat) })).filter(
        (g) => g.items.length > 0,
      )
    : []

  // M3: estimasi total — jumlah kasar dari field biaya yang diisi user (item tercentang saja).
  const totalCost = (analysis?.items ?? [])
    .filter((i) => i.included && i.estimatedCost)
    .reduce((sum, i) => sum + (Number(String(i.estimatedCost).replace(/[^0-9]/g, '')) || 0), 0)

  return (
    <div className="space-y-4">
      <div role="status" aria-live="polite" className="sr-only">
        {liveMessage}
      </div>

      {!hideImage && (
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-clay-soft px-2.5 py-1 text-xs font-semibold text-clay-deep">
              <StepIcon name="checklist" className="h-3 w-3" />
              {t.design} {versionNumber}
            </span>
            {onJumpToFeed && (
              <button
                type="button"
                onClick={onJumpToFeed}
                className="inline-flex items-center gap-1 text-xs font-medium text-ink-muted hover:text-clay-deep"
              >
                {t.jumpToFeed}
                <StepIcon name="external" className="h-3 w-3" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setZoomSrc(generation.imageId)}
            className="mt-1.5 block w-full overflow-hidden rounded-xl2 border-2 border-clay/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-clay/40"
          >
            <img src={generation.imageId} alt="" className="aspect-video w-full object-cover" />
          </button>
        </div>
      )}

      <ImageLightbox src={zoomSrc} onClose={() => setZoomSrc(null)} />

      {!analysis && !loading && !error && (
        <div className="flex flex-col items-center gap-3 rounded-xl2 border border-paper-line bg-paper px-4 py-8 text-center">
          <p className="text-sm text-ink-soft">{t.ctaSuggestBody}</p>
          <button type="button" onClick={analyze} className="btn-primary">
            {t.cta}
          </button>
          <p className="text-xs text-ink-muted">{t.ctaHint}</p>
        </div>
      )}

      {loading && (
        <div className="space-y-4">
          <p className="inline-flex items-center gap-1.5 text-sm font-medium text-clay-deep">
            <Spinner /> {t.analyzing}
          </p>
          {Array.from({ length: 3 }).map((_, gi) => (
            <div key={gi} className="space-y-2">
              <div className="h-3 w-24 rounded bg-paper-soft" />
              <Skeleton shape="checklist-row" />
              <Skeleton shape="checklist-row" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-danger-soft p-4 text-sm text-danger">
          {error}
          <button type="button" onClick={analyze} className="btn-ghost mt-3 !px-3 !py-1.5 text-xs">
            {t.retry}
          </button>
        </div>
      )}

      {analysis && !loading && groups.length === 0 && (
        <EmptyState illustration="checklist" compact title={t.zeroTitle} body={t.zeroBody} cta={t.addItem} onCta={() => addManualItem('Other')} />
      )}

      {analysis && !loading && groups.length > 0 && (
        <div className="space-y-6">
          {groups.map(({ cat, items }) => (
            <div key={cat}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-ink-muted">
                {t.categoryLabels[cat] ?? cat} ({items.length})
              </p>
              <div className="space-y-3">
                {items.map((item) => (
                  <ChecklistRow
                    key={item.id}
                    item={item}
                    onToggle={() => toggleItem(item.id)}
                    onEdit={(patch) => editItem(item.id, patch)}
                    onRemove={item.isManual ? () => removeManual(item.id) : null}
                    onGenerateItemImage={(customPrompt) =>
                      runItemImage(projectId, generation.id, item.id, customPrompt)
                    }
                    onCancelItemImage={() => cancelItemImage(projectId, generation.id, item.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {analysis && !loading && totalCost > 0 && (
        <div className="rounded-xl2 border border-paper-line bg-paper px-4 py-2 text-sm">
          <span className="text-ink-muted">{t.costTotal}: </span>
          <span className="font-semibold text-ink">Rp {totalCost.toLocaleString('id-ID')}</span>
        </div>
      )}

      {analysis && !loading && (
        <Link to="/vendors" className="block text-sm font-medium text-clay-deep hover:underline">
          {t.findVendors}
        </Link>
      )}

      {analysis && !loading && confirmReanalyze && (
        <div className="rounded-lg bg-clay-soft p-3 text-sm text-clay-deep">
          {t.reanalyzeConfirm}
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setConfirmReanalyze(false)
                analyze()
              }}
              className="btn-primary !px-3 !py-1.5 text-xs"
            >
              {t.reanalyze}
            </button>
            <button
              type="button"
              onClick={() => setConfirmReanalyze(false)}
              className="btn-ghost !px-3 !py-1.5 text-xs"
            >
              {t.cancel}
            </button>
          </div>
        </div>
      )}

      {analysis && !loading && (
        <div className="space-y-2 border-t border-paper-line pt-3">
          <button type="button" onClick={() => onExport(generation)} className="btn-primary w-full !py-2 text-sm">
            {t.exportBrief}
          </button>
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => addManualItem('Other')}
              className="text-sm font-medium text-ink-soft hover:text-ink"
            >
              {t.addItem}
            </button>
            <button
              type="button"
              onClick={() => setConfirmReanalyze(true)}
              className="btn-ghost !px-3 !py-1.5 text-xs"
            >
              {t.reanalyze}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Spinner() {
  return (
    <svg className="h-3 w-3 shrink-0 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function ChecklistRow({ item, onToggle, onEdit, onRemove, onGenerateItemImage, onCancelItemImage }) {
  const { showToast } = useToast()
  const [editing, setEditing] = useState(false)
  const [customizing, setCustomizing] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')
  const [confirmGenerate, setConfirmGenerate] = useState(false)
  const [zoomSrc, setZoomSrc] = useState(null)

  const itemImage = item.itemImage
  const isPending = itemImage?.status === 'pending'
  const isDone = itemImage?.status === 'done'
  const isError = itemImage?.status === 'error'
  const isCancelled = itemImage?.status === 'cancelled'

  // Auto-collapse the customize row only on an actual pending->done transition
  // (a fresh regenerate completing) — not just because isDone happens to
  // already be true when the row is opened (that's the normal "click
  // Regenerate/customize on a finished item" case, which must stay open).
  const prevStatusRef = useRef(itemImage?.status)
  useEffect(() => {
    if (prevStatusRef.current === 'pending' && itemImage?.status === 'done') {
      setCustomizing(false)
      showToast(t.itemImageReady)
    }
    prevStatusRef.current = itemImage?.status
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemImage?.status])

  const generate = () => setConfirmGenerate(true)

  const doGenerate = () => {
    onGenerateItemImage(customPrompt)
    setCustomPrompt('')
    // customizing stays open through the pending phase so the button the user
    // just clicked turns into a visible spinner instead of disappearing; the
    // effect above closes it once the new image actually finishes.
  }

  return (
    <div className={`flex items-start gap-3 ${item.included ? '' : 'opacity-45'}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={item.included}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border-2 ${
          item.included ? 'border-clay bg-clay text-white' : 'border-paper-line'
        }`}
      >
        {item.included && <StepIcon name="check" className="h-3.5 w-3.5" />}
      </button>
      <div className="flex-1">
        {editing ? (
          <div className="space-y-1.5">
            <input
              autoFocus
              defaultValue={item.name}
              onBlur={(e) => onEdit({ name: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && setEditing(false)}
              className="w-full rounded border border-paper-line px-2 py-1 text-sm"
            />
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                defaultValue={item.estimatedCost ?? ''}
                placeholder={t.costLabel}
                onBlur={(e) => onEdit({ estimatedCost: e.target.value.replace(/[^0-9]/g, '') })}
                onKeyDown={(e) => e.key === 'Enter' && setEditing(false)}
                className="w-36 rounded border border-paper-line px-2 py-1 text-xs"
              />
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="text-xs font-medium text-clay-deep hover:underline"
              >
                OK
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm font-medium text-ink">
            {item.name}{' '}
            {item.estimatedQuantity && <span className="text-ink-muted">({item.estimatedQuantity})</span>}{' '}
            {item.estimatedCost && (
              <span className="rounded-full bg-paper-soft px-2 py-0.5 text-xs font-medium text-ink-soft">
                {t.costChipPrefix} {Number(item.estimatedCost).toLocaleString('id-ID')}
              </span>
            )}
          </p>
        )}
        {item.description && <p className="line-clamp-2 text-xs text-ink-muted">{item.description}</p>}
        {item.note && <p className="mt-1 text-xs italic text-ink-muted">{t.note}: {item.note}</p>}

        <div className="mt-2 flex items-center gap-2">
          {isPending && (
            <div className="flex items-center gap-2">
              <div className="h-12 w-12 shrink-0 animate-pulse rounded-md bg-paper-soft" />
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-clay-deep">
                <Spinner />
                {t.generatingItemImage}
              </span>
              <button type="button" onClick={onCancelItemImage} className="text-xs font-medium text-ink-muted hover:text-danger">
                {t.itemCancelling}
              </button>
            </div>
          )}

          {isCancelled && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-muted">{t.itemCancelled}</span>
              <button type="button" onClick={generate} className="text-xs font-medium text-clay-deep hover:underline">
                {t.retry}
              </button>
            </div>
          )}

          {isDone && itemImage.imageId && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomSrc(itemImage.imageId)}
                className="shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-clay/40"
              >
                <img src={itemImage.imageId} alt={item.name} className="h-12 w-12 rounded-md object-cover" />
              </button>
              <button
                type="button"
                onClick={() => setCustomizing((c) => !c)}
                className="text-xs font-medium text-clay-deep hover:underline"
              >
                {t.regenerateItem}
              </button>
            </div>
          )}

          {isError && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-danger">{itemImage.error}</span>
              <button type="button" onClick={generate} className="text-xs font-medium text-clay-deep hover:underline">
                {t.retry}
              </button>
            </div>
          )}

          {!itemImage && !customizing && (
            <button
              type="button"
              onClick={() => setCustomizing(true)}
              className="inline-flex items-center gap-1 text-xs font-medium text-clay-deep hover:underline"
            >
              <StepIcon name="spark" className="h-3 w-3" />
              {t.generateItemImage}
            </button>
          )}
        </div>

        {/* Stays visible (input disabled, button turns into a spinner) through the
            pending phase — the button the user just clicked must never vanish
            silently, otherwise a click reads as "did nothing" (ux-spec §3.1). */}
        {customizing && (
          <div className="mt-2 flex items-center gap-2">
            <input
              type="text"
              value={customPrompt}
              disabled={isPending}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder={t.itemPromptPlaceholder}
              className="flex-1 rounded border border-paper-line px-2 py-1 text-xs focus:border-clay focus:outline-none disabled:bg-paper-soft"
            />
            <button
              type="button"
              onClick={generate}
              disabled={isPending}
              className="btn-primary inline-flex items-center gap-1.5 !px-3 !py-1.5 text-xs disabled:opacity-70"
            >
              {isPending && <Spinner />}
              {isPending ? t.itemGenerating : t.itemGenerate}
            </button>
          </div>
        )}
      </div>
      <div className="flex shrink-0 gap-1">
        <button type="button" onClick={() => setEditing(true)} className="text-ink-muted hover:text-ink">
          <StepIcon name="pencil" className="h-3.5 w-3.5" />
        </button>
        {onRemove && (
          <button type="button" onClick={onRemove} className="text-ink-muted hover:text-danger">
            <StepIcon name="close" className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <ConfirmDialog
        open={confirmGenerate}
        onClose={() => setConfirmGenerate(false)}
        onConfirm={doGenerate}
        title={t.confirmItemTitle}
        body={t.confirmItemBody}
        confirmLabel={t.confirmItemCta}
      />
      <ImageLightbox src={zoomSrc} onClose={() => setZoomSrc(null)} />
    </div>
  )
}
