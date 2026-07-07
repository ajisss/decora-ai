import { useRef } from 'react'
import { content } from '../../content.js'
import { StepIcon } from '../icons.jsx'

// Upload referensi gambar (mis. foto lokasi, screenshot Pinterest).
// Disimpan sebagai data URL di state — cukup untuk demo & bisa dioper
// lewat navigasi antar halaman (location.state) tanpa perlu backend.
export default function ReferenceImageInput({ value, onChange }) {
  const r = content.reference
  const inputRef = useRef(null)

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onChange(reader.result)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-ink-soft">{r.label}</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />

      {value ? (
        <div className="flex items-center gap-3 rounded-lg border border-paper-line bg-paper-soft p-2">
          <img src={value} alt="Referensi" className="h-14 w-14 rounded-md object-cover" />
          <div className="flex flex-1 flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-full border border-paper-line bg-white px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-clay/40 hover:text-clay-deep"
            >
              {r.change}
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="inline-flex items-center gap-1 rounded-full border border-paper-line bg-white px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-red-300 hover:text-red-600"
            >
              <StepIcon name="trash" className="h-3.5 w-3.5" /> {r.remove}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full items-center gap-2.5 rounded-lg border border-dashed border-paper-line bg-paper-soft px-4 py-3 text-sm font-medium text-ink-muted transition-colors hover:border-clay/40 hover:text-clay-deep"
        >
          <StepIcon name="image" className="h-4 w-4 shrink-0" />
          {r.add}
        </button>
      )}
      <p className="mt-1.5 text-xs text-ink-muted">{r.hint}</p>
    </div>
  )
}
