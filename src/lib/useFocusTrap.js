import { useEffect, useRef } from 'react'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

// Everything a modal surface owes a keyboard user, in one place:
//   * move focus in when it opens (and remember where focus came from)
//   * keep Tab/Shift+Tab inside it
//   * close on Escape
//   * put focus back on the trigger when it closes — including when it closes
//     because something inside it was activated, which otherwise drops focus
//     to <body> and loses the user's place entirely
//   * lock background scroll so the page behind doesn't move
//
// `aria-modal` tells assistive tech the rest of the page is inert; without a
// real trap that promise is a lie, since Tab still walks out into content the
// screen reader is no longer reporting.
export default function useFocusTrap({ open, onClose, containerRef, initialFocusRef }) {
  const restoreRef = useRef(null)

  useEffect(() => {
    if (!open) return
    restoreRef.current = document.activeElement

    const node = containerRef.current
    const target = initialFocusRef?.current ?? node?.querySelector(FOCUSABLE) ?? node
    // Defer a tick so the element exists and any entry transition has begun.
    const focusTimer = setTimeout(() => target?.focus?.(), 0)

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose?.()
        return
      }
      if (e.key !== 'Tab' || !node) return
      const items = Array.from(node.querySelectorAll(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      )
      if (items.length === 0) {
        e.preventDefault()
        node.focus?.()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && (document.activeElement === first || document.activeElement === node)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey, true)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      clearTimeout(focusTimer)
      document.removeEventListener('keydown', onKey, true)
      document.body.style.overflow = prevOverflow
      // Only restore if focus is somewhere we abandoned (body) or still inside
      // the panel being unmounted — never steal focus the user moved on purpose.
      const active = document.activeElement
      if (!active || active === document.body || node?.contains(active)) {
        restoreRef.current?.focus?.()
      }
    }
  }, [open, onClose, containerRef, initialFocusRef])
}
