import SectionHeading from './SectionHeading.jsx'

export default function Testimonials({ data }) {
  return (
    <section className="container-content py-20 md:py-28">
      <SectionHeading eyebrow={data.eyebrow} title={data.title} />
      <div className="mt-14 grid gap-6 md:grid-cols-2">
        {data.items.map((t) => (
          <figure
            key={t.name}
            className="flex flex-col rounded-xl2 border border-paper-line bg-white p-8"
          >
            <span className="font-display text-4xl leading-none text-clay/40">&ldquo;</span>
            <blockquote className="mt-2 flex-1 text-lg leading-relaxed text-ink">
              {t.quote}
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-clay-soft font-display text-sm font-semibold text-clay-deep">
                {t.name.charAt(0)}
              </span>
              <div>
                <div className="text-sm font-semibold text-ink">{t.name}</div>
                <div className="text-xs text-ink-muted">{t.role}</div>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
