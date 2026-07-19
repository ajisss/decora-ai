import { useState } from 'react'
import { StepIcon } from '../icons.jsx'
import AnalysisTree from './AnalysisTree.jsx'
import InspectorSelectedItem from './inspector/InspectorSelectedItem.jsx'
import useAnalysisController from './analysis/useAnalysisController.js'
import { content } from '../../content.js'

const t = content.app.studio
const ta = content.app.analyze

// Level 3/4 right column. The analysis tree stays visible at all times and the
// selected object's detail stacks underneath it — selecting an item should not
// hide the list you selected it from.
export default function Inspector({
  project,
  activeVersion,
  versionNumber,
  selectedObject,
  onSelectObject,
  onEditSetup,
  onShowProjectDetail,
  onRenameVersion,
  onExportVersion,
}) {
  const [tab, setTab] = useState('inspector')
  const [query, setQuery] = useState('')
  const { analysis, loading, analyze } = useAnalysisController(project.id, activeVersion)

  const versionName =
    activeVersion?.favoriteName || (versionNumber === 1 ? t.original : `${t.design} ${versionNumber}`)
  const itemCount = analysis?.items?.length ?? 0

  return (
    <>
      <div className="flex shrink-0 items-center gap-4 border-b border-paper-line px-4">
        {[
          { value: 'inspector', label: t.inspectorTab },
          { value: 'notes', label: t.notesTab },
        ].map((tb) => (
          <button
            key={tb.value}
            type="button"
            onClick={() => setTab(tb.value)}
            className={`-mb-px border-b-2 py-2.5 text-sm font-medium transition-colors ${
              tab === tb.value
                ? 'border-clay text-clay-deep'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === 'notes' ? (
          <div className="space-y-3 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-muted">{t.notesTab}</p>
            <p className="whitespace-pre-wrap rounded-xl2 border border-paper-line bg-paper p-3 text-sm text-ink-soft">
              {project.setup.notes || '—'}
            </p>
            <button type="button" onClick={onEditSetup} className="btn-ghost w-full !py-2 text-sm">
              <StepIcon name="pencil" className="h-3.5 w-3.5" />
              {t.editSetup}
            </button>
          </div>
        ) : (
          <>
            {/* Project Info — a header row, not a full table. The detail lives
                in the Informasi Acara section; this just gets you there. */}
            <div className="flex items-center justify-between gap-2 border-b border-paper-line px-4 py-3">
              <p className="text-sm font-semibold text-ink">{t.projectInfo}</p>
              <button
                type="button"
                onClick={onShowProjectDetail}
                className="flex shrink-0 items-center gap-0.5 text-xs font-medium text-clay-deep hover:underline"
              >
                {t.viewDetail}
                <StepIcon name="chevronRight" className="h-3 w-3" />
              </button>
            </div>

            {activeVersion && (
              <div className="flex items-center justify-between gap-2 border-b border-paper-line px-4 py-2.5">
                <p className="truncate text-xs text-ink-muted">
                  {versionName} · {new Date(activeVersion.createdAt).toLocaleDateString('id-ID')}
                </p>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onRenameVersion(activeVersion)}
                    aria-label={t.renameVersion}
                    title={t.renameVersion}
                    className="rounded-md p-1 text-ink-muted hover:bg-paper hover:text-ink"
                  >
                    <StepIcon name="pencil" className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onExportVersion(activeVersion)}
                    aria-label={t.export}
                    title={t.export}
                    className="rounded-md p-1 text-ink-muted hover:bg-paper hover:text-ink"
                  >
                    <StepIcon name="download" className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            <div className="p-4">
              {!activeVersion ? (
                <p className="py-6 text-center text-xs text-ink-muted">{ta.noDesignBody}</p>
              ) : analysis ? (
                <>
                  <div className="mb-2 flex items-center gap-2">
                    <p className="shrink-0 text-sm font-semibold text-ink">
                      {ta.analysisHeading}{' '}
                      <span className="font-normal text-ink-muted">({ta.itemCount(itemCount)})</span>
                    </p>
                    <div className="min-w-0 flex-1">
                      <AnalysisTree.Search value={query} onChange={setQuery} />
                    </div>
                  </div>
                  <AnalysisTree
                    items={analysis.items}
                    density="compact"
                    query={query}
                    selectedObjectId={selectedObject?.id ?? null}
                    onSelect={onSelectObject}
                  />
                </>
              ) : (
                <div className="rounded-xl2 border border-paper-line bg-paper p-3 text-center">
                  <p className="text-xs text-ink-soft">{ta.ctaSuggestBody}</p>
                  <button
                    type="button"
                    onClick={analyze}
                    disabled={loading || activeVersion.status !== 'done'}
                    className="btn-primary mt-2 w-full !py-1.5 text-xs disabled:opacity-60"
                  >
                    {loading ? ta.analyzing : ta.cta}
                  </button>
                </div>
              )}
            </div>

            {selectedObject && activeVersion && (
              <InspectorSelectedItem
                projectId={project.id}
                version={activeVersion}
                item={selectedObject}
                onClear={() => onSelectObject(null)}
              />
            )}
          </>
        )}
      </div>
    </>
  )
}
