import { useState } from 'react'
import Dialog from '../ui/Dialog.jsx'
import { StepIcon } from '../icons.jsx'
import { downloadPng, buildBriefPdf } from './buildBriefPdf.js'
import { shareVersion } from './shareLink.js'
import { useToast } from '../ui/Toast.jsx'
import { content } from '../../content.js'

const t = content.app.export

// Two-option export: PNG or PDF vendor brief (ux-spec §9).
export default function ExportDialog({ project, generation, versionNumber, onClose, onAnalyzeFirst }) {
  const hasAnalysis = Boolean(generation?.analysis)
  const [choice, setChoice] = useState(hasAnalysis ? 'pdf' : 'png')
  const [preparing, setPreparing] = useState(false)
  const [error, setError] = useState(null)
  const { showToast } = useToast()

  if (!generation) return null

  const download = async () => {
    setPreparing(true)
    setError(null)
    try {
      if (choice === 'share') {
        // No token = guessed/expired link is rejected by SharePage's gate.
        await shareVersion(project, generation, showToast)
        onClose()
        return
      }
      if (choice === 'png') {
        downloadPng(generation, project, versionNumber)
        showToast(t.pngDone)
      } else {
        await buildBriefPdf({ project, generation, versionNumber })
        showToast(t.pdfDone)
      }
      onClose()
    } catch {
      setError(t.error)
    } finally {
      setPreparing(false)
    }
  }

  return (
    <Dialog
      open={Boolean(generation)}
      onClose={onClose}
      title={t.title(versionNumber)}
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-ghost">
            {t.cancel}
          </button>
          <button type="button" onClick={download} disabled={preparing} className="btn-primary disabled:opacity-50">
            {preparing ? t.preparing : choice === 'share' ? content.app.share.copy : t.download}
          </button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <OptionCard
          icon="image"
          title={t.png}
          body={t.pngDesc}
          selected={choice === 'png'}
          onClick={() => setChoice('png')}
        />
        <OptionCard
          icon="filePdf"
          title={t.pdf}
          body={t.pdfDesc}
          selected={choice === 'pdf'}
          onClick={() => setChoice('pdf')}
        />
        <OptionCard
          icon="external"
          title={content.app.share.option}
          body={content.app.share.optionDesc}
          selected={choice === 'share'}
          onClick={() => setChoice('share')}
        />
      </div>
      {choice === 'pdf' && !hasAnalysis && (
        <p className="mt-3 text-xs text-ink-muted">
          {t.noChecklist}{' '}
          <button type="button" onClick={onAnalyzeFirst} className="font-semibold text-clay-deep underline">
            {t.analyzeFirst}
          </button>
        </p>
      )}
      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
    </Dialog>
  )
}

function OptionCard({ icon, title, body, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border p-4 text-left transition-colors ${
        selected ? 'border-clay bg-clay-soft' : 'border-paper-line hover:border-ink/20'
      }`}
    >
      <StepIcon name={icon} className={`h-5 w-5 ${selected ? 'text-clay-deep' : 'text-ink-muted'}`} />
      <p className="mt-2 text-sm font-semibold text-ink">{title}</p>
      <p className="mt-1 text-xs text-ink-muted">{body}</p>
    </button>
  )
}
