import { content } from '../content.js'
import SectionHeading from './SectionHeading.jsx'
import { StepIcon } from './icons.jsx'

// Placeholder visual: gradient + label (belum ada aset gambar riil).
// Tiap kartu menampilkan prompt → hasil generate untuk menegaskan alur self-serve.
export default function Portfolio() {
  const g = content.shared.gallery
  return (
    <section id="portofolio" className="container-content py-20 md:py-28">
      <SectionHeading eyebrow={g.eyebrow} title={g.title} sub={g.sub} />
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {g.items.map((item, i) => (
          <figure
            key={item.tag}
            className="overflow-hidden rounded-xl2 border border-paper-line bg-white"
          >
            <div className="grid grid-cols-2">
              <PlaceholderPane label={item.prompt} variant="before" seed={i} />
              <PlaceholderPane label={item.result} variant="after" seed={i} />
            </div>
            <figcaption className="flex items-center justify-between px-5 py-4">
              <span className="text-sm font-semibold text-ink">{item.tag}</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted">
                prompt <StepIcon name="arrow" className="h-3.5 w-3.5" /> hasil
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="mt-8 text-center text-sm text-ink-muted">
        Contoh visual bersifat ilustratif — aset portofolio riil menyusul.
      </p>
    </section>
  )
}

function PlaceholderPane({ label, variant, seed }) {
  const hues = [18, 12, 28, 8, 22, 15]
  const h = hues[seed % hues.length]
  const isAfter = variant === 'after'
  const bg = isAfter
    ? `linear-gradient(140deg, hsl(${h} 45% 62%), hsl(${h + 12} 40% 42%))`
    : `linear-gradient(140deg, hsl(${h} 12% 88%), hsl(${h} 10% 78%))`
  return (
    <div
      className="relative flex aspect-[4/5] items-end p-3"
      style={{ background: bg }}
    >
      <span
        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
          isAfter ? 'bg-white/90 text-ink' : 'bg-ink/10 text-ink-soft'
        }`}
      >
        {label}
      </span>
    </div>
  )
}
