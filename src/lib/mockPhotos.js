// Foto dekorasi wedding nyata (Wikimedia Commons, lisensi bebas) — pool yang
// sama persis dipakai server/lib/mockAi.js untuk mock generation. Dipakai di
// landing page (hero floaters, problem framing, portofolio) supaya apa yang
// dilihat calon user di landing konsisten dengan hasil mock yang keluar di app.
export const MOCK_PHOTOS = [
  'Wedding_stage_decoration_in_thrissur_kerala.jpg',
  'Indoor_wedding_stage_decoration_in_Kerala.jpg',
  'Outdoor_Wedding_Chairs_2816px.jpg',
  "(Venice)_Ca'_Rezzonico_ballroom_chandelier.jpg",
  'Tropical_flower_arrangement_wedding.jpg',
]

// width kecil untuk thumbnail (hero floaters), lebih besar untuk kartu.
export function mockPhotoUrl(filename, width = 800) {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=${width}`
}
