const V = 'pantura-rush-v8';

// File inti wajib agar game selalu bisa berjalan offline
const CORE = [
  './',
  'index.html',
  'style.css',
  'audio.js',
  'game.js',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

// Seluruh aset opsional (ikon kendaraan, tombol, toko, audio sfx/musik, latar menu)
// Menggunakan allSettled sehingga jika ada file yang belum diisi tidak menggagalkan instalasi SW
const OPT_ASSETS = [
  'icons/player.png',
  'icons/ambulance.png',
  'icons/mobil.png',
  'icons/motor.png',
  'icons/angkot.png',
  'icons/bus.png',
  'icons/truk.png',
  'icons/becak.png',
  'icons/gas.png',
  'icons/rem.png',
  'icons/klakson.png',
  'icons/speedo.png',
  'icons/shop_fuel.png',
  'icons/shop_repair.png',
  'icons/shop_armor.png',
  'icons/shop_tank.png',
  'icons/shop_horn.png',
  'icons/shop_jerrycan.png',
  'assets/sfx/gas.mp3',
  'assets/sfx/rem.mp3',
  'assets/sfx/horn_0.mp3',
  'assets/sfx/horn_1.mp3',
  'assets/sfx/horn_2.mp3',
  'assets/sfx/horn_3.mp3',
  'assets/sfx/buy_ok.mp3',
  'assets/sfx/buy_fail.mp3',
  'assets/music/warning.mp3',
  'assets/menu/bg_menu.jpg',
  'assets/menu/bg_menu.mp4'
];

// 1. INSTALL: Ambil versi terbaru dari server (bypass HTTP cache) & simpan ke cache offline
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(V).then(async cache => {
      await Promise.all(
        CORE.map(url =>
          fetch(url, { cache: 'no-cache' }).then(res => {
            if (res && res.ok) return cache.put(url, res);
            return cache.add(url);
          })
        )
      );
      await Promise.allSettled(
        OPT_ASSETS.map(url =>
          fetch(url, { cache: 'no-cache' }).then(res => {
            if (res && res.ok) return cache.put(url, res);
          })
        )
      );
    })
  );
  self.skipWaiting();
});

// 2. ACTIVATE: Hapus cache versi lama & langsung ambil alih halaman terbuka tanpa perlu reload manual
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== V).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// 3. FETCH (Network-First + Auto-Update Cache + Ignore Search Query seperti ?v=8)
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);
  // Abaikan request ekstensi chrome atau skema non-http(s)
  if (!url.protocol.startsWith('http')) return;

  // Tangani Range Request (penting untuk audio/video offline di Safari & Chrome)
  const rangeHeader = e.request.headers.get('range');

  e.respondWith(
    fetch(e.request, { cache: 'no-cache' })
      .then(res => {
        // Simpan ke cache jika respons penuh (status 200) atau opaque (font Google/CDN)
        if (res && (res.status === 200 || res.type === 'opaque')) {
          const copy = res.clone();
          caches.open(V).then(cache => cache.put(e.request, copy));
        }
        return res;
      })
      .catch(async () => {
        // Offline fallback: cocokkan URL persis maupun tanpa query string (?v=...)
        const cached =
          (await caches.match(e.request)) ||
          (await caches.match(e.request, { ignoreSearch: true }));

        if (cached) {
          if (rangeHeader && cached.status === 200) {
            const buf = await cached.arrayBuffer();
            const m = /bytes=(\d+)-(\d*)/.exec(rangeHeader);
            if (m) {
              const start = Number(m[1]);
              const end = m[2] ? Number(m[2]) : buf.byteLength - 1;
              return new Response(buf.slice(start, end + 1), {
                status: 206,
                statusText: 'Partial Content',
                headers: {
                  'Content-Range': `bytes ${start}-${end}/${buf.byteLength}`,
                  'Accept-Ranges': 'bytes',
                  'Content-Length': String(end - start + 1),
                  'Content-Type': cached.headers.get('Content-Type') || 'application/octet-stream'
                }
              });
            }
          }
          return cached;
        }

        if (e.request.mode === 'navigate') {
          return caches.match('index.html');
        }
      })
  );
});
