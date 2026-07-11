import { useEffect, useState } from 'react'
import { StepIcon } from './icons.jsx'
import { MOCK_PHOTOS, mockPhotoUrl } from '../lib/mockPhotos.js'

// Right-side product mock that changes with the active HowItWorks step. Purely
// illustrative (the accordion carries the real copy), so the whole thing is
// aria-hidden. The scene is keyed by `active` + a `replay` counter, so its
// entrance animation replays on every step change AND loops on a timer; the
// global reduced-motion rule freezes the motion and the loop is disabled.

function SceneCard({ children, className = '' }) {
  return (
    <div className={`w-full max-w-sm rounded-xl2 border border-paper-line bg-white p-4 shadow-lg ${className}`}>
      {children}
    </div>
  )
}

// 0 — Tulis keinginan: a prompt typed word by word with a blinking caret.
const PROMPT_WORDS = 'pelaminan Jawa modern, dominan emas & putih, ada gebyok ukir'.split(' ')
function SceneWrite() {
  return (
    <SceneCard>
      <div className="flex items-center gap-2 text-xs font-medium text-ink-muted">
        <span className="h-2 w-2 rounded-full bg-clay" /> Prompt kamu
      </div>
      <p className="mt-3 text-[15px] leading-relaxed text-ink">
        {PROMPT_WORDS.map((w, i) => (
          <span key={i} className="animate-word" style={{ animationDelay: `${i * 90}ms` }}>
            {w}{' '}
          </span>
        ))}
        <span
          className="animate-caret ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 bg-clay align-middle"
          style={{ animationDelay: `${PROMPT_WORDS.length * 90}ms` }}
        />
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {['Jawa Klasik', 'Emas & putih', 'Gebyok'].map((c, i) => (
          <span
            key={c}
            className="animate-pop rounded-full border border-paper-line bg-paper-soft px-2.5 py-1 text-[11px] font-medium text-ink-soft"
            style={{ animationDelay: `${400 + i * 90}ms` }}
          >
            {c}
          </span>
        ))}
      </div>
    </SceneCard>
  )
}

// 1 — Biar AI yang gambar: four result tiles popping in one after another.
const GRID_PHOTOS = [0, 4, 2, 1]
function SceneGenerate() {
  return (
    <SceneCard>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-ink">Hasil generate</span>
        <span className="rounded-full bg-clay-soft px-2 py-0.5 text-[11px] font-semibold text-clay-deep">
          4 opsi
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {GRID_PHOTOS.map((p, i) => (
          <div
            key={i}
            className="animate-pop aspect-[4/3] overflow-hidden rounded-lg bg-paper-soft"
            style={{ animationDelay: `${i * 130}ms` }}
          >
            <img src={mockPhotoUrl(MOCK_PHOTOS[p], 400)} alt="" className="h-full w-full object-cover" />
          </div>
        ))}
      </div>
    </SceneCard>
  )
}

// 2 — Utak-atik sampai pas: a result plus a tweak chip and a regenerating pill.
function SceneRevise() {
  return (
    <SceneCard>
      <div className="aspect-[16/10] overflow-hidden rounded-lg bg-paper-soft">
        <img src={mockPhotoUrl(MOCK_PHOTOS[3], 600)} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className="animate-pop rounded-full border border-paper-line bg-paper-soft px-2.5 py-1 text-[11px] font-medium text-clay-deep">
          + lebih banyak bunga
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-clay px-3 py-1.5 text-[11px] font-semibold text-white">
          <StepIcon name="revise" className="h-3.5 w-3.5 animate-spin [animation-duration:2.5s]" />
          Generate lagi
        </span>
      </div>
    </SceneCard>
  )
}

