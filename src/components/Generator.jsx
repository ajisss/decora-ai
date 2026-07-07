import { useEffect, useRef, useState } from 'react'
import { content } from '../content.js'
import { StepIcon } from './icons.jsx'

// Demo generator SIMULASI (belum ada AI riil). Alur: user ketik / pilih gaya
// → tekan Generate → loading singkat → tampil 4 "hasil" placeholder.
// Tujuannya menunjukkan UX self-serve, bukan menghasilkan gambar sungguhan.
export default function Generator({ audience }) {
  const g = content.shared.generator
  const [prompt, setPrompt] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | done
  const [seed, setSeed] = useState(0)
  const timer = useRef(null)
  const resultRef = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const generate = () => {
    if (status === 'loading') return
    setStatus('loading')
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setSeed((s) => s + 1)
      setStatus('done')
      // Beri waktu render lalu scroll hasil ke tampilan.
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 60)
    }, 1300)
  }

  const addChip = (chip) => {
    setPrompt((p) => (p ? `${p}, ${chip}` : chip))
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

      <div className="mx-auto mt-10 max-w-3xl rounded-xl2 border border-paper-line bg-white p-5 shadow-sm md:p-6">
        <label htmlFor="gen-prompt" className="sr-only">Deskripsi dekorasi</label>
        <textarea
          id="gen-prompt"
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={g.placeholder[audience]}
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

        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="text-xs text-ink-muted">{g.note}</p>
          <button
            type="button"
            onClick={generate}
            disabled={status === 'loading'}
            className="btn-primary shrink-0 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status === 'loading' ? (
              <>
                <Spinner /> Meracik…
              </>
            ) : (
              <>
                <StepIcon name="spark" className="h-4 w-4" /> {g.button}
              </>
            )}
          </button>
        </div>
      </div>

      {(status === 'loading' || status === 'done') && (
        <div ref={resultRef} className="mx-auto mt-8 max-w-3xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">
              {status === 'loading' ? g.loading : g.resultTitle}
            </h3>
            {status === 'done' && (
              <button
                onClick={generate}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-clay hover:text-clay-deep"
              >
                <StepIcon name="revise" className="h-4 w-4" /> {g.regenerate}
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <ResultTile key={i} loading={status === 'loading'} seed={seed * 4 + i} />
            ))}
          </div>

          {status === 'done' && (
            <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-xl2 border border-clay/25 bg-clay-soft px-5 py-4 sm:flex-row">
              <p className="text-sm text-ink-soft">{g.resultHint}</p>
              <a href="#brief" className="btn-primary shrink-0">
                {g.upgradeCta} <StepIcon name="arrow" className="h-4 w-4" />
              </a>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

function ResultTile({ loading, seed }) {
  const hues = [18, 12, 28, 8, 22, 15, 32, 5]
  const h = hues[seed % hues.length]
  if (loading) {
    return <div className="aspect-[4/5] animate-pulse rounded-lg bg-paper-line" />
  }
  return (
    <div
      className="aspect-[4/5] rounded-lg ring-1 ring-black/5"
      style={{
        background: `linear-gradient(150deg, hsl(${h} 45% 64%), hsl(${h + 14} 42% 40%))`,
      }}
    />
  )
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
