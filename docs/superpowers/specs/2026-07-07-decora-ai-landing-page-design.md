# Decora AI — Landing Page Design Spec

**Date:** 2026-07-07
**Status:** Approved
**Source:** PRD — Jasa Desain Dekorasi Wedding (Lean PRD v0.1, 6 Juli 2026)

## Ringkasan

Landing page untuk **Decora AI** — jasa desain aset dekorasi wedding (Design-as-a-Service, human + AI). Halaman melayani dua segmen lewat satu halaman dengan **toggle audience di hero**: B2B (wedding decorator profesional) dan B2C (calon pengantin / perencana sendiri). Copy di sepanjang halaman berubah sesuai segmen yang dipilih; struktur & proses tetap sama.

## Keputusan Kunci

| Aspek | Keputusan |
|---|---|
| Brand | Decora AI |
| Segmen | Dual-audience — toggle B2B ⇄ B2C |
| Stack | Vite + React + Tailwind CSS |
| Form | Visual only (non-fungsional, submit → pesan statis) |
| Mood visual | Clean minimal / SaaS-like — putih, whitespace, sans-serif, satu aksen warna |

## Value Proposition (dari PRD Section 4)

- **B2B (decorator):** "Serahkan brief klien, terima aset vector siap presentasi — tanpa nambah beban tim desain internal."
- **B2C (end user):** "Lihat dulu dekorasi impianmu dalam visual profesional, sebelum keluar budget booking vendor."

## Struktur Halaman

Urutan atas → bawah (mengikuti rekomendasi PRD Section 8):

1. **Nav** — logo "Decora AI", anchor links ke section, tombol CTA.
2. **Hero** — toggle audience (`Saya Decorator` ⇄ `Saya Calon Pengantin`); headline + subcopy + CTA berubah per pilihan.
3. **Problem framing** — 3 poin masalah per segmen (PRD Section 2).
4. **How it works** — service flow (PRD Section 5): Brief masuk → Triage & klarifikasi → Produksi (human + AI) → Preview → Revisi terbatas → Delivery final. Visual sama, copy nyesuain.
5. **Portfolio / galeri before-after** — grid gambar placeholder. Ditandai PRD sebagai bukti utama karena tidak ada produk self-serve.
6. **Pricing** — kartu paket berbeda per segmen (PRD Section 6): Starter, Pro, Rush, Custom/Retainer. Tampilkan subset relevan per toggle.
7. **Testimoni** — dipisah per segmen (kredibilitas yang dicari beda).
8. **FAQ** — jawab keberatan spesifik per segmen (decorator: "apakah aset ini eksklusif buat saya?"; end user: "apakah ini menggantikan jasa decorator?").
9. **Brief form (CTA)** — form visual: gaya/budaya, elemen wajib, upload referensi (opsional), budget range, deadline. Submit menampilkan pesan terima kasih statis; tidak ada backend.
10. **Footer** — brand, kontak placeholder, catatan hak cipta.

## Arsitektur Kode

- `src/content.js` — seluruh copy dalam satu objek, dikunci per audience (`b2b` / `b2c`). Section yang copy-nya sama antar segmen disimpan sebagai shared. Satu sumber kebenaran untuk teks → gampang di-edit tanpa nyentuh komponen.
- `src/App.jsx` — memegang state `audience` (`'b2b' | 'b2c'`, default `'b2b'` sesuai rekomendasi PRD). Melewatkan `audience` + slice konten yang relevan ke tiap section via props.
- `src/components/` — satu file per section: `Nav`, `Hero`, `ProblemFraming`, `HowItWorks`, `Portfolio`, `Pricing`, `Testimonials`, `FAQ`, `BriefForm`, `Footer`. Tiap komponen menerima props, tidak memegang state global sendiri (kecuali UI lokal seperti FAQ accordion open/close).
- Styling: Tailwind CSS. Design token (warna netral + satu aksen, skala spacing/tipografi) didefinisikan di `tailwind.config.js` dan `src/index.css`.

