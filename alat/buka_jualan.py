"""Buka jualan terus di laman bila borang BCL siap.

  uv run --no-project python alat/buka_jualan.py claude=https://... autopilot=https://... coaching=https://...

Boleh beri satu, dua atau tiga produk sahaja. Untuk setiap produk yang diberi:
  - isi pautan bcl dalam config.js
  - buang baris status: "akan_datang" (harga dan butang "Beli sekarang" keluar)
Teks "Macam mana nak beli?" bertukar sendiri bila ada produk dengan pautan bcl (app.js, data-bila-bcl).
  - tukar BENARKAN_UJIAN ke "0" dalam wrangler.jsonc (bayaran Test Mode BCL tak lagi buka fail)
Selepas itu: bash alat/bina.sh && npx.cmd --yes wrangler deploy
"""
import re
import sys
from pathlib import Path

L = Path(__file__).resolve().parents[1]
CONFIG = L / "config.js"
SAH = {"meta", "hermes", "coaching", "claude", "autopilot"}


def blok(s, pid):
    """Kembalikan (mula, akhir) blok objek produk dengan id ini."""
    m = re.search(r'\n    \{\n(?:(?!\n    \{).)*?id: "' + pid + '"', s, re.S)
    if not m:
        raise SystemExit(f"Tak jumpa produk id {pid} dalam config.js")
    mula = m.start()
    akhir = s.index("\n    }", m.end())
    return mula, akhir


def main(args):
    pautan = {}
    for a in args:
        k, _, v = a.partition("=")
        if k not in SAH or not v.startswith("https://"):
            raise SystemExit(f"Format: meta=https://...  (dapat: {a})")
        pautan[k] = v.strip()
    if not pautan:
        raise SystemExit(__doc__)

    s = CONFIG.read_text(encoding="utf-8")
    for pid, url in pautan.items():
        mula, akhir = blok(s, pid)
        b = s[mula:akhir]
        b2 = re.sub(r'\n\s*status: "akan_datang",[^\n]*', "", b)
        b2, n = re.subn(r'bcl: "[^"]*"', f'bcl: "{url}"', b2, count=1)
        if n != 1:
            raise SystemExit(f"Produk {pid}: tiada medan bcl")
        s = s[:mula] + b2 + s[akhir:]
        print(f"{pid}: dibuka -> {url}")
    CONFIG.write_text(s, encoding="utf-8")

    # Jualan sebenar: pintu muat turun tak lagi terima bayaran Test Mode BCL.
    w = L / "wrangler.jsonc"
    t = w.read_text(encoding="utf-8")
    t2 = t.replace('"BENARKAN_UJIAN": "1"', '"BENARKAN_UJIAN": "0"')
    if t2 != t:
        w.write_text(t2, encoding="utf-8")
        print("Pintu muat turun: bayaran Test Mode kini ditolak (BENARKAN_UJIAN=0)")

    for f in ("index.html", "links.html"):
        p = L / f
        t = p.read_text(encoding="utf-8")
        v = max(int(x) for x in re.findall(r"\?v=(\d+)", t)) + 1
        p.write_text(re.sub(r"\?v=\d+", f"?v={v}", t), encoding="utf-8")
    for f in list((L / "akses").glob("*/index.html")) + [L / "terima-kasih.html"]:
        t = f.read_text(encoding="utf-8")
        f.write_text(re.sub(r"/config\.js\?v=\d+", f"/config.js?v={v}", t), encoding="utf-8")
    print(f"Versi cache ?v={v}. Seterusnya: bash alat/bina.sh && npx.cmd --yes wrangler deploy")


if __name__ == "__main__":
    main(sys.argv[1:])
