import { StepIcon } from '../icons.jsx'
import { content } from '../../content.js'

const t = content.app.studio

// One-click actions that compose the prompt for the user — the spec's
// "users should never write prompts manually". Context follows the selection:
// with an object selected the chips are scoped to that object, otherwise they
// retouch the whole design.
//
// These SPEND CREDITS, so `onRun` must route through the same confirmation
// gate the composer's send button uses. Never call a generate API from here.
export default function CopilotChips({ selectedObjectName, onRun }) {
  const chips = selectedObjectName ? t.copilotChips.object(selectedObjectName) : t.copilotChips.whole

  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          onClick={() => onRun(chip)}
          title={chip.prompt}
          className="inline-flex items-center gap-1 rounded-full border border-paper-line px-2.5 py-1 text-xs text-ink-soft transition-colors hover:border-clay/40 hover:text-clay-deep"
        >
          <StepIcon name="spark" className="h-3 w-3" />
          {chip.label}
        </button>
      ))}
    </div>
  )
}
