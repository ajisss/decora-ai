import { useNavigate } from 'react-router-dom'
import AppShell from '../components/shell/AppShell.jsx'
import { StepIcon } from '../components/icons.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import { content } from '../content.js'

const t = content.app.vendors

// Vendor Marketplace (mock, uiuxcontext P2) — data contoh dari content.js,
// tombol kontak hanya menampilkan toast demo. Siap ditukar API vendor asli.
export default function VendorsPage() {
  const { showToast } = useToast()
  const navigate = useNavigate()

  return (
    <AppShell>
      <div className="mx-auto max-w-[1152px] px-6 py-12">
        <button type="button" onClick={() => navigate(-1)} className="mb-4 text-sm font-medium text-ink-soft hover:text-ink">
          {t.backToStudio}
        </button>
        <h1 className="font-display text-3xl font-semibold text-ink">{t.title}</h1>
        <p className="mt-2 text-sm text-ink-muted">{t.sub}</p>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {t.list.map((v) => (
            <div key={v.name} className="rounded-xl2 border border-paper-line bg-paper p-6">
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl2 bg-clay-soft text-clay-deep">
                  <StepIcon name="store" className="h-5 w-5" />
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-paper-soft px-2 py-1 text-xs font-medium text-ink-soft">
                  <StepIcon name="star" className="h-3 w-3 fill-clay text-clay" /> {v.rating}
                </span>
              </div>
              <h2 className="mt-3 font-display text-lg font-semibold text-ink">{v.name}</h2>
              <p className="text-sm text-ink-muted">{v.city} · {v.projects}+ proyek</p>
              <p className="mt-2 text-sm text-ink-soft">
                <span className="text-ink-muted">{t.specialty}:</span> {v.specialty}
              </p>
              <button
                type="button"
                onClick={() => showToast(t.contacted)}
                className="btn-ghost mt-4 w-full !py-2 text-sm"
              >
                {t.contact}
              </button>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
