// SATU-SATUNYA fail yang perlu diubah untuk tukar harga, pautan, bukti atau nombor WhatsApp.
// Ubah melalui PR ke main; GitHub Actions terbit semula sendiri.
// Peraturan: jangan reka angka. Kalau bukti belum ada, biar senarai kosong; bahagian tu tersorok sendiri.

window.LAMAN = {
  nama: "Adiel Zainal",
  peranan: "Automasi AI untuk perniagaan · Pengasas SASS ONE",
  domain: "https://adielzainal.com", // dibeli 21 Nov 2026, DNS di Cloudflare
  emel: "",                         // isi "hello@adielzainal.com" SELEPAS Email Routing dipasang (Cloudflare Email Routing, percuma). Kosong = tak dipapar
  syarikat: "SASS ONE WORLDWIDE",     // nama berdaftar (Akta Pendaftaran Perniagaan 1956), ikut company profile v3
  ssm: "202603017072 (JR0186691-K)",                          // nombor pendaftaran SSM (Adiel isi sendiri, salin dari company profile hlm 2). Kosong = tak dipapar. Isi = nampak sah macam laman Zakwan
  foto_bio: "aset/pantai-muka.webp",   // avatar (potret profesional dari rakaman ep007)

  // Nombor WhatsApp jualan, format 60xxxxxxxxx tanpa + atau sengkang.
  // Kosong = butang WhatsApp buka WhatsApp tanpa penerima (pelawat pilih sendiri). WAJIB isi sebelum live.
  // Saluran hubungi. jenis "instagram" = semua butang buka DM Instagram (tiada mesej siap ditaip).
  // jenis "whatsapp" = guna nombor di bawah.
  // Untuk DM Instagram: { jenis: "instagram", pautan: "https://ig.me/m/adielzainal._", label: "DM Instagram" }
  hubungi: { jenis: "whatsapp", label: "WhatsApp" },
  whatsapp: "601127560377",          // nombor jualan WhatsApp

  sosial: {
    threads: "https://www.threads.com/@adielzainal._",
    instagram: "https://www.instagram.com/adielzainal._/",
    tiktok: ""                      // contoh "https://www.tiktok.com/@nama"
  },

  // status: "akan_datang" = harga disorok, butang jadi "Maklumkan saya bila dibuka" (WhatsApp).
  // Bila produk dah siap: PADAM baris status itu, betulkan harga, dan isi pautan bcl.
  // Produk. "bcl" = pautan borang BCL.my. Kosong = butang beli buka WhatsApp dengan mesej pesanan siap ditaip.
  // PROMOSI. "harga" = harga promo sekarang, "harga_biasa" = harga selepas promo tamat.
  // Selepas "tamat", laman terus tunjuk harga_biasa sahaja (kiraan masa dan harga potong hilang sendiri).
  promo: {
    tajuk: "Promosi hujung tahun",
    tamat: "2026-12-31T23:59:59+08:00"   // 31 Dis 2026, 11:59 malam waktu Malaysia
  },

  produk: [
    {
      id: "claude",
      status: "akan_datang",          // buang baris ini bila borang BCL dibuka
      jenis: "Ebook + video",
      nama: "Claude Untuk Pemula",
      harga: 97,
      harga_biasa: 169,
      nota: "sekali bayar",
      ringkas: "Mula guna Claude dari kosong untuk kerja perniagaan: tulis iklan, balas pelanggan, sunting video dan urus Meta Ads. Langkah demi langkah, dengan video pendek untuk setiap bab.",
      isi: [
        "Asas Claude dari kosong: Projects, memori dan cara memberi arahan yang tepat",
        "Prompt siap guna untuk iklan, jualan, khidmat pelanggan dan SOP",
        "Sunting video TikTok dan Reels dengan Claude, tanpa kemahiran menyunting",
        "Claude urus Meta Ads: laporan mingguan dan draf iklan, anda yang meluluskan",
        "Pelan 7 hari: satu tugasan kecil setiap hari",
        "Video pendek setiap bab, kemas kini percuma dan kumpulan sokongan Telegram"
      ],
      tambahan: { nama: "Sesi Pasang Bersama 1 jam", harga: 150 },
      bcl: "",
      bcl_tambahan: "",
      label: "Mula di sini"
    },
    {
      id: "autopilot",
      status: "akan_datang",
      jenis: "2 ebook + video",
      nama: "Pakej Bisnes Autopilot",
      harga: 177,
      harga_biasa: 338,
      nota: "sekali bayar · 2 ebook",
      ringkas: "Claude menjadi otak, Hermes menjadi pekerja 24 jam. Claude menulis dan berfikir untuk perniagaan anda; Hermes menjalankan kerja itu secara automatik, walaupun anda sedang tidur.",
      isi: [
        "Ebook Claude Untuk Pemula, lengkap dengan video",
        "Ebook Hermes: Pekerja AI 24 Jam, edisi baharu yang bersambung terus dengan ebook Claude",
        "Pelan 7 hari merentas dua ebook, dengan automasi pertama anda sebagai matlamat hari ke-7",
        "AI membalas WhatsApp 24 jam cara rasmi, serta laporan dan kerja berjadual ke Telegram",
        "Harga pakej ditolak penuh jika anda naik taraf ke coaching dalam 14 hari",
        "Kemas kini percuma dan kumpulan sokongan Telegram"
      ],
      tambahan: { nama: "Sesi Pasang Bersama 1 jam", harga: 150 },
      bcl: "",
      bcl_tambahan: "",
      label: "Paling berbaloi"
    },
    {
      id: "meta",
      aktif: false,                   // diganti oleh "claude" (Adiel 25 Nov 2026); kekal untuk rujukan pembeli lama
      status: "akan_datang",          // buang baris ini bila borang BCL dibuka (alat/buka_jualan.py)
      jenis: "Ebook + kit",
      nama: "Meta Ads Automation",
      harga: 97,
      harga_biasa: 169,
      nota: "sekali bayar",
      ringkas: "Sambungkan Meta Ads kepada Claude, terima laporan iklan mingguan secara automatik, dan masukkan lead WhatsApp terus ke Google Sheet. Anda bina sendiri, langkah demi langkah.",
      isi: [
        "Sambung Meta Ads ke Claude melalui MCP rasmi Meta, langkah demi langkah",
        "10 aliran kerja siap guna dengan prompt, dan kunci keselamatan di sisi Meta",
        "Laporan iklan mingguan, 17 semakan sebelum dihantar",
        "Mesej WhatsApp jadi CRM dalam Google Sheet",
        "Autopilot pilihan: cadangan bajet & pause, anda yang lulus",
        "Kit siap pasang (VPS + Docker), dengan amaran polisi WhatsApp"
      ],
      tambahan: { nama: "Sesi Pasang Bersama 1 jam", harga: 150 },
      bcl: "",
      bcl_tambahan: "",               // biar kosong bila guna BCL: tambahan sokongan dipilih dalam borang BCL yang sama
      label: "Ebook"
    },
    {
      id: "hermes",
      aktif: false,                   // kini dalam Pakej Bisnes Autopilot sahaja (Adiel 25 Nov 2026)
      status: "akan_datang",
      jenis: "Ebook",
      nama: "Hermes: Pekerja AI 24 Jam",
      harga: 97,
      harga_biasa: 169,
      nota: "sekali bayar",
      ringkas: "Pasang Hermes dengan Claude sebagai otaknya: kerja berjadual, laporan ke Telegram dan AI yang membalas WhatsApp 24 jam. Anda bina sendiri, langkah demi langkah.",
      isi: [
        "Pasang Hermes di VPS, Claude sebagai otak",
        "Beri arahan dan terima laporan melalui Telegram",
        "Peta kerja + otak syarikat: 5 fail memori supaya AI tak meneka",
        "Kerja berjadual, dengan Notion sebagai jambatan Claude ⇄ Hermes",
        "AI balas WhatsApp 24 jam cara rasmi, dengan serahan kepada anda",
        "Pelan 30 hari dan 10 silap yang saya dah buat"
      ],
      tambahan: { nama: "Sesi Pasang Bersama 1 jam", harga: 150 },
      bcl: "",
      bcl_tambahan: "",
      label: "Pekerja 24 jam"
    },
    {
      id: "coaching",
      status: "akan_datang",
      jenis: "1-to-1",
      nama: "Coaching Automasi 1-to-1",
      harga: 977,                     // satu harga: Google Meet atau bersemuka
      harga_biasa: 1499,
      nota: "sesi sehingga 3 jam · Google Meet atau bersemuka",
      // Dua cara (Google Meet / bersemuka), dua servis dalam borang tempahan BCL, harga sama.
      ringkas: "Kita pasang pekerja AI dalam perniagaan anda, bersama-sama. Anda belajar Hermes, Meta Ads dan Claude sepanjang proses, dan pulang dengan pekerja AI yang sudah berjalan.",
      isi: [
        "30 minit audit: pilih kerja pertama untuk pekerja AI anda",
        "Sehingga 2 jam 30 minit memasang pekerja AI bersama dalam perniagaan anda, sehingga ia berjalan",
        "Belajar asas Hermes, Meta Ads dan Claude semasa membina",
        "Pintu kelulusan dan butang henti dipasang sejak awal",
        "Ringkasan dan tugasan susulan dalam masa 24 jam",
        "Isi borang pra-sesi semasa membuat tempahan",
        "Harga yang sama untuk Google Meet atau bersemuka (lokasi disahkan selepas tempahan)"
      ],
      bcl: "",
      label: "Fokus utama",
      utama: true
    },
    {
      id: "laju",
      aktif: false,
      jenis: "Ebook",
      nama: "Bisnes LAJU dengan AI",
      harga: 97,
      nota: "sekali bayar",
      ringkas: "Sistem jualan WhatsApp dengan AI untuk owner yang bukan orang IT: iklan, balas, follow-up, ukur.",
      isi: [
        "Data sebenar 708 perbualan iklan WhatsApp",
        "40+ prompt BM ikut langkah jualan",
        "Skor Bisnes: 5 nombor untuk ukur hasil",
        "Alat rasmi sahaja, tiada bot tak rasmi"
      ],
      bcl: "",
      label: "Untuk bukan orang IT"
    }
  ],

  // Bukti sebenar sahaja (90 hari, disamarkan). Kosong = bahagian bukti tak dipaparkan.
  // testimoni: { teks: "...", nama: "Nama", peranan: "Owner X", sumber: "https://..." } (dengan izin client)
  bukti: {
    tajuk: "",   // kosong = guna tajuk dalam index.html (ada gaya serif)
    angka: [
      { nilai: "708", label: "perbualan WhatsApp daripada iklan pelanggan (90 hari)" },
      { nilai: "RM7.60", label: "purata kos setiap perbualan" },
      { nilai: "10", label: "akaun iklan pelanggan, 9 industri" },
      { nilai: "6–12×", label: "lebih murah: kempen mesej WhatsApp berbanding boost post" }
    ],
    // Portfolio: kos setiap perbualan ikut industri (nama client tak didedahkan)
    kes: [
      { industri: "Makanan sejuk beku", perbualan: 150, kos: "RM2.94" },
      { industri: "Klinik gigi", perbualan: 136, kos: "RM2.71" },
      { industri: "Emas", perbualan: 157, kos: "RM8.34" },
      { industri: "Kontraktor", perbualan: 89, kos: "RM9.53" },
      { industri: "Ejen kereta (kempen mesej)", perbualan: 110, kos: "RM6.93–12.66" },
      { industri: "Hartanah", perbualan: 46, kos: "RM17.51" },
      { industri: "Ejen kereta (boost post teks)", perbualan: 3, kos: "RM80.83", amaran: true }
    ],
    // Petikan mesej WhatsApp client (dengan izin). Nama dan nombor tidak dipaparkan. "nama" = industri sahaja.
    testimoni: [
      { teks: "TERBAIK TUAN! Alhamdulillah sudah 4 orang berminat tanah 26 juta ni.", nama: "Pelanggan · Hartanah" },
      { teks: "Alhamdulillah, sampai sy overload tak cukup nak cover order. Hampir 80% dtg dri iklan pihak tuan.", nama: "Pelanggan · Kontraktor" },
      { teks: "Thank you sbb jd kan sales kami hit target.", nama: "Pelanggan · Kontraktor" },
      { teks: "GOOD NEWS: SOLD TODAY. Alhamdulillah, kondo Selayang dah pun ada pembeli hari ini.", nama: "Pelanggan · Hartanah" },
      { teks: "Service sgt terbaik. Bnyk dpt cust yg kualiti, x terkejar nak melayan.", nama: "Pelanggan · Kewangan" },
      { teks: "So far service you good. Staff you pun good response fast. Lucky dapat jumpa you service yg ikhlas.", nama: "Pelanggan · Kecantikan" },
      { teks: "Bulan lepas kami dapat close deal RM10K.", nama: "Pelanggan · Emas" },
      { teks: "Ok, alhamdulillah. Dapat byk quality leads dari sini.", nama: "Pelanggan · Takaful" },
      { teks: "Dh dapat close 2. Alhamdulillah.", nama: "Pelanggan · Ejen kereta" }
    ]
  },

  // Cloudflare Web Analytics (percuma). Isi token selepas tambah laman di dash.cloudflare.com → Analytics.
  analitik_cloudflare: ""
};
