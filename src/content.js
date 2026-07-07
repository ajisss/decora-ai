// Semua copy landing page — satu versi netral, tanpa segmentasi audience.
// Konsep: self-serve — user ketik keinginan → AI generate gambar dekorasi.
// Opsi lanjut: "dikerjain tim" untuk aset final rapi (hybrid monetisasi).

export const content = {
  brand: 'Decora AI',
  nav: [
    { label: 'Coba', href: '#generator' },
    { label: 'Cara Kerja', href: '#cara-kerja' },
    { label: 'Contoh Hasil', href: '#portofolio' },
    { label: 'Harga', href: '#harga' },
    { label: 'FAQ', href: '#faq' },
  ],

  hero: {
    eyebrow: 'Desain Dekorasi Wedding, Dibantu AI',
    headline: 'Ketik dekorasi impianmu, lihat langsung jadi gambar.',
    sub: 'Masukin gaya, budaya, warna, dan budget yang kamu mau — AI langsung generate visualnya dalam hitungan detik. Buat dibayangkan matang, dipakai presentasi, atau negosiasi vendor. Butuh hasil final rapi? Serahkan ke tim.',
    ctaPrimary: 'Coba Generate Gratis',
    ctaSecondary: 'Lihat Contoh Hasil',
    stat: [
      { value: 'Langsung jadi', label: 'Ketik → gambar dalam detik' },
      { value: 'Paham budaya lokal', label: 'Gebyok, paes ageng, janur, dst' },
      { value: 'Upgrade ke tim', label: 'Untuk aset final siap pakai' },
    ],
  },

  problems: {
    eyebrow: 'Kenapa ini bantu kamu',
    title: 'Susah membayangkan hasil sebelum keluar budget.',
    items: [
      {
        title: 'Trial-error yang mahal',
        body: 'Susah membayangkan hasil dekorasi sebelum booking vendor atau presentasi ke klien. Sekarang tinggal ketik, kamu lihat bayangannya dulu — tanpa coba-coba mahal.',
      },
      {
        title: 'Susah bilang "aku mau seperti ini"',
        body: 'Butuh sesuatu yang bisa dipakai buat negosiasi atau presentasi, tanpa harus sewa decorator penuh dulu. Generate gambarnya sendiri, tunjukin langsung.',
      },
      {
        title: 'Referensi online sering gak nyambung',
        body: 'Pinterest & tools generic sering gak sesuai budget, gaya lokal, atau kombinasi budaya yang kamu mau — termasuk Jawa × modern. Di sini kamu tentukan sendiri.',
      },
    ],
  },

  howItWorks: {
    eyebrow: 'Cara kerja',
    title: 'Dari ketikan, jadi gambar nyata.',
    sub: 'Coba sepuasnya sampai nemu yang sreg. Butuh hasil final rapi? Serahkan ke tim.',
  },

  packages: {
    eyebrow: 'Paket & harga',
    title: 'Coba gratis, upgrade kalau butuh lebih.',
    sub: 'Mulai gratis buat generate sendiri. Volume rutin atau butuh hasil final rapi? Ada paket buat itu.',
    note: 'Halaman pra-validasi — harga di bawah ilustrasi, mesin generate masih dalam pengembangan.',
    plans: [
      {
        name: 'Gratis',
        price: 'Rp0',
        tagline: 'Coba generate dekorasi impianmu',
        featured: false,
        features: [
          'Beberapa generate per hari',
          'Gaya & budaya dasar',
          'Resolusi standar (ada watermark)',
          'Simpan hasil favorit',
        ],
        cta: 'Coba Gratis',
      },
      {
        name: 'Plus',
        price: 'Langganan bulanan',
        tagline: 'Generate lebih bebas, hasil lebih bagus',
        featured: true,
        features: [
          'Generate tanpa batas wajar',
          'Resolusi HD tanpa watermark',
          'Semua gaya & kombinasi budaya',
          'Riwayat & simpan banyak konsep',
        ],
        cta: 'Mulai Plus',
      },
      {
        name: 'Aset Final (Tim)',
        price: 'Per project',
        tagline: 'Dikerjain tim, siap presentasi & produksi',
        featured: false,
        features: [
          'Finalisasi jadi vector rapi berlayer',
          'Dikurasi pakem budaya oleh manusia',
          'Mockup presentasi siap pakai',
          'Revisi terbatas termasuk',
        ],
        cta: 'Serahkan ke Tim',
      },
    ],
  },

  testimonials: {
    eyebrow: 'Kata mereka',
    title: 'Dipakai buat bayangin hasil sebelum keluar budget.',
    items: [
      {
        quote: 'Aku ketik bayangan dekorasiku, langsung muncul gambarnya. Nunjukin ke vendor jadi gampang banget — gak perlu ribet jelasin.',
        name: 'Dinda & Bagas',
        role: 'Menikah 2026, Jawa × modern',
      },
      {
        quote: 'Tinggal ketik gaya yang klien mau, beberapa detik udah ada opsi visual buat presentasi. Yang final tinggal gue serahkan ke tim.',
        name: 'Rangga P.',
        role: 'Owner, studio dekorasi (Yogyakarta)',
      },
      {
        quote: 'Enaknya paham istilah adat. Ketik "paes ageng" langsung nyambung — gak keluar hasil ngawur kayak tools generic.',
        name: 'Sekar A.',
        role: 'Freelance wedding decorator',
      },
    ],
  },

  faq: {
    eyebrow: 'FAQ',
    title: 'Pertanyaan yang sering ditanyakan.',
    items: [
      {
        q: 'Ini beneran langsung jadi gambar?',
        a: 'Ya. Ketik gaya, budaya, warna, dan elemen yang kamu mau — AI menghasilkan visual dekorasinya dalam hitungan detik. Bisa diutak-atik dan generate ulang sampai pas.',
      },
      {
        q: 'Apakah ini menggantikan jasa decorator?',
        a: 'Bukan. Ini bantu kamu membayangkan matang dan presentasi/negosiasi lebih jelas. Eksekusi fisik tetap oleh vendor/decorator. Butuh hasil rapi siap produksi? Upgrade ke opsi tim.',
      },
      {
        q: 'Seberapa akurat dengan pakem budaya?',
        a: 'AI kami dilatih paham gaya & istilah lokal, jauh lebih nyambung dari tools generic. Untuk yang benar-benar pakem & siap produksi, opsi tim — manusia berpengalaman adat — jadi quality gate.',
      },
      {
        q: 'Bisa dipakai komersial?',
        a: 'Bisa. Hasil generate maupun aset final boleh dipakai untuk presentasi, proposal, maupun negosiasi ke klien atau vendor.',
      },
      {
        q: 'Kalau hasil generate belum pas gimana?',
        a: 'Ubah keinginanmu dan generate lagi — sepuasnya di paket berbayar. Atau serahkan ke tim untuk penyempurnaan oleh manusia.',
      },
    ],
  },

  form: {
    eyebrow: 'Upgrade ke tim',
    title: 'Mau hasil final dikerjain tim?',
    sub: 'Isi detail singkat. Tim ubah hasil generate-mu jadi aset rapi & pakem budaya, siap dipakai untuk presentasi maupun produksi.',
    submitLabel: 'Kirim Detail',
  },

  generator: {
    eyebrow: 'Coba sekarang',
    title: 'Tulis keinginanmu, lihat hasilnya.',
    sub: 'Makin detail — gaya, budaya, warna, elemen wajib — makin nyambung hasilnya.',
    placeholder: 'Contoh: pelaminan Jawa modern, dominan putih & emas, ada gebyok ukir & janur, nuansa hangat, budget menengah',
    chips: ['Jawa Klasik', 'Jawa × Modern', 'Rustic Garden', 'Sunda', 'Intimate', 'Nasional'],
    button: 'Generate',
    loading: 'AI lagi meracik konsepmu…',
    emptyHint: 'Tulis keinginanmu di sebelah kiri, hasilnya muncul di sini.',
    resultTitle: 'Hasil generate',
    resultHint: 'Suka hasilnya? Utak-atik lagi, atau sempurnakan dengan tim.',
    regenerate: 'Generate lagi',
    upgradeCta: 'Sempurnakan dengan tim',
    note: 'Hasil ini ilustratif — mesin generate AI masih dalam pengembangan. Daftar buat jadi yang pertama coba versi aslinya.',
  },

  reference: {
    label: 'Referensi gambar (opsional)',
    hint: 'Upload foto lokasi, Pinterest, atau referensi gaya yang kamu suka',
    add: 'Tambah gambar referensi',
    change: 'Ganti gambar',
    remove: 'Hapus',
  },

  studio: {
    backLabel: 'Kembali ke beranda',
    badge: 'Studio Generate',
    editTitle: 'Edit permintaan',
    previewTitle: 'Preview',
    autoGenerating: 'Membuat generate pertamamu…',
    emptyPromptHint: 'Belum ada permintaan. Tulis di sebelah kiri lalu tekan Generate.',
  },

  stepsList: [
    { icon: 'brief', title: 'Tulis keinginan', body: 'Ketik gaya, budaya, warna, elemen wajib, dan budget. Bisa pilih dari contoh gaya biar cepat.' },
    { icon: 'spark', title: 'AI generate gambar', body: 'Dalam hitungan detik, keluar beberapa opsi visual dekorasi yang paham gaya & istilah lokal.' },
    { icon: 'revise', title: 'Utak-atik langsung', body: 'Belum pas? Ubah keinginanmu dan generate ulang — sepuasnya sampai nemu yang sreg.' },
    { icon: 'deliver', title: 'Pakai buat vendor', body: 'Simpan gambar & mockup buat dibayangkan matang dan dipakai negosiasi dengan vendor.' },
    { icon: 'produce', title: 'Sempurnakan dengan tim', body: 'Opsional — upgrade biar dikerjain tim jadi aset rapi, dikurasi pakem budaya oleh manusia.', optional: true },
  ],

  gallery: {
    eyebrow: 'Contoh hasil',
    title: 'Dari ketikan singkat, jadi gambar.',
    sub: 'Beberapa contoh: tulis keinginanmu, keluar visual dekorasinya — tinggal pakai atau sempurnakan.',
    items: [
      { tag: 'Jawa Klasik', prompt: '"Gebyok + paes ageng, emas"', result: 'Pelaminan Jawa klasik' },
      { tag: 'Jawa × Modern', prompt: '"Panggung minimalis, putih"', result: 'Dekorasi modern' },
      { tag: 'Rustic Garden', prompt: '"Taman, kayu & bunga liar"', result: 'Dekorasi taman' },
      { tag: 'Sunda', prompt: '"Pelaminan Sunda, hangat"', result: 'Pelaminan Sunda' },
      { tag: 'Intimate', prompt: '"Intimate, lilin & putih"', result: 'Dekorasi intimate' },
      { tag: 'Nasional', prompt: '"Pelaminan megah, merah emas"', result: 'Pelaminan nasional' },
    ],
  },

  footer: {
    tagline: 'Ketik dekorasi impianmu, lihat langsung jadi gambar. Butuh hasil final rapi, tim siap bantu.',
    note: 'Status: pra-validasi. Halaman ini untuk mengukur minat. Generator & form belum aktif.',
  },
}
