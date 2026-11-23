// Gaya A: nama penuh dimuatkan pada lebar skrin, kad intai pada baris bidang, jam MYT.
(function () {
  "use strict";
  var n = document.getElementById("nama");
  function muat() {
    if (!n) return;
    var ruang = window.innerWidth * (window.innerWidth < 860 ? 0.92 : 0.9);
    n.style.fontSize = "100px";
    var r = document.createRange();
    r.selectNodeContents(n);
    var lebar = r.getBoundingClientRect().width;
    if (lebar > 0) n.style.fontSize = (100 * ruang / lebar) + "px";
  }
  muat();
  window.addEventListener("resize", muat);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(muat);

  var it = document.getElementById("intai");
  if (it && window.matchMedia("(hover:hover)").matches) {
    window.addEventListener("mousemove", function (e) { it.style.left = e.clientX + "px"; it.style.top = e.clientY + "px"; });
    Array.prototype.forEach.call(document.querySelectorAll(".baris"), function (b) {
      b.addEventListener("mouseenter", function () {
        it.style.background = b.getAttribute("data-warna");
        document.getElementById("intai-teks").textContent = b.getAttribute("data-teks");
        document.getElementById("intai-kecil").textContent = b.getAttribute("data-kecil");
        it.classList.add("on");
      });
      b.addEventListener("mouseleave", function () { it.classList.remove("on"); });
    });
  }

  var jam = document.getElementById("jam");
  function masa() {
    if (jam) jam.textContent = new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Kuala_Lumpur", hour: "2-digit", minute: "2-digit" }) + " MYT";
  }
  masa();
  setInterval(masa, 30000);
})();
