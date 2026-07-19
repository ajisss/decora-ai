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
  onCompare,
  compareCount = 0,
  referenceVersion,
  versionOf,
  onSelectVersion,
  filmstrip,
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
  const versionLabel = version.favoriteName || t.design

  return (
    <div className="relative min-h-0 flex-1 overflow-hidden bg-paper-line/40 p-4">
      {/* Toolbar sits inside the stage at top-left, over the design. */}
      <div className="pointer-events-none absolute left-6 top-6 z-20 flex">
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
          onCompare={onCompare}
          compareCount={compareCount}
        />
      </div>

      <button
        type="button"
        onClick={onFullscreen}
        aria-label={t.fullscreen}
        title={t.fullscreen}
        className="absolute right-6 top-6 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-paper-line bg-paper text-ink-soft shadow-sm hover:text-clay-deep"
      >
        <StepIcon name="fullscreen" className="h-4 w-4" />
      </button>

      {/* Picture-in-picture: the design currently pinned as the generation
          reference, so you can see what the next edit is anchored to without
          leaving the canvas. Only shown when it isn't the design on screen. */}
      {referenceVersion && referenceVersion.id !== version.id && referenceVersion.imageId && (
        <button
          type="button"
          onClick={() => onSelectVersion?.(referenceVersion.id)}
          title={`${t.refChip} ${versionOf ? versionOf(referenceVersion) : ''} — ${t.viewReference}`.trim()}
          className="absolute bottom-6 right-6 z-20 w-28 overflow-hidden rounded-lg border-2 border-paper bg-paper shadow-lg ring-1 ring-ink/10 transition-transform hover:scale-[1.03]"
        >
          <img
            src={referenceVersion.imageId}
            alt={`${t.refChip} ${versionOf ? versionOf(referenceVersion) : ''}`.trim()}
            className="aspect-[4/3] w-full object-cover"
          />
        </button>
      )}

      {/* Filmstrip floats over the bottom of the stage rather than taking its
          own row, so the design keeps the full height of the canvas. */}
      {/* pointer-events-none on the wrapper (it spans the full width so it can
          left-align its content) or its invisible right-hand slack blocks
          clicks on whatever else shares this row — like the PiP thumbnail. */}
      {filmstrip && (
        <div className="pointer-events-none absolute inset-x-6 bottom-6 z-20 flex justify-start">
          <div className="pointer-events-auto">{filmstrip}</div>
        </div>
      )}

      <div className="relative h-full w-full">
        {/* AI glow ring — sits just behind the card, blurred so only a soft
            shimmering edge peeks past it. Purely decorative (aria-hidden);
            frozen by the global prefers-reduced-motion rule like every other
            ambient animation in the app. */}
        <div aria-hidden="true" className="pointer-events-none absolute -inset-3 rounded-xl2 bg-ai-glow opacity-40 blur-2xl" />

        <div
          className={`relative h-full w-full select-none overflow-hidden rounded-xl2 bg-paper ${
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
              <img src={version.imageId} alt={versionLabel} className="h-full w-full object-contain" draggable={false} />
            ) : (
              <div className="flex h-full items-center justify-center rounded-xl2 bg-paper-soft text-sm text-ink-muted">
                {version.status === 'pending' ? t.generatingElapsed : version.error || t.emptyErrorTitle}
              </div>
            )}

            {visiblePins.map((item) => {
              const active = item.id === selectedObjectId
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectObject(item.id === selectedObjectId ? null : item.id)}
                  style={{ left: `${item.position.x}%`, top: `${item.position.y}%` }}
                  className="group absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5"
                >
                  {/* Marker dot + short leader, so the label reads as pointing
                      at a spot rather than floating over the middle of the image. */}
                  <span
                    className={`h-2.5 w-2.5 shrink-0 rounded-full border-2 shadow-sm ${
                      active ? 'border-white bg-clay' : 'border-white bg-ink/50 group-hover:bg-ink/70'
                    }`}
                  />
                  <span className={`h-px w-2 shrink-0 ${active ? 'bg-clay' : 'bg-white/70'}`} />
                  <span
                    className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm transition-colors ${
                      active ? 'bg-clay text-white' : 'bg-white/95 text-ink-soft group-hover:bg-white'
                    }`}
                  >
                    {item.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
