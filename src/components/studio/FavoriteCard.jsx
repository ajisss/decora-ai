import { useState } from 'react'
import { StepIcon } from '../icons.jsx'
import AnalyzePanel from '../analyzer/AnalyzePanel.jsx'
import { content } from '../../content.js'

const t = content.app.studio
const tc = content.app.compare

// One favorited design in the Studio right panel's Favorit tab: date, a
// short description, and two accordions (Prompt, Analisis) rather than
// dumping everything inline — the panel is narrow, so collapsed-by-default
// keeps a list of favorites scannable.
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

      <button
        type="button"
        onClick={() => setPromptOpen((o) => !o)}
        className="mt-2 flex items-center gap-1 text-xs text-ink-muted hover:text-ink"
      >
        <StepIcon name={promptOpen ? 'chevronDown' : 'chevronRight'} className="h-3 w-3" />
        {t.prompt}
      </button>
      {promptOpen && <p className="mt-1 text-xs text-ink-muted">{entry.prompt}</p>}

      <button
        type="button"
        onClick={() => setAnalysisOpen((o) => !o)}
        className="mt-2 flex items-center gap-1 text-xs text-ink-muted hover:text-ink"
      >
        <StepIcon name={analysisOpen ? 'chevronDown' : 'chevronRight'} className="h-3 w-3" />
        {t.informasiAnalysisHeading}
      </button>
      {analysisOpen && (
        <div className="mt-2 border-t border-paper-line pt-3">
          <AnalyzePanel
            projectId={projectId}
            generation={entry}
            versionNumber={versionNumber}
            onJumpToFeed={onJumpToFeed}
            onExport={onExport}
          />
        </div>
      )}
    </div>
  )
}
