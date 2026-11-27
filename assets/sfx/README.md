# SFX

Format `.mp3` (dicoba lebih dulu) atau `.ogg`. Bila berkas tidak ada, game memakai suara sintetis bawaan.

| Berkas | Dimuat oleh | Dipakai saat |
|---|---|---|
| `horn_0` sampai `horn_3` | `game.js` | klakson, sesuai level upgrade (0-3) |
| `gas`, `rem` | `game.js` | suara gas dan rem (diputar loop selama ditahan) |
| `buy_ok`, `buy_fail` | `game.js` | beli berhasil atau gagal di toko |
| `coin`, `coin_gold` | `audio.js` | koin biasa dan koin emas |
| `crash` | `audio.js` | tabrakan |
| `siren_hi` | `audio.js` | sirene ambulance (diputar sebagai loop tunggal) |
| `warn` | `audio.js` | peringatan pom bensin atau bengkel |

Tips ukuran: encode 96-128 kbps, contoh `ffmpeg -i asli.wav -c:a libmp3lame -b:a 112k nama.mp3`.
Untuk `gas`, `rem`, dan `siren_hi` pastikan ujung berkas menyambung mulus karena diputar berulang.
