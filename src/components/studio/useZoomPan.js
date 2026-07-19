import { useCallback, useRef, useState } from 'react'

const MIN_SCALE = 1
const MAX_SCALE = 4

// Small zoom/pan controller for the Design Canvas — wheel-to-zoom (clamped
// 1-4x), drag-to-pan once zoomed in, reset/fit back to 1x. No dependency;
// plain pointer events + CSS transform.
export default function useZoomPan() {
  const [scale, setScale] = useState(1)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const dragRef = useRef(null)

  const clampTranslate = useCallback((t, s) => {
    // Simple clamp: at 1x there's nothing to pan; beyond that allow free
    // drag — the image itself is `object-contain` so over-panning just shows
    // paper background, which is harmless and avoids per-frame bounds math.
    return s <= 1 ? { x: 0, y: 0 } : t
  }, [])

  const zoomBy = useCallback((delta) => {
    setScale((s) => {
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, s + delta))
      if (next === 1) setTranslate({ x: 0, y: 0 })
      return next
    })
  }, [])

  const onWheel = useCallback(
    (e) => {
      if (!e.ctrlKey && Math.abs(e.deltaY) < 1) return
      e.preventDefault()
      zoomBy(e.deltaY > 0 ? -0.2 : 0.2)
    },
    [zoomBy],
  )

  const zoomIn = useCallback(() => zoomBy(0.25), [zoomBy])
  const zoomOut = useCallback(() => zoomBy(-0.25), [zoomBy])
  const reset = useCallback(() => {
    setScale(1)
    setTranslate({ x: 0, y: 0 })
  }, [])

  const onPointerDown = useCallback(
    (e) => {
      if (scale <= 1) return
      dragRef.current = { startX: e.clientX, startY: e.clientY, origin: translate }
      e.currentTarget.setPointerCapture(e.pointerId)
    },
    [scale, translate],
  )

  const onPointerMove = useCallback(
    (e) => {
      if (!dragRef.current) return
      const dx = e.clientX - dragRef.current.startX
      const dy = e.clientY - dragRef.current.startY
      setTranslate(clampTranslate({ x: dragRef.current.origin.x + dx, y: dragRef.current.origin.y + dy }, scale))
    },
    [clampTranslate, scale],
  )

  const onPointerUp = useCallback(() => {
    dragRef.current = null
  }, [])

  return {
    scale,
    translate,
    percent: Math.round(scale * 100),
    isPanning: scale > 1,
    zoomIn,
    zoomOut,
    reset,
    onWheel,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  }
}
