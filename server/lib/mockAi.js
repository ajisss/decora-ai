// Mode mock generate (MOCK_AI=true): generate desain jalan tanpa memanggil
// kie.ai — nol kredit. Mengembalikan foto wedding asli berlisensi bebas
// (Wikimedia Commons). Catatan: analisis TIDAK di-mock — selalu kie.ai asli
// (gemini-2.5-flash, murah) sesuai keputusan user; lihat routes/analyze.js.
import fs from 'node:fs/promises'
import path from 'node:path'
import { DATA_DIR } from './store.js'

// Pool foto dekorasi wedding nyata — dirotasi agar feed terlihat bervariasi.
const MOCK_DESIGN_IMAGES = [
  'Wedding_stage_decoration_in_thrissur_kerala.jpg',
  'Indoor_wedding_stage_decoration_in_Kerala.jpg',
  'Outdoor_Wedding_Chairs_2816px.jpg',
  "(Venice)_Ca'_Rezzonico_ballroom_chandelier.jpg",
  'Tropical_flower_arrangement_wedding.jpg',
]

// Cache di disk (bukan cuma memori) — sekali terunduh, mock tidak pernah
// menyentuh jaringan lagi, kebal rate-limit Wikimedia dan restart server.
const CACHE_DIR = path.join(DATA_DIR, 'mock-cache')
const memCache = new Map()
let rotation = 0

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function cachePath(filename) {
  return path.join(CACHE_DIR, filename.replace(/[^a-zA-Z0-9._-]/g, '_'))
}

async function loadCached(filename) {
  if (memCache.has(filename)) return memCache.get(filename)
  try {
    const buffer = await fs.readFile(cachePath(filename))
    memCache.set(filename, buffer)
    return buffer
  } catch {
    return null
  }
}

async function fetchCommons(filename) {
  const cached = await loadCached(filename)
  if (cached) return cached

  const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=1024`
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error(`mock image fetch failed (${res.status})`)
  const buffer = Buffer.from(await res.arrayBuffer())
  memCache.set(filename, buffer)
  await fs.mkdir(CACHE_DIR, { recursive: true })
  await fs.writeFile(cachePath(filename), buffer).catch(() => {})
  return buffer
}

// Upaya terakhir kalau semua kandidat Wikimedia gagal (mis. network Vercel
// tidak bisa reach Wikimedia sama sekali) — placeholder solid warna netral
// yang di-embed langsung di kode, bukan file di disk. Sebelumnya fallback ini
// baca folder data/images lokal, yang sekarang selalu kosong (gambar asli
// pindah ke Vercel Blob) dan filesystem-nya sendiri ephemeral di Vercel — jadi
// fallback lama itu dijamin gagal terus di sana. Mock tidak boleh gagal hanya
// karena jaringan/disk, harus selalu punya jalan keluar.
const PLACEHOLDER_IMAGE = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
)

// Generate mock: delay realistis singkat (latih UI pending), lalu foto asli.
// Urutan ketahanan: file rotasi → sisa pool → placeholder embedded.
export async function mockGenerateImage() {
  await delay(2500 + Math.random() * 2500)

  const start = rotation % MOCK_DESIGN_IMAGES.length
  rotation += 1
  for (let i = 0; i < MOCK_DESIGN_IMAGES.length; i++) {
    const filename = MOCK_DESIGN_IMAGES[(start + i) % MOCK_DESIGN_IMAGES.length]
    try {
      return await fetchCommons(filename)
    } catch {
      /* coba kandidat berikutnya */
    }
  }

  return PLACEHOLDER_IMAGE
}

export const MOCK_AI_ENABLED = process.env.MOCK_AI === 'true'
