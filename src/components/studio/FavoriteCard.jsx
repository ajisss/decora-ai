import { useState } from 'react'
import { StepIcon } from '../icons.jsx'
import AnalyzePanel from '../analyzer/AnalyzePanel.jsx'
import { content } from '../../content.js'

const t = content.app.studio
const tc = content.app.compare

// Card-style accordion trigger, matching the app's list-row treatment
// (border, rounded, hover) instead of a bare text+chevron link.
function AccordionTrigger({ icon, label, open, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-lg border border-paper-line bg-paper-soft px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-ink/20 hover:text-ink"
    >
      <span className="flex items-center gap-1.5">
        <StepIcon name={icon} className="h-3.5 w-3.5" />
        {label}
      </span>
      <StepIcon name={open ? 'chevronDown' : 'chevronRight'} className="h-3.5 w-3.5 text-ink-muted" />
    </button>
  )
}

// One favorited design in the Studio right panel's Favorit tab: date, a
// short description, and two accordions (Prompt, Analisis) rather than
// dumping everything inline — the panel is narrow, so collapsed-by-default
// keeps a list of favorites scannable. The Analisis accordion skips
// AnalyzePanel's own thumbnail (hideImage) since the card already shows the
// design above, and this list can hold many favorites at once.
export default function FavoriteCard({ entry, versionNumber, projectId, onJumpToFeed, onExport }) {
  const [promptOpen, setPromptOpen] = useState(false)
  const [analysisOpen, setAnalysisOpen] = useState(false)

  return (
    <div className="rounded-xl2 border border-paper-line bg-paper p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-sm font-medium text-ink">
          {t.design} {versionNumber}
          <StepIcon name="star" className="h-3.5 w-3.5 fill-clay text-clay" />
        </span>
        <span className="text-xs text-ink-muted">
          {new Date(entry.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>

      <button
        type="button"
        onClick={onJumpToFeed}
        className="mt-2 block w-full overflow-hidden rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-clay/40"
      >
        <img src={`/images/${entry.imageId}`} alt="" className="aspect-[4/3] w-full object-cover" />
      </button>

      <p className="mt-2 text-sm text-ink-soft">
        {entry.modificationNote ? `↳ ${entry.modificationNote}` : tc.noNote}
      </p>

      <div className="mt-3 space-y-2">
        <div>
          <AccordionTrigger icon="comment" label={t.prompt} open={promptOpen} onClick={() => setPromptOpen((o) => !o)} />
          {promptOpen && (
            <p className="mt-1.5 rounded-lg border border-paper-line bg-paper px-3 py-2 text-xs text-ink-muted">
              {entry.prompt}
            </p>
          )}
        </div>

        <div>
          <AccordionTrigger
            icon="checklist"
            label={t.informasiAnalysisHeading}
            open={analysisOpen}
            onClick={() => setAnalysisOpen((o) => !o)}
          />
          {analysisOpen && (
            <div className="mt-1.5 rounded-lg border border-paper-line bg-paper p-3">
              <AnalyzePanel
                projectId={projectId}
                generation={entry}
                versionNumber={versionNumber}
                onJumpToFeed={onJumpToFeed}
                onExport={onExport}
                hideImage
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
