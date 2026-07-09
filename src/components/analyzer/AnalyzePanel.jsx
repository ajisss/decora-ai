import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { StepIcon } from '../icons.jsx'
import Skeleton from '../ui/Skeleton.jsx'
import { useProjects } from '../../context/ProjectsContext.jsx'
import { useToast } from '../ui/Toast.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import { content } from '../../content.js'

const t = content.app.analyze

const TAXONOMY_ORDER = [
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

// Right-anchored slide-over, one generation at a time (ux-spec §8).
export default function AnalyzePanel({ projectId, generation, onClose, onExport }) {
  const { runAnalysis, updateProject, runItemImage } = useProjects()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [confirmReanalyze, setConfirmReanalyze] = useState(false)

  useEffect(() => {
    if (!generation) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [generation, onClose])

  if (!generation) return null

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

  const mutateItems = (updater) => {
    updateProject(projectId, (p) => ({
      ...p,
      generations: p.generations.map((g) =>
        g.id === generation.id ? { ...g, analysis: { ...g.analysis, items: updater(g.analysis.items) } } : g,
      ),
    }))
  }

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
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-ink/20" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-[420px] flex-col bg-paper shadow-2xl">
        <div role="status" aria-live="polite" className="sr-only">
          {liveMessage}
        </div>
        <div className="flex items-center justify-between border-b border-paper-line p-4">
          <div>
            <h2 className="font-display text-lg text-ink">{t.title}</h2>
            <p className="text-xs text-ink-muted">{t.design} {generation.id.slice(0, 6)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-paper-soft hover:text-ink"
          >
            <StepIcon name="close" className="h-5 w-5" />
          </button>
        </div>

        <img src={`/images/${generation.imageId}`} alt="" className="aspect-video w-full object-cover" />

        <div className="flex-1 overflow-y-auto p-4">
          {!analysis && !loading && !error && (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
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
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {analysis && !loading && totalCost > 0 && (
          <div className="border-t border-paper-line px-4 py-2 text-sm">
            <span className="text-ink-muted">{t.costTotal}: </span>
            <span className="font-semibold text-ink">Rp {totalCost.toLocaleString('id-ID')}</span>
          </div>
        )}

        {analysis && !loading && (
          <Link to="/vendors" className="block border-t border-paper-line px-4 py-2 text-sm font-medium text-clay-deep hover:underline">
            {t.findVendors}
          </Link>
        )}

        {analysis && !loading && confirmReanalyze && (
          <div className="border-t border-paper-line bg-clay-soft p-3 text-sm text-clay-deep">
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
          <div className="flex items-center justify-between gap-2 border-t border-paper-line p-4">
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
            <button type="button" onClick={() => onExport(generation)} className="btn-primary !px-4 !py-2 text-sm">
              {t.exportBrief}
            </button>
          </div>
        )}
      </div>
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

function ChecklistRow({ item, onToggle, onEdit, onRemove, onGenerateItemImage }) {
  const { showToast } = useToast()
  const [editing, setEditing] = useState(false)
  const [customizing, setCustomizing] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')

  const itemImage = item.itemImage
  const isPending = itemImage?.status === 'pending'
  const isDone = itemImage?.status === 'done'
  const isError = itemImage?.status === 'error'

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

  const generate = () => {
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
            </div>
          )}

          {isDone && itemImage.imageId && (
            <div className="flex items-center gap-2">
              <img src={`/images/${itemImage.imageId}`} alt={item.name} className="h-12 w-12 rounded-md object-cover" />
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
    </div>
  )
}
