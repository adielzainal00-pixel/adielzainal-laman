// Pintu muat turun ebook (Cloudflare Worker, pelan percuma).
// 1. Pembeli masukkan no. pesanan + e-mel di halaman akses -> POST /api/akses
// 2. Worker semak pesanan itu dengan API BCL (webhook BCL tak ditandatangani, jadi API ialah sumber benar)
// 3. Pautan muat turun bertandatangan (sah 30 minit) -> GET /api/fail
// 4. PDF dicap nama, e-mel dan no. pesanan pembeli di setiap halaman; had HAD muat turun setiap fail; log IP
// Kit berbayar RM3: POST /api/kit (halaman kit-penuh.html), isi kit dari KV PRODUK kit/<id>.json
// Fail templat disimpan dalam KV PRODUK (bukan dalam repo atau aset awam); kunci dalam produk.json. Muat naik: alat/terbit_produk.sh
// Rahsia (wrangler secret): BCL_TOKEN (token API BCL, kebenaran API Read sahaja), KUNCI (tandatangan pautan).
// Pemboleh ubah (wrangler.jsonc vars): BORANG_META, BORANG_HERMES (ID borang BCL, dipisah koma), BENARKAN_UJIAN ("1" semasa Test Mode).
import DATA from "./produk.json";
import VIDEO from "./video.json";

const HAD = 5;                    // muat turun setiap fail, setiap pesanan
const SAH_SAAT = 30 * 60;         // pautan muat turun sah
const SIMPAN_SAAT = 6 * 3600;     // rekod pesanan disimpan dalam KV (kurangkan panggilan API BCL)
const TAKJUMPA_SAAT = 600;        // no. pesanan yang tiada: tak tanya BCL semula selama ini

const VIDEO_SAAT = 3 * 3600;      // pautan video sah (pembeli tonton dalam laman)
// Siri video bab mengikut produk: C = Claude Untuk Pemula, H = Hermes v2. Pakej Autopilot = kedua-duanya.
const SIRI_VIDEO = { claude: ["C"], autopilot: ["C", "H"], hermes: ["H"] };
// Produk yang belum ada fail dalam produk.json (PDF akhir belum siap) tetap boleh buka halaman akses untuk video.
const PRODUK_LAIN = { claude: { nama: "Claude Untuk Pemula", fail: [] }, autopilot: { nama: "Pakej Bisnes Autopilot", fail: [] } };

// Kit RM3 (borang BCL 23113): pembeli ebook dapat semua kit ini percuma. Kit baru: tambah id di sini juga.
const KIT_SEMUA = ["setup", "agent", "belajar", "creator", "repo", "motion", "loop", "cheat"];
const PRODUK_EBOOK = ["claude", "autopilot"];

const KEPALA = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow", "Referrer-Policy": "no-referrer" };

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    try {
      if (url.pathname === "/api/akses" && req.method === "POST") return await akses(req, env);
      if (url.pathname === "/api/fail" && req.method === "GET") return await muatTurun(url, req, env);
      if (url.pathname === "/api/video" && req.method === "GET") return await video(url, req, env);
      if (url.pathname === "/api/kit" && req.method === "POST") return await kitBerbayar(req, env);
    } catch (e) {
      console.log("ralat", e && e.stack || e);
      return json({ ok: false, ralat: "sistem" }, 502);
    }
    if (url.pathname.startsWith("/fail/") || url.pathname.startsWith("/api/")) {
      return new Response("Tiada", { status: 404, headers: KEPALA });
    }
    return env.ASSETS.fetch(req);
  },
};

