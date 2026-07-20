import { useRef } from 'react'
import useFocusTrap from '../../lib/useFocusTrap.js'

// Centered modal dialog: focus-trapped, focus restored to the trigger on
// close, background scroll locked, closes on Escape/overlay click (ux-spec §3.3).
export default function Dialog({ open, onClose, title, children, footer, initialFocusRef }) {
  const dialogRef = useRef(null)
  useFocusTrap({ open, onClose, containerRef: dialogRef, initialFocusRef })

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="w-full max-w-[480px] rounded-xl2 bg-paper p-6 shadow-2xl outline-none"
      >
        {title && <h2 className="font-display text-lg text-ink">{title}</h2>}
        <div className="mt-3">{children}</div>
        {footer && <div className="mt-6 flex items-center justify-end gap-3">{footer}</div>}
      </div>
    </div>
  )
}
