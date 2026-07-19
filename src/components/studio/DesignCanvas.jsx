import { useState } from 'react'
import { StepIcon } from '../icons.jsx'
import SyncIndicator from '../shell/SyncIndicator.jsx'
import ConversationPanel from '../generator/ConversationPanel.jsx'
import StudioComposer from '../generator/StudioComposer.jsx'
import CanvasStepper from './CanvasStepper.jsx'
import useZoomPan from './useZoomPan.js'
import { content } from '../../content.js'

const t = content.app.studio

const SUGGESTION_CHIPS = ['Buat lebih mewah', 'Gunakan bunga mawar merah', 'Ubah ke tema rustic', 'Kurangi dekorasi biaya']

// Level 3 center column — the interactive Design Canvas: header (version
// name, meta, stepper, share/export), toolbar (select/pan/zoom/fullscreen),
// the image itself with clickable object pins, a version filmstrip, and the
// AI Copilot footer (conversation panel + composer, both reused verbatim
// from the previous chat-feed implementation).
export default function DesignCanvas({
  project,
  selectedVersion,
  versionNumber,
  generations,
  onSelectVersion,
  versionOf,
  selectedObjectId,
  onSelectObject,
  onFullscreen,
  onShare,
  onExportClick,
  onRegenerate,
  onToggleFavorite,
  exported,
  analyzing,
  composerProps,
  conversationProps,
}) {
  const zoomPan = useZoomPan()
  const [tool, setTool] = useState('select')
  const [showPins, setShowPins] = useState(true)
  const [conversationOpen, setConversationOpen] = useState(composerProps.mode === 'plan')

  const items = (showPins && selectedVersion?.analysis?.items) || []
  const versionName =
    selectedVersion?.favoriteName || (versionNumber === 1 ? t.original : `${t.design} ${versionNumber}`)

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      {/* Header: version identity, project meta, stepper, share/export */}
      <div className="shrink-0 border-b border-paper-line px-5 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <h1 className="truncate font-display text-lg font-semibold text-ink">{versionName}</h1>
            {selectedVersion && (
              <button
                type="button"
                onClick={() => onToggleFavorite(selectedVersion)}
                aria-label={selectedVersion.favorite ? content.app.favorite.remove : content.app.favorite.add}
                className={selectedVersion.favorite ? 'text-clay' : 'text-ink-muted hover:text-clay'}
              >
                <StepIcon name="star" className={`h-4 w-4 ${selectedVersion.favorite ? 'fill-clay' : ''}`} />
              </button>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <SyncIndicator />
            <button type="button" onClick={onShare} className="btn-ghost !px-3 !py-1.5 text-xs">
              <StepIcon name="external" className="h-3.5 w-3.5" />
              {t.shareLink}
            </button>
            <button type="button" onClick={onExportClick} disabled={!selectedVersion} className="btn-primary !px-3 !py-1.5 text-xs disabled:opacity-50">
              <StepIcon name="download" className="h-3.5 w-3.5" />
              {t.export}
            </button>
          </div>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
          <span>{t.setupTheme}: <span className="font-medium text-ink-soft">{project.setup.theme}</span></span>
          <span>{t.setupVenue}: <span className="font-medium text-ink-soft">{project.setup.venueType}</span></span>
          <span>{t.setupGuests}: <span className="font-medium text-ink-soft">{project.setup.guestCapacity}</span></span>
          <span>{t.setupBudget}: <span className="font-medium text-ink-soft">{project.setup.budgetTier}</span></span>
        </div>
        <div className="mt-2">
          <CanvasStepper project={project} selectedVersion={selectedVersion} analyzing={analyzing} exported={exported} />
        </div>
      </div>

      {/* Canvas */}
      <div className="relative min-h-0 flex-1 overflow-hidden bg-paper-line/40 p-4">
        {!selectedVersion ? (
          <div className="flex h-full items-center justify-center text-sm text-ink-muted">{t.emptyBody}</div>
        ) : (
          <>
            <div className="absolute left-6 top-6 z-10 flex items-center gap-1 rounded-full border border-paper-line bg-paper p-1 shadow-sm">
              <ToolButton icon="hand" active={tool === 'pan'} onClick={() => setTool('pan')} label={t.toolPan} />
              <ToolButton icon="arrow" active={tool === 'select'} onClick={() => setTool('select')} label={t.toolSelect} />
              <span className="mx-1 h-4 w-px bg-paper-line" />
              <ToolButton icon="zoomTool" onClick={zoomPan.zoomIn} label={t.zoomIn} />
              <button
                type="button"
                onClick={zoomPan.reset}
                className="rounded-full px-2 text-xs font-medium text-ink-soft hover:bg-paper-soft"
              >
                {zoomPan.percent}%
              </button>
              <span className="mx-1 h-4 w-px bg-paper-line" />
              <ToolButton icon="frame" onClick={zoomPan.reset} label={t.zoomFit} />
              <ToolButton icon="layersToggle" active={showPins} onClick={() => setShowPins((v) => !v)} label={t.toggleLabels} />
            </div>
            <button
              type="button"
              onClick={onFullscreen}
              aria-label={t.fullscreen}
              title={t.fullscreen}
              className="absolute right-6 top-6 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-paper-line bg-paper text-ink-soft shadow-sm hover:text-clay-deep"
            >
              <StepIcon name="fullscreen" className="h-4 w-4" />
            </button>

            <div
              className={`relative mx-auto h-full max-w-4xl select-none overflow-hidden rounded-xl2 ${
                tool === 'pan' || zoomPan.isPanning ? 'cursor-grab active:cursor-grabbing' : ''
              }`}
              onWheel={zoomPan.onWheel}
              onPointerDown={zoomPan.onPointerDown}
              onPointerMove={zoomPan.onPointerMove}
              onPointerUp={zoomPan.onPointerUp}
              onPointerLeave={zoomPan.onPointerUp}
            >
              <div
                className="h-full w-full origin-center transition-transform duration-100"
                style={{ transform: `translate(${zoomPan.translate.x}px, ${zoomPan.translate.y}px) scale(${zoomPan.scale})` }}
              >
                {selectedVersion.imageId ? (
                  <img src={selectedVersion.imageId} alt="" className="h-full w-full object-contain" draggable={false} />
                ) : (
                  <div className="flex h-full items-center justify-center rounded-xl2 bg-paper-soft text-sm text-ink-muted">
                    {selectedVersion.status === 'pending' ? t.generatingElapsed : t.emptyErrorTitle}
                  </div>
                )}

                {items.map(
                  (item) =>
                    item.position && (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelectObject(item.id === selectedObjectId ? null : item.id)}
                        style={{ left: `${item.position.x}%`, top: `${item.position.y}%` }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm transition-colors ${
                          item.id === selectedObjectId
                            ? 'bg-clay text-white'
                            : 'bg-white/90 text-ink-soft hover:bg-white'
                        }`}
                      >
                        {item.name}
                      </button>
                    ),
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Filmstrip: quick-switch across versions */}
      {generations.length > 0 && (
        <div className="flex shrink-0 items-center gap-2 border-t border-paper-line px-4 py-2">
          <div className="flex flex-1 items-center gap-2 overflow-x-auto">
            {generations.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => onSelectVersion(g.id)}
                title={g.favoriteName || `${t.design} ${versionOf(g)}`}
                className={`h-12 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                  g.id === selectedVersion?.id ? 'border-clay' : 'border-transparent hover:border-paper-line'
                }`}
              >
                {g.imageId ? (
                  <img src={g.imageId} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-paper-soft">
                    <StepIcon name="image" className="h-3.5 w-3.5 text-ink-muted" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* AI Copilot */}
      <div className="shrink-0 space-y-2 border-t border-paper-line bg-paper px-4 pb-4 pt-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-ink-soft">
            <StepIcon name="spark" className="h-3.5 w-3.5 text-clay-deep" />
            {t.copilotTitle}
          </span>
          <button
            type="button"
            onClick={() => setConversationOpen((v) => !v)}
            className="flex items-center gap-1 text-xs font-medium text-ink-muted hover:text-clay-deep"
          >
            {t.conversationHistory}
            <StepIcon name={conversationOpen ? 'chevronDown' : 'chevronRight'} className="h-3 w-3" />
          </button>
        </div>

        {conversationOpen && (
          <div className="max-h-72 overflow-y-auto rounded-xl2 border border-paper-line bg-paper-soft p-3">
            <ConversationPanel {...conversationProps} />
          </div>
        )}

        {!selectedObjectId && composerProps.mode === 'generate' && (
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTION_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => composerProps.onNoteChange(chip)}
                className="rounded-full border border-paper-line px-2.5 py-1 text-xs text-ink-soft hover:border-clay/40 hover:text-clay-deep"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        <StudioComposer {...composerProps} />
      </div>
    </div>
  )
}

function ToolButton({ icon, active, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
        active ? 'bg-clay text-white' : 'text-ink-soft hover:bg-paper-soft'
      }`}
    >
      <StepIcon name={icon} className="h-3.5 w-3.5" />
    </button>
  )
}
