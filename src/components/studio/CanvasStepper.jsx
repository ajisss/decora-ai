import { StepIcon } from '../icons.jsx'
import { content } from '../../content.js'

const t = content.app.studio

// Derived, client-only wayfinding strip (Brief → Generate → Explore →
// Analyze → Export) — a pure function of already-existing project/version
// state, nothing new persisted. Cosmetic: it's not a gate on any action.
export default function CanvasStepper({ project, selectedVersion, analyzing, exported }) {
  const steps = [
    { label: t.stepBrief, done: Boolean(project.setup) },
    { label: t.stepGenerate, done: project.generations.length > 0 },
    { label: t.stepExplore, done: project.generations.length > 1 || project.generations.some((g) => g.favorite) },
    { label: t.stepAnalyze, done: Boolean(selectedVersion?.analysis), active: analyzing },
    { label: t.stepExport, done: exported },
  ]

  return (
    <div className="flex items-center gap-1 overflow-x-auto text-xs">
      {steps.map((s, i) => (
        <div key={s.label} className="flex shrink-0 items-center gap-1">
          {i > 0 && <span className="mx-1 h-px w-4 shrink-0 bg-paper-line" />}
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
              s.done ? 'bg-success/15 text-success' : s.active ? 'bg-clay text-white' : 'bg-paper-line text-ink-muted'
            }`}
          >
            {s.done ? <StepIcon name="checkCircle" className="h-3 w-3" /> : <span className="text-[10px] font-semibold">{i + 1}</span>}
          </span>
          <span className="flex flex-col leading-tight">
            <span className={`font-medium ${s.done || s.active ? 'text-ink' : 'text-ink-muted'}`}>{s.label}</span>
            <span className="text-[10px] text-ink-muted">{s.done ? t.stepDone : s.active ? t.stepActive : t.stepWaiting}</span>
          </span>
        </div>
      ))}
    </div>
  )
}
