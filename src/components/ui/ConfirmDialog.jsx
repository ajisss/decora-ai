import Dialog from './Dialog.jsx'
import { content } from '../../content.js'

// Confirms an action that spends real AI-generation credit before firing it —
// reuses the generic Dialog rather than each call site rolling its own.
export default function ConfirmDialog({ open, onClose, onConfirm, title, body, confirmLabel, cancelLabel }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-ghost !px-3 !py-1.5 text-xs">
            {cancelLabel ?? content.app.studio.cancel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className="btn-primary !px-3 !py-1.5 text-xs"
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm text-ink-soft">{body}</p>
    </Dialog>
  )
}