// ---------- POST /api/akses ----------
async function akses(req, env) {
  if (Number(req.headers.get("content-length") || 0) > 2000) return json({ ok: false, ralat: "format" }, 400);
  let b;
  try { b = await req.json(); } catch { return json({ ok: false, ralat: "format" }, 400); }
  const pid = String(b.produk || "");
  const produk = DATA.produk[pid] || PRODUK_LAIN[pid];
  const pesanan = String(b.pesanan || "").toUpperCase().replace(/\s+/g, "");
  const emel = String(b.emel || "").trim().toLowerCase();
  if (!produk || !/^[A-Z0-9][A-Z0-9_-]{2,40}$/.test(pesanan) || !/^[^@\s]{1,64}@[^@\s]{1,190}\.[^@\s]{2,}$/.test(emel)) {
    return json({ ok: false, ralat: "format" }, 400);
  }
  const semak = await semakPesanan(pesanan, emel, pid, env);
  if (semak.ralat) return semak.ralat;
  const rek = semak.rek;

  const exp = Math.floor(Date.now() / 1000) + SAH_SAAT;
  const fail = [];
  for (const f of produk.fail) {
    const n = parseInt(await env.MUAT_TURUN.get(`n:${pesanan}:${pid}:${f.id}`) || "0", 10);
    const s = await tandatangan(env.KUNCI, `${pesanan}|${pid}|${f.id}|${exp}`);
    fail.push({
      id: f.id, label: f.label, baki: Math.max(0, HAD - n), had: HAD,
      url: `/api/fail?o=${encodeURIComponent(pesanan)}&p=${pid}&f=${f.id}&e=${exp}&s=${s}`,
    });
  }
  const vexp = Math.floor(Date.now() / 1000) + VIDEO_SAAT;
  const siri = SIRI_VIDEO[pid] || [];
  const video = [];
  for (const v of VIDEO.bab || []) {
    if (!siri.includes(v.siri)) continue;
    const s = await tandatangan(env.KUNCI, `${pesanan}|${pid}|vid:${v.kod}|${vexp}`);
    const asas = `/api/video?o=${encodeURIComponent(pesanan)}&p=${pid}&k=${v.kod}&e=${vexp}&s=${s}`;
    video.push({ kod: v.kod, siri: v.siri, bab: v.bab, tajuk: v.tajuk, ebook: v.ebook, url: asas, poster: asas + "&j=poster" });
  }
  return json({ ok: true, nama: rek.nama, produk: produk.nama, fail, video });
}

// Semak pesanan dengan BCL (rekod disimpan 6 jam dalam KV). Pulang { rek } atau { ralat: Response }.
async function semakPesanan(pesanan, emel, pid, env) {
  if (!env.BCL_TOKEN || !env.KUNCI || !env.MUAT_TURUN) return { ralat: json({ ok: false, ralat: "belum_aktif" }, 503) };
  if (await env.MUAT_TURUN.get("sekat:" + pesanan)) return { ralat: json({ ok: false, ralat: "disekat" }, 403) };

  let rek = await env.MUAT_TURUN.get("p:" + pesanan, "json");
  if (!rek) {
    const cache = caches.default, kunciCache = new Request("https://cache.adielzainal.invalid/takjumpa/" + pesanan);
    if (await cache.match(kunciCache)) return { ralat: json({ ok: false, ralat: "tak_jumpa" }, 404) };
    rek = await cariPesanan(pesanan, pid, env);
    if (!rek) {
      await cache.put(kunciCache, new Response("1", { headers: { "Cache-Control": "max-age=" + TAKJUMPA_SAAT } }));
      return { ralat: json({ ok: false, ralat: "tak_jumpa" }, 404) };
    }
    await env.MUAT_TURUN.put("p:" + pesanan, JSON.stringify(rek), { expirationTtl: SIMPAN_SAAT });
  }
  // e-mel salah dan pesanan tiada beri jawapan yang sama (orang tak boleh teka pesanan siapa wujud)
  if (rek.emel !== emel) return { ralat: json({ ok: false, ralat: "tak_jumpa" }, 404) };
  if (pid && !rek.produk.includes(pid)) return { ralat: json({ ok: false, ralat: "produk_lain" }, 403) };
  return { rek };
}

