import { StepIcon } from '../../icons.jsx'
import AnalysisTree from '../AnalysisTree.jsx'
import useAnalysisController from '../analysis/useAnalysisController.js'
import { content } from '../../../content.js'

const t = content.app.studio
const ta = content.app.analyze

// Inspector's "a version is selected, no object" state: image metadata plus
// the compact object tree. Analyzing is offered here because the tree is the
// thing it fills in — the CTA sits where its result will appear.
export default function InspectorVersionPanel({
  projectId,
  version,
  versionName,
  selectedObjectId,
  onSelectObject,
  onRename,
  onExport,
}) {
  const { analysis, loading, analyze } = useAnalysisController(projectId, version)

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-ink">{versionName}</p>
          <button
            type="button"
            onClick={() => onRename(version)}
            aria-label={t.renameVersion}
            title={t.renameVersion}
            className="shrink-0 text-ink-muted hover:text-ink"
          >
            <StepIcon name="pencil" className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="mt-1 text-xs text-ink-muted">{new Date(version.createdAt).toLocaleString('id-ID')}</p>
        {version.modificationNote && (
          <p className="mt-2 rounded-lg bg-paper px-2.5 py-1.5 text-xs text-ink-soft">↳ {version.modificationNote}</p>
        )}
        {version.prompt && <p className="mt-2 line-clamp-4 text-xs text-ink-muted">{version.prompt}</p>}
        <button type="button" onClick={() => onExport(version)} className="btn-ghost mt-3 w-full !py-1.5 text-xs">
          <StepIcon name="download" className="h-3.5 w-3.5" />
          {t.export}
        </button>
      </div>

      <div className="border-t border-paper-line pt-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-ink-muted">{ta.title}</p>
        {analysis ? (
          <AnalysisTree
            items={analysis.items}
            density="compact"
            selectedObjectId={selectedObjectId}
            onSelect={onSelectObject}
          />
        ) : (
          <div className="rounded-xl2 border border-paper-line bg-paper p-3 text-center">
            <p className="text-xs text-ink-soft">{ta.ctaSuggestBody}</p>
            <button
              type="button"
              onClick={analyze}
              disabled={loading || version.status !== 'done'}
              className="btn-primary mt-2 w-full !py-1.5 text-xs disabled:opacity-60"
            >
              {loading ? ta.analyzing : ta.cta}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
