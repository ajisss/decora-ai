import { useEffect, useRef, useState } from 'react'
import { content } from '../content.js'
import { StepIcon } from './icons.jsx'
import HowItWorksVisual from './HowItWorksVisual.jsx'

const mqMobile = '(max-width: 1023px)'
const mqReduce = '(prefers-reduced-motion: reduce)'

function Breakdown({ items }) {
  return (
    <ul className="mt-3 space-y-1.5">
      {items.map((f) => (
        <li key={f} className="flex items-center gap-2 text-[13px] text-ink-soft">
          <span className="h-1 w-1 shrink-0 rounded-full bg-clay" />
          {f}
        </li>
      ))}
    </ul>
  )
}

// Desktop accordion row: icon + title, expanding to body + feature breakdown.
function StepItem({ step, open, onSelect }) {
  return (
    <li
      className={`rounded-xl2 transition-colors ${
        open ? 'bg-white shadow-sm ring-1 ring-paper-line' : 'hover:bg-white/60'
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-expanded={open}
        className="relative flex w-full items-center gap-3 rounded-xl2 p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-clay/40"
      >
        {open && <span className="absolute left-5 top-0 h-1 w-12 -translate-y-1/2 rounded-full bg-clay" />}
        <StepIcon name={step.icon} className={`h-5 w-5 shrink-0 ${open ? 'text-clay' : 'text-ink-muted'}`} />
        <span className={`font-semibold ${open ? 'text-ink' : 'text-ink-soft'}`}>{step.title}</span>
        {step.optional && (
          <span className="ml-auto rounded-full bg-ink/5 px-2 py-0.5 text-[11px] font-semibold text-ink-muted">
            Opsional
          </span>
        )}
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="pb-5 pl-[3.25rem] pr-5">
            <p className="text-[15px] leading-relaxed text-ink-soft">{step.body}</p>
            <Breakdown items={step.breakdown} />
          </div>
        </div>
      </div>
    </li>
  )
}

export default function HowItWorks({ data }) {
  const steps = content.stepsList
  const sectionRef = useRef(null)
  const [active, setActive] = useState(0)
  const [mobile, setMobile] = useState(() => window.matchMedia(mqMobile).matches)

  useEffect(() => {
    const m = window.matchMedia(mqMobile)
    const on = () => setMobile(m.matches)
    on()
    m.addEventListener?.('change', on)
    return () => m.removeEventListener?.('change', on)
  }, [])

  // Both viewports: the block is pinned across a tall scroll span and the active
  // step follows scroll position — scroll first, then the info changes.
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const el = sectionRef.current
      if (!el) return
      const totalScroll = el.offsetHeight - window.innerHeight
      if (totalScroll <= 0) return
      const sectionTop = el.getBoundingClientRect().top + window.scrollY
      const scrolled = Math.min(Math.max(window.scrollY - sectionTop, 0), totalScroll)
      const idx = Math.min(Math.floor((scrolled / totalScroll) * steps.length), steps.length - 1)
      setActive(idx)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    update()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [steps.length])

  const selectStep = (i) => {
    const el = sectionRef.current
    if (!el) return
    const totalScroll = el.offsetHeight - window.innerHeight
    const sectionTop = el.getBoundingClientRect().top + window.scrollY
    const reduced = window.matchMedia(mqReduce).matches
    window.scrollTo({
      top: sectionTop + ((i + 0.5) / steps.length) * totalScroll,
      behavior: reduced ? 'auto' : 'smooth',
    })
  }

  const step = steps[active]

  return (
    <section
      id="cara-kerja"
      ref={sectionRef}
      className="scroll-mt-20 border-y border-paper-line bg-paper-soft h-[380vh] lg:h-[450vh]"
    >
      <div className="sticky top-0 flex min-h-screen items-center">
        <div className="container-content w-full">
          {mobile ? (
            // Mobile: same interaction as desktop — pinned, scroll drives the
            // single active step. Compact one-column: heading, progress, the
            // active step's info, then its looping visual.
            <div className="flex flex-col">
              <h2 className="text-balance font-display text-3xl font-semibold tracking-tight text-ink">
                {data.titleLead}
                <span className="text-clay">{data.titleAccent}</span>
              </h2>

              <div className="mt-5 flex gap-1.5" aria-label="Langkah">
                {steps.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => selectStep(i)}
                    aria-label={`Langkah ${i + 1}`}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      i === active ? 'bg-clay' : 'bg-paper-line'
                    }`}
                  />
                ))}
              </div>

              <div className="mt-6">
                <div className="flex items-center gap-2.5">
                  <StepIcon name={step.icon} className="h-5 w-5 shrink-0 text-clay" />
                  <h3 className="font-display text-xl font-semibold text-ink">{step.title}</h3>
                  {step.optional && (
                    <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[11px] font-semibold text-ink-muted">
                      Opsional
                    </span>
                  )}
                </div>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{step.body}</p>
                <Breakdown items={step.breakdown} />
              </div>

              <div className="mt-6">
                <HowItWorksVisual active={active} />
              </div>
            </div>
          ) : (
            // Desktop: pinned two-column, scroll drives the active step.
            <div className="grid w-full items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <div className="flex flex-col">
                <h2 className="text-balance font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
                  {data.titleLead}
                  <span className="text-clay">{data.titleAccent}</span>
                </h2>
                <p className="text-pretty mt-4 max-w-md text-lg leading-relaxed text-ink-soft">{data.sub}</p>
                <ul className="mt-8 space-y-2">
                  {steps.map((s, i) => (
                    <StepItem key={s.title} step={s} open={active === i} onSelect={() => selectStep(i)} />
                  ))}
                </ul>
              </div>
              <HowItWorksVisual active={active} />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
