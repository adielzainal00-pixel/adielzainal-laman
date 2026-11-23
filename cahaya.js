// Gaya Cahaya: muncul semasa skrol, dan butang Lulus / Tunggu dulu dalam contoh mesej AI.
(function () {
  "use strict";
  document.documentElement.classList.add("js");
  var el = document.querySelectorAll(".muncul");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("nampak"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    Array.prototype.forEach.call(el, function (x) { io.observe(x); });
  } else {
    Array.prototype.forEach.call(el, function (x) { x.classList.add("nampak"); });
  }
  Array.prototype.forEach.call(document.querySelectorAll("[data-jawab]"), function (b) {
    b.addEventListener("click", function () {
      var msg = b.closest(".msg");
      Array.prototype.forEach.call(msg.querySelectorAll("[data-jawab]"), function (x) { x.disabled = true; });
      msg.querySelector(".balas").textContent = b.textContent + ". " + b.getAttribute("data-jawab");
    });
  });
})();
