import { useEffect, useState } from 'react'
import { content } from '../content.js'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors ${
        scrolled
          ? 'border-paper-line bg-paper/85 backdrop-blur'
          : 'border-transparent bg-paper'
      }`}
    >
      <div className="container-content flex h-16 items-center justify-between gap-4">
        <a href="#top" className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
          <span className="text-clay">✦</span>
          {content.brand}
        </a>

        <nav className="hidden items-center gap-7 md:flex">
          {content.nav.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-ink-muted transition-colors hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <a href="#generator" className="btn-primary">
          Coba
        </a>
      </div>
    </header>
  )
}
