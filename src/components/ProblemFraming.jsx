import SectionHeading from './SectionHeading.jsx'

export default function ProblemFraming({ data }) {
  return (
    <section className="container-content py-20 md:py-28">
      <SectionHeading eyebrow={data.eyebrow} title={data.title} />
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {data.items.map((item, i) => (
          <div
            key={item.title}
            className="rounded-xl2 border border-paper-line bg-white p-7"
          >
            <span className="font-display text-sm font-semibold text-clay">
              0{i + 1}
            </span>
            <h3 className="mt-3 text-lg font-semibold text-ink">{item.title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
