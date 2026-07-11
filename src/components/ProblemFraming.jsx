import { useEffect, useRef, useState } from 'react'

const mqReduce = '(prefers-reduced-motion: reduce)'

// A single big heading that stays pinned while it fills from muted → ink, word
// by word, as you scroll. The section only releases (scrolls on to the next)
// once the whole heading is filled. Under reduced-motion it's a normal static
// section at full ink — no pin, no scroll-jack.
export default function ProblemFraming({ data }) {
  const ref = useRef(null)
  const [reduced, setReduced] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const m = window.matchMedia(mqReduce)
    const on = () => setReduced(m.matches)
    on()
    m.addEventListener?.('change', on)
    return () => m.removeEventListener?.('change', on)
  }, [])

  useEffect(() => {
    if (reduced) {
      setProgress(1)
      return
    }
    let raf = 0
    const update = () => {
      raf = 0
      const el = ref.current
      if (!el) return
      const totalScroll = el.offsetHeight - window.innerHeight
      if (totalScroll <= 0) {
        setProgress(1)
        return
      }
      const sectionTop = el.getBoundingClientRect().top + window.scrollY
      const scrolled = Math.min(Math.max(window.scrollY - sectionTop, 0), totalScroll)
      // Finish the fill by ~85% of the pinned scroll, so there's a beat of
      // full-ink hold before the section releases.
      setProgress(Math.min(1, scrolled / totalScroll / 0.85))
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
  }, [reduced])

  const leadWords = data.lead.split(' ')
  const bodyWords = data.body.split(' ')
  const total = leadWords.length + bodyWords.length

  // ink at 0.5 opacity reads as muted gray on white; 1 is full ink. Each word
  // crosses that range as the scroll progress sweeps past its position.
  const wordStyle = (globalIndex) => {
    const t = Math.max(0, Math.min(1, progress * total - globalIndex))
    return { opacity: 0.5 + 0.5 * t }
  }

  const block = (
    <div className="mx-auto max-w-4xl">
      <p className="text-balance font-display text-4xl font-semibold leading-[1.1] tracking-tight text-ink md:text-6xl">
        {leadWords.map((w, i) => (
          <span key={i} style={wordStyle(i)}>
            {w}{' '}
          </span>
        ))}
      </p>
      <p className="text-pretty mt-8 text-xl font-normal leading-relaxed text-ink md:text-2xl">
        {bodyWords.map((w, i) => (
          <span key={i} style={wordStyle(leadWords.length + i)}>
            {w}{' '}
          </span>
        ))}
      </p>
    </div>
  )

  if (reduced) {
    return (
      <section className="section-y">
        <div className="container-content">{block}</div>
      </section>
    )
  }

  return (
    <section ref={ref} className="relative h-[220vh]">
      <div className="sticky top-0 flex min-h-screen items-center">
        <div className="container-content w-full">{block}</div>
      </div>
    </section>
  )
}
