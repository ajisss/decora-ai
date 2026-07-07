import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { content } from '../content.js'
import { StepIcon } from '../components/icons.jsx'
import ReferenceImageInput from '../components/generator/ReferenceImageInput.jsx'
import ResultTile from '../components/generator/ResultTile.jsx'

// Workspace ala "AI tool": sidebar ikon kiri, canvas jadi feed generate
// (tiap generate nambah entry baru: timestamp + prompt + status/hasil),
// bottom bar buat nulis prompt, panel kanan (Contoh/Riwayat). Tetap tema
// terang konsisten dengan landing — cuma layout yang diadopsi.
// Simulasi — belum ada AI riil, generate cuma menunda lalu render placeholder.
export default function StudioPage() {
  const { state } = useLocation()
  const g = content.generator
  const s = content.studio

  const [prompt, setPrompt] = useState(state?.prompt ?? '')
  const [reference, setReference] = useState(state?.reference ?? null)
  const [entries, setEntries] = useState([]) // {id, prompt, timestamp, status, percent, seed}
  const [lightboxSeed, setLightboxSeed] = useState(null)
  const [rightTab, setRightTab] = useState('explore') // explore | history
  const [mobilePanel, setMobilePanel] = useState(false)
  const nextId = useRef(0)
  const nextSeed = useRef(0)
  const percentTimer = useRef(null)
  const doneTimer = useRef(null)

  const isGenerating = entries.some((e) => e.status === 'loading')

  // Autorun saat halaman dibuka dari teaser. Timer dimiliki oleh efek ini
  // sendiri (bukan lewat ref bersama) supaya cleanup React StrictMode
  // (setup -> cleanup -> setup di dev) membatalkan & membuat ulang timer
  // dengan benar, alih-alih meninggalkan status macet di "loading".
  useEffect(() => {
    if (!state?.autorun) return
    runGenerate(state?.prompt ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (lightboxSeed === null) return
    const onKey = (e) => e.key === 'Escape' && setLightboxSeed(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxSeed])

  useEffect(
    () => () => {
      clearInterval(percentTimer.current)
      clearTimeout(doneTimer.current)
    },
    [],
  )

  const runGenerate = (promptAtRun) => {
    const id = nextId.current
    nextId.current += 1
    const entry = { id, prompt: promptAtRun, timestamp: new Date(), status: 'loading', percent: 0, seed: null }
    setEntries((es) => [entry, ...es])

    clearInterval(percentTimer.current)
    clearTimeout(doneTimer.current)

    percentTimer.current = setInterval(() => {
      setEntries((es) =>
        es.map((e) => (e.id === id && e.status === 'loading' ? { ...e, percent: Math.min(95, e.percent + 12) } : e)),
      )
    }, 150)

    doneTimer.current = setTimeout(() => {
      clearInterval(percentTimer.current)
      const seed = nextSeed.current
      nextSeed.current += 1
      setEntries((es) => es.map((e) => (e.id === id ? { ...e, status: 'done', percent: 100, seed } : e)))
    }, 1300)
  }

  const generate = () => runGenerate(prompt)

  const addChip = (chip) => {
    setPrompt((p) => (p ? `${p}, ${chip}` : chip))
  }

  const useExamplePrompt = (item) => {
    setPrompt(item.prompt.replace(/^"|"$/g, ''))
    setMobilePanel(false)
  }

  return (
    <div className="flex h-screen flex-col bg-paper">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-paper-line bg-paper px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
          <span className="text-clay">✦</span>
          {content.brand}
        </Link>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-clay-soft px-3 py-1 text-xs font-semibold text-clay-deep">
            {s.badge}
          </span>
          <button
            type="button"
            onClick={() => setMobilePanel(true)}
            className="rounded-full border border-paper-line px-3 py-1.5 text-xs font-medium text-ink-soft lg:hidden"
          >
            {s.tabs.explore} & {s.tabs.history}
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Sidebar */}
        <aside className="hidden w-16 shrink-0 flex-col items-center gap-2 border-r border-paper-line bg-paper-soft py-4 md:flex">
          <SidebarIcon icon="home" label={s.sidebar.home} as={Link} to="/" />
          <SidebarIcon icon="spark" label={s.sidebar.generate} active />
          <SidebarIcon
            icon="history"
            label={s.sidebar.history}
            onClick={() => setMobilePanel(true)}
            className="lg:hidden"
          />
        </aside>

        {/* Canvas (feed) + bottom bar */}
        <div className="flex min-h-0 flex-1 flex-col">
          <main className="relative flex-1 overflow-y-auto p-6">
            {entries.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="max-w-md text-center">
                  <h1 className="font-display text-2xl font-semibold leading-snug text-ink md:text-3xl">
                    {s.canvasIdleTitle}
                  </h1>
                  <p className="mt-3 text-ink-muted">{s.canvasIdleHint}</p>
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-xl">
                {entries.map((entry, i) => (
                  <FeedEntry
                    key={entry.id}
                    entry={entry}
                    isLatest={i === 0}
                    g={g}
                    onOpenLightbox={setLightboxSeed}
                  />
                ))}
              </div>
            )}
          </main>

          {/* Bottom prompt bar */}
          <div className="shrink-0 border-t border-paper-line bg-white p-4">
            <div className="mx-auto max-w-3xl">
              <textarea
                rows={2}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={g.placeholder}
                className="w-full resize-none rounded-lg border border-paper-line bg-paper-soft px-4 py-3 text-[15px] leading-relaxed text-ink placeholder:text-ink-muted/70 focus:border-clay focus:bg-white focus:outline-none focus:ring-2 focus:ring-clay/20"
              />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <ReferenceImageInput value={reference} onChange={setReference} compact />
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
                  disabled={isGenerating}
                  className="btn-primary shrink-0 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isGenerating ? (
                    <>
                      <Spinner /> Meracik…
                    </>
                  ) : (
                    <>
                      <StepIcon name="spark" className="h-4 w-4" />
                      {entries.length > 0 ? g.regenerate : g.button}
                    </>
                  )}
                </button>
              </div>
              <p className="mt-2 text-xs text-ink-muted">{g.note}</p>
            </div>
          </div>
        </div>

        {/* Right panel (desktop) */}
        <aside className="hidden w-[340px] shrink-0 flex-col border-l border-paper-line bg-paper-soft lg:flex">
          <RightPanel
            rightTab={rightTab}
            setRightTab={setRightTab}
            entries={entries}
            onUseExample={useExamplePrompt}
            s={s}
          />
        </aside>
      </div>

      {/* Right panel (mobile overlay) */}
      {mobilePanel && (
        <div className="fixed inset-0 z-[90] flex justify-end bg-ink/40 lg:hidden" onClick={() => setMobilePanel(false)}>
          <div
            className="flex h-full w-full max-w-sm flex-col bg-paper-soft"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-paper-line px-4">
              <span className="text-sm font-semibold text-ink">{s.tabs.explore} & {s.tabs.history}</span>
              <button onClick={() => setMobilePanel(false)} aria-label="Tutup" className="text-ink-muted hover:text-ink">
                <StepIcon name="close" className="h-5 w-5" />
              </button>
            </div>
            <RightPanel
              rightTab={rightTab}
              setRightTab={setRightTab}
              entries={entries}
              onUseExample={useExamplePrompt}
              s={s}
            />
          </div>
        </div>
      )}

      {lightboxSeed !== null && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxSeed(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/70 p-6 backdrop-blur-sm"
        >
          <button
            onClick={() => setLightboxSeed(null)}
            aria-label="Tutup"
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <StepIcon name="close" className="h-5 w-5" />
          </button>
          <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <ResultTile seed={lightboxSeed} />
          </div>
        </div>
      )}
    </div>
  )
}

