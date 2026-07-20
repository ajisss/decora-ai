import PlanMessage from './PlanMessage.jsx'
import GenerationEntry from './GenerationEntry.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import { content } from '../../content.js'

const t = content.app.studio

// The chat-style feed: generation cards + plan-mode advisor bubbles,
// interleaved oldest-first (chat convention, latest at the bottom). Extracted
// verbatim from StudioPage so it can be reused as a standalone panel (the
// Design Workspace's "Riwayat percakapan") without changing any of its logic.
export default function ConversationPanel({
  timeline,
  generations,
  allErrored,
  entryRefs,
  onOpenLightbox,
  onAnalyze,
  onExport,
  onRetry,
  onCancel,
  onUseAsReference,
  onReply,
  onUseBrief,
  referenceEntry,
  latestDoneId,
  analyzeTargetId,
  isAnalysisFocused,
  flashId,
  onToggleFavorite,
  onToggleCompare,
  compareIds,
}) {
  if (timeline.length === 0) {
    return (
      <div className="flex items-center justify-center py-10">
        <EmptyState illustration="canvas" title={t.emptyTitle} body={t.emptyBody} />
      </div>
    )
  }

  if (allErrored) {
    return (
      <div className="flex items-center justify-center py-10">
        <EmptyState
          illustration="canvas"
          title={t.emptyErrorTitle}
          body={t.emptyErrorBody}
          cta={t.emptyErrorCta}
          onCta={() => onRetry(generations.find((g) => g.status === 'error'))}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[720px] space-y-4">
      {timeline.map((item) =>
        item.kind === 'msg' ? (
          <PlanMessage key={item.id} message={item.data} onUseBrief={onUseBrief} />
        ) : (
          <div
            key={item.id}
            ref={(el) => {
              if (el) entryRefs.current.set(item.id, el)
              else entryRefs.current.delete(item.id)
            }}
          >
            <GenerationEntry
              entry={item.data}
              index={generations.findIndex((g) => g.id === item.id)}
              total={generations.length}
              onOpenLightbox={onOpenLightbox}
              onAnalyze={onAnalyze}
              onExport={onExport}
              onRetry={onRetry}
              onCancel={onCancel}
              onUseAsReference={onUseAsReference}
              onReply={onReply}
              isReference={referenceEntry?.id === item.id}
              isLatestDone={item.id === latestDoneId}
              isBeingAnalyzed={isAnalysisFocused && analyzeTargetId === item.id}
              flashed={flashId === item.id}
              focused={isAnalysisFocused && analyzeTargetId === item.id && flashId !== item.id}
              onToggleFavorite={onToggleFavorite}
              onToggleCompare={onToggleCompare}
              isCompareSelected={compareIds.includes(item.id)}
            />
          </div>
        ),
      )}
    </div>
  )
}
