const V='pantura-rush-v7';
const CORE=['./','index.html','style.css','audio.js','game.js','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png'];
const OPT_ICONS=['icons/player.png','icons/ambulance.png','icons/mobil.png','icons/motor.png','icons/angkot.png','icons/bus.png','icons/truk.png','icons/becak.png'];

self.addEventListener('install',e=>{
 e.waitUntil(
  caches.open(V).then(async c=>{
   await c.addAll(CORE);
   await Promise.allSettled(OPT_ICONS.map(u=>c.add(u)));
  })
 );
 self.skipWaiting();
});

self.addEventListener('activate',e=>{
 e.waitUntil(
  caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x))))
 );
 self.clients.claim();
});

// Strategi Network-First: selalu cek & ambil versi terbaru dari server saat online,
// lalu simpan ke cache. Jika offline, otomatis pakai versi terakhir dari cache.
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 e.respondWith(
  fetch(e.request,{cache:'no-cache'}).then(res=>{
   if(res&&res.ok){
    const cp=res.clone();
    caches.open(V).then(c=>c.put(e.request,cp));
   }
   return res;
  }).catch(()=>
   caches.match(e.request).then(r=>r||(e.request.mode==='navigate'?caches.match('index.html'):undefined))
  )
 );
});
