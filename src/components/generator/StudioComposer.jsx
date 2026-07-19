import { StepIcon } from '../icons.jsx'
import ReferenceImageInput from './ReferenceImageInput.jsx'
import { content } from '../../content.js'

const t = content.app.studio

// The bottom "AI Copilot" bar: mode switch (Buat gambar / Rencana), optional
// reference-image chip, textarea, send. Extracted verbatim from StudioPage —
// same handlers, same state shape — just componentized so the Design Canvas
// can mount it in its footer instead of it living inline in the page.
export default function StudioComposer({
  mode,
  onModeChange,
  modeMenuOpen,
  onModeMenuOpenChange,
  modeMenuRef,
  composerImage,
  onComposerImageChange,
  referenceEntry,
  onRemoveReference,
  referenceVersionNumber,
  note,
  onNoteChange,
  composerRef,
  isPending,
  isPlanPending,
  onGenerate,
  onPlanSend,
  placeholder,
}) {
  const busy = mode === 'plan' ? isPlanPending : isPending

  return (
    <div className="flex flex-wrap items-end gap-2 rounded-2xl border border-paper-line bg-paper p-2 shadow-lg shadow-ink/5">
      {/* Mode switch: Rencana (advisor, gratis) vs Buat gambar (generate),
          folded into the composer as a dropdown. Default = Buat gambar so
          the original one-shot flow is unchanged. */}
      <div className="relative shrink-0" ref={modeMenuRef}>
        <button
          type="button"
          onClick={() => onModeMenuOpenChange(!modeMenuOpen)}
          aria-haspopup="menu"
          aria-expanded={modeMenuOpen}
          className="flex items-center gap-1.5 rounded-full border border-paper-line bg-paper-soft px-3 py-2 text-xs font-medium text-ink-soft transition-colors hover:border-clay/40 hover:text-clay-deep"
        >
          <StepIcon name={mode === 'plan' ? 'spark' : 'image'} className="h-3.5 w-3.5" />
          {mode === 'plan' ? t.modePlan : t.modeGenerate}
          <StepIcon name="chevronDown" className="h-3 w-3" />
        </button>
        {modeMenuOpen && (
          <div
            role="menu"
            className="absolute bottom-full left-0 z-20 mb-2 w-60 rounded-lg border border-paper-line bg-paper py-1 shadow-lg"
          >
            {[
              { value: 'generate', icon: 'image', label: t.modeGenerate, hint: t.modeGenerateHint },
              { value: 'plan', icon: 'spark', label: t.modePlan, hint: t.modePlanHint },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="menuitem"
                onClick={() => {
                  onModeChange(opt.value)
                  onModeMenuOpenChange(false)
                }}
                className="flex w-full items-start gap-2.5 px-3 py-2 text-left transition-colors hover:bg-paper-soft"
              >
                <StepIcon name={opt.icon} className="mt-0.5 h-4 w-4 shrink-0 text-clay-deep" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-ink">{opt.label}</span>
                  <span className="block text-xs text-ink-muted">{opt.hint}</span>
                </span>
                {mode === opt.value && <StepIcon name="check" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-clay" />}
              </button>
            ))}
          </div>
        )}
      </div>
      {mode === 'generate' && (
        <>
          <ReferenceImageInput value={composerImage} onChange={onComposerImageChange} compact />
          {referenceEntry && (
            <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-paper-line bg-paper-soft py-1 pl-1 pr-2">
              <img src={referenceEntry.imageId} alt="" className="h-7 w-7 rounded-full object-cover" />
              <span className="text-xs text-ink-soft">
                {t.refChip} {referenceVersionNumber}
              </span>
              <button type="button" onClick={onRemoveReference} className="text-ink-muted hover:text-ink" aria-label={t.removeRef}>
                <StepIcon name="close" className="h-3 w-3" />
              </button>
            </div>
          )}
        </>
      )}
      <textarea
        ref={composerRef}
        rows={1}
        value={note}
        onChange={(e) => onNoteChange(e.target.value.slice(0, 300))}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            mode === 'plan' ? onPlanSend() : onGenerate()
          }
        }}
        placeholder={placeholder ?? (mode === 'plan' ? t.planPlaceholder : t.composerPlaceholder)}
        className="min-w-[140px] max-h-24 flex-1 resize-none bg-transparent px-2 py-2 text-sm focus:outline-none"
      />
      <button
        type="button"
        onClick={mode === 'plan' ? onPlanSend : onGenerate}
        disabled={busy || !note.trim()}
        aria-label={mode === 'plan' ? t.planSend : isPending ? t.generating : t.generate}
        title={mode === 'plan' ? t.planSend : isPending ? t.generating : t.generate}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-clay text-white transition-colors hover:bg-clay-deep disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
            <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        ) : (
          <StepIcon name="arrow" className="h-4 w-4" />
        )}
      </button>
    </div>
  )
}
