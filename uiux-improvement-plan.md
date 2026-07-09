# Decor-AI — UIUX Improvement Plan & Review

Hasil review seluruh flow (landing → login → wizard → studio → analisis → ekspor) terhadap `uiuxcontext.md` sebagai single source of truth, beserta perbaikan yang sudah diimplementasikan. Dokumen ini adalah catatan audit + keputusan desain — bukan spec baru; spec perilaku tetap di `ux-spec.md`.

---

## 1. Ringkasan Audit

Audit dilakukan per aturan di uiuxcontext.md. Status: ✅ sudah diperbaiki di sesi ini · ⚠ deviasi yang disengaja (dengan alasan) · ⏳ masa depan.

| # | Aturan (uiuxcontext.md) | Temuan sebelum | Status |
|---|---|---|---|
| 1 | Satu pengalaman produk konsisten | Landing bahasa Indonesia, seluruh app bahasa Inggris — bahasa "flip" di tengah journey; blok `content.studio` (ID) mati tak terpakai | ✅ Seluruh app kini bahasa Indonesia lewat `content.app` di `content.js`; blok mati dihapus |
| 2 | §9 CTA utama landing = masuk ke produk | Hero "Coba Generate Gratis" dan Nav "Coba" dua-duanya cuma scroll ke anchor `#generator` — CTA paling menonjol tidak pernah membawa user ke produk | ✅ Hero & Nav → **"Buat Desain Wedding"** → `/login` (atau `/projects/new` kalau sudah login); teaser tetap sebagai jalur sekunder |
| 3 | §11 Empty state = ilustrasi + penjelasan + CTA | Library: teks+CTA tanpa ilustrasi; feed Studio: teks polos; hasil analisis kosong: teks polos | ✅ Komponen `EmptyState` (ilustrasi line-art SVG inline, gaya token existing) dipakai di ketiganya |
| 4 | §13 Success state di aksi penting | Hanya ada toast delete-undo, ekspor, setup-updated. "Proyek tersimpan", "Desain berhasil dibuat", "Analisis selesai" tidak ada feedback visual (cuma aria-live sr-only) | ✅ Toast ditambahkan: Proyek tersimpan ✓ · Desain berhasil dibuat ✓ · Analisis selesai ✓ · Gambar item selesai ✓ |
| 5 | §5.6 Satu aksi utama per layar | Di Studio, tombol Generate (primer) bersaing dengan Analisis/Ekspor/Referensi di tiap kartu — tidak ada aksi utama yang jelas | ✅ Tombol **Analisis di desain terbaru yang belum dianalisis** kini tampil primer (terisi); kartu lain tetap ghost. Alur terarah: Generate → Analisis → Ekspor |
| 6 | §10 Jelaskan proses menunggu | Generate sudah ada elapsed counter; fase analisis cuma skeleton tanpa keterangan | ✅ Baris "Menganalisis… ±15 detik" + spinner di atas skeleton |
| 7 | §8 IA memuat Settings | Route settings tidak ada | ✅ `/settings`: profil (nama/email, mock), info aplikasi, keluar |
| 8 | §9 Kategori analisis termasuk VIP Chairs | Taksonomi tidak punya "VIP Chairs" | ✅ Ditambahkan (additive) di enum server + urutan tampil client |
| 9 | Terasa seperti SaaS proper | Tidak ada login/akun sama sekali | ✅ Mock auth: halaman login/daftar, gate route app, avatar + menu user, logout |
| 10 | Kebersihan navigasi | `ProjectsPage` pakai `<a>` mentah + preventDefault | ✅ Diganti `<Link>` |

---

## 2. Yang Dibangun

### 2.1 Mock Login → SaaS shell
- **`/login`** — kartu login bermerek (token paper/clay, judul Fraunces): email + kata sandi, "Lanjutkan dengan Google" (mock), toggle Masuk ⇄ Daftar. Kredensial apa pun diterima (demo); sesi di `localStorage['decor-ai:session']`.
- **Gate**: `/projects`, `/projects/new`, `/studio/:id`, `/settings` dibungkus `RequireAuth` — belum login → redirect `/login` lalu balik ke halaman asal. Landing tetap publik.
- **App shell**: avatar inisial di kanan atas → menu Pengaturan / Keluar.
- Kontrak `AuthContext` (login/loginWithGoogle/logout/updateProfile) siap ditukar implementasi asli tanpa menyentuh komponen.

### 2.2 Halaman Pengaturan (`/settings`)
Profil (nama/email tersimpan ke sesi), info aplikasi (batas generate harian, bahasa), tombol Keluar. Sengaja minimal (uiuxcontext §16: no overengineering).

### 2.3 Lokalisasi Indonesia
- Semua string layar app pindah ke `content.app` di `src/content.js` (pola terpusat yang sama dengan landing) — library, wizard, studio, panel analisis, dialog ekspor, settings, login, not-found, sync indicator, pesan error client & server, dan label PDF brief ("Detail Pernikahan", "Checklist Dekorasi").
- Blok `content.studio` lama (kode mati) dihapus.

### 2.4 Empty state, toast, waiting, aksi utama
Lihat tabel audit #3–#6. Komponen baru: `src/components/ui/EmptyState.jsx` (2 varian ilustrasi: kanvas & checklist).

---

## 3. Deviasi yang Disengaja

