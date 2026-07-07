import { content } from '../content.js'
import SectionHeading from './SectionHeading.jsx'
import { StepIcon } from './icons.jsx'

export default function HowItWorks({ data }) {
  const steps = content.shared.steps
  return (
    <section id="cara-kerja" className="border-y border-paper-line bg-paper-soft py-20 md:py-28">
      <div className="container-content">
        <SectionHeading eyebrow={data.eyebrow} title={data.title} sub={data.sub} />
        <ol className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, i) => (
            <li
              key={step.title}
              className="group relative rounded-xl2 border border-paper-line bg-white p-6"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-clay-soft text-clay-deep">
                  <StepIcon name={step.icon} className="h-5 w-5" />
                </span>
                <span className="font-display text-sm font-semibold text-ink-muted">
                  Langkah {i + 1}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-ink">{step.title}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
