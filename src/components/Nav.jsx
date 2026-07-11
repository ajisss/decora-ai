import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { content } from '../content.js'
import { useAuth } from '../context/AuthContext.jsx'
import { StepIcon } from './icons.jsx'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile menu on Escape (open state only lingers while the panel is
  // actually shown — the panel itself is md:hidden).
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors ${
        open
          ? 'border-paper-line bg-paper'
          : scrolled
            ? 'border-paper-line bg-paper/85 backdrop-blur'
            : 'border-transparent bg-paper'
      }`}
    >
      <div className="container-content flex h-16 items-center justify-between gap-4">
        <a href="#top" className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
          <span className="text-clay">✦</span>
          {content.brand}
        </a>

        {/* Desktop nav */}
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

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <Link to="/projects" className="btn-primary">
              Buka Studio
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-ink-soft transition-colors hover:text-ink"
              >
                Masuk
              </Link>
              <Link to="/login" className="btn-primary">
                {content.hero.ctaPrimary}
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-lg text-ink transition-colors hover:bg-ink/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-clay/40 md:hidden"
        >
          {open ? (
            <StepIcon name="close" className="h-5 w-5" />
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <div id="mobile-menu" className="border-t border-paper-line md:hidden">
          <nav className="container-content flex flex-col py-3">
            {content.nav.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-3 text-[15px] font-medium text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
              >
                {l.label}
              </a>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-paper-line pt-4">
              {user ? (
                <Link to="/projects" onClick={() => setOpen(false)} className="btn-primary w-full">
                  Buka Studio
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="btn-ghost w-full"
                  >
                    Masuk
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="btn-primary w-full"
                  >
                    {content.hero.ctaPrimary}
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
