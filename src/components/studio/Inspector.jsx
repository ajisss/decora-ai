import { useState } from 'react'
import { Link } from 'react-router-dom'
import { StepIcon } from '../icons.jsx'
import AnalysisTree from './AnalysisTree.jsx'
import useAnalysisMutations from './useAnalysisMutations.js'
import { useProjects } from '../../context/ProjectsContext.jsx'
import { useToast } from '../ui/Toast.jsx'
import { api } from '../../api/client.js'
import { content } from '../../content.js'

const t = content.app.studio
const ta = content.app.analyze

// Level 3/4 right column — switches between Project Info (nothing selected),
// version metadata + object tree (a version is selected), and Object
// Properties (an object is selected). Reuses the exact setup `dl` block that
// used to live in StudioPage's old right rail, plus AnalyzePanel's analyze
// trigger and the shared checklist-item mutations.
export default function Inspector({
  project,
  selectedVersion,
  versionNumber,
  selectedObjectId,
  onSelectObject,
  onEditSetup,
  onRenameVersion,
  onExportVersion,
}) {
  const [tab, setTab] = useState('inspector')
  const { runAnalysis } = useProjects()
  const { showToast } = useToast()
  const [analyzing, setAnalyzing] = useState(false)

  const item = selectedVersion?.analysis?.items.find((i) => i.id === selectedObjectId) ?? null

  const runAnalyze = async () => {
    setAnalyzing(true)
    const result = await runAnalysis(project.id, selectedVersion.id)
    setAnalyzing(false)
    if (result.ok) showToast(ta.complete)
  }

  return (
    <div className="flex h-full w-72 shrink-0 flex-col border-l border-paper-line bg-paper-soft">
      <div className="flex items-center gap-1 border-b border-paper-line p-2">
        {[
          { value: 'inspector', label: t.inspectorTab },
          { value: 'notes', label: t.notesTab },
        ].map((tb) => (
          <button
            key={tb.value}
            type="button"
            onClick={() => setTab(tb.value)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              tab === tb.value ? 'bg-paper text-clay-deep' : 'text-ink-muted hover:text-ink'
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {tab === 'notes' ? (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-muted">{t.navEvent}</p>
            <p className="whitespace-pre-wrap rounded-xl2 border border-paper-line bg-paper p-3 text-sm text-ink-soft">
              {project.setup.notes || '—'}
            </p>
            <button type="button" onClick={onEditSetup} className="btn-ghost w-full !py-2 text-sm">
              <StepIcon name="pencil" className="h-3.5 w-3.5" />
              {t.editSetup}
            </button>
          </div>
        ) : item ? (
          <ObjectProperties
            projectId={project.id}
            generationId={selectedVersion.id}
            item={item}
            onBack={() => onSelectObject(null)}
          />
        ) : selectedVersion ? (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold text-ink">
                  {selectedVersion.favoriteName || `${t.design} ${versionNumber}`}
                </p>
                <button type="button" onClick={() => onRenameVersion(selectedVersion)} className="text-ink-muted hover:text-ink">
                  <StepIcon name="pencil" className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="mt-1 text-xs text-ink-muted">{new Date(selectedVersion.createdAt).toLocaleString('id-ID')}</p>
              {selectedVersion.prompt && <p className="mt-2 line-clamp-3 text-xs text-ink-muted">{selectedVersion.prompt}</p>}
              <button type="button" onClick={() => onExportVersion(selectedVersion)} className="btn-ghost mt-3 w-full !py-1.5 text-xs">
                <StepIcon name="download" className="h-3.5 w-3.5" />
                {t.export}
              </button>
            </div>

            <div className="border-t border-paper-line pt-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-ink-muted">{ta.title}</p>
              {selectedVersion.analysis ? (
                <AnalysisTree analysis={selectedVersion.analysis} selectedObjectId={selectedObjectId} onSelect={onSelectObject} compact />
              ) : (
                <div className="rounded-xl2 border border-paper-line bg-paper p-3 text-center">
                  <p className="text-xs text-ink-soft">{ta.ctaSuggestBody}</p>
                  <button
                    type="button"
                    onClick={runAnalyze}
                    disabled={analyzing || selectedVersion.status !== 'done'}
                    className="btn-primary mt-2 w-full !py-1.5 text-xs disabled:opacity-60"
                  >
                    {analyzing ? ta.analyzing : ta.cta}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-muted">{t.projectInfo}</p>
            <dl className="space-y-3 rounded-xl2 border border-paper-line bg-paper p-4 text-sm">
              {[
                [t.setupTheme, project.setup.theme],
                [t.setupStyle, project.setup.style || '—'],
                [t.setupVenue, project.setup.venueType],
                [t.setupSize, project.setup.venueSize],
                [t.setupGuests, project.setup.guestCapacity],
                [t.setupBudget, project.setup.budgetTier],
                [t.setupPalette, project.setup.colorPalette?.join(', ') || '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-3">
                  <dt className="shrink-0 text-xs text-ink-muted">{label}</dt>
                  <dd className="text-right font-medium text-ink-soft">{value}</dd>
                </div>
              ))}
            </dl>
            <button type="button" onClick={onEditSetup} className="btn-ghost w-full !py-2 text-sm">
              <StepIcon name="pencil" className="h-3.5 w-3.5" />
              {t.editSetup}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Object Properties: item fields, actions (Edit/Hapus reuse the shared
// checklist mutations; Ganti/Generate Similar reuse runItemImage; Lihat
// Vendor links out), and AI Suggestions + Estimate Biaya via the new
// /api/item-insight endpoint — ephemeral until "Terapkan" writes it in.
function ObjectProperties({ projectId, generationId, item, onBack }) {
  const { editItem, removeManual } = useAnalysisMutations(projectId, generationId)
  const { runItemImage } = useProjects()
  const { showToast } = useToast()
  const [insight, setInsight] = useState(null)
  const [loadingInsight, setLoadingInsight] = useState(false)
  const [insightError, setInsightError] = useState(null)

  const loadInsight = async () => {
    setLoadingInsight(true)
    setInsightError(null)
    try {
      const result = await api.itemInsight({ projectId, generationId, itemId: item.id })
      setInsight(result)
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
      <button type="button" onClick={onBack} className="flex items-center gap-1 text-xs font-medium text-ink-muted hover:text-clay-deep">
        <StepIcon name="chevronRight" className="h-3 w-3 rotate-180" />
        {t.design}
      </button>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-muted">{t.objectProperties}</p>
        {item.itemImage?.imageId && (
          <img src={item.itemImage.imageId} alt={item.name} className="mt-2 h-28 w-full rounded-xl2 object-cover" />
        )}
        <p className="mt-2 text-sm font-semibold text-ink">{item.name}</p>
        <p className="text-xs text-ink-muted">{ta.categoryLabels[item.category] ?? item.category}</p>
        {typeof item.confidence === 'number' && (
          <p className="mt-1 text-xs text-ink-muted">
            {t.confidenceLabel}: <span className="font-medium text-ink-soft">{item.confidence}%</span>
          </p>
        )}
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
          <ActionChip
            icon="pencil"
            label={t.editObject}
            onClick={() => {
              const name = window.prompt(ta.title, item.name)
              if (name?.trim()) editItem(item.id, { name: name.trim() })
            }}
          />
          <ActionChip icon="spark" label={t.swapItem} onClick={() => runItemImage(projectId, generationId, item.id, '')} />
          <ActionChip
            icon="duplicate"
            label={t.generateSimilar}
            onClick={() => runItemImage(projectId, generationId, item.id, `A similar but different ${item.name}`)}
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
          <Link to="/vendors" className="inline-flex items-center gap-1 rounded-full border border-paper-line px-2.5 py-1 text-xs text-ink-soft hover:border-clay/40 hover:text-clay-deep">
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
              <div className="flex items-center justify-between rounded-lg bg-paper px-2.5 py-1.5 text-xs">
                <span className="text-ink-muted">
                  {t.estimateCost}: <span className="font-semibold text-ink">Rp {insight.estimatedCost.toLocaleString('id-ID')}</span>
                </span>
                <button type="button" onClick={applyEstimate} className="font-medium text-clay-deep hover:underline">
                  {t.applyEstimate}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function ActionChip({ icon, label, onClick, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors ${
        danger
          ? 'border-paper-line text-ink-soft hover:border-danger/40 hover:text-danger'
          : 'border-paper-line text-ink-soft hover:border-clay/40 hover:text-clay-deep'
      }`}
    >
      <StepIcon name={icon} className="h-3 w-3" />
      {label}
    </button>
  )
}
