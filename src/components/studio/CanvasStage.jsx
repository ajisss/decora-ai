import { StepIcon } from '../icons.jsx'
import CanvasToolbar from './CanvasToolbar.jsx'
import useZoomPan from './useZoomPan.js'
import { content } from '../../content.js'

const t = content.app.studio

// The interactive stage: the design image under a zoom/pan transform, with
// clickable object pins laid over it. Pins come from the analysis items'
// optional `position` ({x, y} as percentages) — items analyzed before that
// field existed simply have no pin and stay selectable from the tree.
export default function CanvasStage({
  version,
  tool,
  onToolChange,
  showPins,
  onTogglePins,
  selectedObjectId,
  onSelectObject,
  onFullscreen,
}) {
  const zoom = useZoomPan()
  const items = version?.analysis?.items ?? []
  const pinnable = items.filter((i) => i.position)
  const visiblePins = showPins ? pinnable : []

  if (!version) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center bg-paper-line/40 p-4 text-sm text-ink-muted">
        {t.emptyBody}
      </div>
    )
  }

  const grabbing = tool === 'pan' || zoom.canPan

  return (
    <div className="relative min-h-0 flex-1 overflow-hidden bg-paper-line/40 p-4">
      <div className="pointer-events-none absolute inset-x-0 top-4 z-10 flex justify-center px-4">
        <CanvasToolbar
          tool={tool}
          onToolChange={onToolChange}
          percent={zoom.percent}
          onZoomIn={zoom.zoomIn}
          onZoomOut={zoom.zoomOut}
          onFit={zoom.reset}
          showPins={showPins}
          onTogglePins={onTogglePins}
          canTogglePins={pinnable.length > 0}
        />
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
        className={`relative mx-auto h-full w-full max-w-5xl select-none overflow-hidden rounded-xl2 ${
          grabbing ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
        onWheel={zoom.onWheel}
        onPointerDown={zoom.onPointerDown}
        onPointerMove={zoom.onPointerMove}
        onPointerUp={zoom.onPointerUp}
        onPointerLeave={zoom.onPointerUp}
      >
        <div
          className="h-full w-full origin-center transition-transform duration-100"
          style={{ transform: `translate(${zoom.translate.x}px, ${zoom.translate.y}px) scale(${zoom.scale})` }}
        >
          {version.imageId ? (
            <img src={version.imageId} alt="" className="h-full w-full object-contain" draggable={false} />
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl2 bg-paper-soft text-sm text-ink-muted">
              {version.status === 'pending' ? t.generatingElapsed : version.error || t.emptyErrorTitle}
            </div>
          )}

          {visiblePins.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectObject(item.id === selectedObjectId ? null : item.id)}
              style={{ left: `${item.position.x}%`, top: `${item.position.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm transition-colors ${
                item.id === selectedObjectId ? 'bg-clay text-white' : 'bg-white/90 text-ink-soft hover:bg-white'
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
