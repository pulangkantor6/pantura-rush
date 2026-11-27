# Latar menu

- `bg_menu.jpg`: gambar latar (dan cadangan bila video tidak bisa diputar), sekitar 720 px lebar.
- `bg_menu.mp4`: video latar tanpa suara, H.264, sekitar 540 px lebar. Tidak dimuat saat mode hemat data atau jaringan 2G.

Contoh mengecilkan video: `ffmpeg -i asli.mp4 -vf "scale=540:-2,fps=24" -c:v libx264 -crf 31 -pix_fmt yuv420p -an -movflags +faststart bg_menu.mp4`
