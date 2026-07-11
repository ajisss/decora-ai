import { useEffect, useRef, useState } from 'react'
import Dialog from '../ui/Dialog.jsx'
import { content } from '../../content.js'

const t = content.app.studio

// Naming a favorite is mandatory the first time (bookmarking without a way
// to tell it apart later defeats the point) — Save stays disabled until
// there's a name — and the same dialog doubles as the rename flow.
export default function BookmarkNameDialog({ open, title, initialName, onClose, onSave }) {
  const [name, setName] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) setName(initialName ?? '')
  }, [open, initialName])

  const save = () => {
    if (!name.trim()) return
    onSave(name.trim())
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      initialFocusRef={inputRef}
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-ghost !px-3 !py-1.5 text-xs">
            {t.cancel}
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!name.trim()}
            className="btn-primary !px-3 !py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t.bookmarkSave}
          </button>
        </>
      }
    >
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-soft">{t.bookmarkNameLabel}</span>
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 60))}
          onKeyDown={(e) => e.key === 'Enter' && save()}
          placeholder={t.bookmarkNamePlaceholder}
          className="h-10 w-full rounded-lg border border-paper-line bg-paper px-3 text-sm focus:border-clay focus:outline-none focus-visible:ring-2 focus-visible:ring-clay/40"
        />
      </label>
    </Dialog>
  )
}
