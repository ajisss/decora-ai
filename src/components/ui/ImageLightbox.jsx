import { useRef } from 'react'
import { StepIcon } from '../icons.jsx'
import useFocusTrap from '../../lib/useFocusTrap.js'
import { content } from '../../content.js'

// Full-bleed zoom for a single image. Rendered unconditionally by callers and
// driven by `src`, so a null src is the closed state.
export default function ImageLightbox({ src, alt = '', onClose }) {
  const panelRef = useRef(null)
  const closeRef = useRef(null)
  useFocusTrap({ open: Boolean(src), onClose, containerRef: panelRef, initialFocusRef: closeRef })

  if (!src) return null

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label={alt || content.app.studio.fullscreen}
      tabIndex={-1}
      onClick={onClose}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/90 p-6 outline-none"
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label={content.app.studio.lightboxClose}
        className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
      >
        <StepIcon name="close" className="h-5 w-5" />
      </button>
      <img
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] max-w-full rounded-lg object-contain"
      />
    </div>
  )
}