// ---------- POST /api/kit ----------
// Kit berbayar (RM3 sekit). Borang BCL: item bernama "Kit <KATA KUNCI>" (cth. "Kit MOTION Penuh").
// Success URL borang: https://adielzainal.com/kit-penuh?k=<id>&pesanan={order_number}&e={email}
// Isi kit dalam KV PRODUK, kunci kit/<id>.json (alat/terbit_kit.sh), bukan dalam repo awam.
async function kitBerbayar(req, env) {
  if (Number(req.headers.get("content-length") || 0) > 2000) return json({ ok: false, ralat: "format" }, 400);
  let b;
  try { b = await req.json(); } catch { return json({ ok: false, ralat: "format" }, 400); }
  const id = String(b.kit || "").toLowerCase();
  const pesanan = String(b.pesanan || "").toUpperCase().replace(/\s+/g, "");
  const emel = String(b.emel || "").trim().toLowerCase();
  if ((id && !/^[a-z0-9-]{2,30}$/.test(id)) || !/^[A-Z0-9][A-Z0-9_-]{2,40}$/.test(pesanan) || !/^[^@\s]{1,64}@[^@\s]{1,190}\.[^@\s]{2,}$/.test(emel)) {
    return json({ ok: false, ralat: "format" }, 400);
  }
  // Satu borang BCL "Kit Keyword" boleh ada banyak item: tanpa id (atau id bukan dalam pesanan) = buka semua kit dalam pesanan.
  const semak = await semakPesanan(pesanan, emel, null, env);
  if (semak.ralat) return semak.ralat;
  const ebook = semak.rek.produk.some((p) => PRODUK_EBOOK.includes(p));
  const dibeli = ebook ? KIT_SEMUA : semak.rek.produk.filter((p) => p.startsWith("kit-")).map((p) => p.slice(4));
  const pilih = id && dibeli.includes(id) ? [id] : dibeli;
  const kits = [];
  for (const k of pilih) {
    const isi = env.PRODUK && (await env.PRODUK.get("kit/" + k + ".json", "json"));
    if (isi) kits.push({ id: k, kit: isi });
  }
  if (!kits.length) return json({ ok: false, ralat: dibeli.length ? "belum_aktif" : "produk_lain" }, dibeli.length ? 503 : 403);
  const log = (await env.MUAT_TURUN.get("logkit:" + pesanan, "json")) || [];
  log.push({ t: new Date().toISOString(), k: kits.map((x) => x.id).join(","), ip: req.headers.get("CF-Connecting-IP") || "" });
  await env.MUAT_TURUN.put("logkit:" + pesanan, JSON.stringify(log.slice(-30)));
  return json({ ok: true, nama: semak.rek.nama, bonus: ebook, kit: kits[0].kit, kits });
}

async function cariPesanan(no, pid, env) {
  const asas = (env.BCL_API || "https://api.bcl.my/v1").replace(/\/$/, "");
  const h = {
    Authorization: "Bearer " + env.BCL_TOKEN,
    Accept: "application/json",
    "User-Agent": "AdielZainalLaman/1.0 (+https://adielzainal.com)",
  };
  const ujian = env.BENARKAN_UJIAN === "1";
  const laluan = ["/transactions/" + encodeURIComponent(no)];
  if (ujian) laluan.push("/transaction/" + encodeURIComponent(no));   // Test Mode: hanya endpoint ini jumpa bayaran ujian
  for (const l of laluan) {
    const r = await fetch(asas + l, { headers: h });
    if (r.status === 404) continue;
    if (!r.ok) throw new Error("BCL " + r.status + " " + l);
    const j = await r.json();
    const d = j && j.data;
    if (d && d.main_data) {                                     // GET /transactions/{no}: butiran penuh
      const m = d.main_data;
      if ((m.transaction_type || "live") !== "live" && !ujian) return null;
      if (!(m.is_paid === true || m.is_paid === 1) || Number(m.status) !== 3) return null;
      return { nama: bersih(m.payer_name), emel: String(m.payer_email || "").trim().toLowerCase(), produk: kenalProduk(d, m, env) };
    }
    if (ujian && d && d.transaction) {                          // GET /transaction/{no}: Test Mode, tiada maklumat borang
      const t = d.transaction;
      if (Number(t.status) !== 3) return null;
      return { nama: bersih(t.payer_name), emel: String(t.payer_email || "").trim().toLowerCase(), produk: [pid], ujian: true };
    }
  }
  return null;
}

