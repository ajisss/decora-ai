import { useEffect, useRef } from 'react'

// Centered modal dialog. Focus-trapped, closes on Escape/overlay click (ux-spec §3.3).
export default function Dialog({ open, onClose, title, children, footer, initialFocusRef }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    ;(initialFocusRef?.current ?? dialogRef.current)?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, initialFocusRef])

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
