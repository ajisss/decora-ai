import { useEffect, useRef, useState } from 'react'
import { StepIcon } from '../icons.jsx'
import ConversationPanel from '../generator/ConversationPanel.jsx'
import StudioComposer from '../generator/StudioComposer.jsx'
import CopilotChips from './CopilotChips.jsx'
import { content } from '../../content.js'

const t = content.app.studio

// The docked AI Copilot at the bottom of the canvas column: context chips,
// the composer, and a collapsible transcript of the generate/plan thread.
export default function CopilotBar({ selectedObjectName, onRunChip, composerProps, conversationProps, timelineCount }) {
  const [open, setOpen] = useState(composerProps.mode === 'plan')
  const scrollRef = useRef(null)
  const prevCount = useRef(null)

  // Plan mode is a conversation — showing the composer with the transcript
  // collapsed would hide the reply the user is waiting for.
  useEffect(() => {
    if (composerProps.mode === 'plan') setOpen(true)
  }, [composerProps.mode])

  // Stick to the bottom on new entries, but only if the user was already
  // near it — never yank scroll away from someone reading back. (This
  // replaces the old effects in StudioPage, which were bound to a ref that
  // stopped matching any element once the feed moved in here.)
  useEffect(() => {
    const el = scrollRef.current
    if (!el || !open) return
    if (prevCount.current !== null && timelineCount > prevCount.current) {
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= 120
      if (nearBottom) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    }
    prevCount.current = timelineCount
  }, [timelineCount, open])

  // Jump to the latest entry when the drawer is opened.
  useEffect(() => {
    if (!open) return
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [open])

  return (
    <div className="shrink-0 space-y-2 border-t border-paper-line bg-paper px-4 pb-4 pt-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-ink-soft">
          <StepIcon name="spark" className="h-3.5 w-3.5 text-clay-deep" />
          {t.copilotTitle}
        </span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex items-center gap-1 text-xs font-medium text-ink-muted hover:text-clay-deep"
        >
          {t.conversationHistory}
          <StepIcon name={open ? 'chevronDown' : 'chevronRight'} className="h-3 w-3" />
        </button>
      </div>

      {open && (
        <div ref={scrollRef} className="max-h-72 overflow-y-auto rounded-xl2 border border-paper-line bg-paper-soft p-3">
          <ConversationPanel {...conversationProps} />
        </div>
      )}

      {composerProps.mode === 'generate' && (
        <CopilotChips selectedObjectName={selectedObjectName} onRun={onRunChip} />
      )}

      <StudioComposer {...composerProps} />
    </div>
  )
}
