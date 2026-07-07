import { useEffect, useRef, useState } from 'react'
import { content } from '../content.js'
import { StepIcon } from './icons.jsx'

// Demo generator SIMULASI (belum ada AI riil). Alur: user ketik / pilih gaya
// → tekan Generate → loading singkat → tampil 1 "hasil" placeholder.
// Layout dua kolom: kiri form prompt, kanan panel hasil. Hasil bisa
// diklik untuk dibesarkan (lightbox) — menunjukkan UX, bukan gambar riil.
export default function Generator({ audience }) {
  const g = content.shared.generator
  const [prompt, setPrompt] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | done
  const [seed, setSeed] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e) => e.key === 'Escape' && setLightbox(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox])

  const generate = () => {
    if (status === 'loading') return
    setStatus('loading')
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setSeed((s) => s + 1)
      setStatus('done')
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

      <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-2 md:items-start">
        {/* Kiri: form prompt */}
        <div className="rounded-xl2 border border-paper-line bg-white p-5 shadow-sm md:p-6">
          <label htmlFor="gen-prompt" className="sr-only">Deskripsi dekorasi</label>
          <textarea
            id="gen-prompt"
            rows={5}
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

          <button
            type="button"
            onClick={generate}
            disabled={status === 'loading'}
            className="btn-primary mt-5 w-full disabled:cursor-not-allowed disabled:opacity-70"
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
          <p className="mt-3 text-xs text-ink-muted">{g.note}</p>
        </div>

        {/* Kanan: panel hasil */}
        <div className="flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">
              {status === 'loading' ? g.loading : status === 'done' ? g.resultTitle : 'Hasil'}
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

          {status === 'idle' && <EmptyState hint={g.emptyHint} />}
          {status === 'loading' && <ResultTile loading seed={seed} />}
          {status === 'done' && (
            <button
              type="button"
              onClick={() => setLightbox(true)}
              className="group relative overflow-hidden rounded-xl2 focus:outline-none focus-visible:ring-2 focus-visible:ring-clay/40"
              aria-label="Perbesar hasil generate"
            >
              <ResultTile seed={seed} />
              <span className="absolute inset-0 flex items-center justify-center bg-ink/0 transition-colors group-hover:bg-ink/25">
                <span className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-ink opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                  <StepIcon name="preview" className="h-3.5 w-3.5" /> Perbesar
                </span>
              </span>
            </button>
          )}

          {status === 'done' && (
            <div className="mt-6 rounded-xl2 border border-clay/25 bg-clay-soft px-5 py-4">
              <p className="text-sm text-ink-soft">{g.resultHint}</p>
              <a href="#brief" className="btn-primary mt-4 w-full">
                {g.upgradeCta} <StepIcon name="arrow" className="h-4 w-4" />
              </a>
            </div>
          )}
        </div>
      </div>

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightbox(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/70 p-6 backdrop-blur-sm"
        >
          <button
            onClick={() => setLightbox(false)}
            aria-label="Tutup"
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <StepIcon name="close" className="h-5 w-5" />
          </button>
          <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <ResultTile seed={seed} />
          </div>
        </div>
      )}
    </section>
  )
}

function EmptyState({ hint }) {
  return (
    <div className="flex aspect-[4/5] flex-col items-center justify-center gap-3 rounded-xl2 border border-dashed border-paper-line bg-paper-soft px-6 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink-muted ring-1 ring-paper-line">
        <StepIcon name="spark" className="h-5 w-5" />
      </span>
      <p className="text-sm text-ink-muted">{hint}</p>
    </div>
  )
}

function ResultTile({ loading, seed = 0 }) {
  const hues = [18, 12, 28, 8, 22, 15, 32, 5]
  const h = hues[seed % hues.length]
  if (loading) {
    return <div className="aspect-[4/5] animate-pulse rounded-xl2 bg-paper-line" />
  }
  return (
    <div
      className="aspect-[4/5] rounded-xl2 ring-1 ring-black/5"
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
