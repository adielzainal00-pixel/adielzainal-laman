/* Pratonton ebook di laman utama: dinding halaman bergerak, pop-up "Intip isi buku", video bab ringan.
   Halaman = gambar sahaja (bukan PDF). Halaman separuh terbuka sudah dikaburkan dalam fail gambar (aset/intip/s-*.webp),
   jadi isi berbayar tidak boleh dibaca walaupun gambar dimuat turun. Harga, promo dan WhatsApp diurus app.js. */
(function () {
  "use strict";
  var A = "aset/intip/";
  var PERCUMA = ["c07", "c23", "c08", "c09", "h06"];                 // tools + permulaan Bab 1, penuh
  var SEPARA = ["c49", "c46", "c43", "c34", "c25", "h25", "c42"];    // hack, prompt, arahan: separuh terbuka
  var DINDING = ["c49", "c07", "c43", "c23", "c46", "c34", "c25", "h25", "c24", "c42", "h06", "h07", "c08", "c30", "h11", "h14"];
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // dinding: dua baris bergerak bertentangan (gambar resolusi rendah)
  $$("[data-dinding]").forEach(function (el) {
    [[0, 8, "kiri"], [8, 16, "kanan"]].forEach(function (b) {
      var s = DINDING.slice(b[0], b[1]), r = document.createElement("div");
      r.className = "dd-baris " + b[2];
      r.innerHTML = '<div class="dd-trek">' + s.concat(s).map(function (n) {
        return '<figure class="dd-hlm"><img src="' + A + "d-" + n + '.webp" alt="" loading="lazy" width="300" height="532"></figure>';
      }).join("") + "</div>";
      el.appendChild(r);
    });
  });

  // pop-up buku
  var dlg = document.createElement("dialog");
  dlg.className = "buku-dlg";
  dlg.setAttribute("aria-label", "Intip isi ebook");
  dlg.innerHTML =
    '<div class="bd-atas"><b>Intip isi buku · tools, hack, prompt</b><span class="bd-kira"></span><button class="bd-tutup" type="button" aria-label="Tutup">✕</button></div>' +
    '<div class="bd-trek">' +
    PERCUMA.map(function (n) { return '<figure><img src="' + A + n + '.webp" alt="Halaman contoh ebook" loading="lazy"></figure>'; }).join("") +
    SEPARA.map(function (n) { return '<figure class="separa"><div class="sp-bingkai"><img src="' + A + "s-" + n + '.webp" alt="" loading="lazy"><span class="sp-label">🔒 Sambungan dalam buku penuh</span></div></figure>'; }).join("") +
    '<figure class="bd-akhir"><div><p class="bd-k">Itu baru sedikit.</p><h3>12 hack, 25 prompt, 29 video bab. Semua dalam buku.</h3>' +
    '<a class="bd-cta" href="#produk" data-tutup>Lihat pakej ebook</a></div></figure>' +
    "</div>" +
    '<div class="bd-bawah"><button class="bd-sebelum" type="button" aria-label="Halaman sebelum">‹</button><span>Leret atau tekan anak panah</span><button class="bd-seterus" type="button" aria-label="Halaman seterusnya">›</button></div>';
  document.body.appendChild(dlg);
  var trek = dlg.querySelector(".bd-trek"), kira = dlg.querySelector(".bd-kira");
  var jumlah = function () { return trek.children.length; };
  var semasa = function () { return Math.round(trek.scrollLeft / trek.clientWidth); };
  var pergi = function (i) { trek.scrollTo({ left: Math.max(0, Math.min(jumlah() - 1, i)) * trek.clientWidth, behavior: "smooth" }); };
  var kemas = function () { kira.textContent = (semasa() + 1) + " / " + jumlah(); };
  trek.addEventListener("scroll", function () { window.requestAnimationFrame(kemas); }, { passive: true });
  dlg.querySelector(".bd-sebelum").onclick = function () { pergi(semasa() - 1); };
  dlg.querySelector(".bd-seterus").onclick = function () { pergi(semasa() + 1); };
  dlg.querySelector(".bd-tutup").onclick = function () { dlg.close(); };
  dlg.querySelector("[data-tutup]").onclick = function () { dlg.close(); };
  dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener("keydown", function (e) { if (e.key === "ArrowRight") pergi(semasa() + 1); if (e.key === "ArrowLeft") pergi(semasa() - 1); });
  $$("[data-buka-bab]").forEach(function (b) {
    b.addEventListener("click", function (e) {
      e.preventDefault();
      if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
      trek.scrollLeft = 0; kemas();
    });
  });

  // video bab: main bila kelihatan sahaja (ringan di telefon)
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (x) { var v = x.target; if (x.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause(); });
    }, { threshold: 0.3 });
    $$("video[data-auto]").forEach(function (v) { io.observe(v); });
  }

  // FAQ: satu terbuka pada satu masa
  $$(".faq details").forEach(function (d) {
    d.addEventListener("toggle", function () { if (d.open) $$(".faq details").forEach(function (o) { if (o !== d) o.open = false; }); });
  });
})();
