"""Sediakan fail produk untuk pintu muat turun (dipanggil oleh alat/terbit_produk.sh, BUKAN oleh bina.sh).

Untuk setiap PDF: tambah satu baris kaki di setiap halaman berisi placeholder panjang tetap,
sebagai kemas kini bertambah (incremental update), tanpa mampatan. Teks disimpan sebagai hex
dalam aliran kandungan, jadi Worker boleh tukar placeholder kepada butiran pembeli dengan
menulis terus pada offset yang sudah diketahui (tiada proses PDF dalam Worker, kekal bawah had CPU percuma).

Hasil:
  .produk/<kunci>                  fail templat (gitignore), dimuat naik ke KV PRODUK oleh terbit_produk.sh
  worker/produk.json               offset placeholder + kunci KV (diimport oleh worker/index.js, MASUK git)

Kunci KV mengandungi hash fail, jadi templat baru dimuat naik di sebelah yang lama. produk.json hanya
menunjuk ke templat baru selepas PR digabung, jadi offset dan templat sentiasa sepadan.
Fail produk (berbayar) tidak pernah masuk repo; sumber di ../digital-products (repo agensi-ai).
"""
import hashlib
import json
import shutil
import sys
from pathlib import Path

import pymupdf

L = Path(__file__).resolve().parents[1]
DP = L.parent / "digital-products"
DIST = L / ".produk"
SUMBER = L / ".produk-sumber"   # PDF pakej baru (gitignore)
PANJANG = 120                     # aksara teks cap; Worker pad / potong ke panjang ini
PH = "#" * PANJANG
PH_HEX = PH.encode().hex().encode()

PRODUK = {
    "meta": {
        "nama": "Meta Ads Automation",
        "fail": [
            {"id": "pdf", "label": "Ebook Meta Ads Automation (PDF)", "src": DP / "ebook" / "meta-ads-automation-pembeli.pdf",
             "simpan": "meta-ads-automation.pdf", "nama_muat": "Meta-Ads-Automation-Adiel-Zainal.pdf"},
            {"id": "kit", "label": "Kit siap pasang (ZIP)", "src": "KIT",
             "simpan": "meta-ads-automation-kit.zip", "nama_muat": "meta-ads-automation-kit.zip"},
        ],
    },
    "hermes": {
        "nama": "Hermes: Pekerja AI 24 Jam",
        "fail": [
            {"id": "pdf", "label": "Ebook Hermes: Pekerja AI 24 Jam (PDF)", "src": DP / "ebook" / "hermes.pdf",
             "simpan": "hermes.pdf", "nama_muat": "Hermes-Pekerja-AI-24-Jam-Adiel-Zainal.pdf"},
        ],
    },
    # 3 pakej baru (26 Nov 2026). Sumber PDF dalam .produk-sumber/ (gitignore), salinan dari VPS company/coaching/ebook_update/.
    "claude": {
        "nama": "Claude Untuk Pemula",
        "fail": [
            {"id": "pdf", "label": "Ebook Claude Untuk Pemula (PDF)", "src": SUMBER / "claude-untuk-pemula.pdf",
             "simpan": "claude-untuk-pemula.pdf", "nama_muat": "Claude-Untuk-Pemula-Adiel-Zainal.pdf"},
        ],
    },
    "autopilot": {
        "nama": "Pakej Bisnes Autopilot",
        "fail": [
            {"id": "pdf", "label": "Ebook Claude Untuk Pemula (PDF)", "src": SUMBER / "claude-untuk-pemula.pdf",
             "simpan": "claude-untuk-pemula.pdf", "nama_muat": "Claude-Untuk-Pemula-Adiel-Zainal.pdf"},
            {"id": "pdf2", "label": "Ebook Hermes: Pekerja AI 24 Jam v2 (PDF)", "src": SUMBER / "hermes-v2.pdf",
             "simpan": "hermes-v2.pdf", "nama_muat": "Hermes-Pekerja-AI-24-Jam-v2-Adiel-Zainal.pdf"},
        ],
    },
}


def kit_terbaru():
    z = sorted((DP / "dist").glob("meta-ads-automation-kit-v*.zip"),
               key=lambda p: [int(x) for x in p.stem.split("-v")[-1].split(".")])
    if not z:
        sys.exit("Tiada kit ZIP. Jalankan dulu: (cd ../digital-products && python tools/bina_zip.py)")
    return z[-1]


def templat_pdf(src, dst):
    shutil.copyfile(src, dst)
    doc = pymupdf.open(dst)
    if doc.is_encrypted:
        sys.exit(f"{src.name}: PDF berkunci, tak boleh dicap")
    baru = []
    for pg in doc:
        sebelum = set(pg.get_contents())
        r = pg.rect
        pg.insert_text((28, r.height - 12), PH, fontsize=6.5, fontname="helv", color=(0.45, 0.45, 0.45))
        baru += [x for x in pg.get_contents() if x not in sebelum]
    for x in baru:                                    # simpan aliran cap tanpa mampatan supaya placeholder nampak
        data = doc.xref_stream(x)
        if PH_HEX in data:
            doc.update_stream(x, data, compress=False)
    halaman = doc.page_count
    doc.save(dst, incremental=True, encryption=pymupdf.PDF_ENCRYPT_KEEP, deflate=False)
    doc.close()
    b = dst.read_bytes()
    offset, i = [], b.find(PH_HEX)
    while i != -1:
        offset.append(i)
        i = b.find(PH_HEX, i + 1)
    if len(offset) != halaman:
        sys.exit(f"{src.name}: jumpa {len(offset)} placeholder untuk {halaman} halaman")
    return offset


def main():
    shutil.rmtree(DIST, ignore_errors=True)
    DIST.mkdir(parents=True)
    keluar = {"panjang": PANJANG, "produk": {}}
    for pid, p in PRODUK.items():
        fail = []
        for f in p["fail"]:
            src = kit_terbaru() if f["src"] == "KIT" else f["src"]
            tmp = DIST / f"tmp-{pid}-{f['simpan']}"
            masuk = {"id": f["id"], "label": f["label"], "nama_muat": f["nama_muat"]}
            if tmp.suffix == ".pdf":
                masuk["offset"] = templat_pdf(src, tmp)
            else:
                shutil.copyfile(src, tmp)
            h = hashlib.sha256(tmp.read_bytes()).hexdigest()[:10]
            dst = DIST / f"{pid}-{h}-{f['simpan']}"
            tmp.rename(dst)
            masuk["kunci"] = f"fail/{dst.name}"
            fail.append(masuk)
            print(f"{pid}/{f['id']}: {dst.name} ({dst.stat().st_size // 1024} KB)")
        keluar["produk"][pid] = {"nama": p["nama"], "fail": fail}
    (L / "worker" / "produk.json").write_text(json.dumps(keluar, ensure_ascii=False), encoding="utf-8")


if __name__ == "__main__":
    main()
