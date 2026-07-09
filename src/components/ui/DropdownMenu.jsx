import { useEffect, useRef, useState } from 'react'

// Trigger + floating menu; closes on outside click / Escape (ux-spec §5.2).
export default function DropdownMenu({ trigger, items }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDocClick = (e) => !ref.current?.contains(e.target) && setOpen(false)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDocClick)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setOpen((o) => !o)
        }}
        className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-paper-soft hover:text-ink"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {trigger}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-1 w-44 rounded-lg border border-paper-line bg-paper py-1 shadow-lg"
        >
          {items.map((item, i) =>
            item.divider ? (
              <div key={i} className="my-1 border-t border-paper-line" />
            ) : (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                onClick={(e) => {
                  e.stopPropagation()
                  setOpen(false)
                  item.onSelect()
                }}
                className={`block w-full px-3 py-2 text-left text-sm transition-colors hover:bg-paper-soft ${
                  item.destructive ? 'text-danger' : 'text-ink-soft hover:text-ink'
                }`}
              >
                {item.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  )
}
