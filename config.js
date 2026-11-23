// SATU-SATUNYA fail yang perlu diubah untuk tukar harga, pautan, bukti atau nombor WhatsApp.
// Ubah melalui PR ke main; GitHub Actions terbit semula sendiri.
// Peraturan: jangan reka angka. Kalau bukti belum ada, biar senarai kosong; bahagian tu tersorok sendiri.

window.LAMAN = {
  nama: "Adiel Zainal",
  peranan: "Automasi AI untuk bisnes · Pengasas SASS ONE",
  domain: "https://adielzainal.com", // dibeli 21 Nov 2026, DNS di Cloudflare
  emel: "",                         // isi "hello@adielzainal.com" SELEPAS Email Routing dipasang (Cloudflare Email Routing, percuma). Kosong = tak dipapar
  syarikat: "SASS ONE WORLDWIDE",     // nama berdaftar (Akta Pendaftaran Perniagaan 1956), ikut company profile v3
  ssm: "",                          // nombor pendaftaran SSM (Adiel isi sendiri, salin dari company profile hlm 2). Kosong = tak dipapar. Isi = nampak sah macam laman Zakwan
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
      id: "meta",
      status: "akan_datang",          // buang baris ini bila borang BCL dibuka (alat/buka_jualan.py)
      jenis: "Ebook + kit",
      nama: "Meta Ads Automation",
      harga: 97,
      harga_biasa: 169,
      nota: "sekali bayar",
      ringkas: "Sambung Meta Ads ke Claude, laporan iklan mingguan automatik, dan lead WhatsApp terus ke Google Sheet.",
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
      status: "akan_datang",
      jenis: "Ebook",
      nama: "Hermes: Pekerja AI 24 Jam",
      harga: 97,
      harga_biasa: 169,
      nota: "sekali bayar",
      ringkas: "Pasang Hermes dengan Claude sebagai otak: kerja berjadual, laporan ke Telegram, dan AI balas WhatsApp 24 jam.",
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
      nota: "sesi 2 jam · Google Meet atau bersemuka",
      // Dua cara (Google Meet / bersemuka), dua servis dalam borang tempahan BCL, harga sama.
      ringkas: "Kita bina bersama dalam bisnes anda sendiri. Anda keluar dengan satu automasi AI yang dah jalan.",
      isi: [
        "30 minit audit kerja: pilih satu kerja untuk diserah",
        "90 minit bina bersama sampai jalan",
        "Pintu kelulusan + butang henti dipasang",
        "Ringkasan dan tugasan dalam 24 jam",
        "Isi borang pra-sesi semasa tempah",
        "Harga sama untuk Google Meet atau bersemuka (lokasi disahkan selepas tempah)"
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
      { nilai: "708", label: "perbualan WhatsApp dari iklan client (90 hari)" },
      { nilai: "RM7.60", label: "purata kos setiap perbualan" },
      { nilai: "10", label: "akaun iklan client, 9 industri" },
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
      { teks: "TERBAIK TUAN! Alhamdulillah sudah 4 orang berminat tanah 26 juta ni.", nama: "Client · Hartanah" },
      { teks: "Alhamdulillah, sampai sy overload tak cukup nak cover order. Hampir 80% dtg dri iklan pihak tuan.", nama: "Client · Kontraktor" },
      { teks: "Thank you sbb jd kan sales kami hit target.", nama: "Client · Kontraktor" },
      { teks: "GOOD NEWS: SOLD TODAY. Alhamdulillah, kondo Selayang dah pun ada pembeli hari ini.", nama: "Client · Hartanah" },
      { teks: "Service sgt terbaik. Bnyk dpt cust yg kualiti, x terkejar nak melayan.", nama: "Client · Kewangan" },
      { teks: "So far service you good. Staff you pun good response fast. Lucky dapat jumpa you service yg ikhlas.", nama: "Client · Kecantikan" },
      { teks: "Bulan lepas kami dapat close deal RM10K.", nama: "Client · Emas" },
      { teks: "Ok, alhamdulillah. Dapat byk quality leads dari sini.", nama: "Client · Takaful" },
      { teks: "Dh dapat close 2. Alhamdulillah.", nama: "Client · Ejen kereta" }
    ]
  },

  // Cloudflare Web Analytics (percuma). Isi token selepas tambah laman di dash.cloudflare.com → Analytics.
  analitik_cloudflare: ""
};
