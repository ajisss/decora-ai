// Plan-mode advisor via kie.ai's OpenAI-compatible chat completions proxy —
// the same synchronous endpoint the vision analyzer uses (gemini-2.5-flash),
// here for free-text conversation instead of a JSON-schema vision call.
const CHAT_URL = 'https://api.kie.ai/gemini-2.5-flash/v1/chat/completions'

function apiKey() {
  const key = process.env.KIE_API_KEY
  if (!key) throw Object.assign(new Error('KIE_API_KEY is not configured'), { code: 'config' })
  return key
}

// The advisor speaks Indonesian, leans on the project's setup, honors adat
// specifics, and keeps turns short. When the concept is concrete enough to draw,
// it ends with a single `BRIEF:` line the client parses into a ready-to-run
// generation prompt (the "Pakai brief ini" affordance in Plan mode).
function systemPrompt(setup = {}) {
  const details = [
    setup.theme && `Tema: ${setup.theme}`,
    setup.style && `Gaya: ${setup.style}`,
    setup.venueType && `Venue: ${setup.venueType}`,
    setup.venueSize && `Ukuran: ${setup.venueSize}`,
    setup.guestCapacity && `Tamu: ${setup.guestCapacity}`,
    setup.budgetTier && `Budget: ${setup.budgetTier}`,
    setup.colorPalette?.length && `Palet: ${setup.colorPalette.join(', ')}`,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    'Kamu perencana dekorasi pernikahan Indonesia yang paham detail adat (gebyok, paes ageng, ' +
    'janur, Jawa, Sunda, Bali). Bantu pengguna matangkan konsep dekorasi lewat percakapan singkat. ' +
    'Jawab dalam Bahasa Indonesia, hangat tapi to the point, maksimal 2-4 kalimat. Ajukan pertanyaan ' +
    'klarifikasi kalau perlu, dan beri saran konkret (elemen, warna, tata letak) yang sesuai budaya. ' +
    'Jangan mengarang harga vendor. ' +
    (details ? `Konteks proyek — ${details}. ` : '') +
    'Kalau konsepnya sudah cukup jelas untuk digambar, akhiri balasanmu dengan SATU baris terpisah ' +
    'persis berformat "BRIEF: <deskripsi visual satu kalimat dalam Bahasa Indonesia>". Kalau belum ' +
    'cukup jelas, jangan tulis baris BRIEF sama sekali.'
  )
}

async function parseError(res) {
  const body = await res.json().catch(() => null)
  const message = body?.msg ?? body?.error?.message ?? `Plan request failed (${res.status})`
  if (res.status === 401) return Object.assign(new Error(message), { code: 'config' })
  return Object.assign(new Error(message), { code: 'upstream' })
}

// Given the prior conversation and the project setup, returns the advisor's next
// reply as plain text (may include a trailing `BRIEF:` line for the client to split).
export async function planReply(setup, history) {
  const messages = [
    { role: 'system', content: systemPrompt(setup) },
    ...history.map((m) => ({ role: m.role, content: m.text })),
  ]

  const res = await fetch(CHAT_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: 'gemini-2.5-flash', messages }),
  })
  if (!res.ok) throw await parseError(res)
  const data = await res.json()
  const text = data?.choices?.[0]?.message?.content?.trim()
  if (!text) throw Object.assign(new Error('Empty plan response'), { code: 'parse' })
  return text
}
