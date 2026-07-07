import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { content } from '../content.js'
import { StepIcon } from '../components/icons.jsx'
import ReferenceImageInput from '../components/generator/ReferenceImageInput.jsx'
import ResultTile from '../components/generator/ResultTile.jsx'
import EmptyState from '../components/generator/EmptyState.jsx'

// Halaman fokus: edit permintaan di kiri, preview hasil di kanan.
// Dibuka dari teaser di landing (Hero/Nav/GeneratorTeaser) lewat navigate('/studio', {state}).
// Simulasi — belum ada AI riil, generate cuma menunda lalu render placeholder.
export default function StudioPage() {
  const { state } = useLocation()
  const g = content.generator
  const s = content.studio

  const [prompt, setPrompt] = useState(state?.prompt ?? '')
  const [reference, setReference] = useState(state?.reference ?? null)
  const [status, setStatus] = useState('idle') // idle | loading | done
  const [seed, setSeed] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const timer = useRef(null)

  // Autorun saat halaman dibuka dari teaser. Timer dimiliki oleh efek ini
  // sendiri (bukan lewat ref bersama) supaya cleanup React StrictMode
  // (setup -> cleanup -> setup di dev) membatalkan & membuat ulang timer
  // dengan benar, alih-alih meninggalkan status macet di "loading".
  useEffect(() => {
    if (!state?.autorun) return
    setStatus('loading')
    const t = setTimeout(() => {
      setSeed((sd) => sd + 1)
      setStatus('done')
    }, 1300)
    timer.current = t
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e) => e.key === 'Escape' && setLightbox(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox])

  // Bersihkan timer dari klik manual Generate/Regenerate saat halaman ditinggalkan.
  useEffect(() => () => clearTimeout(timer.current), [])

  const generate = () => {
    setStatus('loading')
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setSeed((sd) => sd + 1)
      setStatus('done')
    }, 1300)
  }

  const addChip = (chip) => {
    setPrompt((p) => (p ? `${p}, ${chip}` : chip))
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper-soft">
      <header className="border-b border-paper-line bg-paper">
        <div className="container-content flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
            <span className="text-clay">✦</span>
            {content.brand}
          </Link>
          <span className="hidden rounded-full bg-clay-soft px-3 py-1 text-xs font-semibold text-clay-deep sm:inline-block">
            {s.badge}
          </span>
          <Link to="/" className="text-sm font-medium text-ink-muted hover:text-ink">
            {s.backLabel}
          </Link>
        </div>
      </header>

      <main className="container-content flex-1 py-10 md:py-14">
        <div className="grid gap-8 md:grid-cols-2 md:items-start">
          {/* Kiri: edit permintaan */}
          <div className="rounded-xl2 border border-paper-line bg-white p-5 shadow-sm md:p-6">
            <h1 className="font-display text-xl font-semibold text-ink">{s.editTitle}</h1>

            <label htmlFor="studio-prompt" className="sr-only">Deskripsi dekorasi</label>
            <textarea
              id="studio-prompt"
              rows={5}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={g.placeholder}
              className="mt-4 w-full resize-none rounded-lg border border-paper-line bg-paper-soft px-4 py-3 text-[15px] leading-relaxed text-ink placeholder:text-ink-muted/70 focus:border-clay focus:bg-white focus:outline-none focus:ring-2 focus:ring-clay/20"
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

            <button
              type="button"
              onClick={generate}
              disabled={status === 'loading'}
              className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status === 'loading' ? (
                <>
                  <Spinner /> Meracik…
                </>
              ) : (
                <>
                  <StepIcon name="spark" className="h-4 w-4" />
                  {status === 'done' ? g.regenerate : g.button}
                </>
              )}
            </button>
            <p className="mt-3 text-xs text-ink-muted">{g.note}</p>
          </div>

          {/* Kanan: preview */}
          <div className="flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink">
                {status === 'loading' ? g.loading : status === 'done' ? s.previewTitle : s.previewTitle}
              </h2>
            </div>

            {status === 'idle' && <EmptyState hint={s.emptyPromptHint} />}
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
                <a href="/#generator" className="btn-primary mt-4 w-full">
                  {g.upgradeCta} <StepIcon name="arrow" className="h-4 w-4" />
                </a>
              </div>
            )}
          </div>
        </div>
      </main>

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
    </div>
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