function kenalProduk(d, m, env) {
  const fid = String(d.formable_id ?? "");
  const senarai = (v) => String(v || "").split(",").map((x) => x.trim()).filter(Boolean);
  const teks = [d.form_title, ...(m.items || []).map((i) => i && i.item)].join(" ").toLowerCase();
  const out = [];
  const meta = senarai(env.BORANG_META), hermes = senarai(env.BORANG_HERMES);
  if (meta.length ? meta.includes(fid) : teks.includes("meta ads")) out.push("meta");
  if (hermes.length ? hermes.includes(fid) : teks.includes("hermes")) out.push("hermes");
  if (teks.includes("claude untuk pemula")) out.push("claude");
  if (teks.includes("autopilot")) out.push("autopilot");
  // kit berbayar: item atau tajuk borang "Kit <KATA KUNCI>" -> "kit-<kata kunci>"
  for (const m of teks.matchAll(/\bkit\s+([a-z0-9-]{2,30})\b/g)) if (!out.includes("kit-" + m[1])) out.push("kit-" + m[1]);
  return out;
}

// ---------- GET /api/fail ----------
async function muatTurun(url, req, env) {
  const q = (k) => url.searchParams.get(k) || "";
  const o = q("o").toUpperCase(), pid = q("p"), fid = q("f"), e = q("e"), s = q("s");
  const produk = DATA.produk[pid];
  const fail = produk && produk.fail.find((x) => x.id === fid);
  if (!fail || !env.KUNCI || !env.MUAT_TURUN) return halaman("Pautan muat turun tidak sah.", 400);
  if (!/^\d{10}$/.test(e) || Number(e) < Date.now() / 1000) {
    return halaman("Pautan muat turun sudah tamat. Kembali ke halaman akses dan masukkan semula no. pesanan anda.", 410);
  }
  if (!(await sahkan(env.KUNCI, `${o}|${pid}|${fid}|${e}`, s))) return halaman("Pautan muat turun tidak sah.", 403);
  if (await env.MUAT_TURUN.get("sekat:" + o)) return halaman("Akses untuk pesanan ini telah ditutup. Mesej saya jika ini satu kesilapan.", 403);
  const rek = await env.MUAT_TURUN.get("p:" + o, "json");
  if (!rek) return halaman("Sesi tamat. Kembali ke halaman akses dan masukkan semula no. pesanan anda.", 410);

  const kunci = `n:${o}:${pid}:${fid}`;
  const n = parseInt(await env.MUAT_TURUN.get(kunci) || "0", 10);
  if (n >= HAD) {
    return halaman(`Had ${HAD} kali muat turun untuk fail ini sudah dicapai. Mesej saya dengan no. pesanan ${o} jika anda perlukan salinan baru.`, 429);
  }

  const data = env.PRODUK && (await env.PRODUK.get(fail.kunci, "arrayBuffer"));
  if (!data) return halaman("Fail tidak dapat dibuka sekarang. Cuba lagi sebentar.", 502);
  let badan = data;
  if (fail.offset) {
    const buf = new Uint8Array(data);
    const cap = hexCap(`Lesen: ${rek.nama} | ${rek.emel} | Pesanan ${o} | Satu pembeli, jangan kongsi | adielzainal.com`);
    for (const off of fail.offset) buf.set(cap, off);
    badan = buf;
  }

  await env.MUAT_TURUN.put(kunci, String(n + 1));
  const log = (await env.MUAT_TURUN.get("log:" + o, "json")) || [];
  log.push({ t: new Date().toISOString(), p: pid, f: fid, ip: req.headers.get("CF-Connecting-IP") || "", n: (req.cf && req.cf.country) || "" });
  await env.MUAT_TURUN.put("log:" + o, JSON.stringify(log.slice(-30)));

  return new Response(badan, {
    headers: {
      ...KEPALA,
      "Content-Type": fail.offset ? "application/pdf" : "application/zip",
      "Content-Disposition": `attachment; filename="${fail.nama_muat}"`,
    },
  });
}

