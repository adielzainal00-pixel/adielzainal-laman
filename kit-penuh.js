// Halaman kit berbayar: ?k=<kit>&pesanan=<no. pesanan>&e=<e-mel> (Success URL BCL) -> POST /api/kit -> papar isi kit.
// Semua teks kit dipapar dengan textContent (tiada HTML dari pelayan).
(function () {
  var q = new URLSearchParams(location.search);
  var kit = (q.get("k") || "").toLowerCase();
  var f = document.getElementById("borang-kit");
  var mesej = document.getElementById("mesej-kit");
  var tunggu = document.getElementById("kit-tunggu");
  var isi = document.getElementById("kit-isi");
  var butang = f.querySelector("button[type=submit]");
  var RALAT = {
    format: "Semak semula no. pesanan dan e-mel anda.",
    tak_jumpa: "Tak jumpa pesanan dengan no. pesanan dan e-mel ini. Kalau anda baru bayar, tunggu 1 minit dan cuba lagi.",
    produk_lain: "Pesanan ini untuk produk lain. Buka pautan dalam e-mel kit yang anda beli.",
    disekat: "Akses untuk pesanan ini telah ditutup. Mesej saya jika ini satu kesilapan.",
    belum_aktif: "Kit ini sedang disediakan. Cuba lagi sebentar, atau mesej saya dengan no. pesanan anda.",
    sistem: "Sistem tak dapat semak pesanan sekarang. Cuba lagi dalam beberapa minit."
  };
  if (!/^[a-z0-9-]{2,30}$/.test(kit)) { mesej.textContent = "Pautan kit tidak lengkap. Buka semula pautan dalam e-mel anda."; butang.disabled = true; return; }
  document.getElementById("kit-kicker").textContent = "Kit " + kit.toUpperCase() + " · Penuh";

  var pq = (q.get("pesanan") || "").trim(), eq = (q.get("e") || "").trim();
  if (/^[A-Za-z0-9][A-Za-z0-9_-]{2,40}$/.test(pq)) f.pesanan.value = pq.toUpperCase();
  if (eq.indexOf("@") > 0) f.emel.value = eq;

  function el(tag, cls, teks) { var e = document.createElement(tag); if (cls) e.className = cls; if (teks != null) e.textContent = teks; return e; }

  function papar(j) {
    var k = j.kit || {};
    isi.textContent = "";
    if (k.tajuk) isi.appendChild(el("h2", "", k.tajuk));
    if (k.ringkas) isi.appendChild(el("p", "lead", k.ringkas));
    (k.bahagian || []).forEach(function (b) {
      if (b.tajuk) isi.appendChild(el("h2", "", b.tajuk));
      if (b.teks) isi.appendChild(el("p", "", b.teks));
      if (b.langkah && b.langkah.length) {
        var ol = el("ol", "langkah");
        b.langkah.forEach(function (x) { ol.appendChild(el("li", "", x)); });
        isi.appendChild(ol);
      }
      if (b.kod) {
        isi.appendChild(el("pre", "", b.kod));
        var s = el("button", "salin", b.salinLabel || "Salin");
        s.type = "button";
        s.addEventListener("click", function () {
          (navigator.clipboard ? navigator.clipboard.writeText(b.kod) : Promise.reject()).then(
            function () { s.textContent = "Disalin ✓"; }, function () { s.textContent = "Salin manual dari kotak atas"; });
        });
        isi.appendChild(s);
      }
      if (b.tip) isi.appendChild(el("p", "nota", "💡 " + b.tip));
    });
    f.hidden = true;
    isi.hidden = false;
  }

  function hantar() {
    mesej.textContent = "";
    butang.disabled = true;
    tunggu.hidden = false;
    fetch("/api/kit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kit: kit, pesanan: f.pesanan.value, emel: f.emel.value })
    }).then(function (r) { return r.json(); }).then(function (j) {
      if (!j.ok) { mesej.textContent = RALAT[j.ralat] || RALAT.sistem; return; }
      papar(j);
    }).catch(function () { mesej.textContent = RALAT.sistem; })
      .then(function () { butang.disabled = false; tunggu.hidden = true; });
  }

  f.addEventListener("submit", function (ev) { ev.preventDefault(); hantar(); });
  // Datang terus dari BCL selepas bayar: buka kit tanpa taip apa-apa.
  if (f.pesanan.value && f.emel.value) hantar();
})();
