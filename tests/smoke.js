// Uji asap tanpa browser: memuat audio.js + game.js di lingkungan tiruan,
// memainkan game puluhan ribu frame dengan input acak, dan memastikan tidak ada error.
// Jalankan: npm test
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

// RNG deterministik supaya hasil uji bisa diulang
let seed = 1234567;
Math.random = () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

const P = () => new Proxy(function () {}, {
  get: (t, k) => (k === Symbol.toPrimitive ? () => 0 : k === 'length' ? 0 : P()),
  set: () => true, apply: () => P(), construct: () => P()
});
const els = {}, ls = {}, created = [];
let oscCount = 0;
function on(n, f) { (ls[n] = ls[n] || []).push(f); }
function fire(n, e) { (ls[n] || []).forEach(f => f(e)); }
function EL(id) {
  const e = {
    id, style: {}, children: [], dataset: {}, _h: '', value: '30',
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    addEventListener(n, f) { (e.l = e.l || {})[n] = f; }, removeEventListener() {},
    appendChild(c) { return c; }, remove() {}, setAttribute() {}, getAttribute() { return null; },
    querySelector() { return EL('q'); }, querySelectorAll() { return []; }, focus() {},
    play() { return Promise.resolve(); }, pause() {}, load() {}, paused: true,
    getBoundingClientRect() { return { left: 0, top: 0, width: 360, height: 640, right: 360, bottom: 640 }; },
    getContext() { return P(); }, setPointerCapture() {},
    offsetWidth: 360, offsetHeight: 640, clientWidth: 360, clientHeight: 640,
    set innerHTML(v) { e._h = v; }, get innerHTML() { return e._h; }
  };
  created.push(e);
  return e;
}
const node = () => ({
  gain: { value: 0, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {}, cancelScheduledValues() {}, setTargetAtTime() {} },
  frequency: { value: 0, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} },
  Q: { value: 0 }, connect() {}, disconnect() {}, start() {}, stop() {}, type: '', buffer: null, loop: false
});
class FakeAC {
  constructor() { this.state = 'running'; this.currentTime = 0; this.sampleRate = 44100; this.destination = node(); }
  resume() { return Promise.resolve(); } suspend() { return Promise.resolve(); }
  createGain() { return node(); } createOscillator() { oscCount++; return node(); } createBufferSource() { return node(); }
  createBiquadFilter() { return node(); } createMediaElementSource() { return node(); }
  createBuffer() { return { getChannelData() { return new Float32Array(64); } }; }
  decodeAudioData(ab, ok, err) { if (err) err(); }
}
global.window = global;
global.__PR_TEST__ = {};
global.navigator = { userAgent: 'smoke', vibrate() {}, hardwareConcurrency: 8, serviceWorker: { register: () => Promise.resolve({ addEventListener() {} }), addEventListener() {}, controller: null } };
global.location = { href: 'https://example.com/pantura-rush/', reload() {} };
global.devicePixelRatio = 1; global.innerWidth = 360; global.innerHeight = 640;
global.matchMedia = () => ({ matches: false, addEventListener() {}, addListener() {} });
global.document = { body: EL('body'), head: EL('head'), documentElement: EL('html'), hidden: false,
  getElementById: i => (els[i] = els[i] || EL(i)), createElement: t => EL(t),
  querySelector: () => EL('q'), querySelectorAll: () => [], addEventListener: on };
global.addEventListener = on; global.removeEventListener = () => {};
let raf = null; global.requestAnimationFrame = f => { raf = f; return 1; }; global.cancelAnimationFrame = () => {};
global.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
global.Image = function () { return EL('img'); };
global.Audio = function () { return EL('audio'); };
global.fetch = () => Promise.reject(new Error('offline'));
global.XMLHttpRequest = function () { return { open() {}, send() {} }; };
global.AudioContext = FakeAC;

const errors = new Set();
const guard = (label, fn) => { try { fn(); } catch (e) { const k = label + ': ' + e.message; if (!errors.has(k)) { errors.add(k); console.error('ERROR', k, '\n', (e.stack || '').split('\n').slice(1, 4).join('\n')); } } };
const ev = (f, o) => f && guard('event', () => f(Object.assign({ pointerId: 1, clientX: 100, clientY: 400, key: '', preventDefault() {}, stopPropagation() {} }, o || {})));

guard('load', () => {
  (0, eval)(fs.readFileSync(path.join(root, 'audio.js'), 'utf8'));
  (0, eval)(fs.readFileSync(path.join(root, 'game.js'), 'utf8'));
});
if (typeof PRAudio === 'undefined' || typeof PRAudio.ctx !== 'function') { errors.add('PRAudio.ctx tidak ada'); console.error('PRAudio.ctx tidak ada'); }

let ts = 0;
const step = n => { for (let i = 0; i < n; i++) { ts += 16; if (raf) guard('frame', () => raf(ts)); } };
const check = (ok, msg) => { if (!ok) { errors.add(msg); console.error('GAGAL:', msg); } };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const pauseBtn = () => created.find(e => e.id === 'btn_pause');
const click = n => els[n] && els[n].onclick && ev(els[n].onclick);

