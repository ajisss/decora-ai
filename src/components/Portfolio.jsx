import { content } from '../content.js'
import SectionHeading from './SectionHeading.jsx'
import { MOCK_PHOTOS, mockPhotoUrl } from '../lib/mockPhotos.js'

// Two rows of three cards. Each card is one culture combination: a photo, the
// style cross (clay label), and the combo name. Photos are illustrative mock
// assets (shared MOCK_PHOTOS pool) until real generated results exist.
export default function Portfolio() {
  const g = content.gallery
  return (
    <section id="portofolio" className="scroll-mt-20 container-content section-y">
      <SectionHeading title={g.title} sub={g.sub} />

      <div className="mt-16 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {g.items.map((item) => (
          <figure key={item.name} className="flex flex-col">
            <div className="relative rounded-xl2 border border-paper-line bg-paper-soft p-4">
              {/* Minimalist corner ornament — clay L-brackets framing the photo
                  like a matted print, a quiet decorative border. */}
              <span className="pointer-events-none absolute left-2 top-2 h-4 w-4 border-l border-t border-clay/50" />
              <span className="pointer-events-none absolute right-2 top-2 h-4 w-4 border-r border-t border-clay/50" />
              <span className="pointer-events-none absolute bottom-2 left-2 h-4 w-4 border-b border-l border-clay/50" />
              <span className="pointer-events-none absolute bottom-2 right-2 h-4 w-4 border-b border-r border-clay/50" />
              <img
                src={mockPhotoUrl(MOCK_PHOTOS[item.photo], 600)}
                alt={`Dekorasi ${item.name}`}
                loading="lazy"
                className="aspect-[4/3] w-full rounded-md object-cover"
              />
            </div>
            <figcaption className="mt-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-clay-deep">
                {item.style}
              </p>
              <h3 className="mt-1.5 text-lg font-semibold text-ink">{item.name}</h3>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
