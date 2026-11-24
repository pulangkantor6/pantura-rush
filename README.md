# Pantura Rush

Game balap vertikal bergaya Road Fighter dengan nuansa jalur Pantura. PWA, tanpa dependensi, murni HTML + Canvas.

## Fitur
- Kendaraan lokal: mobil, motor, angkot, bus, truk, becak
- Jalan berbelok yang mendorong mobil ke luar tikungan
- Siklus siang, senja, malam (lampu depan, lampu belakang, tiang lampu)
- Cuaca cerah, mendung, hujan (jalan licin, genangan, petir)
- Bensin, nitro, *near miss*, lubang jalan, nyawa
- Efek visual: partikel asap dan percikan, garis kecepatan, vinyet, pantulan lampu di jalan basah
- Offline lewat service worker, bisa dipasang ke layar utama

## Kontrol
- HP: geser jari untuk menyetir, tahan tombol NITRO
- PC: panah kiri/kanan atau A/D, Spasi untuk nitro

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
`index.html`, `style.css`, `game.js` (seluruh logika), `sw.js`, `manifest.webmanifest`, `icons/`

## Ide lanjutan
Suara, garasi dan upgrade mobil, stage tol dan pegunungan, daily challenge, leaderboard.
