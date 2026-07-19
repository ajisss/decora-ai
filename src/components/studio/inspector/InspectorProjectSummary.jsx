import { StepIcon } from '../../icons.jsx'
import { content } from '../../../content.js'

const t = content.app.studio

// Inspector's "nothing selected" state: the wedding's fixed parameters.
export default function InspectorProjectSummary({ project, onEditSetup }) {
  const fields = [
    [t.setupTheme, project.setup.theme],
    [t.setupStyle, project.setup.style || '—'],
    [t.setupVenue, project.setup.venueType],
    [t.setupSize, project.setup.venueSize],
    [t.setupGuests, project.setup.guestCapacity],
    [t.setupBudget, project.setup.budgetTier],
    [t.setupPalette, project.setup.colorPalette?.join(', ') || '—'],
  ]

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-muted">{t.projectInfo}</p>
      <dl className="space-y-3 rounded-xl2 border border-paper-line bg-paper p-4 text-sm">
        {fields.map(([label, value]) => (
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
  )
}
