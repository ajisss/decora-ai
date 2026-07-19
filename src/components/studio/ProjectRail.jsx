import { StepIcon } from '../icons.jsx'
import VersionExplorer from './VersionExplorer.jsx'
import { content } from '../../content.js'

const t = content.app.studio

const NAV_SECTIONS = [
  { value: 'summary', icon: 'checklist', label: t.navSummary },
  { value: 'event', icon: 'store', label: t.navEvent },
  { value: 'checklist', icon: 'checklist', label: t.navChecklist },
]

// Level 2 (Project context) + Level 3 (Version Explorer) stacked in one rail,
// matching the mockup's combined left column. `navSection` picks which of
// the 3 project-context panes the Inspector/main area shows; version
// selection is separate (drives Canvas/Inspector once built).
export default function ProjectRail({
  project,
  onEditSetup,
  navSection,
  onNavSectionChange,
  versionExplorerProps,
  onCompare,
  compareCount = 0,
}) {
  return (
    <>
      <div className="flex items-start justify-between gap-2 p-3">
        <div className="min-w-0">
          <h2 className="truncate font-display text-base font-semibold text-ink">{project.name}</h2>
          <p className="truncate text-xs text-ink-muted">
            {project.setup.style || project.setup.theme} · {project.setup.venueType}
          </p>
        </div>
        <button
          type="button"
          onClick={onEditSetup}
          aria-label={t.editSetup}
          title={t.editSetup}
          className="shrink-0 rounded-md p-1.5 text-ink-muted hover:bg-paper hover:text-ink"
        >
          <StepIcon name="settings" className="h-4 w-4" />
        </button>
      </div>

      <nav aria-label={t.panelRail} className="space-y-0.5 px-2 pb-2">
        {NAV_SECTIONS.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => onNavSectionChange(s.value)}
            aria-current={navSection === s.value ? 'page' : undefined}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors ${
              navSection === s.value ? 'bg-clay-soft text-clay-deep' : 'text-ink-soft hover:bg-paper hover:text-ink'
            }`}
          >
            <StepIcon name={s.icon} className="h-4 w-4 shrink-0" />
            <span className="truncate">{s.label}</span>
          </button>
        ))}
      </nav>

      <div className="border-t border-paper-line" />

      <VersionExplorer {...versionExplorerProps} />

      <div className="shrink-0 border-t border-paper-line p-2">
        <button
          type="button"
          onClick={onCompare}
          disabled={compareCount < 2}
          title={compareCount < 2 ? content.app.compare.barHint : undefined}
          className="btn-ghost w-full !py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
        >
          <StepIcon name="compare" className="h-3.5 w-3.5" />
          {t.compareVersions}
          {compareCount > 0 && <span className="text-clay-deep">({compareCount}/2)</span>}
        </button>
      </div>
    </>
  )
}
