# adielzainal.com

Laman peribadi Adiel Zainal: coaching dan ebook automasi AI untuk owner bisnes, dalam BM.

## Struktur
- `index.html`, `links.html`, `kit.html`, `coaching.html`, `terma.html`, `privasi.html`, `terima-kasih.html`: halaman statik.
- `config.js`: satu-satunya tempat untuk harga, pautan, nombor hubungi dan bukti.
- `app.js`, `style.css`, `kecil.css`: paparan.
- `akses/`, `akses.js`: halaman akses pembeli (masukkan no. pesanan dan e-mel).
- `worker/index.js`: Cloudflare Worker. Hidangkan aset statik dan pintu muat turun ebook (`/api/akses`, `/api/fail`).
- `alat/bina.sh`: salin fail awam ke `dist/`.

## Terbit
GitHub Actions (`.github/workflows/terbit.yml`) dengan token Cloudflare yang hanya boleh deploy Worker `adielzainal` (secret `CLOUDFLARE_API_TOKEN`).
- `main` = produksi. Masuk `main` melalui PR sahaja (ruleset, tiada bypass); selepas digabung, Actions jalankan `bash alat/bina.sh` dan `wrangler deploy`.
- PR = preview (`wrangler versions upload --preview-alias pr-N`); pautan dikomen dalam PR. Preview guna KV dan rahsia produksi, jadi jangan uji muat turun sebenar di situ.

## Pintu muat turun
Fail produk berbayar tidak ada dalam repo ini. Templat PDF/ZIP disimpan dalam Workers KV `PRODUK`; `worker/produk.json` hanya simpan kunci KV dan offset cap.
Pembeli dapat fail hanya selepas Worker sahkan pesanan dengan API BCL, melalui pautan bertandatangan (HMAC, sah 30 minit, had 5 muat turun setiap fail). Setiap PDF dicap nama, e-mel dan no. pesanan pembeli.

Kemas kini fail produk: `bash alat/terbit_produk.sh` (perlu sumber ebook tempatan dan wrangler log masuk), kemudian PR untuk `worker/produk.json`.

## Rahsia
Hanya dalam Cloudflare (`wrangler secret put`): `KUNCI` (tandatangan pautan), `BCL_TOKEN` (API BCL, Read sahaja). `.dev.vars` tempatan di-gitignore. Secret scanning dan push protection GitHub dihidupkan.