### Data flow

```
App (audience state)
 ├─ Nav (audience, setAudience)      ← toggle juga bisa diakses dari nav (opsional)
 ├─ Hero (audience, setAudience, content[audience].hero)
 ├─ ProblemFraming (content[audience].problems)
 ├─ HowItWorks (content[audience].steps)
 ├─ Portfolio (content.shared.gallery)
 ├─ Pricing (content[audience].packages)
 ├─ Testimonials (content[audience].testimonials)
 ├─ FAQ (content[audience].faq)
 ├─ BriefForm (audience)             ← state form lokal, submit → pesan statis
 └─ Footer (content.shared.footer)
```

Perpindahan toggle hanya mengganti slice konten yang di-render; tidak ada fetch, tidak ada routing.

## Out of Scope

Sesuai PRD (Section 7) dan keputusan sesi ini:

- Backend / integrasi form beneran (email, WhatsApp, database).
- Software/tools self-serve, kolaborasi real-time, AR/3D preview, marketplace vendor/preset.
- SEO multi-halaman terpisah per funnel (PRD menyebut ini untuk fase serius; MVP cukup satu halaman).

## Kriteria Sukses (untuk implementasi ini)

- Halaman render bersih di desktop & mobile (responsive).
- Toggle audience mengganti copy di semua section terkait tanpa reload.
- Semua 10 section tampil dengan konten dari PRD (bukan lorem ipsum di copy utama; placeholder hanya untuk gambar galeri & foto testimoni).
- Form bisa diisi dan submit menampilkan pesan terima kasih statis.
- Estetika clean-minimal konsisten (palet, spacing, tipografi seragam).

## Amendemen — Pivot ke Self-Serve Generate (2026-07-07)

Berdasarkan klarifikasi konsep dari user (referensi: andalai.id, tapi generate gambar): produk **bukan** jasa "serahkan brief, tim kerjain", melainkan **self-serve** — user mengetik keinginan (gaya, budaya, elemen, budget) dan **AI langsung generate gambar dekorasi**. Model: **hybrid** — generate mandiri sebagai pintu masuk, opsi "dikerjain tim" sebagai upgrade untuk aset final rapi.

Perubahan pada implementasi:

- **Copy** di seluruh section direframe dari "serahkan brief" → "ketik keinginan, langsung jadi gambar" (kedua segmen).
- **Section baru `Generator`** (`src/components/Generator.jsx`) — demo interaktif **simulasi** (belum ada AI riil): textarea + chip gaya → tombol Generate → loading singkat → grid 4 gambar placeholder + CTA "Sempurnakan dengan tim". Ditempatkan tepat setelah Hero; CTA utama Hero & Nav mengarah ke sini.
- **How it works** direframe jadi alur self-serve: Tulis keinginan → AI generate → Utak-atik → Pakai buat vendor → (Opsional) Sempurnakan dengan tim.
- **Portfolio** direframe: `before/after` → `prompt/hasil` (contoh hasil generate).
- **Pricing** jadi hybrid: tier self-serve (Gratis/Plus untuk B2C; Pro/Team untuk B2B) + tier jasa ("Hasil/Aset Final — dikerjain tim").
- **BriefForm** (bawah) direposisi jadi form **upgrade ke tim**, tetap visual-only.
- Generator & form tetap non-fungsional (pra-validasi); note eksplisit "mesin generate AI masih dalam pengembangan".

## Amendemen — Generate Pindah ke Halaman Studio + Referensi Gambar (2026-07-07)

Perubahan lanjutan: tombol Generate di landing tidak lagi menampilkan hasil inline, melainkan **berpindah ke halaman terpisah `/studio`** supaya user fokus mengedit permintaan & melihat preview tanpa distraksi konten marketing. Ditambahkan juga kemampuan **upload gambar referensi** (opsional), bukan cuma menampilkan hasil.

