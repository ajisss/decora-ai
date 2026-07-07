import { content } from '../content.js'

export default function Footer() {
  const { brand, footer, nav } = content
  return (
    <footer className="border-t border-paper-line bg-paper">
      <div className="container-content py-14">
        <div className="grid gap-8 md:grid-cols-2 md:items-start">
          <div className="max-w-sm">
            <div className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
              <span className="text-clay">✦</span>
              {brand}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">{footer.tagline}</p>
          </div>
          <nav className="flex flex-wrap gap-x-8 gap-y-3 md:justify-end">
            {nav.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-ink-muted transition-colors hover:text-ink"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-paper-line pt-6 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <span>© {2026} {brand}. Desain aset dekorasi wedding.</span>
          <span>{footer.note}</span>
        </div>
      </div>
    </footer>
  )
}
