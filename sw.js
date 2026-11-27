/* Pantura Rush - service worker.
   - Kode (html/js/css/manifest): jaringan dulu (maks 3,5 dtk) lalu cache.
   - Aset (gambar, audio, video): cache dulu, diperbarui di latar (stale-while-revalidate).
   - Request Range (audio/video) dilayani dari cache; bila belum ada, lewat jaringan sambil disimpan di latar.
   - Naikkan V setiap rilis (npm run bump) agar cache lama dibersihkan. */
const V = 'pantura-rush-v9';

const CORE = [
  './', 'index.html', 'style.css', 'audio.js', 'game.js', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png'
];

const OPT = [
  'icons/maskable-512.png', 'icons/player.png', 'icons/ambulance.png', 'icons/mobil.png', 'icons/motor.png',
  'icons/angkot.png', 'icons/bus.png', 'icons/truk.png', 'icons/becak.png', 'icons/gas.png', 'icons/rem.png',
  'icons/klakson.png', 'icons/speedo.png', 'icons/shop_fuel.png', 'icons/shop_repair.png', 'icons/shop_armor.png',
  'icons/shop_tank.png', 'icons/shop_horn.png', 'icons/shop_jerrycan.png',
  'assets/menu/bg_menu.jpg', 'assets/menu/bg_menu.mp4',
  'assets/sfx/gas.mp3', 'assets/sfx/rem.mp3', 'assets/sfx/horn_0.mp3', 'assets/sfx/horn_1.mp3',
  'assets/sfx/horn_2.mp3', 'assets/sfx/horn_3.mp3', 'assets/sfx/buy_ok.mp3', 'assets/sfx/buy_fail.mp3',
  'assets/sfx/coin.mp3', 'assets/sfx/coin_gold.mp3', 'assets/sfx/crash.mp3', 'assets/sfx/siren_hi.mp3',
  'assets/sfx/warn.mp3',
  'assets/music/menu.mp3', 'assets/music/day.mp3', 'assets/music/night.mp3', 'assets/music/warning.mp3'
];

async function fresh(cache, url) {
  const res = await fetch(new Request(url, { cache: 'reload' }));
  if (!res || !res.ok) throw new Error('gagal ' + url);
  await cache.put(url, res);
}

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(V);
    await Promise.all(CORE.map(u => fresh(c, u)));          // inti wajib sukses
    await Promise.allSettled(OPT.map(u => fresh(c, u)));    // aset lain boleh gagal
  })());
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== V).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

function withTimeout(p, ms) {
  return new Promise((ok, no) => {
    const t = setTimeout(() => no(new Error('timeout')), ms);
    p.then(v => { clearTimeout(t); ok(v); }, err => { clearTimeout(t); no(err); });
  });
}

async function networkFirst(req) {
  const c = await caches.open(V);
  try {
    const res = await withTimeout(fetch(req, { cache: 'no-cache' }), 3500);
    if (res && res.ok && res.status === 200) c.put(req, res.clone());
    return res;
  } catch (_) {
    const hit = await c.match(req, { ignoreSearch: true });
    if (hit) return hit;
    if (req.mode === 'navigate') {
      const idx = await c.match('index.html');
      if (idx) return idx;
    }
    return Response.error();
  }
}

async function staleWhileRevalidate(req, e) {
  const c = await caches.open(V);
  const hit = await c.match(req, { ignoreSearch: true });
  const net = fetch(req).then(res => {
    if (res && res.ok && res.status === 200) c.put(req, res.clone());
    return res;
  }).catch(() => null);
  if (hit) { e.waitUntil(net); return hit; }
  return (await net) || Response.error();
}

async function rangeResponse(req, e) {
  const c = await caches.open(V);
  const url = req.url.split('#')[0];
  const hit = await c.match(url, { ignoreSearch: true });
  if (!hit) {
    // belum ada di cache: layani dari jaringan, simpan utuh di latar untuk mode offline
    e.waitUntil(fetch(url).then(r => { if (r && r.ok && r.status === 200) return c.put(url, r); }).catch(() => {}));
    return fetch(req).catch(() => Response.error());
  }
  const m = /bytes=(\d*)-(\d*)/.exec(req.headers.get('range') || '');
  if (!m) return hit;
  const buf = await hit.arrayBuffer();
  const total = buf.byteLength;
  let start = m[1] === '' ? Math.max(0, total - Number(m[2])) : Number(m[1]);
  let end = m[1] === '' || m[2] === '' ? total - 1 : Math.min(Number(m[2]), total - 1);
  if (start > end || start >= total) {
    return new Response(null, { status: 416, headers: { 'Content-Range': 'bytes */' + total } });
  }
  return new Response(buf.slice(start, end + 1), {
    status: 206,
    statusText: 'Partial Content',
    headers: {
      'Content-Type': hit.headers.get('Content-Type') || 'application/octet-stream',
      'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
      'Content-Length': String(end - start + 1),
      'Accept-Ranges': 'bytes'
    }
  });
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;               // lintas-origin (mis. font) diurus browser
  if (req.headers.has('range')) { e.respondWith(rangeResponse(req, e)); return; }
  const isCode = req.mode === 'navigate' || url.pathname.endsWith('/') || /\.(?:html|js|css|webmanifest)$/.test(url.pathname);
  e.respondWith(isCode ? networkFirst(req) : staleWhileRevalidate(req, e));
});