function FeedEntry({ entry, isLatest, g, onOpenLightbox }) {
  return (
    <div className="border-b border-paper-line py-5 first:pt-0">
      <p className="text-xs text-ink-muted">{formatTimestamp(entry.timestamp)}</p>
      <p className="mt-1 text-[15px] font-medium text-ink">{entry.prompt || '(tanpa prompt)'}</p>

      {entry.status === 'loading' ? (
        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-paper-line bg-paper-soft px-3 py-1.5 text-xs font-medium text-ink-soft">
          <Spinner /> Generating {entry.percent}%
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => onOpenLightbox(entry.seed)}
            className="group relative mt-3 block w-48 overflow-hidden rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-clay/40"
            aria-label="Perbesar hasil generate"
          >
            <ResultTile seed={entry.seed} />
            <span className="absolute inset-0 flex items-center justify-center bg-ink/0 transition-colors group-hover:bg-ink/25">
              <span className="flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-ink opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                <StepIcon name="preview" className="h-3 w-3" /> Perbesar
              </span>
            </span>
          </button>

          {isLatest && (
            <div className="mt-4 max-w-md rounded-xl2 border border-clay/25 bg-clay-soft px-5 py-4">
              <p className="text-sm text-ink-soft">{g.resultHint}</p>
              <a href="#generator" className="btn-primary mt-3 w-full">
                {g.upgradeCta} <StepIcon name="arrow" className="h-4 w-4" />
              </a>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function formatTimestamp(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function RightPanel({ rightTab, setRightTab, entries, onUseExample, s }) {
  const gallery = content.gallery
  const done = entries.filter((e) => e.status === 'done')
  return (
    <>
      <div className="flex shrink-0 gap-1 border-b border-paper-line p-3">
        <TabButton active={rightTab === 'explore'} onClick={() => setRightTab('explore')}>
          {s.tabs.explore}
        </TabButton>
        <TabButton active={rightTab === 'history'} onClick={() => setRightTab('history')}>
          {s.tabs.history}
        </TabButton>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {rightTab === 'explore' && (
          <>
            <p className="mb-3 px-1 text-xs text-ink-muted">{s.exploreHint}</p>
            <div className="grid grid-cols-2 gap-2">
              {gallery.items.map((item, i) => (
                <button
                  key={item.tag}
                  type="button"
                  onClick={() => onUseExample(item)}
                  className="group overflow-hidden rounded-lg border border-paper-line bg-white text-left"
                >
                  <ExampleThumb seed={i} />
                  <span className="block truncate px-2 py-1.5 text-xs font-medium text-ink-soft group-hover:text-clay-deep">
                    {item.tag}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {rightTab === 'history' && (
          <>
            {done.length === 0 ? (
              <p className="px-1 py-6 text-center text-sm text-ink-muted">{s.historyEmpty}</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {done.map((h) => (
                  <div key={h.id} className="overflow-hidden rounded-lg border border-paper-line bg-white">
                    <ResultTile seed={h.seed} />
                    <span className="block truncate px-2 py-1.5 text-xs text-ink-soft" title={h.prompt}>
                      {h.prompt || '(tanpa prompt)'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}

function ExampleThumb({ seed }) {
  const hues = [18, 12, 28, 8, 22, 15]
  const h = hues[seed % hues.length]
  return (
    <div
      className="aspect-square"
      style={{ background: `linear-gradient(140deg, hsl(${h} 45% 62%), hsl(${h + 12} 40% 42%))` }}
    />
  )
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
        active ? 'bg-white text-ink shadow-sm ring-1 ring-paper-line' : 'text-ink-muted hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}

function SidebarIcon({ icon, label, active, as: Comp = 'button', className = '', ...props }) {
  return (
    <Comp
      title={label}
      aria-label={label}
      className={`flex h-11 w-11 items-center justify-center rounded-xl2 transition-colors ${
        active ? 'bg-clay text-white' : 'text-ink-muted hover:bg-white hover:text-ink'
      } ${className}`}
      {...props}
    >
      <StepIcon name={icon} className="h-5 w-5" />
    </Comp>
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
