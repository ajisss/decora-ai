import { useState } from 'react'
import { StepIcon } from './icons.jsx'

// Form visual-only: tidak ada backend. Submit menampilkan pesan terima kasih statis.
export default function BriefForm({ data }) {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <section id="brief" className="container-content py-20 md:py-28">
      <div className="mx-auto max-w-2xl rounded-xl2 border border-paper-line bg-white p-8 md:p-10">
        {submitted ? (
          <div className="py-8 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-clay-soft text-clay-deep">
              <StepIcon name="check" className="h-7 w-7" />
            </span>
            <h3 className="mt-5 font-display text-2xl font-semibold text-ink">
              Terima kasih! Brief kamu tercatat.
            </h3>
            <p className="mx-auto mt-3 max-w-md text-ink-soft">
              Ini halaman pra-validasi — tim akan menghubungi kamu untuk langkah berikutnya.
              Kalau briefnya masih abstrak, kami follow-up dengan beberapa pertanyaan dulu.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-6 text-sm font-semibold text-clay hover:text-clay-deep"
            >
              Kirim brief lain
            </button>
          </div>
        ) : (
          <>
            <div className="text-center">
              <p className="eyebrow mb-3">{data.eyebrow}</p>
              <h2 className="font-display text-3xl font-semibold text-ink">{data.title}</h2>
              <p className="mx-auto mt-3 max-w-md text-ink-soft">{data.sub}</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <Field label="Nama kamu" htmlFor="nama">
                <input id="nama" type="text" required className={inputClass} placeholder="Ketik di sini" />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Gaya / budaya" htmlFor="gaya">
                  <input id="gaya" type="text" className={inputClass} placeholder="Mis. Jawa × modern" />
                </Field>
                <Field label="Budget range" htmlFor="budget">
                  <select id="budget" className={inputClass} defaultValue="">
                    <option value="" disabled>Pilih rentang</option>
                    <option>&lt; 25 juta</option>
                    <option>25–50 juta</option>
                    <option>50–100 juta</option>
                    <option>&gt; 100 juta</option>
                  </select>
                </Field>
              </div>

              <Field label="Elemen wajib" htmlFor="elemen">
                <input id="elemen" type="text" className={inputClass} placeholder="Mis. pelaminan, gebyok, janur" />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Deadline" htmlFor="deadline">
                  <input id="deadline" type="text" className={inputClass} placeholder="Mis. 2 minggu lagi" />
                </Field>
                <Field label="Referensi (opsional)" htmlFor="ref">
                  <input id="ref" type="text" className={inputClass} placeholder="Link Pinterest / Instagram" />
                </Field>
              </div>

              <Field label="Catatan tambahan" htmlFor="catatan">
                <textarea id="catatan" rows={3} className={inputClass} placeholder="Ceritakan yang kamu bayangkan…" />
              </Field>

              <button type="submit" className="btn-primary w-full">
                {data.submitLabel}
              </button>
              <p className="text-center text-xs text-ink-muted">
                Belum ada pembayaran di tahap ini. Kami hubungi dulu untuk klarifikasi brief.
              </p>
            </form>
          </>
        )}
      </div>
    </section>
  )
}

const inputClass =
  'w-full rounded-lg border border-paper-line bg-paper-soft px-4 py-2.5 text-[15px] text-ink placeholder:text-ink-muted/70 focus:border-clay focus:bg-white focus:outline-none focus:ring-2 focus:ring-clay/20'

function Field({ label, htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-soft">{label}</span>
      {children}
    </label>
  )
}
