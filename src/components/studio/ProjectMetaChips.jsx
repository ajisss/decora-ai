import { useEffect, useRef, useState } from 'react'
import { StepIcon } from '../icons.jsx'
import { content } from '../../content.js'

const t = content.app.studio

// The wedding's fixed parameters, shown inline in the workspace header on wide
// screens and folded into a popover below md so the header never wraps into a
// second row and steals canvas height.
export default function ProjectMetaChips({ project, inline }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDocClick = (e) => !ref.current?.contains(e.target) && setOpen(false)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDocClick)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const fields = [
    [t.setupTheme, project.setup.theme],
    [t.setupVenue, project.setup.venueType],
    [t.setupGuests, project.setup.guestCapacity],
    [t.setupBudget, project.setup.budgetTier],
  ].filter(([, value]) => value !== undefined && value !== null && value !== '')

  if (inline) {
    return (
      <div className="flex min-w-0 items-center gap-x-4 gap-y-1 overflow-x-auto text-xs">
        {fields.map(([label, value]) => (
          <span key={label} className="shrink-0 whitespace-nowrap text-ink-muted">
            {label} <span className="font-medium text-ink-soft">{value}</span>
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex items-center gap-1 rounded-full border border-paper-line px-2.5 py-1 text-xs font-medium text-ink-soft hover:border-clay/40 hover:text-clay-deep"
      >
        {t.informasiDetailHeading}
        <StepIcon name="chevronDown" className="h-3 w-3" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-1.5 w-56 rounded-lg border border-paper-line bg-paper p-3 shadow-lg">
          <dl className="space-y-2 text-xs">
            {fields.map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-3">
                <dt className="shrink-0 text-ink-muted">{label}</dt>
                <dd className="text-right font-medium text-ink-soft">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  )
}
