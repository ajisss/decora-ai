import { StepIcon } from '../icons.jsx'
import { content } from '../../content.js'

const t = content.app.studio

// Derived, client-only wayfinding strip (Brief → Generate → Explore → Analyze
// → Export) — a pure function of existing project/version state, nothing new
// persisted. Cosmetic: it never gates an action.
export default function CanvasStepper({ project, activeVersion, analyzing, exported }) {
  const hasVersions = project.generations.length > 0
  const analyzed = Boolean(activeVersion?.analysis)

  const steps = [
    { icon: 'brief', label: t.stepBrief, done: Boolean(project.setup) },
    { icon: 'spark', label: t.stepGenerate, done: hasVersions },
    {
      icon: 'compare',
      label: t.stepExplore,
      done: project.generations.length > 1 || project.generations.some((g) => g.favorite),
    },
    { icon: 'checklist', label: t.stepAnalyze, done: analyzed, active: analyzing && !analyzed },
    { icon: 'download', label: t.stepExport, done: exported },
  ]

  return (
    <div className="shrink-0 px-4 pt-3">
      {/* min-w-0 + truncate on every label, and a shrinking connector, so all
          5 steps fit without an unindicated horizontal clip at normal canvas
          widths — this only reaches for overflow-x-auto as a last resort. */}
      <ol className="flex items-center justify-between gap-0.5 overflow-x-auto rounded-xl2 border border-paper-line bg-paper px-3 py-2">
        {steps.map((s, i) => {
          const state = s.done ? 'done' : s.active ? 'active' : 'waiting'
          return (
            <li key={s.label} className="flex shrink-0 items-center">
              {i > 0 && (
                <span className="mx-1.5 h-px w-3 shrink-0 bg-paper-line sm:mx-2 sm:w-6" aria-hidden="true" />
              )}

              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                  state === 'done'
                    ? 'bg-success text-white'
                    : state === 'active'
                      ? 'bg-clay text-white'
                      : 'bg-paper-line text-ink-muted'
                }`}
              >
                {state === 'done' ? (
                  <StepIcon name="check" className="h-3 w-3" />
                ) : state === 'active' ? (
                  <StepIcon name={s.icon} className="h-3 w-3" />
                ) : (
                  <span className="text-[9px] font-semibold">{i + 1}</span>
                )}
              </span>

              <span className="ml-1.5 flex flex-col leading-tight">
                <span
                  className={`whitespace-nowrap text-[11px] font-semibold sm:text-xs ${
                    state === 'active' ? 'text-clay-deep' : state === 'done' ? 'text-ink' : 'text-ink-muted'
                  }`}
                >
                  {i + 1}. {s.label}
                </span>
                <span
                  className={`hidden whitespace-nowrap text-[10px] sm:block ${
                    state === 'active' ? 'text-clay' : state === 'done' ? 'text-success' : 'text-ink-muted'
                  }`}
                >
                  {state === 'done' ? t.stepDone : state === 'active' ? t.stepActive : t.stepWaiting}
                </span>
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