- **Routing** ditambahkan (`react-router-dom`). `App.jsx` memegang state `audience` (dibagi lintas halaman) dan merender `<Routes>`: `/` → `LandingPage`, `/studio` → `StudioPage`.
- **`GeneratorTeaser`** (landing, menggantikan `Generator` lama) hanya menangkap input: prompt, chip gaya, dan referensi gambar. Tombol Generate memanggil `navigate('/studio', { state: { prompt, reference, audience, autorun: true } })` — tidak ada hasil ditampilkan di landing.
- **`StudioPage`** (`src/pages/StudioPage.jsx`): halaman fokus dua kolom — kiri edit (prompt, chip, upload referensi, tombol Generate/Generate lagi), kanan preview (empty/loading/hasil + lightbox). Auto-generate saat dibuka dari teaser (`state.autorun`).
- **`ReferenceImageInput`** (`src/components/generator/ReferenceImageInput.jsx`): upload file gambar → disimpan sebagai data URL di state (cukup untuk demo, ikut lewat `location.state` saat navigasi). Dipakai di teaser maupun studio.
- Komponen hasil (`ResultTile`, `EmptyState`) diekstrak ke `src/components/generator/` supaya dipakai bersama.
- **Catatan teknis penting**: efek autorun-on-mount awalnya memakai ref-guard sekali-jalan yang rusak oleh React StrictMode (setup→cleanup→setup di dev) — timer generate ke-cancel dan macet di "loading" selamanya. Diperbaiki dengan menaruh timer di dalam efek yang sama (bukan ref bersama) dan tanpa guard permanen, supaya re-setup StrictMode membuat timer baru yang benar.

## Amendemen — Hapus Toggle Dual-Audience, Satu Copy Netral (2026-07-07)

Toggle "Saya Decorator / Saya Calon Pengantin" dihapus sepenuhnya (Nav, Hero, header Studio). Semua section sekarang pakai **satu copy netral** yang nyambung buat decorator maupun calon pengantin sekaligus, bukan lagi konten yang berganti per segmen.

- `content.js` direstrukturisasi dari `{ b2b, b2c, shared }` menjadi objek flat tunggal (`content.hero`, `content.problems`, `content.packages`, dst) — tidak ada lagi indeks `content[audience]`.
- Pricing: 3 tier netral — **Gratis** (coba generate), **Plus** (langganan, generate lebih bebas), **Aset Final/Tim** (per-project, dikerjain tim). Bukan lagi 2 set tier terpisah per segmen.
- Testimoni & FAQ: digabung jadi satu list yang mencampur sudut pandang decorator dan calon pengantin (peran masing-masing sudah jelas dari nama/role di tiap testimoni, tidak perlu label segmen).
- Komponen `AudienceToggle.jsx` dihapus. Prop `audience`/`setAudience` dibuang dari `App.jsx`, `LandingPage.jsx`, `StudioPage.jsx`, `Nav.jsx`, `Hero.jsx`, `GeneratorTeaser.jsx`, `BriefForm.jsx`. `content.generator.placeholder` jadi satu string (bukan `{ b2b, b2c }`).
- Penamaan di `content.js` dirapikan: `steps` (header section "Cara kerja") menjadi `howItWorks`, dan daftar 6 langkah ikon (dulu `shared.steps`) menjadi `stepsList` — supaya tidak ambigu.

## Amendemen — Hapus Form Upgrade-ke-Tim (2026-07-07)

Section form "Upgrade ke tim" di bawah landing (`BriefForm.jsx`, `content.form`) dihapus. CTA yang tadinya mengarah ke situ ("Serahkan ke Tim" di Pricing, "Sempurnakan dengan tim" di Studio) dialihkan ke `#generator` / `/#generator` supaya tidak jadi link mati.

## Amendemen — Studio Diubah Jadi Workspace Ala AI Tool (2026-07-07)

