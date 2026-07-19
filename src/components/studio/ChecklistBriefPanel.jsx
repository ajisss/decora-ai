import { useState } from 'react'
import { Link } from 'react-router-dom'
import { StepIcon } from '../icons.jsx'
import Skeleton from '../ui/Skeleton.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import ImageLightbox from '../ui/ImageLightbox.jsx'
import Spinner from './Spinner.jsx'
import AnalysisTree from './AnalysisTree.jsx'
import ChecklistItemRow from './analysis/ChecklistItemRow.jsx'
import useAnalysisController from './analysis/useAnalysisController.js'
import { content } from '../../content.js'

const t = content.app.analyze
const ts = content.app.studio

// The "Checklist & Brief" project section: the full decoration analysis with
// per-item editing, plus the vendor-brief hand-off. Replaces AnalyzePanel —
// same capabilities, but the flat category sections are now a collapsible
// tree, and selecting a row also drives the canvas pin + Inspector.
export default function ChecklistBriefPanel({
  projectId,
  generation,
  versionNumber,
  selectedObjectId,
  onSelectObject,
  onExport,
}) {
  const [confirmReanalyze, setConfirmReanalyze] = useState(false)
  const [zoomSrc, setZoomSrc] = useState(null)
  const {
    analysis,
    totalCost,
    loading,
    error,
    analyze,
    editItem,
    toggleItem,
    removeManual,
    addManualItem,
    generateItemImage,
    cancelItemImage,
  } = useAnalysisController(projectId, generation)

  const liveMessage = loading ? t.analyzing : error ? t.error : analysis ? t.complete : ''
  const hasItems = (analysis?.items?.length ?? 0) > 0

  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-6">
      <div className="mx-auto max-w-[760px] space-y-4">
        <div role="status" aria-live="polite" className="sr-only">
          {liveMessage}
        </div>

        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-lg font-semibold text-ink">{ts.navChecklist}</h2>
          {generation && (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-clay-soft px-2.5 py-1 text-xs font-semibold text-clay-deep">
              <StepIcon name="checklist" className="h-3 w-3" />
              {t.design} {versionNumber}
            </span>
          )}
        </div>

        {!generation ? (
          <div className="flex items-center justify-center py-10">
            <EmptyState illustration="checklist" compact title={t.noDesignTitle} body={t.noDesignBody} />
          </div>
        ) : (
          <>
            {generation.imageId && (
              <button
                type="button"
                onClick={() => setZoomSrc(generation.imageId)}
            aria-label={t.zoomImage}
                className="block w-full overflow-hidden rounded-xl2 border border-paper-line focus:outline-none focus-visible:ring-2 focus-visible:ring-clay/40"
              >
                <img src={generation.imageId} alt="" className="aspect-video w-full object-cover" />
              </button>
            )}

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

            {analysis && !loading && !hasItems && (
              <EmptyState
                illustration="checklist"
                compact
                title={t.zeroTitle}
                body={t.zeroBody}
                cta={t.addItem}
                onCta={() => addManualItem('Other')}
              />
            )}

            {analysis && !loading && hasItems && (
              <AnalysisTree
                items={analysis.items}
                density="full"
                searchable
                selectedObjectId={selectedObjectId}
                onSelect={onSelectObject}
                renderRow={(item) => (
                  <ChecklistItemRow
                    key={item.id}
                    item={item}
                    selected={item.id === selectedObjectId}
                    onSelect={onSelectObject}
                    onToggle={() => toggleItem(item.id)}
                    onEdit={(patch) => editItem(item.id, patch)}
                    onRemove={item.isManual ? () => removeManual(item.id) : null}
                    onGenerateItemImage={(customPrompt) => generateItemImage(item.id, customPrompt)}
                    onCancelItemImage={() => cancelItemImage(item.id)}
                  />
                )}
              />
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
          </>
        )}

        <ImageLightbox src={zoomSrc} onClose={() => setZoomSrc(null)} />
      </div>
    </div>
  )
}
