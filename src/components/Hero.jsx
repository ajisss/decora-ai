import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { content } from '../content.js'
import { useAuth } from '../context/AuthContext.jsx'
import { StepIcon } from './icons.jsx'
import ReferenceImageInput from './generator/ReferenceImageInput.jsx'
import { MOCK_PHOTOS, mockPhotoUrl } from '../lib/mockPhotos.js'

// Read once by WizardPage on mount, then cleared. Router `state` doesn't
// survive the RequireAuth -> /login -> back hop for a logged-out visitor, so
// this sessionStorage handoff is what actually carries the typed prompt
// through login instead of silently dropping it.
const TEASER_HANDOFF_KEY = 'decor-ai:teaser-handoff'

// Decorative photos scattered around the composer (xl+ only — below that there
// isn't margin room beside the centered column, so they'd collide with content).
// Purely atmospheric: aria-hidden, pointer-events-none, gentle float that the
// global reduced-motion rule freezes.
const FLOATERS = [
  { i: 0, pos: 'left-[3%] top-[13%] w-32', delay: '0s', ar: 'aspect-[4/5]' },
  { i: 2, pos: 'left-[8%] top-[46%] w-24', delay: '.8s', ar: 'aspect-square' },
  { i: 4, pos: 'left-[4%] top-[73%] w-28', delay: '.4s', ar: 'aspect-[4/5]' },
  { i: 1, pos: 'right-[4%] top-[11%] w-28', delay: '.6s', ar: 'aspect-square' },
  { i: 3, pos: 'right-[8%] top-[47%] w-24', delay: '.2s', ar: 'aspect-[4/5]' },
  { i: 2, pos: 'right-[3%] top-[71%] w-32', delay: '1s', ar: 'aspect-square' },
]

function HeroFloaters() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden xl:block" aria-hidden="true">
      {FLOATERS.map((f, idx) => (
        <figure
          key={idx}
          className={`animate-float absolute ${f.pos} overflow-hidden rounded-2xl border border-paper-line bg-paper shadow-lg`}
          style={{ animationDelay: f.delay }}
        >
          <img
            src={mockPhotoUrl(MOCK_PHOTOS[f.i], 400)}
            alt=""
            className={`${f.ar} w-full object-cover`}
          />
        </figure>
      ))}
    </div>
  )
}

export default function Hero({ data }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [prompt, setPrompt] = useState('')
  const [reference, setReference] = useState(null)

  const goGenerate = () => {
    if (prompt || reference) {
      try {
        sessionStorage.setItem(TEASER_HANDOFF_KEY, JSON.stringify({ notes: prompt, reference }))
      } catch {
        /* private mode — the router state below still covers the already-logged-in path */
      }
    }
    // Hand off into the wizard rather than bypassing it (ux-spec §4) — the
    // wizard's structure is the product thesis, so typed effort becomes
    // pre-filled notes instead of skipping straight to a raw prompt.
    if (user) {
      navigate('/projects/new', { state: { teaserNotes: prompt, teaserReference: reference } })
    } else {
      navigate('/login', { state: { from: '/projects/new' } })
    }
  }

  return (
    <section id="top" className="relative overflow-hidden bg-paper-soft">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(50% 40% at 80% 0%, rgba(192,95,60,0.10), transparent 70%), radial-gradient(40% 40% at 0% 100%, rgba(192,95,60,0.06), transparent 70%)',
        }}
      />
      <HeroFloaters />

      <div className="container-content relative z-10 section-y">
        <div className="animate-hero-in mx-auto max-w-2xl text-center">
          <h1 className="text-balance font-display text-5xl font-semibold tracking-tight text-ink md:text-7xl md:leading-[1.05]">
            {data.headline}
          </h1>
          <p className="text-pretty mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
            {data.sub}
          </p>
        </div>

        {/* Chat-composer shape: the bordered card IS the input boundary, the
            textarea inside is borderless. focus-within lifts the whole card to
            the active (clay) state. An avatar + brand row up top signals "this
            is Decora AI", not a generic text field. One bottom toolbar: attach
            left, single send action right — not a stacked full-width button. */}
        <div
          id="generator"
          className="animate-hero-in mx-auto mt-10 max-w-3xl scroll-mt-24 rounded-xl2 border border-paper-line bg-white p-3 shadow-sm transition-[border-color,box-shadow] [animation-delay:100ms] hover:border-ink/20 focus-within:border-clay focus-within:ring-2 focus-within:ring-clay/20 md:p-4"
        >
          <div className="flex items-center gap-2 px-2 pb-2">
            <span className="animate-ai-pulse relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-clay text-white">
              <StepIcon name="spark" className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-semibold text-ink-soft">Decora AI</span>
          </div>

          <label htmlFor="hero-prompt" className="sr-only">Deskripsi dekorasi</label>
          <textarea
            id="hero-prompt"
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={content.generator.placeholder}
            className="w-full resize-none border-0 bg-transparent px-2 py-2 text-[15px] leading-relaxed text-ink placeholder:text-ink-muted focus:outline-none focus:ring-0"
          />

          <div className="mt-2 flex items-center justify-between gap-2 border-t border-paper-line pt-3">
            <ReferenceImageInput value={reference} onChange={setReference} compact />
            <button
              type="button"
              onClick={goGenerate}
              disabled={!prompt.trim() && !reference}
              aria-label={data.ctaPrimary}
              title={data.ctaPrimary}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-clay text-white transition-colors hover:bg-clay-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-clay/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-clay"
            >
              <StepIcon name="spark" className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