(async () => {
  step(10);
  guard('start', () => els.main_screen.onclick());
  const zl = els.zone.l || {}, gl = els.bg.l || {}, rl = els.br.l || {}, hl = els.bh.l || {};
  const FRAMES = Number(process.env.FRAMES || 40000);
  let shopChecks = 0;
  for (let i = 0; i < FRAMES; i++) {
    if (i % 500 === 0) ev(zl.pointerdown);
    if (i % 500 === 100) ev(zl.pointermove, { clientX: 150 });
    if (i % 500 === 300) ev(zl.pointermove, { clientX: 60 });
    if (i % 500 === 450) ev(zl.pointerup);
    if (i % 900 === 0) ev(gl.pointerdown, { pointerId: 2 });
    if (i % 900 === 400) ev(gl.pointerup, { pointerId: 2 });
    if (i % 1100 === 200) ev(rl.pointerdown, { pointerId: 3 });
    if (i % 1100 === 500) ev(rl.pointerup, { pointerId: 3 });
    if (i % 70 === 0) ev(hl.pointerdown, { pointerId: 4 });
    if (i % 90 === 0) ev(hl.pointerup, { pointerId: 4 });
    if (i % 1200 === 0) guard('key', () => {   // tahan satu arah cukup lama agar mobil bisa masuk lajur pom/bengkel
      ['ArrowLeft', 'ArrowRight'].forEach(k => fire('keyup', { key: k }));
      fire('keydown', { key: (i / 1200) % 2 ? 'ArrowRight' : 'ArrowLeft', preventDefault() {} });
    });
    if (i === 15000) { document.hidden = true; guard('hide', () => fire('visibilitychange', {})); document.hidden = false; guard('show', () => fire('visibilitychange', {})); }
    if (i % 150 === 0) {
      const shopOpen = els.m._h.includes('id="lv"');
      ['p_res', 'go', 'fb', 'b1', 'b2', 'b3', 'b4', 'b5', 'share', 'to_home', 'st_q', 'st_fl'].forEach(click);
      if (shopOpen) {
        click('lv'); step(2);
        shopChecks++;
        check(pauseBtn() && pauseBtn().style.display === 'flex', 'tombol pause hilang setelah menutup toko');
      }
    }
    step(1);
  }
  // --- skenario: tombol pause harus kembali setelah menutup toko (ketiga jenis layanan)
  const freshGame = async () => {              // pastikan ada game yang sedang berjalan
    if (!els.m._h.includes('main_screen')) {
      if (pauseBtn() && pauseBtn().style.display === 'flex') { ev(pauseBtn().l.pointerdown); click('p_hom'); }
      else { click('to_home'); }
    }
    await sleep(600);
    ev(els.main_screen.onclick); step(5);
  };
  await freshGame();
  for (const kind of ['pom', 'pertamini', 'bengkel']) {
    check(__PR_TEST__.shop(kind), 'game tidak sedang berjalan untuk uji toko ' + kind);
    check(els.m._h.includes('id="lv"'), 'toko ' + kind + ' tidak terbuka');
    check(pauseBtn() && pauseBtn().style.display === 'none', 'tombol pause seharusnya tersembunyi saat toko terbuka');
    click('lv'); step(3);
    check(pauseBtn() && pauseBtn().style.display === 'flex', 'tombol pause hilang setelah menutup toko ' + kind);
    shopChecks++;
  }
  console.log('  toko ditutup & tombol pause dicek:', shopChecks, 'kali');

  // --- skenario: pengaturan dari menu utama tidak boleh langsung memulai game
  await freshGame();
  ev(pauseBtn() && pauseBtn().l && pauseBtn().l.pointerdown); click('p_hom');
  check(els.m._h.includes('main_screen'), 'menu utama tidak tampil');
  click('main_cfg');
  check(els.m._h.includes('PENGATURAN'), 'pengaturan tidak terbuka dari menu utama');
  click('st_ctrl');                                  // ganti ke Full Joystick
  click('st_tut');
  check(els.m._h.includes('TUTORIAL 1/'), 'tutorial tidak terbuka');
  for (let k = 0; k < 6; k++) click('tut_next');
  check(els.m._h.includes('TUTORIAL 7/'), 'navigasi tutorial gagal');
  click('tut_next');                                 // halaman terakhir -> kembali ke pengaturan
  check(els.m._h.includes('PENGATURAN'), 'tutorial tidak kembali ke pengaturan');
  els.st_back.l.pointerdown({ preventDefault() {}, stopPropagation() {} });
  ev(els.main_screen.onclick);                       // klik susulan setelah pointerdown
  check(els.zone.style.display !== 'block', 'tombol Selesai di pengaturan langsung memulai game');
  await sleep(600);
  ev(els.main_screen.onclick);
  check(els.zone.style.display === 'block', 'layar utama tidak bisa memulai game setelah jeda singkat');
  step(30);

  // --- skenario: klakson ketuk 2x pada mode Full Joystick
  const wl = els.w.l || {};
  const tap = () => { ev(wl.pointerdown, { pointerId: 9, clientX: 250, clientY: 300 }); ev(wl.pointerup, { pointerId: 9, clientX: 250, clientY: 300 }); };
  check(els.bh.style.display === 'none', 'tombol klakson masih tampil pada mode Full Joystick');
  step(120);
  let before = oscCount; tap(); step(2);
  check(oscCount === before, 'satu ketukan tidak boleh membunyikan klakson');
  step(60);
  before = oscCount; tap(); tap(); step(2);
  check(oscCount > before, 'ketuk 2x tidak membunyikan klakson');

  console.log(errors.size ? `GAGAL: ${errors.size} masalah` : `OK: ${FRAMES} frame + skenario menu/tutorial/klakson tanpa error`);
  process.exit(errors.size ? 1 : 0);
})();
