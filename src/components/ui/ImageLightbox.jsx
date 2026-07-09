import { StepIcon } from '../icons.jsx'

// Minimal full-screen image viewer, reused wherever a thumbnail needs to be
// zoomable (analyzed design preview, checklist item images) without pulling
// in the main feed lightbox's next/prev navigation.
export default function ImageLightbox({ src, alt = '', onClose }) {
  if (!src) return null
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/90 p-6"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup"
        className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
      >
        <StepIcon name="close" className="h-5 w-5" />
      </button>
      <img
        src={src}
        alt={alt}
        className="max-h-[85vh] max-w-full rounded-lg object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}
