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
