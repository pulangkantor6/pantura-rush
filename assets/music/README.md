# Musik

Format `.mp3` (dicoba lebih dulu) atau `.ogg`. Trek di-stream dan diputar berulang (loop).

| Berkas | Dipakai saat |
|---|---|
| `menu` | menu utama dan layar tamat |
| `day` | siang dan senja |
| `night` | malam hari |
| `warning` | bensin di bawah 20% (diputar oleh `game.js`, menggantikan musik lain) |

Tips ukuran: 96-128 kbps stereo sudah cukup, contoh `ffmpeg -i asli.wav -c:a libmp3lame -b:a 112k day.mp3`.
