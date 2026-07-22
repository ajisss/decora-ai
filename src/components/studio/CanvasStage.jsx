import { useCallback, useEffect, useState } from 'react'
import { StepIcon } from '../icons.jsx'
import CanvasToolbar from './CanvasToolbar.jsx'
import Spinner from './Spinner.jsx'
import useZoomPan from './useZoomPan.js'
import { content } from '../../content.js'

const t = content.app.studio

function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max)
}

function useElapsed(active) {
  const [seconds, setSeconds] = useState(0)
  useEffect(() => {
    if (!active) return
    setSeconds(0)
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [active])
  return seconds
}

function formatElapsed(s) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

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
  onRetry,
  filmstrip,
}) {
  const zoom = useZoomPan()
  const elapsed = useElapsed(version?.status === 'pending')
  const items = version?.analysis?.items ?? []
  const pinnable = items.filter((i) => i.position)
  const visiblePins = showPins ? pinnable : []

  // Measures the card so the minimap can translate scale/translate (pixels)
  // into a viewport rectangle expressed as a fraction of the full image —
  // the same math an image editor's navigator uses.
  //
  // A callback ref, not useRef + a `[]`-deps effect: this component
  // early-returns a completely different (ref-less) tree while `version` is
  // still loading, so the card DOM node doesn't exist yet on first mount. A
  // mount-only effect would find `cardRef.current` null, no-op, and never
  // run again — the observer would simply never attach once the real tree
  // showed up on a later render. Tying the effect to the node itself (via
  // state) makes it re-run exactly when the node actually appears.
  const [cardEl, setCardEl] = useState(null)
  const cardRef = useCallback((node) => setCardEl(node), [])
  const [cardSize, setCardSize] = useState({ w: 0, h: 0 })
  useEffect(() => {
    if (!cardEl) return
    const ro = new ResizeObserver(([entry]) => {
      setCardSize({ w: entry.contentRect.width, h: entry.contentRect.height })
    })
    ro.observe(cardEl)
    return () => ro.disconnect()
  }, [cardEl])

  if (!version) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center bg-paper p-4 text-sm text-ink-muted">
        {t.emptyBody}
      </div>
    )
  }

  const grabbing = tool === 'pan' || zoom.canPan
  const versionLabel = version.favoriteName || t.design

  // Viewport rectangle (as 0-1 fractions of the untransformed image), derived
  // from the transform `translate(tx,ty) scale(s)` applied with a center
  // origin: content point P maps to screen = center + (tx,ty) + s*(P-center).
  // Solving for the P range that lands inside the visible card bounds gives
  // the box below. Only shown once zoomed past fit, where there's actually
  // something to navigate.
  const showMinimap = zoom.scale > 1.02 && cardSize.w > 0 && cardSize.h > 0 && Boolean(version.imageId)
  let vpLeft = 0
  let vpTop = 0
  let vpW = 1
  let vpH = 1
  if (showMinimap) {
    vpW = 1 / zoom.scale
    vpH = 1 / zoom.scale
    vpLeft = clamp(0.5 - (0.5 + zoom.translate.x / cardSize.w) / zoom.scale, 0, 1 - vpW)
    vpTop = clamp(0.5 - (0.5 + zoom.translate.y / cardSize.h) / zoom.scale, 0, 1 - vpH)
  }

  const showReference = referenceVersion && referenceVersion.id !== version.id && referenceVersion.imageId

  return (
    <div className="relative min-h-0 flex-1 overflow-hidden bg-paper p-4">
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

      {/* Picture-in-picture: the design pinned as the generation reference —
          bottom-left, so it never collides with the zoom minimap (bottom-right,
          below) when both are showing at once. */}
      {showReference && (
        <button
          type="button"
          onClick={() => onSelectVersion?.(referenceVersion.id)}
          title={`${t.refChip} ${versionOf ? versionOf(referenceVersion) : ''} — ${t.viewReference}`.trim()}
          className="absolute bottom-6 left-6 z-20 w-28 overflow-hidden rounded-lg border-2 border-paper bg-paper shadow-lg ring-1 ring-ink/10 transition-transform hover:scale-[1.03]"
        >
          <img
            src={referenceVersion.imageId}
            alt={`${t.refChip} ${versionOf ? versionOf(referenceVersion) : ''}`.trim()}
            className="aspect-[4/3] w-full object-cover"
          />
        </button>
      )}

      {/* Zoom minimap/navigator: the full image with a rectangle marking what's
          currently in view, exactly like an image editor's navigator. Clicking
          it resets to fit — the fastest way back once you're lost in a zoom. */}
      {showMinimap && (
        <button
          type="button"
          onClick={zoom.reset}
          aria-label={t.minimapReset}
          title={t.minimapReset}
          className="absolute bottom-6 right-6 z-20 w-28 overflow-hidden rounded-lg border-2 border-paper bg-paper shadow-lg ring-1 ring-ink/10"
        >
          <span className="relative block aspect-[4/3] w-full">
            <img src={version.imageId} alt="" className="h-full w-full object-cover" />
            <span
              className="absolute border-2 border-clay bg-clay/15"
              style={{
                left: `${vpLeft * 100}%`,
                top: `${vpTop * 100}%`,
                width: `${vpW * 100}%`,
                height: `${vpH * 100}%`,
              }}
            />
          </span>
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
        {/* The soft mesh gradient lives on the card itself (bg-canvas-card,
            below) so it's contained by the card's own rounded-xl2 +
            overflow-hidden — no separate blurred glow layer to bleed past
            the card edge and tint the white stage panel around it. */}
        <div
          ref={cardRef}
          className={`relative h-full w-full select-none overflow-hidden rounded-xl2 bg-canvas-card ${
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
            ) : version.status === 'pending' ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl2 bg-paper-soft text-sm text-ink-muted">
                <Spinner className="h-6 w-6 text-clay" />
                <p>
                  {t.generatingElapsed} {formatElapsed(elapsed)}
                </p>
                {elapsed > 30 && <p className="text-xs">{t.patience}</p>}
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl2 bg-paper-soft p-6 text-center text-sm">
                <StepIcon name="warningTriangle" className="h-5 w-5 text-danger" />
                <p className="max-w-sm text-danger">{version.error || t.emptyErrorTitle}</p>
                {onRetry && version.errorCode !== 'cap' && (
                  <button type="button" onClick={() => onRetry(version)} className="btn-ghost !px-3 !py-1.5 text-xs">
                    {t.retry}
                  </button>
                )}
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
                  {/* Marker: a hollow ring at rest (an unclaimed detection),
                      filling solid clay once selected — plus a short leader so
                      the label reads as pointing at a spot on the photo rather
                      than floating over the middle of it. */}
                  <span
                    className={`h-2.5 w-2.5 shrink-0 rounded-full border-2 shadow-sm transition-colors ${
                      active ? 'border-clay bg-clay' : 'border-white bg-white/40 group-hover:bg-white/70'
                    }`}
                  />
                  <span className={`h-px w-2 shrink-0 ${active ? 'bg-clay' : 'bg-white/70'}`} />
                  <span
                    className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur-sm transition-colors ${
                      active ? 'bg-clay text-white' : 'bg-white/80 text-ink-soft group-hover:bg-white/95'
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