Referensi: layout tool AI generator (sidebar ikon kiri, canvas besar tengah, bottom bar prompt, panel kanan Explore/History). Diadaptasi ke `/studio` dengan **tema tetap terang** konsisten dengan landing (bukan dark mode seperti referensi) — hanya struktur layout yang diadopsi, palet tetap paper/ink/clay.

- **Sidebar kiri** (`w-16`, hilang di bawah `md`): ikon Beranda (`Link to="/"`), Generate (aktif/highlight, non-klik karena representasi halaman saat ini), dan Riwayat (khusus mobile, `lg:hidden`, buka panel overlay).
- **Canvas tengah**: state idle menampilkan judul besar + hint (analog "Light Up Your Creation"), loading menampilkan skeleton, done menampilkan hasil generate ukuran besar (klik untuk lightbox) + kartu CTA upgrade ke tim.
- **Bottom bar** menggantikan card edit kiri sebelumnya: textarea prompt, pill referensi gambar (mode `compact` baru di `ReferenceImageInput`), chip gaya, tombol Generate/Generate lagi — semuanya dalam satu baris di bawah canvas, bukan panel terpisah.
- **Panel kanan** (`w-[340px]`, hilang di bawah `lg`, diganti tombol "Contoh & Riwayat" yang membuka overlay dari kanan): dua tab —
  - **Contoh**: reuse `content.gallery.items` sebagai galeri prompt inspirasi; klik salah satu langsung mengisi prompt (`useExamplePrompt`).
  - **Riwayat**: daftar hasil generate di sesi berjalan (state lokal `history`, tidak persisten), ditambah tiap kali generate selesai. Kosong → pesan `content.studio.historyEmpty`.
- Komponen `EmptyState.jsx` dihapus (state idle sekarang ditulis langsung di `StudioPage` sebagai judul besar, bukan kotak kosong generik).
- `ReferenceImageInput` mendapat prop `compact` — versi pill kecil (thumbnail bulat + tombol hapus ikon silang) untuk ditaruh di baris toolbar bottom bar, terpisah dari versi field penuh yang masih dipakai di `GeneratorTeaser`.

## Amendemen — Canvas Jadi Feed Generate, Bukan Satu Box yang Ditimpa (2026-07-07)

Referensi: tool AI generator yang menampilkan tiap generate sebagai entry baru (timestamp + prompt + status) di area canvas, bukan satu hasil yang tertimpa tiap kali generate ulang.

- State `status`/`seed`/`history` tunggal diganti satu state `entries` (array `{id, prompt, timestamp, status, percent, seed}`). Tiap `generate()` (`runGenerate`) nge-*prepend* entry baru berstatus `loading`, bukan mengganti satu nilai.
- **Progress simulasi**: `setInterval` menaikkan `percent` tiap 150ms (+12, dibatasi 95) selama entry `loading`, ditampilkan sebagai pill "Generating {percent}%" — meniru progress asli walau hasilnya tetap simulasi. Selesai di 1300ms lewat `setTimeout` terpisah yang men-set `status: 'done'`, `percent: 100`, dan `seed`.
- **Canvas** (`<main>`) merender daftar `entries` (terbaru di atas) sebagai feed: tiap entry menampilkan timestamp (`formatTimestamp`), teks prompt, lalu status loading ATAU thumbnail hasil (klik → lightbox). Kartu CTA "Sempurnakan dengan tim" cuma nempel di entry **paling baru** (`isLatest`) yang sudah `done`, supaya tidak berulang di tiap entry lama.
- State idle (`entries.length === 0`) tetap menampilkan judul besar + hint di tengah canvas, sama seperti sebelumnya.
- Tombol Generate di bottom bar disable selama ada entry berstatus `loading` (`isGenerating = entries.some(...)`), label berubah ke "Generate lagi" begitu minimal satu entry pernah dibuat.
- Tab **Riwayat** di panel kanan sekarang menyaring `entries` yang `status === 'done'` (bukan array terpisah) — satu sumber data yang sama dengan feed canvas.
