#!/usr/bin/env bash
# Salin fail awam sahaja ke dist/ (README, KEPUTUSAN dan alat/ tak diterbitkan).
# Dijalankan oleh Cloudflare Workers Builds pada setiap push (hanya cp, tiada Python).
# Fail produk (PDF, ZIP) TIDAK di sini: ia dalam KV PRODUK, dimuat naik oleh alat/terbit_produk.sh.
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf dist && mkdir -p dist
cp index.html coaching.html links.html privasi.html terima-kasih.html terma.html config.js app.js akses.js style.css kecil.css _redirects _headers robots.txt dist/
cp -r aset akses dist/
echo "dist/ siap: $(find dist -type f | wc -l) fail"
