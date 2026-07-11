import { useState } from 'react'
import SectionHeading from './SectionHeading.jsx'

export default function FAQ({ data }) {
  const [open, setOpen] = useState(0)
  return (
    <section id="faq" className="scroll-mt-20 border-t border-paper-line bg-paper-soft section-y">
      <div className="container-content max-w-3xl">
        <SectionHeading title={data.title} />
        <div className="mt-16 divide-y divide-paper-line overflow-hidden rounded-xl2 border border-paper-line bg-white">
          {data.items.map((item, i) => {
            const isOpen = open === i
            return (
              <div key={item.q}>
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="text-[15px] font-semibold text-ink">{item.q}</span>
                  <span
                    className={`shrink-0 text-xl leading-none text-clay transition-transform ${
                      isOpen ? 'rotate-45' : ''
                    }`}
                    aria-hidden="true"
                  >
                    +
                  </span>
                </button>
                <div
                  className={`grid transition-all duration-300 ease-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-[15px] leading-relaxed text-ink-soft">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
