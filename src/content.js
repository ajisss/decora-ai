// Semua copy landing page, dikunci per audience.
// Sumber: PRD — Jasa Desain Dekorasi Wedding (Lean PRD v0.1).
// content.b2b = decorator profesional, content.b2c = calon pengantin / perencana sendiri.
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
      headline: 'Serahkan brief klien, terima aset vector siap presentasi.',
      sub: 'Tim kami (manusia + AI co-pilot) mengubah brief jadi moodboard & proposal visual yang paham pakem budaya lokal — tanpa nambah beban tim desain internal kamu.',
      ctaPrimary: 'Kirim Brief Pertama',
      ctaSecondary: 'Lihat Portofolio',
      stat: [
        { value: '3–5 hari', label: 'Rata-rata delivery' },
        { value: 'SVG/AI/EPS', label: 'File vector rapi berlayer' },
        { value: '1–2x', label: 'Revisi termasuk paket' },
      ],
    },
    problems: {
      eyebrow: 'Masalah yang kami selesaikan',
      title: 'Kuat di lapangan, kepentok di produksi visual digital.',
      items: [
        {
          title: 'Eksekusi jago, visual digital lambat',
          body: 'Kamu kuat di motif, ornamen, dan komposisi fisik — tapi bikin moodboard/proposal digital yang cepat buat klien makan waktu.',
        },
        {
          title: 'Jam ideation kepakai buat gambar',
          body: 'Waktu buat ideation & revisi visual harusnya dipakai buat closing klien atau produksi, bukan utak-atik file desain.',
        },
        {
          title: 'Freelance luar sering gak paham pakem',
          body: 'Outsource ke desainer biasa sering gak ngerti istilah lokal (gebyok, paes ageng, janur kuning), jadi malah nambah ronde revisi.',
        },
      ],
    },
    steps: {
      eyebrow: 'Cara kerja',
      title: 'Dari brief ke aset siap presentasi.',
      sub: 'Satu alur jasa, manusia tetap jadi quality gate — AI cuma akselerator kerja.',
    },
    packages: {
      eyebrow: 'Paket & harga',
      title: 'Transparan, per-project maupun langganan.',
      sub: 'Model per-project/jasa. Langganan bulanan tersedia untuk volume rutin.',
      note: 'Harga final menyesuaikan kompleksitas brief. Angka di bawah ilustrasi rentang awal.',
      plans: [
        {
          name: 'Pro',
          price: 'Langganan bulanan',
          tagline: 'Untuk studio & decorator dengan order rutin',
          featured: true,
          features: [
            'Bundel beberapa project / bulan',
            'Prioritas antrian produksi',
            'Revisi lebih fleksibel',
            'File vector berlayer (SVG/AI/EPS/PDF)',
          ],
          cta: 'Diskusikan Langganan',
        },
        {
          name: 'Rush',
          price: 'Harga premium',
          tagline: 'Deadline mepet, delivery dipercepat',
          featured: false,
          features: [
            'Antrian dipercepat',
            'Delivery prioritas',
            'Cocok untuk klien last-minute',
            'File vector siap presentasi',
          ],
          cta: 'Tanya Ketersediaan',
        },
        {
          name: 'Custom / Retainer',
          price: 'Nego per volume',
          tagline: 'Kerja sama jangka panjang volume tinggi',
          featured: false,
          features: [
            'Kerjasama jangka panjang',
            'Harga nego per volume',
            'SLA & kapasitas didedikasikan',
            'Alur brief yang dikustom',
          ],
          cta: 'Ajak Bicara',
        },
      ],
    },
    testimonials: {
      eyebrow: 'Kata decorator',
      title: 'Dipakai tim yang mau fokus closing, bukan gambar ulang.',
      items: [
        {
          quote: 'Brief klien tinggal gue teruskan, besoknya udah ada dua alternatif moodboard. Tim gue bisa balik fokus ke eksekusi lapangan.',
          name: 'Rangga P.',
          role: 'Owner, studio dekorasi (Yogyakarta)',
        },
        {
          quote: 'Yang bikin beda: mereka ngerti istilah adat. Gak perlu jelasin panjang apa itu paes ageng — hasilnya udah nyambung.',
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
          q: 'Apakah aset yang dibuat eksklusif buat saya?',
          a: 'Ya. Hasil delivery jadi milik kamu dan boleh dipakai komersial untuk klien kamu. Kami tidak menjual ulang aset yang sama ke pihak lain.',
        },
        {
          q: 'Apakah kalian akan jualan langsung ke klien saya?',
          a: 'Posisi kami adalah tim produksi visual di belakang layar untuk kamu. Fokus layanan B2B ini adalah membantu decorator, bukan menggantikan hubungan kamu dengan klien.',
        },
        {
          q: 'Gimana kalau hasilnya belum sesuai?',
          a: 'Tiap paket sudah termasuk revisi terbatas (biasanya 1–2x), termasuk revisi parsial per elemen seperti ganti warna bunga atau kurangi ornamen.',
        },
        {
          q: 'File akhirnya format apa?',
          a: 'File vector rapi berlayer: SVG, AI, EPS, dan PDF — siap dipakai untuk presentasi maupun produksi lanjutan.',
        },
      ],
    },
    form: {
      eyebrow: 'Mulai',
      title: 'Kirim brief pertama kamu.',
      sub: 'Isi singkat di bawah. Kalau briefnya masih abstrak, tim kami follow-up dengan 2–3 pertanyaan — bukan langsung nebak-nebak.',
      submitLabel: 'Kirim Brief',
    },
  },

  b2c: {
    hero: {
      eyebrow: 'Untuk Calon Pengantin & Perencana Sendiri',
      headline: 'Lihat dulu dekorasi impianmu, sebelum keluar budget booking vendor.',
      sub: 'Dapatkan visual dekorasi profesional sesuai gaya, budaya, dan budget kamu — buat dibayangkan matang dan dipakai negosiasi dengan vendor.',
      ctaPrimary: 'Mulai Visual Impianmu',
      ctaSecondary: 'Lihat Contoh Hasil',
      stat: [
        { value: 'Sesuai budget', label: 'Bukan sekadar referensi Pinterest' },
        { value: 'Gaya lokal', label: 'Termasuk kombinasi budaya' },
        { value: 'Mockup siap', label: 'Buat ngobrol sama vendor' },
      ],
    },
    problems: {
      eyebrow: 'Masalah yang kami selesaikan',
      title: 'Susah membayangkan hasil akhir sebelum booking.',
      items: [
        {
          title: 'Trial-error yang mahal',
          body: 'Atur pernikahan sendiri tanpa WO bikin kamu susah membayangkan hasil akhir dekorasi sebelum booking vendor — sering coba-coba yang makan biaya.',
        },
        {
          title: 'Susah bilang "saya mau seperti ini"',
          body: 'Kamu butuh sesuatu yang bisa dipakai buat negosiasi ke vendor tanpa harus menyewa decorator penuh yang lebih mahal.',
        },
        {
          title: 'Referensi online sering gak nyambung',
          body: 'Pinterest/Instagram sering gak sesuai budget, gaya lokal, atau kombinasi budaya yang kamu mau — misal Jawa x modern.',
        },
      ],
    },
    steps: {
      eyebrow: 'Cara kerja',
      title: 'Dari bayangan ke visual yang bisa kamu pegang.',
      sub: 'Manusia tetap jadi quality gate biar hasilnya nyambung sama gaya & budaya yang kamu mau.',
    },
    packages: {
      eyebrow: 'Paket & harga',
      title: 'Harga transparan, per-project.',
      sub: 'Bayar per project — gak perlu langganan, gak perlu sewa decorator penuh.',
      note: 'Harga final menyesuaikan kompleksitas permintaan. Angka di bawah ilustrasi rentang awal.',
      plans: [
        {
          name: 'Starter',
          price: 'Per project',
          tagline: 'Satu konsep dekorasi impianmu',
          featured: true,
          features: [
            '1 konsep visual dekorasi',
            '1x revisi termasuk',
            'Delivery 3–5 hari kerja',
            'Sesuai gaya, budaya & budget kamu',
          ],
          cta: 'Mulai Sekarang',
        },
        {
          name: 'Rush',
          price: 'Harga premium',
          tagline: 'Butuh cepat buat ketemu vendor minggu ini',
          featured: false,
          features: [
            'Delivery dipercepat',
            'Antrian prioritas',
            'Cocok kalau waktumu mepet',
            'Mockup siap dipakai negosiasi',
          ],
          cta: 'Tanya Ketersediaan',
        },
      ],
    },
    testimonials: {
      eyebrow: 'Kata pasangan',
      title: 'Bantu ribuan pasangan bayangin harinya sebelum keluar DP.',
      items: [
        {
          quote: 'Akhirnya bisa nunjukin ke vendor "aku mau yang seperti ini" tanpa ribet jelasin. Negonya jadi jauh lebih gampang.',
          name: 'Dinda & Bagas',
          role: 'Menikah 2026, Jawa x modern',
        },
        {
          quote: 'Sebelum booking, aku udah kebayang hasilnya kayak apa dan cocok sama budget. Gak ada lagi trial-error yang bikin boros.',
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
          q: 'Apakah ini menggantikan jasa decorator?',
          a: 'Bukan. Kami memberi visual dekorasi impianmu supaya kamu bisa membayangkan matang dan negosiasi lebih jelas dengan vendor/decorator pilihanmu. Eksekusi fisik tetap oleh vendor.',
        },
        {
          q: 'Bisa sesuai budget dan gaya budaya tertentu?',
          a: 'Bisa. Kamu isi gaya, elemen wajib, budget range, dan budaya yang kamu mau — termasuk kombinasi seperti Jawa x modern. Hasilnya disesuaikan, bukan sekadar template.',
        },
        {
          q: 'Hasilnya bisa langsung dipakai ke vendor?',
          a: 'Ya. Selain file visual, kamu dapat versi "mockup presentasi" yang siap dipakai buat ngobrol dan negosiasi dengan vendor.',
        },
        {
          q: 'Gimana kalau hasilnya belum pas?',
          a: 'Paket Starter sudah termasuk 1x revisi, termasuk revisi parsial per elemen seperti ganti warna bunga atau kurangi ornamen.',
        },
      ],
    },
    form: {
      eyebrow: 'Mulai',
      title: 'Ceritakan dekorasi impianmu.',
      sub: 'Isi singkat di bawah. Kalau masih bingung mau gaya apa, tim kami bantu arahkan dengan beberapa pertanyaan — bukan langsung nebak.',
      submitLabel: 'Kirim Permintaan',
    },
  },

  shared: {
    brand: 'Decora AI',
    nav: [
      { label: 'Cara Kerja', href: '#cara-kerja' },
      { label: 'Portofolio', href: '#portofolio' },
      { label: 'Harga', href: '#harga' },
      { label: 'FAQ', href: '#faq' },
    ],
    // Ikon direpresentasikan sebagai key; komponen memetakan ke SVG.
    steps: [
      { icon: 'brief', title: 'Brief masuk', body: 'Kamu isi form: gaya/budaya, elemen wajib, referensi (opsional), budget range, dan deadline.' },
      { icon: 'triage', title: 'Triage & klarifikasi', body: 'Kalau brief masih abstrak, kami follow-up 2–3 pertanyaan atau opsi arah — bukan tebak-tebakan.' },
      { icon: 'produce', title: 'Produksi (manusia + AI)', body: 'Tim menyusun 2 alternatif konsep. AI bantu eksplorasi mood, manusia jadi quality gate.' },
      { icon: 'preview', title: 'Preview', body: 'Kamu lihat draft dan kasih feedback. Semua diskusi lewat satu alur yang jelas.' },
      { icon: 'revise', title: 'Revisi terbatas', body: 'Sesuai paket (biasanya 1–2x), termasuk revisi parsial per elemen: ganti warna, kurangi ornamen.' },
      { icon: 'deliver', title: 'Delivery final', body: 'File vector rapi berlayer (SVG/AI/EPS/PDF), plus versi mockup presentasi bila diperlukan.' },
    ],
    gallery: {
      eyebrow: 'Portofolio',
      title: 'Bukti hasil, before → after.',
      sub: 'Dari brief kasar & referensi mentah, jadi aset visual profesional siap presentasi.',
      items: [
        { tag: 'Jawa Klasik', before: 'Brief & referensi', after: 'Gebyok + paes ageng' },
        { tag: 'Jawa × Modern', before: 'Moodboard kasar', after: 'Panggung minimalis' },
        { tag: 'Rustic Garden', before: 'Foto lokasi', after: 'Dekorasi taman' },
        { tag: 'Sunda', before: 'Catatan budget', after: 'Pelaminan Sunda' },
        { tag: 'Intimate', before: 'Referensi Pinterest', after: 'Dekorasi intimate' },
        { tag: 'Nasional', before: 'Coretan konsep', after: 'Pelaminan megah' },
      ],
    },
    footer: {
      tagline: 'Satu proses jasa, dua pintu masuk. Desain aset dekorasi wedding — manusia + AI.',
      note: 'Status: pra-validasi. Halaman ini untuk mengukur minat. Form belum aktif.',
    },
  },
}
