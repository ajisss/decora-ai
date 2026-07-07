// Semua copy landing page, dikunci per audience.
// Konsep: self-serve — user ketik keinginan → AI generate gambar dekorasi.
// Opsi lanjut: "dikerjain tim" untuk aset final rapi (hybrid monetisasi).
// content.b2b = wedding decorator, content.b2c = calon pengantin / perencana sendiri.
// content.shared = elemen yang sama antar segmen.

export const AUDIENCES = {
  b2b: {
    id: 'b2b',
    label: 'Saya Decorator',
    short: 'Decorator',
  },
  b2c: {
    id: 'b2c',
    label: 'Saya Calon Pengantin',
    short: 'Calon Pengantin',
  },
}

export const content = {
  b2b: {
    hero: {
      eyebrow: 'Untuk Wedding Decorator',
      headline: 'Generate konsep dekorasi buat klien, dalam hitungan detik.',
      sub: 'Ketik gaya, budaya, dan elemen yang klien mau — AI langsung keluarkan visualnya. Butuh aset final rapi & pakem budaya? Tinggal upgrade, tim kami yang bereskan.',
      ctaPrimary: 'Coba Generate',
      ctaSecondary: 'Lihat Contoh Hasil',
      stat: [
        { value: 'Hitungan detik', label: 'Dari ketik ke gambar' },
        { value: 'Paham pakem', label: 'Gaya & istilah adat lokal' },
        { value: 'Upgrade ke tim', label: 'Untuk aset vector final' },
      ],
    },
    problems: {
      eyebrow: 'Kenapa ini bantu kamu',
      title: 'Kuat di lapangan, kepentok di visual digital cepat.',
      items: [
        {
          title: 'Moodboard makan waktu',
          body: 'Kamu kuat di motif, ornamen, dan komposisi fisik — tapi bikin visual digital cepat buat klien makan jam kerja. Sekarang cukup ketik, gambar keluar.',
        },
        {
          title: 'Jam ideation kepakai buat gambar',
          body: 'Waktu ideation & revisi visual harusnya buat closing klien. Generate opsi awal sendiri dalam detik, baru serahkan yang final ke tim kalau perlu.',
        },
        {
          title: 'Tools generic gak paham pakem',
          body: 'Generator AI biasa gak ngerti gebyok, paes ageng, janur kuning. Punya kami dilatih paham istilah & gaya lokal — hasilnya nyambung, bukan ngawur.',
        },
      ],
    },
    steps: {
      eyebrow: 'Cara kerja',
      title: 'Dari ketikan, jadi konsep siap presentasi.',
      sub: 'Generate sendiri untuk eksplorasi cepat. Butuh final rapi? Manusia jadi quality gate lewat opsi tim.',
    },
    packages: {
      eyebrow: 'Paket & harga',
      title: 'Generate sendiri, atau serahkan yang final ke tim.',
      sub: 'Mulai gratis. Volume rutin pakai langganan. Aset final rapi pakai opsi tim.',
      note: 'Halaman pra-validasi — harga di bawah ilustrasi, mesin generate masih dalam pengembangan.',
      plans: [
        {
          name: 'Pro',
          price: 'Langganan bulanan',
          tagline: 'Generate volume tinggi untuk studio & decorator',
          featured: true,
          features: [
            'Generate konsep tanpa batas wajar',
            'Resolusi HD tanpa watermark',
            'Semua gaya & budaya lokal',
            'Riwayat & simpan konsep klien',
          ],
          cta: 'Mulai Pro',
        },
        {
          name: 'Studio / Team',
          price: 'Nego per volume',
          tagline: 'Multi-seat untuk tim yang lebih besar',
          featured: false,
          features: [
            'Beberapa akun dalam satu tim',
            'Prioritas antrian generate',
            'Gaya kustom sesuai brand studio',
            'Dukungan onboarding',
          ],
          cta: 'Ajak Bicara',
        },
        {
          name: 'Aset Final (Tim)',
          price: 'Per project',
          tagline: 'Dikerjain tim jadi aset siap produksi',
          featured: false,
          features: [
            'Finalisasi jadi vector rapi berlayer',
            'Dikurasi pakem budaya oleh manusia',
            'Mockup presentasi buat klien',
            'Revisi terbatas termasuk',
          ],
          cta: 'Serahkan ke Tim',
        },
      ],
    },
    testimonials: {
      eyebrow: 'Kata decorator',
      title: 'Dipakai tim yang mau cepat presentasi, bukan gambar ulang.',
      items: [
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
      title: 'Pertanyaan yang sering ditanya decorator.',
      items: [
        {
          q: 'Hasilnya generate AI — seakurat apa pakem budayanya?',
          a: 'AI kami dilatih untuk paham gaya & istilah lokal, jadi hasilnya jauh lebih nyambung dari tools generic. Untuk yang benar-benar pakem & siap produksi, upgrade ke opsi tim — manusia berpengalaman adat jadi quality gate.',
        },
        {
          q: 'Bedanya generate sendiri vs dikerjain tim?',
          a: 'Generate sendiri: cepat, buat eksplorasi & presentasi awal, keluar gambar (PNG/HD). Dikerjain tim: aset vector rapi berlayer (SVG/AI/EPS/PDF), dikurasi pakem budaya, siap produksi.',
        },
        {
          q: 'Bisa dipakai komersial buat klien saya?',
          a: 'Bisa. Hasil generate maupun aset final boleh kamu pakai untuk presentasi dan proposal ke klien kamu.',
        },
        {
          q: 'Apakah kalian jualan langsung ke klien saya?',
          a: 'Tidak. Alat ini dan opsi tim posisinya di belakang layar untuk membantu kamu — bukan menggantikan hubungan kamu dengan klien.',
        },
      ],
    },
    form: {
      eyebrow: 'Upgrade ke tim',
      title: 'Mau aset final dikerjain tim?',
      sub: 'Isi detail singkat. Tim finalisasi hasil generate-mu jadi aset vector rapi & pakem budaya, siap produksi.',
      submitLabel: 'Kirim Detail',
    },
  },

  b2c: {
    hero: {
      eyebrow: 'Untuk Calon Pengantin & Perencana Sendiri',
      headline: 'Ketik dekorasi impianmu, lihat langsung jadi gambar.',
      sub: 'Masukin gaya, budaya, dan budget yang kamu mau — AI langsung tunjukin bayangannya. Buat dibayangkan matang & dipakai negosiasi vendor. Mau hasil final rapi? Serahkan ke tim.',
      ctaPrimary: 'Coba Generate Gratis',
      ctaSecondary: 'Lihat Contoh Hasil',
      stat: [
        { value: 'Langsung jadi', label: 'Ketik → gambar dalam detik' },
        { value: 'Sesuai budget', label: 'Bukan sekadar Pinterest' },
        { value: 'Siap buat vendor', label: 'Mockup buat negosiasi' },
      ],
    },
    problems: {
      eyebrow: 'Kenapa ini bantu kamu',
      title: 'Susah membayangkan hasil sebelum keluar budget.',
      items: [
        {
          title: 'Trial-error yang mahal',
          body: 'Atur pernikahan sendiri bikin susah membayangkan hasil dekorasi sebelum booking. Sekarang tinggal ketik, kamu lihat bayangannya dulu — tanpa coba-coba mahal.',
        },
        {
          title: 'Susah bilang "aku mau seperti ini"',
          body: 'Butuh sesuatu buat negosiasi ke vendor tanpa sewa decorator penuh. Generate gambarnya sendiri, tunjukin langsung ke vendor.',
        },
        {
          title: 'Referensi online sering gak nyambung',
          body: 'Pinterest sering gak sesuai budget, gaya lokal, atau kombinasi budaya yang kamu mau. Di sini kamu tentukan sendiri — termasuk Jawa × modern.',
        },
      ],
    },
    steps: {
      eyebrow: 'Cara kerja',
      title: 'Dari bayangan di kepala, jadi gambar nyata.',
      sub: 'Coba sepuasnya sampai nemu yang sreg. Mau hasil rapi buat vendor? Serahkan ke tim.',
    },
    packages: {
      eyebrow: 'Paket & harga',
      title: 'Coba gratis, upgrade kalau butuh lebih.',
      sub: 'Mulai gratis. Mau lebih banyak & tanpa watermark, ambil Plus. Mau hasil final rapi, serahkan ke tim.',
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
            'Riwayat & bandingkan konsep',
          ],
          cta: 'Mulai Plus',
        },
        {
          name: 'Hasil Final (Tim)',
          price: 'Per project',
          tagline: 'Dirapiin tim, siap dipakai negosiasi',
          featured: false,
          features: [
            'Mockup presentasi rapi buat vendor',
            'Dikurasi sesuai gaya & budaya kamu',
            'Sentuhan manusia, bukan cuma AI',
            'Revisi termasuk',
          ],
          cta: 'Serahkan ke Tim',
        },
      ],
    },
    testimonials: {
      eyebrow: 'Kata pasangan',
      title: 'Bantu pasangan bayangin harinya sebelum keluar DP.',
      items: [
        {
          quote: 'Aku ketik bayangan dekorasiku, langsung muncul gambarnya. Nunjukin ke vendor jadi gampang banget — gak perlu ribet jelasin.',
          name: 'Dinda & Bagas',
          role: 'Menikah 2026, Jawa × modern',
        },
        {
          quote: 'Coba-coba sendiri dulu sampai nemu yang sreg, baru upgrade biar dirapiin tim. Hemat dan gak buta lagi soal hasil akhir.',
          name: 'Nabila R.',
          role: 'Atur pernikahan sendiri',
        },
      ],
    },
    faq: {
      eyebrow: 'FAQ',
      title: 'Pertanyaan yang sering ditanya calon pengantin.',
      items: [
        {
          q: 'Ini beneran langsung jadi gambar?',
          a: 'Ya. Kamu ketik keinginanmu — gaya, budaya, warna, elemen — dan AI menghasilkan visual dekorasinya dalam hitungan detik. Bisa kamu utak-atik dan generate ulang sampai pas.',
        },
        {
          q: 'Apakah ini menggantikan jasa decorator?',
          a: 'Bukan. Ini bantu kamu membayangkan matang & negosiasi lebih jelas dengan vendor. Eksekusi fisik tetap oleh vendor. Butuh hasil rapi buat vendor? Upgrade biar dikerjain tim.',
        },
        {
          q: 'Hasilnya bisa langsung dipakai ke vendor?',
          a: 'Bisa. Simpan gambarnya, atau upgrade ke versi mockup presentasi yang lebih rapi — siap dipakai buat ngobrol dan negosiasi dengan vendor.',
        },
        {
          q: 'Kalau hasil generate belum pas gimana?',
          a: 'Tinggal ubah keinginanmu dan generate lagi — sepuasnya di paket berbayar. Atau serahkan ke tim untuk penyempurnaan oleh manusia.',
        },
      ],
    },
    form: {
      eyebrow: 'Upgrade ke tim',
      title: 'Mau hasil final dirapiin tim?',
      sub: 'Isi detail singkat. Tim ubah bayanganmu jadi mockup presentasi rapi, siap dipakai negosiasi dengan vendor.',
      submitLabel: 'Kirim Detail',
    },
  },

  shared: {
    brand: 'Decora AI',
    nav: [
      { label: 'Coba', href: '#generator' },
      { label: 'Cara Kerja', href: '#cara-kerja' },
      { label: 'Contoh Hasil', href: '#portofolio' },
      { label: 'Harga', href: '#harga' },
      { label: 'FAQ', href: '#faq' },
    ],
    generator: {
      eyebrow: 'Coba sekarang',
      title: 'Tulis keinginanmu, lihat hasilnya.',
      sub: 'Makin detail — gaya, budaya, warna, elemen wajib — makin nyambung hasilnya.',
      placeholder: {
        b2b: 'Contoh: pelaminan Jawa modern buat klien, dominan putih & emas, ada gebyok ukir, nuansa hangat, budget menengah',
        b2c: 'Contoh: dekorasi impianku — Jawa × modern, warna putih & sage, ada janur & bunga segar, intimate, budget menengah',
      },
      chips: ['Jawa Klasik', 'Jawa × Modern', 'Rustic Garden', 'Sunda', 'Intimate', 'Nasional'],
      button: 'Generate',
      loading: 'AI lagi meracik konsepmu…',
      resultTitle: 'Hasil generate',
      resultHint: 'Suka hasilnya? Utak-atik lagi, atau sempurnakan dengan tim.',
      regenerate: 'Generate lagi',
      upgradeCta: 'Sempurnakan dengan tim',
      note: 'Hasil ini ilustratif — mesin generate AI masih dalam pengembangan. Daftar buat jadi yang pertama coba versi aslinya.',
    },
    steps: [
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
  },
}
