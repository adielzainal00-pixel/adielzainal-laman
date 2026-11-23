#!/usr/bin/env bash
# Kemas kini fail produk berbayar (PDF ebook, kit ZIP) untuk pintu muat turun. Jalankan di laptop Adiel,
# yang ada ../digital-products (repo agensi-ai) dan wrangler yang sudah log masuk.
#   1. cap_templat.py: bina templat cap di .produk/ dan tulis worker/produk.json (kunci KV + offset)
#   2. muat naik setiap templat ke KV PRODUK (kunci baru di sebelah yang lama, produksi tak terjejas)
#   3. buka PR dengan worker/produk.json yang baru; selepas digabung, Workers Builds deploy dan pembeli dapat fail baru
set -euo pipefail
cd "$(dirname "$0")/.."
uv run --no-project --with pymupdf python alat/cap_templat.py
for f in .produk/*; do
  k="fail/$(basename "$f")"
  echo "muat naik $k"
  npx.cmd --yes wrangler kv key put --remote --binding PRODUK "$k" --path "$f" >/dev/null 2>&1 \
    || npx --yes wrangler kv key put --remote --binding PRODUK "$k" --path "$f"
done
echo "Siap. Seterusnya: git checkout -b produk-baru && git add worker/produk.json && git commit && git push, kemudian buka PR."
