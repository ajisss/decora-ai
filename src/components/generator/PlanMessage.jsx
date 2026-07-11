import { StepIcon } from '../icons.jsx'
import { content } from '../../content.js'

const t = content.app.studio

// Splits an advisor reply into its conversational body and an optional trailing
// `BRIEF: …` line (see server/lib/planner.js). The brief, when present, powers
// the "Pakai brief ini" affordance that hands a ready prompt to Generate mode.
export function parseBrief(text) {
  if (!text) return { body: text, brief: null }
  const match = text.match(/^BRIEF:\s*(.+)\s*$/im)
  if (!match) return { body: text.trim(), brief: null }
  const body = text.slice(0, match.index).trim()
  return { body, brief: match[1].trim() }
}

// One turn in the Plan-mode conversation: user prompts sit right (clay), advisor
// replies sit left with the same spark avatar the generation feed uses.
export default function PlanMessage({ message, onUseBrief }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-clay px-4 py-2.5 text-sm text-white sm:max-w-[70%]">
          {message.text}
        </div>
      </div>
    )
  }

  const { body, brief } = parseBrief(message.text)

  return (
    <div className="flex items-start gap-2">
      <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-clay-soft text-clay-deep">
        <StepIcon name="spark" className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 flex-1 rounded-xl2 rounded-tl-md border border-paper-line bg-paper p-4">
        {message.status === 'pending' ? (
          <p className="flex items-center gap-1.5 text-sm text-ink-muted">
            <span className="flex gap-1">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-clay [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-clay [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-clay [animation-delay:300ms]" />
            </span>
            {t.planThinking}
          </p>
        ) : message.status === 'error' ? (
          <p className="text-sm text-danger">{message.error ?? t.planError}</p>
        ) : (
          <>
            <p className="whitespace-pre-wrap text-sm text-ink-soft">{body}</p>
            {brief && (
              <div className="mt-3 rounded-lg border border-paper-line bg-paper-soft p-3">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-clay-deep">
                  <StepIcon name="spark" className="h-3.5 w-3.5" />
                  {t.planBriefLabel}
                </p>
                <p className="mt-1.5 text-sm text-ink">{brief}</p>
                <button
                  type="button"
                  onClick={() => onUseBrief(brief)}
                  className="btn-primary mt-3 !px-3 !py-1.5 text-xs"
                >
                  <StepIcon name="arrow" className="h-3.5 w-3.5" />
                  {t.planUseBrief}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
