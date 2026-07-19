import { useCallback, useRef, useState } from 'react'

const MIN_SCALE = 0.4
const MAX_SCALE = 4
const FIT_SCALE = 1
const STEP = 0.25

// Zoom/pan controller for the Design Canvas — wheel-to-zoom, drag-to-pan,
// and a fit that returns to 100% with the pan reset.
//
// The floor is below 1 on purpose: the toolbar has a real zoom-out button, and
// clamping at exactly fit-scale would make that button do nothing the moment
// you were already at 100% — a control that silently no-ops reads as broken.
export default function useZoomPan() {
  const [scale, setScale] = useState(FIT_SCALE)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const dragRef = useRef(null)

  const zoomBy = useCallback((delta) => {
    setScale((s) => {
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, Math.round((s + delta) * 100) / 100))
      // Panning only means something while the image overflows its frame.
      if (next <= FIT_SCALE) setTranslate({ x: 0, y: 0 })
      return next
    })
  }, [])

  const zoomIn = useCallback(() => zoomBy(STEP), [zoomBy])
  const zoomOut = useCallback(() => zoomBy(-STEP), [zoomBy])

  const reset = useCallback(() => {
    setScale(FIT_SCALE)
    setTranslate({ x: 0, y: 0 })
  }, [])

  const onWheel = useCallback(
    (e) => {
      // Trackpad pinch arrives as ctrlKey+wheel; plain wheel scrolls nothing
      // here (the stage has no overflow) so treating it as zoom is safe.
      if (Math.abs(e.deltaY) < 1) return
      zoomBy(e.deltaY > 0 ? -0.1 : 0.1)
    },
    [zoomBy],
  )

  const onPointerDown = useCallback(
    (e) => {
      if (scale <= FIT_SCALE) return
      dragRef.current = { startX: e.clientX, startY: e.clientY, origin: translate }
      e.currentTarget.setPointerCapture?.(e.pointerId)
    },
    [scale, translate],
  )

  const onPointerMove = useCallback((e) => {
    const drag = dragRef.current
    if (!drag) return
    setTranslate({ x: drag.origin.x + (e.clientX - drag.startX), y: drag.origin.y + (e.clientY - drag.startY) })
  }, [])

  const onPointerUp = useCallback(() => {
    dragRef.current = null
  }, [])

  return {
    scale,
    translate,
    percent: Math.round(scale * 100),
    canPan: scale > FIT_SCALE,
    zoomIn,
    zoomOut,
    reset,
    onWheel,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  }
}