// 3 — Bedah tiap elemen: the generated image decomposed into its decoration
// elements — the actual "break the image into a parts list" feature.
const ELEMENTS = [
  { name: 'Pelaminan', cost: 'Rp18jt' },
  { name: 'Kursi tamu VIP', cost: 'Rp6jt' },
  { name: 'Backdrop bunga', cost: 'Rp10jt' },
  { name: 'Meja penerima', cost: 'Rp4jt' },
  { name: 'Lighting', cost: 'Rp4jt' },
]
function SceneBreakdown() {
  return (
    <SceneCard>
      <div className="flex items-center gap-3">
        <div className="h-12 w-16 shrink-0 overflow-hidden rounded-md bg-paper-soft">
          <img src={mockPhotoUrl(MOCK_PHOTOS[0], 300)} alt="" className="h-full w-full object-cover" />
        </div>
        <div>
          <div className="text-xs font-semibold text-ink">Elemen terdeteksi</div>
          <div className="text-[11px] text-ink-muted">5 item · est. Rp42jt</div>
        </div>
      </div>
      <ul className="mt-3 space-y-1.5">
        {ELEMENTS.map((row, i) => (
          <li
            key={row.name}
            className="animate-pop flex items-center justify-between rounded-lg bg-paper-soft px-3 py-1.5 text-[13px]"
            style={{ animationDelay: `${i * 110}ms` }}
          >
            <span className="flex items-center gap-2 text-ink-soft">
              <StepIcon name="check" className="h-4 w-4 text-clay" />
              {row.name}
            </span>
            <span className="font-medium text-ink-muted">{row.cost}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white">
        <StepIcon name="download" className="h-3.5 w-3.5" /> Ekspor brief vendor
      </div>
    </SceneCard>
  )
}

// 4 — Serahkan ke tim: the curated final asset with a team badge.
function SceneTeam() {
  return (
    <SceneCard className="text-center">
      <div className="aspect-[16/10] overflow-hidden rounded-lg bg-paper-soft">
        <img src={mockPhotoUrl(MOCK_PHOTOS[0], 600)} alt="" className="h-full w-full object-cover" />
      </div>
      <span className="animate-pop mt-3 inline-flex items-center gap-1.5 rounded-full bg-clay-soft px-3 py-1 text-xs font-semibold text-clay-deep">
        <StepIcon name="checkCircle" className="h-4 w-4" /> Dikurasi tim — aset final
      </span>
      <p className="mt-2 text-xs text-ink-muted">Vector rapi berlayer, dikurasi pakem adat, siap produksi.</p>
    </SceneCard>
  )
}

const SCENES = [SceneWrite, SceneGenerate, SceneRevise, SceneBreakdown, SceneTeam]
const REPLAY_MS = 2800

export default function HowItWorksVisual({ active }) {
  const Scene = SCENES[active] ?? SCENES[0]
  const [replay, setReplay] = useState(0)

  // Loop the scene motion: remounting the keyed wrapper replays every entrance
  // animation. Disabled under reduced motion (the loop would be pointless — the
  // animations are frozen — and needless churn).
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setReplay((r) => r + 1), REPLAY_MS)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      className="relative flex min-h-[300px] items-center justify-center rounded-xl2 border border-paper-line bg-paper-soft/60 p-5 sm:p-6 lg:min-h-[440px]"
      aria-hidden="true"
    >
      {/* Decorative squiggle + dots, echoing the reference's playful accents. */}
      <svg
        className="pointer-events-none absolute right-5 top-5 h-16 w-16 text-clay/25"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      >
        <path d="M8 40 C 40 8, 60 8, 62 34 C 63 54, 40 56, 42 74 C 44 92, 78 88, 92 62" />
      </svg>
      <div className="pointer-events-none absolute bottom-6 left-6 flex gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-clay/40" />
        <span className="h-1.5 w-1.5 rounded-full bg-clay/25" />
        <span className="h-1.5 w-1.5 rounded-full bg-clay/40" />
      </div>

      <div key={`${active}-${replay}`} className="animate-hero-in relative z-10 w-full">
        <div className="mx-auto flex justify-center">
          <Scene />
        </div>
      </div>
    </div>
  )
}
