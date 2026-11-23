#!/usr/bin/env bash
# Muat naik isi kit berbayar (RM1) ke KV PRODUK. Jalankan di laptop (wrangler log masuk).
# Isi kit TIDAK dalam repo awam: simpan di luar repo, cth. ../kit-berbayar/motion.json
#   bash alat/terbit_kit.sh motion ../kit-berbayar/motion.json
# Kunci KV: kit/<id>.json. Halaman: /kit-penuh?k=<id>. Borang BCL: item bernama "Kit <ID> ..." dan
# Success URL https://adielzainal.com/kit-penuh?k=<id>&pesanan={order_number}&e={email}
set -euo pipefail
cd "$(dirname "$0")/.."
id="${1:?id kit, cth. motion}"; f="${2:?fail JSON kit}"
[[ "$id" =~ ^[a-z0-9-]{2,30}$ ]] || { echo "id tak sah"; exit 1; }
node -e 'const k=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8")); if(!k.tajuk||!Array.isArray(k.bahagian)) throw new Error("perlu tajuk + bahagian[]")' "$f"
npx.cmd --yes wrangler kv key put --remote --binding PRODUK "kit/$id.json" --path "$f" >/dev/null 2>&1 \
  || npx --yes wrangler kv key put --remote --binding PRODUK "kit/$id.json" --path "$f"
echo "Siap: kit/$id.json dimuat naik."
