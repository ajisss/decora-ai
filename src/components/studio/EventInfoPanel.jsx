import { StepIcon } from '../icons.jsx'
import { content } from '../../content.js'

const t = content.app.studio

// The "Informasi Acara" project section: the full wedding brief in one place.
// The Inspector keeps a condensed copy for at-a-glance reference; this is the
// readable version with room for the palette and the free-text notes.
export default function EventInfoPanel({ project, onEditSetup }) {
  const { setup } = project
  const fields = [
    [t.setupTheme, setup.theme],
    [t.setupStyle, setup.style],
    [t.setupVenue, setup.venueType],
    [t.setupSize, setup.venueSize],
    [t.setupGuests, setup.guestCapacity],
    [t.setupBudget, setup.budgetTier],
  ]
  const palette = setup.colorPalette ?? []

  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-6">
      <div className="mx-auto max-w-[760px] space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h1 className="font-display text-lg font-semibold text-ink">{t.navEvent}</h1>
          <button type="button" onClick={onEditSetup} className="btn-ghost !px-3 !py-1.5 text-xs">
            <StepIcon name="pencil" className="h-3.5 w-3.5" />
            {t.editSetup}
          </button>
        </div>

        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 rounded-xl2 border border-paper-line bg-paper p-5 sm:grid-cols-2">
          {fields.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-3 border-b border-paper-line pb-2 last:border-0">
              <dt className="shrink-0 text-xs text-ink-muted">{label}</dt>
              <dd className="text-right text-sm font-medium text-ink-soft">{value || '—'}</dd>
            </div>
          ))}
        </dl>

        <div className="rounded-xl2 border border-paper-line bg-paper p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-ink-muted">{t.setupPalette}</p>
          {palette.length === 0 ? (
            <p className="text-sm text-ink-muted">—</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {palette.map((color) => (
                <span
                  key={color}
                  className="rounded-full border border-paper-line bg-paper-soft px-3 py-1 text-sm text-ink-soft"
                >
                  {color}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl2 border border-paper-line bg-paper p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-ink-muted">{t.notesTab}</p>
          <p className="whitespace-pre-wrap text-sm text-ink-soft">{setup.notes || '—'}</p>
        </div>

        <div className="rounded-xl2 border border-paper-line bg-paper p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-ink-muted">{t.prompt}</p>
          <p className="whitespace-pre-wrap text-sm text-ink-muted">{project.prompt || '—'}</p>
        </div>
      </div>
    </div>
  )
}
