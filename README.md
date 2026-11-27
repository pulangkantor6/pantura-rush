# Pantura Rush

Game balap vertikal bergaya Road Fighter dengan nuansa jalur Pantura. PWA murni HTML + Canvas, tanpa dependensi, bisa dimainkan offline.

## Fitur
- Kendaraan lokal: mobil, motor, angkot, bus, truk, becak, dan ambulance (dengan peringatan sirene)
- Siklus siang, senja, malam (semua kendaraan menyalakan lampu) dan cuaca cerah, mendung, hujan, petir
- Jalan berbelok, polisi tidur, lubang, genangan, kendaraan NPC bisa bertabrakan beruntun
- Tanpa nyawa: kalah hanya kalau bensin habis; tabrakan membuat tangki bocor (makin cepat makin parah)
- Koin di jalan untuk beli BBM di pom bensin dan upgrade di bengkel (tangki, bodi, klakson); anggaran koin per siklus dibatasi
- Klakson berjangkauan (bus dan truk butuh 2 klakson sebelum upgrade), gas dan rem yang menggeser posisi mobil di layar
- Combo nyaris-tabrak, slipstream di belakang bus/truk, checkpoint kota rute Pantura (Bekasi sampai Surabaya)
- Kesulitan bertahap: mudah sampai bengkel pertama
- Pengaturan: joystick dinamis/tetap, kontrol tombol/joystick penuh, editor tata letak, grafis hemat, kilatan layar, musik dan SFX
- Pause otomatis saat aplikasi disembunyikan, bagikan skor, install ke layar utama, pembaruan otomatis

## Kontrol
- HP: joystick kiri untuk setir, tombol GAS (maju ke depan layar), REM (mundur), KLAKSON
- PC: panah kiri/kanan atau A/D (setir), panah atas/bawah atau W/S (gas/rem), H (klakson)

## Struktur
```
index.html            halaman dan elemen kontrol
style.css
game.js               seluruh logika game
audio.js              pengelola audio (satu AudioContext, musik streaming)
sw.js                 service worker (offline, cache)
manifest.webmanifest  PWA
icons/                ikon kendaraan, tombol, toko, dan ikon aplikasi
assets/               sfx/, music/, menu/ (lihat README tiap folder)
tests/smoke.js        uji asap tanpa browser
tools/bump-version.js menaikkan nomor versi
.github/workflows/    CI (cek sintaks dan uji asap)
```

## Menjalankan lokal
```bash
npm run serve        # atau: python3 -m http.server 8080
```
Buka http://localhost:8080. Service worker butuh `localhost` atau HTTPS.

## Deploy ke GitHub Pages
1. Push semua berkas ke branch `main`.
2. Di GitHub: Settings, Pages, Source: `Deploy from a branch`, branch `main`, folder `/ (root)`.
3. Buka `https://USERNAME.github.io/NAMA-REPO/`.

## Rilis versi baru
Setiap mengubah kode atau aset, naikkan versi supaya cache perangkat pemain diperbarui:
```bash
npm run bump         # menaikkan versi di sw.js dan game.js (tampil di Pengaturan)
git add -A && git commit -m "Rilis vN" && git push
```

## Tes
```bash
npm run check        # cek sintaks semua berkas JS
npm test             # uji asap: memainkan game 40.000 frame dengan input acak
```
CI (`.github/workflows/ci.yml`) menjalankan keduanya di setiap push.

## Aset dan lisensi
Kode berlisensi MIT. Aset (musik, SFX, video, ikon) punya lisensi sendiri: isi `CREDITS.md`.
Aset sudah dikompres (total sekitar 5 MB). Panduan mengecilkan aset ada di README tiap folder `assets/`.

## Ide yang belum dikerjakan (perlu diskusi)
- Garasi dan dompet koin permanen, mobil dengan karakter berbeda
- Tantangan harian dengan seed sama dan papan skor (butuh server, dan pemisahan RNG dunia dari efek)
- Perlintasan kereta api, banjir rob, hewan menyeberang, kabut dan stage pegunungan atau tol
- Font disimpan lokal (saat ini dimuat dari Google Fonts, jadi saat offline memakai font cadangan)
- Memecah `game.js` menjadi modul (input, UI, dunia, audio)
