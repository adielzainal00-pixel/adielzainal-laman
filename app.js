(function () {
  "use strict";
  var C = window.LAMAN || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var rm = function (n) { return "RM" + Number(n).toLocaleString("en-MY"); };
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  // ---------- 0. Pemuat pendek: sekali setiap sesi, ±1 saat, boleh langkau ----------
  (function () {
    var p = $("#pemuat");
    if (!p) return;
    // Skrip kecil selepas #pemuat dalam index.html dah putuskan sama ada pemuat dipapar (tiada kelipan)
    if (p.hidden) { p.remove(); return; }
    try { sessionStorage.setItem("pemuat", "1"); } catch (e) {}
    var nilai = $("#pemuat-nilai"), mula = performance.now(), TEMPOH = 1000, habis = false;
    var tutup = function () {
      if (habis) return; habis = true;
      p.classList.add("keluar");
      document.documentElement.classList.remove("memuat");
      setTimeout(function () { p.remove(); }, 600);
    };
    p.addEventListener("click", tutup);
    setTimeout(tutup, TEMPOH + 400);   // tetap tutup walaupun requestAnimationFrame diperlahankan (tab latar)
    (function detik(t) {
      var k = Math.min(1, (t - mula) / TEMPOH);
      nilai.textContent = Math.round(k * 100);
      if (k < 1 && !habis) requestAnimationFrame(detik); else setTimeout(tutup, 150);
    })(mula);
  })();

  // ---------- 1. Platform asal pelawat (?dari=tiktok, /tt, utm_source) ----------
  var NAMA_PLATFORM = { t: "Threads", threads: "Threads", ig: "Instagram", instagram: "Instagram",
    tt: "TikTok", tiktok: "TikTok", fb: "Facebook", facebook: "Facebook", wa: "WhatsApp", yt: "YouTube" };
  var dari = "";
  try {
    var q = new URLSearchParams(location.search);
    var mentah = (q.get("dari") || q.get("utm_source") || "").toLowerCase().trim();
    if (mentah) {
      dari = NAMA_PLATFORM[mentah] || mentah.charAt(0).toUpperCase() + mentah.slice(1, 20);
      try { sessionStorage.setItem("dari", dari); } catch (e) {}
    } else {
      try { dari = sessionStorage.getItem("dari") || ""; } catch (e) {}
    }
  } catch (e) {}
  if (dari && $("#dari")) {
    var chip = $("#dari");
    chip.textContent = "Salam Kejayaan 😊";
    chip.hidden = false;
  }

  // ---------- 2. Pautan WhatsApp (nombor dari config, asal pelawat dilampirkan) ----------
  var H = C.hubungi || { jenis: "whatsapp" };
  var viaIG = H.jenis === "instagram" && H.pautan;
  function waLink(teks) {
    if (viaIG) return H.pautan;
    var t = teks + (dari ? "\n\n(dari " + dari + ")" : "");
    var no = String(C.whatsapp || "").replace(/\D/g, "");
    return "https://wa.me/" + no + "?text=" + encodeURIComponent(t);
  }
  function luar(a) { a.target = "_blank"; a.rel = "noopener"; }
  function pasangWa(root) {
    $$("[data-wa]", root).forEach(function (a) { a.href = waLink(a.getAttribute("data-wa")); luar(a); });
  }

  // ---------- 3. Teks umum & sosial ----------
  $$("[data-isi]").forEach(function (el) { var k = el.getAttribute("data-isi"); if (C[k]) el.textContent = C[k]; });
  var S = C.sosial || {};
  var ctaThreads = $("#cta-threads");
  if (ctaThreads) { if (S.threads) { ctaThreads.href = S.threads; luar(ctaThreads); } else { ctaThreads.remove(); } }
  $("#sosial").innerHTML = [["Threads", S.threads], ["Instagram", S.instagram], ["TikTok", S.tiktok]]
    .filter(function (x) { return x[1]; })
    .map(function (x) { return '<a href="' + esc(x[1]) + '" target="_blank" rel="noopener">' + x[0] + "</a>"; })
    .join("");
  $("#tahun").textContent = new Date().getFullYear();
  var sah = [C.syarikat && C.ssm ? esc(C.syarikat) + " · No. Pendaftaran SSM: " + esc(C.ssm) : "",
    C.emel ? '<a href="mailto:' + esc(C.emel) + '">' + esc(C.emel) + "</a>" : ""].filter(Boolean).join(" · ");
  if (sah) $("#sah").innerHTML = sah; else $("#sah").remove();

  // ---------- 4. Produk ----------
  var PRODUK = (C.produk || []).filter(function (p) { return p.aktif !== false; });
  var cariProduk = function (id) { return PRODUK.filter(function (p) { return p.id === id; })[0]; };

  var belum = function (p) { return p.status === "akan_datang"; };
  var PROMO = C.promo || {};
  var promoTamat = Date.parse(PROMO.tamat || "");
  var promoAktif = function () { return !isNaN(promoTamat) && Date.now() < promoTamat; };
  var adaPromo = function (p) { return promoAktif() && p.harga_biasa && p.harga_biasa > p.harga; };
  var hargaKini = function (p) { return adaPromo(p) || !p.harga_biasa ? p.harga : p.harga_biasa; };
  var hargaTeks = function (p) { return belum(p) && !p.harga ? "Akan datang" : rm(hargaKini(p)); };
  var notaHarga = function (p) { return belum(p) ? "Dibuka semula tak lama lagi" : esc(p.nota); };
  var hargaPotong = function (p) {
    return adaPromo(p) ? ' <s class="asal">' + rm(p.harga_biasa) + '</s><span class="jimat">Jimat ' + rm(p.harga_biasa - p.harga) + "</span>" : "";
  };
  // Ebook (produk digital) TIDAK BOLEH dijual atau dipautkan melalui WhatsApp (Commerce Policy Meta).
  // Tanpa pautan BCL, butang ebook jadi "Dibuka tak lama lagi" tanpa pautan, bukan WhatsApp.
  var ebook = function (p) { return /ebook/i.test(p.jenis || ""); };
  var ebookTanpaBcl = function (p) { return ebook(p) && (belum(p) || !p.bcl); };
  function pautanBeli(p, denganTambahan) {
    if (ebookTanpaBcl(p)) return "";
    if (belum(p)) return waLink("Hi Adiel, tolong maklumkan saya bila " + p.nama + " dibuka.");
    if (denganTambahan && p.tambahan) {
      if (p.bcl_tambahan) return p.bcl_tambahan;
      return waLink("Hi Adiel, saya nak beli " + p.nama + " + " + p.tambahan.nama + " (" + rm(hargaKini(p) + p.tambahan.harga) + (adaPromo(p) ? ", harga promo" : "") + ").");
    }
    return p.bcl || waLink("Hi Adiel, saya nak beli " + p.nama + " (" + rm(hargaKini(p)) + (adaPromo(p) ? ", harga promo" : "") + ").");
  }
  // produk dengan beberapa cara (coaching: Google Meet / bersemuka): senarai harga setiap cara
  function modHarga(p) {
    if (!p.mod || p.mod.length < 2) return "";
    return '<ul class="mod-harga">' + p.mod.map(function (m) {
      var promo = promoAktif() && m.harga_biasa > m.harga;
      return "<li><span>" + esc(m.nama) + "</span><b>" + rm(promo ? m.harga : (m.harga_biasa || m.harga)) + "</b>" +
        (promo ? ' <s class="asal">' + rm(m.harga_biasa) + "</s>" : "") + "</li>";
    }).join("") + "</ul>";
  }
  function labelBeli(p) { if (ebookTanpaBcl(p)) return "Dibuka tak lama lagi"; if (belum(p)) return "Maklumkan saya bila dibuka →"; return p.bcl ? "Beli sekarang →" : (viaIG ? "DM untuk beli →" : "Beli melalui WhatsApp →"); }

  $("#senarai-produk").innerHTML = PRODUK.map(function (p) {
    return '<article class="kad produk' + (p.utama ? " utama" : "") + '" id="p-' + esc(p.id) + '">' +
      (p.label ? '<span class="label">' + esc(p.label) + "</span>" : "") +
      '<p class="jenis">' + esc(p.jenis) + "</p>" +
      "<h3>" + esc(p.nama) + "</h3>" +
      '<p class="harga"><span class="nilai">' + hargaTeks(p) + "</span>" + hargaPotong(p) + "<small>" + notaHarga(p) + "</small></p>" +
      modHarga(p) +
      '<p class="ringkas">' + esc(p.ringkas) + "</p>" +
      "<ul>" + (p.isi || []).map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + "</ul>" +
      '<div class="bawah">' +
      (p.tambahan && !belum(p) && !ebookTanpaBcl(p) ? (p.bcl
        ? '<p class="tambahan-nota">+ ' + esc(p.tambahan.nama) + " (" + rm(p.tambahan.harga) + ") boleh ditambah di halaman bayaran.</p>"
        : '<label class="tambahan"><input type="checkbox" data-tambahan="' + esc(p.id) + '"> + ' +
          esc(p.tambahan.nama) + " (" + rm(p.tambahan.harga) + ")</label>") : "") +
      (ebookTanpaBcl(p)
        ? '<span class="btn btn-penuh" aria-disabled="true" style="opacity:.55;cursor:default">' + labelBeli(p) + "</span>"
        : '<a class="btn btn-penuh" data-beli="' + esc(p.id) + '" href="' + esc(pautanBeli(p, false)) +
          '" target="_blank" rel="noopener">' + labelBeli(p) + "</a>") +
      "</div></article>";
  }).join("");

  $$("[data-tambahan]").forEach(function (cb) {
    cb.addEventListener("change", function () {
      var p = cariProduk(cb.getAttribute("data-tambahan"));
      var kad = $("#p-" + p.id);
      var tambah = cb.checked ? p.tambahan.harga : 0;
      $(".nilai", kad).textContent = rm(hargaKini(p) + tambah);
      var asal = $("s.asal", kad);
      if (asal) asal.textContent = rm(p.harga_biasa + tambah);
      $("[data-beli]", kad).href = pautanBeli(p, cb.checked);
    });
  });

  // ---------- 4b. Kiraan masa promosi ----------
  (function () {
    var bar = $("#promo-bar"), kotak = $("#promo-kira");
    if (!promoAktif()) { if (bar) bar.remove(); if (kotak) kotak.remove(); return; }
    var tarikh = new Date(promoTamat).toLocaleDateString("ms-MY", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kuala_Lumpur" });
    $$("[data-promo-tajuk]").forEach(function (el) { el.textContent = PROMO.tajuk || "Promosi"; });
    $$("[data-promo-tarikh]").forEach(function (el) { el.textContent = tarikh; });
    if (bar) bar.hidden = false;
    if (kotak) kotak.hidden = false;
    var dua = function (n) { return (n < 10 ? "0" : "") + n; };
    var detik = function () {
      var baki = Math.max(0, promoTamat - Date.now());
      if (!baki) { location.reload(); return; }
      var h = Math.floor(baki / 864e5), j = Math.floor(baki / 36e5) % 24, m = Math.floor(baki / 6e4) % 60, d = Math.floor(baki / 1e3) % 60;
      $$("[data-kira=h]").forEach(function (el) { el.textContent = h; });
      $$("[data-kira=j]").forEach(function (el) { el.textContent = dua(j); });
      $$("[data-kira=m]").forEach(function (el) { el.textContent = dua(m); });
      $$("[data-kira=d]").forEach(function (el) { el.textContent = dua(d); });
    };
    detik();
    setInterval(detik, 1000);
  })();

  // ---------- 5. Bukti (tersorok kalau kosong) ----------
  var B = C.bukti || {};
  var angka = B.angka || [], testi = B.testimoni || [], kes = B.kes || [];
  if (angka.length || testi.length || kes.length) {
    $("#bukti").hidden = false;
    if (B.tajuk) $("#bukti-tajuk").textContent = B.tajuk;
    if (kes.length) {
      var galeri = $("#bukti-kes"), pad = function (n) { return (n < 10 ? "0" : "") + n; };
      galeri.hidden = $("#galeri-kepala").hidden = $("#galeri-nota").hidden = false;
      galeri.innerHTML = kes.map(function (k, i) {
        return '<article class="kes-kad' + (k.amaran ? " amaran" : "") + '">' +
          '<p class="kes-no">' + pad(i + 1) + "</p>" +
          '<p class="kes-industri">' + esc(k.industri) + "</p>" +
          '<p class="kes-kos">' + esc(k.kos) + "</p>" +
          '<p class="kes-label">setiap perbualan WhatsApp</p>' +
          '<p class="kes-kaki"><span>' + esc(k.perbualan) + " perbualan</span><span>90 hari</span></p>" +
          (k.amaran ? '<p class="kes-amaran">Boost post teks. Bisnes sama, kos 6–12× lebih tinggi.</p>' : "") +
          "</article>";
      }).join("");
      var kad = $$(".kes-kad", galeri), kiraanEl = $("#galeri-kiraan");
      var semasa = function () {
        var x = galeri.scrollLeft, best = 0, d = 1e9;
        kad.forEach(function (c, i) { var dd = Math.abs(c.offsetLeft - galeri.offsetLeft - x); if (dd < d) { d = dd; best = i; } });
        return best;
      };
      var kemas = function () { kiraanEl.textContent = pad(semasa() + 1) + " / " + pad(kad.length); };
      var pergi = function (arah) {
        var i = Math.max(0, Math.min(kad.length - 1, semasa() + arah));
        galeri.scrollTo({ left: kad[i].offsetLeft - galeri.offsetLeft, behavior: "smooth" });
      };
      galeri.addEventListener("scroll", function () { window.requestAnimationFrame(kemas); }, { passive: true });
      $("#galeri-kiri").addEventListener("click", function () { pergi(-1); });
      $("#galeri-kanan").addEventListener("click", function () { pergi(1); });
      galeri.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight") { e.preventDefault(); pergi(1); }
        if (e.key === "ArrowLeft") { e.preventDefault(); pergi(-1); }
      });
      kemas();
    }
    $("#bukti-angka").innerHTML = angka.map(function (a) {
      return "<div><b>" + esc(a.nilai) + "</b><span>" + esc(a.label) + "</span></div>";
    }).join("");
    $("#bukti-testimoni").innerHTML = testi.map(function (t) {
      return "<figure><blockquote>“" + esc(t.teks) + "”</blockquote><figcaption><b>" + esc(t.nama) + "</b>" +
        (t.peranan ? " · " + esc(t.peranan) : "") +
        (t.sumber ? ' · <a href="' + esc(t.sumber) + '" target="_blank" rel="noopener">sumber</a>' : "") +
        "</figcaption></figure>";
    }).join("");
  }

  // ---------- 6. Kuiz ----------
  var SOALAN = [
    { id: "masalah", tanya: "Apakah kerja yang paling banyak mengambil masa anda sekarang?", pilihan: [
      { v: "iklan", ikon: "📊", t: "Iklan Meta & laporan", s: "Menarik data, menyediakan laporan dan menghantarnya kepada pelanggan atau pengurusan" },
      { v: "lead", ikon: "💬", t: "Lead & follow-up WhatsApp", s: "Lead masuk, tetapi lambat dibalas atau terlepas susulan" },
      { v: "staf", ikon: "🧑‍💼", t: "Kerja bergantung pada seorang staf", s: "Jika staf bercuti atau berhenti, semua kerja tergendala" },
      { v: "mula", ikon: "🌱", t: "Belum pasti, ingin mula menggunakan AI", s: "Pernah mendengar tentang AI agent, tetapi tidak pasti dari mana bermula" } ] },
    { id: "cara", tanya: "Bagaimana anda ingin melaksanakannya?", pilihan: [
      { v: "sendiri", ikon: "📘", t: "Bina sendiri dengan panduan", s: "Saya selesa membaca dan mengikut langkah, mengikut masa saya sendiri" },
      { v: "pimpin", ikon: "🤝", t: "Dipasang bersama pakar", s: "Sudah mencuba tetapi tersangkut, atau ingin siap dengan cepat" } ] },
    { id: "iklan", tanya: "Adakah perniagaan anda menjalankan iklan Meta (FB/IG)?", pilihan: [
      { v: "ya", ikon: "✅", t: "Ya, setiap bulan", s: "" },
      { v: "kadang", ikon: "〰️", t: "Kadang-kadang", s: "" },
      { v: "tidak", ikon: "➖", t: "Belum, organik sahaja", s: "" } ] }
  ];
  var jawapan = {}, langkah = 0;
  var kotak = $("#kuiz-kotak");

  function teksPilihan(sid, v) {
    var s = SOALAN.filter(function (x) { return x.id === sid; })[0];
    var p = s.pilihan.filter(function (x) { return x.v === v; })[0];
    return p ? p.t : "";
  }

  function cadangan(j) {
    if (j.cara === "pimpin") return { id: "coaching",
      kenapa: "Anda mahu sistem siap dengan cepat, dipasang bersama saya. Dalam satu sesi sehingga 3 jam, kita pilih satu kerja dalam perniagaan anda dan pasang pekerja AI sehingga berjalan, lengkap dengan pintu kelulusan dan butang henti. Anda juga belajar Hermes, Meta Ads dan Claude sepanjang proses." };
    if (j.masalah === "iklan") return { id: "claude",
      kenapa: "Banyak masa anda digunakan untuk iklan dan kandungan. Ebook ini bermula dari kosong: Claude menulis iklan, menyunting video dan menyediakan laporan Meta Ads mingguan, dan anda hanya meluluskan." };
    if (j.iklan === "ya" && j.masalah !== "staf") return { id: "claude",
      kenapa: "Iklan anda berjalan setiap bulan. Mulakan dengan Claude: draf iklan, laporan Meta Ads mingguan dan kandungan video, semuanya dari kosong dan langkah demi langkah." };
    var k = { lead: "Lead dan susulan ialah kerja pertama yang saya cadangkan untuk hampir semua perniagaan. Pakej ini mengajar Claude menulis balasan yang tepat, kemudian Hermes membalas WhatsApp, merekod lead dan membuat susulan 24 jam.",
      staf: "Apabila kerja bergantung pada seorang staf, perniagaan anda mudah terjejas. Pakej ini menunjukkan cara menyerahkan kerja berulang kepada AI: Claude sebagai otak, Hermes sebagai pekerja 24 jam.",
      mula: "Inilah laluan lengkap dari kosong: belajar Claude dahulu, kemudian pasang Hermes supaya kerja itu berjalan sendiri. Mulakan dengan satu kerja berjadual yang berisiko rendah.",
      iklan: "" };
    return { id: "autopilot", kenapa: k[j.masalah] || k.mula };
  }

  function lukisSoalan() {
    var s = SOALAN[langkah];
    kotak.innerHTML =
      '<p class="kuiz-langkah">Soalan ' + (langkah + 1) + " / " + SOALAN.length + "</p>" +
      '<div class="kuiz-bar"><span style="width:' + ((langkah) / SOALAN.length * 100) + '%"></span></div>' +
      "<h3>" + esc(s.tanya) + '</h3><div class="pilihan">' +
      s.pilihan.map(function (p) {
        return '<button type="button" data-v="' + p.v + '"><span class="ikon" aria-hidden="true">' + p.ikon +
          "</span><span><b>" + esc(p.t) + "</b>" + (p.s ? "<small>" + esc(p.s) + "</small>" : "") + "</span></button>";
      }).join("") + "</div>" +
      (langkah > 0 ? '<button type="button" class="kuiz-balik">← Balik</button>' : "");
    $$(".pilihan button", kotak).forEach(function (b) {
      b.addEventListener("click", function () {
        jawapan[s.id] = b.getAttribute("data-v");
        langkah++;
        if (langkah < SOALAN.length) lukisSoalan(); else lukisHasil();
        kotak.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    });
    var balik = $(".kuiz-balik", kotak);
    if (balik) balik.addEventListener("click", function () { langkah--; lukisSoalan(); });
  }

  function lukisHasil() {
    var c = cadangan(jawapan), p = cariProduk(c.id);
    if (!p) { lukisSoalan(); return; }
    var ringkasan = "Hi Adiel, saya dah buat kuiz.\n" +
      "Masalah: " + teksPilihan("masalah", jawapan.masalah) + "\n" +
      "Cara: " + teksPilihan("cara", jawapan.cara) + "\n" +
      "Iklan Meta: " + teksPilihan("iklan", jawapan.iklan) + "\n" +
      "Cadangan: " + p.nama + ". Boleh terangkan lagi?";
    kotak.innerHTML =
      '<div class="kuiz-bar"><span style="width:100%"></span></div>' +
      '<div class="hasil"><span class="hasil-tag">Cadangan untuk anda</span>' +
      '<p class="kuiz-langkah">' + esc(p.jenis) + "</p><h3>" + esc(p.nama) + "</h3>" +
      '<p class="harga">' + hargaTeks(p) + hargaPotong(p) + ' <small class="kecil">' + notaHarga(p) + "</small></p>" +
      '<p class="kenapa">' + esc(c.kenapa) + "</p>" +
      '<div class="hasil-cta"><a class="btn" href="' + esc(pautanBeli(p, false)) + '" target="_blank" rel="noopener">' + labelBeli(p) + "</a>" +
      '<a class="btn btn-garis" href="' + esc(waLink(ringkasan)) + '" target="_blank" rel="noopener">' + (viaIG ? "Tanya dulu di DM Instagram" : "Tanya dulu di WhatsApp") + '</a></div>' +
      '<p style="margin-top:16px"><a class="kecil" href="#produk">Tengok semua pilihan</a> · ' +
      '<button type="button" class="kuiz-balik" id="ulang">Ulang kuiz</button></p></div>';
    $("#ulang").addEventListener("click", function () { jawapan = {}; langkah = 0; lukisSoalan(); });
  }
  if (kotak) lukisSoalan();   // laman tanpa kuiz: langkau

  // ---------- 7. Kalkulator jam terbuang ----------
  var iLead = $("#i-lead"), iAdmin = $("#i-admin"), iKadar = $("#i-kadar");
  function kira() {
    var jam = (Number(iLead.value) + Number(iAdmin.value)) * 52 / 12;
    $("#o-lead").textContent = iLead.value + " jam";
    $("#o-admin").textContent = iAdmin.value + " jam";
    $("#o-kadar").textContent = rm(iKadar.value);
    $("#h-jam").textContent = Math.round(jam);
    $("#h-rm").textContent = Math.round(jam * Number(iKadar.value)).toLocaleString("en-MY");
    $("#h-separuh").textContent = Math.round(jam / 2) + " jam";
  }
  if (iLead && iAdmin && iKadar) {   // laman tanpa kalkulator: langkau
    [iLead, iAdmin, iKadar].forEach(function (i) { i.addEventListener("input", kira); });
    kira();
  }

  // ---------- 8. WhatsApp statik, bar bawah, analitik, SEO ----------
  pasangWa(document);
  // label butang hubungi ikut saluran (DM Instagram semasa nombor WhatsApp tiada)
  if (viaIG) {
    $$("[data-wa]").forEach(function (a) { a.textContent = a.textContent.replace(/WhatsApp/g, H.label || "DM Instagram"); });
    $$("[data-ikut-saluran]").forEach(function (el) { el.textContent = el.getAttribute("data-ikut-saluran"); });
  }
  // bila sekurang-kurangnya satu produk dijual melalui BCL, teks "cara beli" ikut aliran bayar terus
  if (PRODUK.some(function (p) { return p.bcl && !belum(p); })) {
    $$("[data-bila-bcl]").forEach(function (el) { el.textContent = el.getAttribute("data-bila-bcl"); });
  }

  var bar = $("#bar-bawah"), hero = $(".hero");
  if ("IntersectionObserver" in window && bar && hero) {
    new IntersectionObserver(function (e) { bar.classList.toggle("nampak", !e[0].isIntersecting); }).observe(hero);
  }

  if (C.analitik_cloudflare) {
    var sc = document.createElement("script");
    sc.defer = true;
    sc.src = "https://static.cloudflareinsights.com/beacon.min.js";
    sc.setAttribute("data-cf-beacon", JSON.stringify({ token: C.analitik_cloudflare }));
    document.body.appendChild(sc);
  }

  var ld = document.createElement("script");
  ld.type = "application/ld+json";
  ld.textContent = JSON.stringify({
    "@context": "https://schema.org", "@type": "Person", name: C.nama, jobTitle: C.peranan,
    url: C.domain || undefined,
    sameAs: [S.threads, S.instagram, S.tiktok].filter(Boolean),
    makesOffer: PRODUK.map(function (p) {
      return { "@type": "Offer", name: p.nama, price: p.harga, priceCurrency: "MYR", url: p.bcl || undefined };
    })
  });
  document.head.appendChild(ld);
})();
