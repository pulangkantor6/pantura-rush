// Menaikkan nomor versi di sw.js (nama cache) dan game.js (APP_VER) sekaligus.
// Pakai: npm run bump   (lalu commit & push)
const fs = require('fs');
const sw = fs.readFileSync('sw.js', 'utf8');
const m = /const V = 'pantura-rush-v(\d+)'/.exec(sw);
if (!m) { console.error('Tidak menemukan const V di sw.js'); process.exit(1); }
const next = Number(m[1]) + 1;
fs.writeFileSync('sw.js', sw.replace(m[0], `const V = 'pantura-rush-v${next}'`));
const g = fs.readFileSync('game.js', 'utf8');
if (!/var APP_VER='\d+';/.test(g)) { console.error('Tidak menemukan APP_VER di game.js'); process.exit(1); }
fs.writeFileSync('game.js', g.replace(/var APP_VER='\d+';/, `var APP_VER='${next}';`));
console.log('Versi dinaikkan ke v' + next);
