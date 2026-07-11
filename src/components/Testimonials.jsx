import SectionHeading from './SectionHeading.jsx'

// Two audience columns (Calon Pengantin / Vendor & Decorator), each an outlined
// pill header over a stack of testimonial quote cards. Content is all user
// quotes — no use-case list items.

function highlightQuote(quote, phrase) {
  if (!phrase) return <>&ldquo;{quote}&rdquo;</>
  const idx = quote.indexOf(phrase)
  if (idx === -1) return <>&ldquo;{quote}&rdquo;</>
  return (
    <>
      &ldquo;{quote.slice(0, idx)}
      <mark className="rounded bg-clay-soft px-1 text-ink">{phrase}</mark>
      {quote.slice(idx + phrase.length)}&rdquo;
    </>
  )
}

function QuoteCard({ quote, highlight, name, role }) {
  return (
    <figure className="rounded-xl2 bg-paper-soft p-5">
      <span className="font-display text-3xl leading-none text-clay/60">&ldquo;</span>
      <blockquote className="mt-1 text-[15px] leading-relaxed text-ink">
        {highlightQuote(quote, highlight)}
      </blockquote>
      <figcaption className="mt-4 flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-clay-soft font-display text-xs font-semibold text-clay-deep">
          {name.charAt(0)}
        </span>
        <span className="text-sm leading-tight">
          <span className="font-semibold text-ink">{name}</span>
          <span className="block text-xs text-ink-muted">{role}</span>
        </span>
      </figcaption>
    </figure>
  )
}

export default function Testimonials({ data }) {
  return (
    <section className="container-content section-y">
      <SectionHeading title={data.title} />
      <div className="mx-auto mt-16 grid max-w-5xl gap-x-12 gap-y-12 md:grid-cols-2 md:gap-y-0">
        {data.columns.map((col) => (
          <div key={col.label} className="flex flex-col">
            <div className="mx-auto mb-8 w-fit rounded-full border border-ink/25 px-5 py-2 text-sm font-semibold text-ink">
              {col.label}
            </div>
            <div className="space-y-6">
              {col.items.map((q, i) => (
                <QuoteCard key={i} {...q} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
