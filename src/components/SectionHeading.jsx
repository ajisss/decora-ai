export default function SectionHeading({ eyebrow, title, sub, center = true }) {
  return (
    <div className={`max-w-2xl ${center ? 'mx-auto text-center' : ''}`}>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 className="text-balance font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
        {title}
      </h2>
      {sub && <p className="text-pretty mt-4 text-lg leading-relaxed text-ink-soft">{sub}</p>}
    </div>
  )
}
