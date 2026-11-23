// Halaman akses pembeli: hantar no. pesanan + e-mel ke /api/akses (worker/index.js), papar butang muat turun.
(function () {
  var f = document.getElementById("borang-akses");
  if (!f) return;
  var produk = f.getAttribute("data-produk");
  var butang = f.querySelector("button[type=submit]");
  var mesej = document.getElementById("mesej-akses");
  var hasil = document.getElementById("hasil-akses");
  var RALAT = {
    format: "Semak semula no. pesanan dan e-mel anda.",
    tak_jumpa: "Tak jumpa pesanan dengan no. pesanan dan e-mel ini. Guna e-mel yang anda isi semasa bayar, dan no. pesanan dalam resit BCL (contoh: BCL-01234).",
    produk_lain: "Pesanan ini untuk produk lain. Buka pautan akses dalam e-mel produk yang anda beli.",
    disekat: "Akses untuk pesanan ini telah ditutup. Mesej saya jika ini satu kesilapan.",
    belum_aktif: "Sistem muat turun sedang disediakan. Cuba lagi sebentar, atau mesej saya dengan no. pesanan anda.",
    sistem: "Sistem tak dapat semak pesanan sekarang. Cuba lagi dalam beberapa minit."
  };
  var q = new URLSearchParams(location.search);
  // pautan dalam e-mel BCL: ?pesanan={reference_id}. Isi hanya jika BCL memang gantikan pemboleh ubah itu.
  var pq = (q.get("pesanan") || "").trim();
  if (/^[A-Za-z0-9][A-Za-z0-9_-]{2,40}$/.test(pq)) f.pesanan.value = pq.toUpperCase();

  function el(tag, cls, teks) { var e = document.createElement(tag); if (cls) e.className = cls; if (teks) e.textContent = teks; return e; }

  f.addEventListener("submit", function (ev) {
    ev.preventDefault();
    mesej.textContent = "";
    butang.disabled = true;
    butang.textContent = "Menyemak pesanan…";
    fetch("/api/akses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ produk: produk, pesanan: f.pesanan.value, emel: f.emel.value })
    }).then(function (r) { return r.json(); }).then(function (j) {
      if (!j.ok) { mesej.textContent = RALAT[j.ralat] || RALAT.sistem; return; }
      hasil.textContent = "";
      hasil.appendChild(el("p", "lead", "Terima kasih, " + (j.nama || "pembeli") + ". Fail anda sedia:"));
      j.fail.forEach(function (x) {
        var a = el("a", x.id === "pdf" ? "fail" : "fail kedua");
        var kiri = el("span");
        kiri.appendChild(el("b", "", x.label));
        kiri.appendChild(el("small", "", x.baki > 0 ? "Baki " + x.baki + " daripada " + x.had + " kali muat turun" : "Had muat turun dicapai. Mesej saya jika perlu salinan baru."));
        a.appendChild(kiri);
        a.appendChild(el("span", "", x.baki > 0 ? "Muat turun ↓" : "Tamat"));
        if (x.baki > 0) a.href = x.url; else a.setAttribute("aria-disabled", "true");
        hasil.appendChild(a);
      });
      hasil.appendChild(el("p", "nota", "Setiap PDF dicap dengan nama, e-mel dan no. pesanan anda. Pautan di atas sah 30 minit; selepas itu masukkan semula no. pesanan."));
      hasil.hidden = false;
      f.hidden = true;
    }).catch(function () { mesej.textContent = RALAT.sistem; })
      .then(function () { butang.disabled = false; butang.textContent = "Dapatkan fail saya →"; });
  });
})();
