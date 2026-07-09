import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { content } from '../content.js'
import { StepIcon } from './icons.jsx'
import ReferenceImageInput from './generator/ReferenceImageInput.jsx'

// Teaser di landing page: hanya menangkap input (prompt + referensi opsional).
// Generate sungguhan (loading, hasil, edit lanjutan) terjadi di halaman
// terpisah /studio supaya usernya fokus di sana.
export default function GeneratorTeaser() {
  const g = content.generator
  const navigate = useNavigate()
  const [prompt, setPrompt] = useState('')
  const [reference, setReference] = useState(null)

  const addChip = (chip) => {
    setPrompt((p) => (p ? `${p}, ${chip}` : chip))
  }

  const goGenerate = () => {
    // Hand off into the wizard rather than bypassing it (ux-spec §4) — the
    // wizard's structure is the product thesis, so typed effort becomes
    // pre-filled notes instead of skipping straight to a raw prompt.
    navigate('/projects/new', { state: { teaserNotes: prompt, teaserReference: reference } })
  }

  return (
    <section id="generator" className="container-content py-20 md:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <p className="eyebrow mb-3">{g.eyebrow}</p>
        <h2 className="font-display text-3xl font-semibold leading-tight text-ink md:text-4xl">
          {g.title}
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-ink-soft">{g.sub}</p>
      </div>

      <div className="mx-auto mt-10 max-w-2xl rounded-xl2 border border-paper-line bg-white p-5 shadow-sm md:p-6">
        <label htmlFor="gen-prompt" className="sr-only">Deskripsi dekorasi</label>
        <textarea
          id="gen-prompt"
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={g.placeholder}
          className="w-full resize-none rounded-lg border border-paper-line bg-paper-soft px-4 py-3 text-[15px] leading-relaxed text-ink placeholder:text-ink-muted/70 focus:border-clay focus:bg-white focus:outline-none focus:ring-2 focus:ring-clay/20"
        />

        <div className="mt-3 flex flex-wrap gap-2">
          {g.chips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => addChip(chip)}
              className="rounded-full border border-paper-line bg-paper-soft px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-clay/40 hover:text-clay-deep"
            >
              + {chip}
            </button>
          ))}
        </div>

        <div className="mt-5">
          <ReferenceImageInput value={reference} onChange={setReference} />
        </div>

        <button type="button" onClick={goGenerate} className="btn-primary mt-5 w-full">
          <StepIcon name="spark" className="h-4 w-4" /> {g.button}
        </button>
        <p className="mt-3 text-center text-xs text-ink-muted">{g.note}</p>
      </div>
    </section>
  )
}
