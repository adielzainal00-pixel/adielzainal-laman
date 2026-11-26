// Muat naik video bab ebook (pembeli sahaja) ke KV PRODUK dan tulis worker/video.json.
// Jalankan di laptop Adiel (wrangler sudah log masuk):
//   node alat/terbit_video.mjs                 semua kod yang ada video_telefon.mp4
//   node alat/terbit_video.mjs C01 H03         kod tertentu sahaja
//   node alat/terbit_video.mjs --kering        tulis video.json tanpa muat naik (semak)
// Sumber: ~/sass-ebook-video/<KOD>/video_telefon.mp4 + poster.jpg, tajuk dari films.js.
// Kunci KV: video/<KOD>-<hash10>.mp4 dan .jpg (kunci baru setiap kali fail berubah; produksi tak terjejas sampai PR digabung).
// KV had 25 MiB setiap nilai: versi telefon (< 20 MB) sahaja.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { homedir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const L = join(dirname(fileURLToPath(import.meta.url)), "..");
const SUMBER = process.env.VIDEO_SUMBER || join(homedir(), "sass-ebook-video");
const OUT = join(L, "worker", "video.json");
const args = process.argv.slice(2);
const kering = args.includes("--kering");
const pilih = args.filter((a) => /^[CH]\d\d$/.test(a));

const { FILMS } = await import(pathToFileURL(join(SUMBER, "films.js")).href);
const lama = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : { bab: [] };
const ikut = new Map(lama.bab.map((b) => [b.kod, b]));

const hash = (buf) => createHash("sha256").update(buf).digest("hex").slice(0, 10);
function kvPut(kunci, fail) {
  const a = ["--yes", "wrangler", "kv", "key", "put", "--remote", "--binding", "PRODUK", kunci, "--path", fail];
  try { execFileSync("npx.cmd", a, { cwd: L, stdio: "pipe", shell: true }); }
  catch { execFileSync("npx", a, { cwd: L, stdio: "inherit" }); }
}

const kod = Object.keys(FILMS).filter((k) => /^[CH]\d\d$/.test(k)).sort();
for (const k of kod) {
  if (pilih.length && !pilih.includes(k)) continue;
  const mp4 = join(SUMBER, k, "video_telefon.mp4"), jpg = join(SUMBER, k, "poster.jpg");
  if (!existsSync(mp4) || !existsSync(jpg)) { console.log(`${k}: tiada video lagi, langkau`); continue; }
  const saiz = statSync(mp4).size;
  if (saiz > 24 * 1024 * 1024) throw new Error(`${k}: ${saiz} bait, melebihi had KV 25 MiB`);
  const v = readFileSync(mp4), p = readFileSync(jpg);
  const f = FILMS[k];
  const bab = Number(k.slice(1));
  const rek = {
    kod: k,
    siri: k[0],
    bab,
    tajuk: (f.title || []).join(" ").replace(/\s+/g, " ").trim(),
    ebook: f.ebook || "",
    video: `video/${k}-${hash(v)}.mp4`,
    poster: `video/${k}-${hash(p)}.jpg`,
    saiz,
  };
  const sedia = ikut.get(k);
  if (sedia && sedia.video === rek.video && sedia.poster === rek.poster) { console.log(`${k}: tiada perubahan`); ikut.set(k, rek); continue; }
  if (!kering) {
    console.log(`${k}: muat naik ${rek.video} (${(saiz / 1e6).toFixed(1)} MB)`);
    kvPut(rek.video, mp4);
    kvPut(rek.poster, jpg);
  } else console.log(`${k}: (kering) ${rek.video}`);
  ikut.set(k, rek);
}

const bab = [...ikut.values()].sort((a, b) => a.siri.localeCompare(b.siri) || a.bab - b.bab);
writeFileSync(OUT, JSON.stringify({ bab }, null, 1) + "\n");
console.log(`worker/video.json: ${bab.length} video. Seterusnya: commit worker/video.json dan buka PR.`);
