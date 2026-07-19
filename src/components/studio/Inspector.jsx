import { useState } from 'react'
import { StepIcon } from '../icons.jsx'
import InspectorProjectSummary from './inspector/InspectorProjectSummary.jsx'
import InspectorVersionPanel from './inspector/InspectorVersionPanel.jsx'
import InspectorObjectPanel from './inspector/InspectorObjectPanel.jsx'
import { content } from '../../content.js'

const t = content.app.studio

// Level 3/4 right column. The body is driven entirely by what is selected —
// object beats version beats nothing — so it can never disagree with the
// canvas. The mode is derived, not stored (see useWorkspaceSelection).
export default function Inspector({
  project,
  activeVersion,
  versionNumber,
  selectedObject,
  onSelectObject,
  onEditSetup,
  onRenameVersion,
  onExportVersion,
}) {
  const [tab, setTab] = useState('inspector')

  const versionName =
    activeVersion?.favoriteName || (versionNumber === 1 ? t.original : `${t.design} ${versionNumber}`)

  return (
    <>
      <div className="flex shrink-0 items-center gap-1 border-b border-paper-line p-2">
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
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-muted">{t.notesTab}</p>
            <p className="whitespace-pre-wrap rounded-xl2 border border-paper-line bg-paper p-3 text-sm text-ink-soft">
              {project.setup.notes || '—'}
            </p>
            <button type="button" onClick={onEditSetup} className="btn-ghost w-full !py-2 text-sm">
              <StepIcon name="pencil" className="h-3.5 w-3.5" />
              {t.editSetup}
            </button>
          </div>
        ) : selectedObject && activeVersion ? (
          <InspectorObjectPanel
            projectId={project.id}
            version={activeVersion}
            item={selectedObject}
            onBack={() => onSelectObject(null)}
          />
        ) : activeVersion ? (
          <InspectorVersionPanel
            projectId={project.id}
            version={activeVersion}
            versionName={versionName}
            selectedObjectId={selectedObject?.id ?? null}
            onSelectObject={onSelectObject}
            onRename={onRenameVersion}
            onExport={onExportVersion}
          />
        ) : (
          <InspectorProjectSummary project={project} onEditSetup={onEditSetup} />
        )}
      </div>
    </>
  )
}
