import { useEffect, useRef, useState } from 'react'
import { StepIcon } from '../../icons.jsx'
import ConfirmDialog from '../../ui/ConfirmDialog.jsx'
import ImageLightbox from '../../ui/ImageLightbox.jsx'
import Spinner from '../Spinner.jsx'
import { useToast } from '../../ui/Toast.jsx'
import { content } from '../../../content.js'

const t = content.app.analyze

// One editable checklist item: include toggle, inline name/cost editing,
// per-item image generation (confirm-gated), cancel/retry, and manual-item
// removal. Lifted out of AnalyzePanel unchanged so the Inspector tree and the
// full Checklist & Brief panel share exactly one implementation.
//
// Two behaviors here are load-bearing and easy to break when refactoring:
//   * the customize row only auto-collapses on a real pending->done
//     transition, not merely because the item already has an image — the
//     latter is the normal "regenerate an existing item" case and must stay open
//   * the row stays mounted while pending (input disabled, button becomes a
//     spinner) so the button the user just clicked never silently disappears

export default function ChecklistItemRow({ item, selected, onSelect, onToggle, onEdit, onRemove, onGenerateItemImage, onCancelItemImage }) {
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
    <div
      onClick={() => onSelect?.(item.id)}
      className={`flex items-start gap-3 rounded-lg p-1.5 transition-colors ${
        item.included ? '' : 'opacity-45'
      } ${selected ? 'bg-clay-soft' : onSelect ? 'cursor-pointer hover:bg-paper-soft' : ''}`}
    >
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
