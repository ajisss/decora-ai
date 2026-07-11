import SectionHeading from './SectionHeading.jsx'
import { StepIcon } from './icons.jsx'

export default function Pricing({ data }) {
  const cols = data.plans.length === 2 ? 'md:grid-cols-2 md:max-w-3xl md:mx-auto' : 'md:grid-cols-3'
  return (
    <section id="harga" className="scroll-mt-20 border-y border-paper-line bg-paper-soft section-y">
      <div className="container-content">
        <SectionHeading title={data.title} sub={data.sub} />
        <div className={`mt-16 grid gap-8 ${cols}`}>
          {data.plans.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col rounded-xl2 border p-7 ${
                plan.featured
                  ? 'border-clay bg-white shadow-[0_1px_0_0_theme(colors.clay.DEFAULT)] ring-1 ring-clay/30'
                  : 'border-paper-line bg-white'
              }`}
            >
              {plan.featured && (
                <span className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-clay-soft px-3 py-1 text-xs font-semibold text-clay-deep">
                  <StepIcon name="spark" className="h-3.5 w-3.5" /> Paling populer
                </span>
              )}
              <h3 className="font-display text-xl font-semibold text-ink">{plan.name}</h3>
              <p className="mt-1 text-sm text-ink-muted">{plan.tagline}</p>
              <p className="mt-4 font-display text-lg font-semibold text-clay-deep">{plan.price}</p>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[15px] text-ink-soft">
                    <StepIcon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-clay" />
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="#generator"
                className={`mt-7 ${plan.featured ? 'btn-primary' : 'btn-ghost'} w-full`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
