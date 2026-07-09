import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function HeroCta({ label }) {
  const { user } = useAuth()
  return (
    <Link to={user ? '/projects/new' : '/login'} state={user ? undefined : { from: '/projects/new' }} className="btn-primary w-full sm:w-auto">
      {label}
    </Link>
  )
}

export default function Hero({ data }) {
  return (
    <section id="top" className="relative overflow-hidden bg-paper-soft">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(50% 40% at 80% 0%, rgba(192,95,60,0.10), transparent 70%), radial-gradient(40% 40% at 0% 100%, rgba(192,95,60,0.06), transparent 70%)',
        }}
      />
      <div className="container-content relative py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow mb-4">{data.eyebrow}</p>
          <h1 className="font-display text-4xl font-semibold leading-[1.1] text-ink md:text-6xl">
            {data.headline}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
            {data.sub}
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {/* CTA utama masuk ke aplikasi (uiuxcontext §9) — gate login yang
                mengarahkan user baru ke daftar/masuk lalu lanjut ke wizard. */}
            <HeroCta label={data.ctaPrimary} />
            <a href="#portofolio" className="btn-ghost w-full sm:w-auto">
              {data.ctaSecondary}
            </a>
          </div>
        </div>

        <dl className="mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-px overflow-hidden rounded-xl2 border border-paper-line bg-paper-line sm:grid-cols-3">
          {data.stat.map((s) => (
            <div key={s.label} className="bg-white px-6 py-6 text-center">
              <dt className="font-display text-2xl font-semibold text-ink">{s.value}</dt>
              <dd className="mt-1 text-sm text-ink-muted">{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
