import { useState } from 'react'
import { StepIcon } from '../icons.jsx'
import AnalyzePanel from '../analyzer/AnalyzePanel.jsx'
import { content } from '../../content.js'

const t = content.app.studio
const tc = content.app.compare

// Card-style accordion: trigger and content share one bordered container
// (content sits directly under the trigger, split by a border-t) instead of
// being two visually separate boxes with a gap between them.
function Accordion({ icon, label, open, onToggle, children }) {
  return (
    <div className="overflow-hidden rounded-lg border border-paper-line">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between bg-paper-soft px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
      >
        <span className="flex items-center gap-1.5">
          <StepIcon name={icon} className="h-3.5 w-3.5" />
          {label}
        </span>
        <StepIcon name={open ? 'chevronDown' : 'chevronRight'} className="h-3.5 w-3.5 text-ink-muted" />
      </button>
      {open && <div className="border-t border-paper-line bg-paper p-3">{children}</div>}
    </div>
  )
}

// One favorited design in the Studio right panel's Favorit tab: date, a
// short description, and two accordions (Prompt, Analisis) rather than
// dumping everything inline — the panel is narrow, so collapsed-by-default
// keeps a list of favorites scannable. The Analisis accordion skips
// AnalyzePanel's own thumbnail+version badge (hideImage) since the card
// already shows the design and its version above, and this list can hold
// many favorites at once.
export default function FavoriteCard({ entry, versionNumber, projectId, onJumpToFeed, onExport, onRename }) {
  const [promptOpen, setPromptOpen] = useState(false)
  const [analysisOpen, setAnalysisOpen] = useState(false)

  return (
    <div className="rounded-xl2 border border-paper-line bg-paper p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1.5 text-sm font-medium text-ink">
          <StepIcon name="star" className="h-3.5 w-3.5 shrink-0 fill-clay text-clay" />
          <span className="truncate">{entry.favoriteName || `${t.design} ${versionNumber}`}</span>
          <button
            type="button"
            onClick={onRename}
            aria-label={t.renameFavorite}
            title={t.renameFavorite}
            className="shrink-0 text-ink-muted hover:text-clay"
          >
            <StepIcon name="pencil" className="h-3.5 w-3.5" />
          </button>
        </span>
        <span className="shrink-0 text-xs text-ink-muted">
          {new Date(entry.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>
      {entry.favoriteName && (
        <p className="mt-0.5 text-xs text-ink-muted">
          {t.design} {versionNumber}
        </p>
      )}

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
        <Accordion icon="comment" label={t.prompt} open={promptOpen} onToggle={() => setPromptOpen((o) => !o)}>
          <p className="text-xs text-ink-muted">{entry.prompt}</p>
        </Accordion>

        <Accordion
          icon="checklist"
          label={t.informasiAnalysisHeading}
          open={analysisOpen}
          onToggle={() => setAnalysisOpen((o) => !o)}
        >
          <AnalyzePanel
            projectId={projectId}
            generation={entry}
            versionNumber={versionNumber}
            onJumpToFeed={onJumpToFeed}
            onExport={onExport}
            hideImage
          />
        </Accordion>
      </div>
    </div>
  )
}