| Deviasi | Alasan |
|---|---|
| **Prompt generate tetap bahasa Inggris** (nilai chip tema/venue/gaya, template prompt di server) | Kualitas output image model lebih konsisten dengan prompt EN. Yang dilokalisasi hanya label UI. User tidak pernah diminta menulis prompt (§5.1) — jadi bahasa prompt internal tidak mengubah pengalaman. |
| **Kategori "Reception Desk" & "Chairs" tidak di-rename** ke "Reception"/"Guest Chairs" versi uiuxcontext | Rename memutus data lama: item tersimpan dengan kategori lama tidak akan cocok dengan daftar tampil dan hilang dari checklist user. "VIP Chairs" ditambahkan karena additive (aman). |
| **Nama kategori checklist tampil dalam EN** (Stage, Backdrop, …) | Nilai kategori = enum data yang dipakai server (JSON schema) dan tersimpan di project. Menerjemahkan tampilannya butuh peta label ID→EN — kandidat perbaikan berikutnya (lihat §5), tidak menghalangi flow. |
| **Chip "Custom…" tetap** (bukan "Kustom…") | Nilainya dipakai sebagai sentinel perbandingan (`=== 'Custom…'`) dan tersimpan di draft sessionStorage; mengganti akan mematahkan draft lama. Kosmetik murni. |

---

## 4. Peta Flow Sesudah Perbaikan

```
Landing (publik, ID)
  └─ "Buat Desain Wedding" ──► /login (mock; daftar/masuk/Google)
                                  └─► /projects (gate)
                                        ├─ EmptyState → Proyek baru
                                        └─ /projects/new (wizard, ID)
                                              └─ Pratinjau prompt → Buat desain ✦
                                                    └─► /studio/:id
                                                          ├─ toast "Proyek tersimpan ✓"
                                                          ├─ generate (elapsed + patience)
                                                          ├─ toast "Desain berhasil dibuat ✓"
                                                          ├─ [AKSI UTAMA] Analisis (primer di desain terbaru)
                                                          │     └─ panel: Menganalisis… ±15 dtk → checklist
                                                          │           └─ toast "Analisis selesai ✓"
                                                          │           └─ gambar per item (mock) + kustomisasi
                                                          └─ Ekspor → PNG / PDF brief (label ID)
Avatar → Pengaturan / Keluar (logout → landing; gate aktif lagi)
```

---

## 5. Gelombang 2 — Full SaaS (semua mock, ✅ selesai)

Seluruh kandidat P2 dari plan.md + uiuxcontext.md dikerjakan dengan data mock (nol kredit AI):

| Fitur | Implementasi |
|---|---|
| ✅ **Mode MOCK_AI** | `MOCK_AI=true` di `.env` (default): generate mengembalikan foto wedding asli (Wikimedia, rotasi 5 foto, delay 2.5–5 dtk) dan analisis mengembalikan checklist kanonik 8 item — seluruh golden path jalan tanpa kie.ai. Set `false` untuk AI sungguhan. `server/lib/mockAi.js` |
| ✅ **Label kategori ID** | Peta `categoryLabels` di `content.app.analyze` — tampilan panel + PDF ("Panggung", "Kursi VIP", …); nilai data tetap EN |
| ✅ **Estimasi biaya per item** | Field biaya (Rp) di mode edit item, chip tampilan, "Estimasi total" di panel + di PDF brief |
| ✅ **Favorit desain** | Bintang di header tiap kartu desain (persisted di project) |
| ✅ **Bandingkan Versi** (P2 uiuxcontext) | Tombol "Bandingkan" per desain → pilih 2 → modal side-by-side |
| ✅ **Link berbagi** (P2 plan.md) | Opsi ke-3 di dialog Ekspor → salin URL `/share/:projectId/:generationId`; halaman publik lihat-saja (gambar + checklist + branding). Mock: tanpa kontrol akses |
| ✅ **Vendor Marketplace** (P2 uiuxcontext) | `/vendors`: 6 vendor contoh (kartu: kota, spesialisasi, rating), "Hubungi vendor" → toast demo. Link dari panel analisis ("Butuh vendor…?") |
| ✅ **Paket & Tagihan mock** | Seksi di Pengaturan: paket Gratis/Plus, upgrade/downgrade demo (tersimpan di sesi) |
| ✅ **Code-splitting** | Route lazy + jsPDF dynamic import — bundle utama 658 kB → **214 kB** (warning 500 kB hilang); tiap halaman jadi chunk kecil |

## 5b. Sisa untuk produksi sungguhan (bukan mock)

- **Auth asli** (email verification, OAuth, proyek per user di server) — `AuthContext` mock ini kontraknya.
- **Pembayaran asli** (billing Gratis/Plus sekarang demo di sesi).
- **Share link dengan kontrol akses** (token/expiry — sekarang siapa pun dengan URL bisa lihat).
- **Data vendor asli** + alur kontak sungguhan.
- **Ilustrasi empty state yang lebih kaya** — sekarang line-art SVG sederhana.

---

## 6. File yang Berubah

Baru: `src/context/AuthContext.jsx`, `src/pages/LoginPage.jsx`, `src/pages/SettingsPage.jsx`, `src/components/ui/EmptyState.jsx`.
Berubah: `src/App.jsx` (RequireAuth + route baru), `src/main.jsx`, `src/content.js` (blok `app`), `Nav/Hero`, `AppShell/SyncIndicator`, `ProjectsPage/WizardPage/StudioPage/NotFoundPage`, `AnalyzePanel/GenerationEntry/ExportDialog/buildBriefPdf`, sub-komponen wizard, `api/client.js`, `ProjectsContext`, `server/lib/vision.js` (+VIP Chairs), pesan error di `server/routes/*`.
