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
const els = {}, ls = {};
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
  createGain() { return node(); } createOscillator() { return node(); } createBufferSource() { return node(); }
  createBiquadFilter() { return node(); } createMediaElementSource() { return node(); }
  createBuffer() { return { getChannelData() { return new Float32Array(64); } }; }
  decodeAudioData(ab, ok, err) { if (err) err(); }
}
global.window = global;
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
step(10);
guard('start', () => els.main_screen.onclick());
const zl = els.zone.l || {}, gl = els.bg.l || {}, rl = els.br.l || {}, hl = els.bh.l || {};
const FRAMES = Number(process.env.FRAMES || 40000);
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
  if (i % 300 === 0) guard('key', () => fire('keydown', { key: (i / 300) % 2 ? 'ArrowLeft' : 'ArrowRight', preventDefault() {} }));
  if (i === 15000) { document.hidden = true; guard('hide', () => fire('visibilitychange', {})); document.hidden = false; guard('show', () => fire('visibilitychange', {})); }
  if (i % 150 === 0) ['p_res', 'go', 'fb', 'b1', 'b2', 'b3', 'b4', 'lv', 'share', 'to_home', 'st_q', 'st_fl'].forEach(n => { if (els[n] && els[n].onclick) ev(els[n].onclick); });
  step(1);
}
console.log(errors.size ? `GAGAL: ${errors.size} error` : `OK: ${FRAMES} frame tanpa error`);
process.exit(errors.size ? 1 : 0);