// ---------- GET /api/video ----------
// Video bab untuk pembeli sahaja: pautan bertandatangan (HMAC, sah 3 jam), dimainkan dalam laman (sokong Range untuk Safari/iPhone).
async function video(url, req, env) {
  const q = (k) => url.searchParams.get(k) || "";
  const o = q("o").toUpperCase(), pid = q("p"), kod = q("k"), e = q("e"), s = q("s"), poster = q("j") === "poster";
  const v = (VIDEO.bab || []).find((x) => x.kod === kod);
  if (!v || !(SIRI_VIDEO[pid] || []).includes(v.siri) || !env.KUNCI || !env.MUAT_TURUN) return new Response("Tidak sah", { status: 400, headers: KEPALA });
  if (!/^\d{10}$/.test(e) || Number(e) < Date.now() / 1000) return new Response("Pautan tamat. Muat semula halaman akses.", { status: 410, headers: KEPALA });
  if (!(await sahkan(env.KUNCI, `${o}|${pid}|vid:${kod}|${e}`, s))) return new Response("Tidak sah", { status: 403, headers: KEPALA });
  if (await env.MUAT_TURUN.get("sekat:" + o)) return new Response("Akses ditutup", { status: 403, headers: KEPALA });

  const data = env.PRODUK && (await env.PRODUK.get(poster ? v.poster : v.video, "arrayBuffer"));
  if (!data) return new Response("Video tidak dapat dibuka sekarang", { status: 502, headers: KEPALA });
  const jenis = poster ? "image/jpeg" : "video/mp4";
  const h = { ...KEPALA, "Cache-Control": "private, max-age=600", "Content-Type": jenis, "Content-Disposition": "inline", "Accept-Ranges": "bytes" };
  const n = data.byteLength;
  const julat = !poster && /^bytes=(\d*)-(\d*)$/.exec(req.headers.get("Range") || "");
  if (julat && (julat[1] || julat[2])) {
    let a = julat[1] ? Number(julat[1]) : n - Number(julat[2]);
    const b = julat[1] && julat[2] ? Math.min(Number(julat[2]), n - 1) : n - 1;
    if (a < 0) a = 0;
    if (a >= n || a > b) return new Response(null, { status: 416, headers: { ...h, "Content-Range": `bytes */${n}` } });
    return new Response(data.slice(a, b + 1), { status: 206, headers: { ...h, "Content-Range": `bytes ${a}-${b}/${n}`, "Content-Length": String(b - a + 1) } });
  }
  return new Response(data, { headers: { ...h, "Content-Length": String(n) } });
}

// ---------- alat ----------
function bersih(s) {
  return String(s || "").normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
}

// teks cap -> hex ASCII panjang tetap (sama panjang dengan placeholder dalam PDF)
function hexCap(teks) {
  const n = DATA.panjang;
  let t = bersih(teks).replace(/[^\x20-\x7e]/g, "?");
  t = t.length > n ? t.slice(0, n) : t.padEnd(n, " ");
  const out = new Uint8Array(n * 2);
  const hex = "0123456789abcdef";
  for (let i = 0; i < n; i++) {
    const c = t.charCodeAt(i);
    out[i * 2] = hex.charCodeAt(c >> 4);
    out[i * 2 + 1] = hex.charCodeAt(c & 15);
  }
  return out;
}

async function kunciHmac(rahsia) {
  return crypto.subtle.importKey("raw", new TextEncoder().encode(rahsia), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}
function b64url(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
async function tandatangan(rahsia, mesej) {
  const sig = await crypto.subtle.sign("HMAC", await kunciHmac(rahsia), new TextEncoder().encode(mesej));
  return b64url(sig);
}
async function sahkan(rahsia, mesej, s) {
  const jangka = await tandatangan(rahsia, mesej);
  if (jangka.length !== s.length) return false;
  let beza = 0;
  for (let i = 0; i < s.length; i++) beza |= jangka.charCodeAt(i) ^ s.charCodeAt(i);
  return beza === 0;
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { ...KEPALA, "Content-Type": "application/json; charset=utf-8" } });
}
function halaman(mesej, status) {
  const esc = (x) => x.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const html = `<!doctype html><html lang="ms"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Muat turun | Adiel Zainal</title><link rel="stylesheet" href="/kecil.css?v=2"></head><body><main class="bingkai"><div class="kepala"><a href="/">Adiel Zainal</a><span>Akses pembeli</span></div><h1>Muat turun</h1><p class="lead">${esc(mesej)}</p><p><a class="btn garis" href="javascript:history.back()">← Kembali</a></p></main></body></html>`;
  return new Response(html, { status, headers: { ...KEPALA, "Content-Type": "text/html; charset=utf-8" } });
}
