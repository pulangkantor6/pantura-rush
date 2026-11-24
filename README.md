# Pantura Rush

Game balap vertikal bergaya Road Fighter dengan nuansa jalur Pantura. PWA, tanpa dependensi, murni HTML + Canvas.

## Fitur
- Kendaraan lokal: mobil, motor, angkot, bus, truk, becak
- Jalan berbelok (tiap 3-5 jam game) yang mendorong mobil ke luar tikungan; kendaraan ikut miring mengikuti jalan
- Klakson: kendaraan di depan minggir ke jalur samping
- Tabrakan membuat kendaraan lain terpental ke bahu jalan
- Siklus siang, senja, malam (lampu depan, lampu belakang, tiang lampu)
- Cuaca cerah, mendung, hujan (jalan licin, genangan, petir)
- Bensin, nitro, *near miss*, lubang jalan, nyawa
- Efek visual: partikel asap dan percikan, garis kecepatan, vinyet, pantulan lampu di jalan basah
- Offline lewat service worker, bisa dipasang ke layar utama

## Kontrol
- HP: joystick kiri (dinamis atau tetap, diatur di menu) untuk menyetir; tombol GAS (maju ke depan layar), REM (mundur), KLAKSON
- PC: panah kiri/kanan atau A/D untuk setir, panah atas/bawah atau W/S untuk gas/rem, H untuk klakson

## Menjalankan lokal
```bash
python3 -m http.server 8080
```
Buka http://localhost:8080. Service worker butuh `localhost` atau HTTPS.

## Deploy ke GitHub Pages
```bash
git init && git add . && git commit -m "Pantura Rush: versi awal"
git branch -M main
git remote add origin https://github.com/USERNAME/pantura-rush.git
git push -u origin main
```
Lalu di GitHub: Settings, Pages, Source: `main` / root. Setiap mengubah aset, naikkan `V` di `sw.js` agar cache diperbarui.

## Struktur
`index.html`, `style.css`, `game.js` (logika), `audio.js` (pengelola suara), `assets/sfx` dan `assets/music` (berkas suara, lihat README di dalamnya), `sw.js`, `manifest.webmanifest`, `icons/`

## Ide lanjutan
Suara, garasi dan upgrade mobil, stage tol dan pegunungan, daily challenge, leaderboard.

## Suara dan musik
Letakkan berkas di `assets/sfx` dan `assets/music` sesuai nama di README masing-masing. Bila tidak ada, SFX memakai suara sintetis bawaan dan musik tidak diputar.
