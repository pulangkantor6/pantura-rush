/* Pantura Rush - pengelola audio.
   - Satu AudioContext bersama (game.js memakai PRAudio.ctx()).
   - SFX pendek: dimuat ke memori dari assets/sfx (.mp3 lalu .ogg); bila tidak ada, dipakai suara sintetis.
   - Musik: di-stream lewat satu elemen <audio> (hemat RAM), pindah trek dengan fade.
   - Sirene: diputar sebagai loop tunggal (bukan dipicu berulang).
   - Otomatis dibisukan saat tab/aplikasi disembunyikan. */
(function(){
var AC=null,out=null,cfg={sfx:1,mus:1},bufs={},started=false,hidden=false;
var SFX=['crash','coin','coin_gold','siren_hi','warn'],MUS=['menu','day','night'],EXT=['.mp3','.ogg'];
var MV=.5,want=null,curName=null,mLoadId=0,mel=null,mg=null;

function ctx(){
 if(AC)return AC;
 var C=window.AudioContext||window.webkitAudioContext;if(!C)return null;
 try{AC=new C({latencyHint:'interactive'})}catch(e){try{AC=new C()}catch(e2){AC=null;return null}}
 out=AC.createGain();out.connect(AC.destination);
 return AC;
}
function load(name){
 (function next(i){
  if(i>=EXT.length)return;
  try{
   fetch('assets/sfx/'+name+EXT[i]).then(function(r){if(!r.ok)throw 0;return r.arrayBuffer()})
    .then(function(b){return new Promise(function(res,rej){AC.decodeAudioData(b,res,rej)})})
    .then(function(buf){bufs[name]=buf})
    .catch(function(){next(i+1)});
  }catch(e){next(i+1)}
 })(0);
}

/* ---- musik (streaming, satu elemen) ---- */
function melEl(){
 if(mel)return mel;
 mel=new Audio();mel.loop=true;mel.preload='auto';
 try{var s=AC.createMediaElementSource(mel);mg=AC.createGain();mg.gain.value=0;s.connect(mg);mg.connect(out)}catch(e){mg=null}
 return mel;
}
function setVol(v,sec){
 if(mg&&AC){var n=AC.currentTime;try{mg.gain.cancelScheduledValues(n);mg.gain.setValueAtTime(mg.gain.value,n);mg.gain.linearRampToValueAtTime(v,n+sec)}catch(e){}}
 else if(mel){mel.volume=v}
}
function applyMusic(){
 if(!AC||!started)return;
 var w=(cfg.mus&&!hidden&&MUS.indexOf(want)>=0)?want:null;
 if(w===curName)return;
 var id=++mLoadId;curName=w;
 var el=melEl();
 function tryExt(i){
  if(id!==mLoadId||i>=EXT.length)return;
  el.onerror=function(){tryExt(i+1)};
  el.src='assets/music/'+w+EXT[i];
  var p=el.play();if(p&&p.catch)p.catch(function(){});
  setVol(MV,1.2);
 }
 if(!w){setVol(0,.6);setTimeout(function(){if(id===mLoadId){try{el.pause()}catch(e){}}},700);return}
 if(el.paused||!el.src){tryExt(0)}
 else{setVol(0,.5);setTimeout(function(){tryExt(0)},550)}
}

/* ---- suara sintetis cadangan ---- */
function osc(f,d,v,type,t0,f2){var o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime+(t0||0);o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(out);o.start(t);o.stop(t+d)}
function noise(d,v){var n=Math.floor(AC.sampleRate*d),b=AC.createBuffer(1,n,AC.sampleRate),a=b.getChannelData(0);for(var i=0;i<n;i++)a[i]=(Math.random()*2-1)*(1-i/n);var s=AC.createBufferSource(),g=AC.createGain(),f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=1400;s.buffer=b;g.gain.value=v;s.connect(f);f.connect(g);g.connect(out);s.start()}
var SYN={
 crash:function(v){noise(.35,.5*v);osc(110,.3,.25*v,'sine',0,50)},
 coin:function(v){osc(1000,.09,.04*v,'sine',0,1500)},
 coin_gold:function(v){osc(1300,.12,.05*v,'sine',0,1900)},
 siren_hi:function(v){osc(960,.4,.04*v)},
 siren_lo:function(v){osc(720,.4,.04*v)},
 warn:function(v){osc(660,.18,.05*v,'triangle')}
};

/* ---- sirene: satu loop ---- */
var sirenSrc=null,sirenTimer=null;
function sirenOff(){
 if(sirenSrc){try{sirenSrc.stop()}catch(e){}sirenSrc=null}
 if(sirenTimer){clearInterval(sirenTimer);sirenTimer=null}
}

document.addEventListener('visibilitychange',function(){
 hidden=document.hidden;
 if(!AC)return;
 try{if(hidden)AC.suspend();else if(started)AC.resume()}catch(e){}
 applyMusic();
});

window.PRAudio={
 ctx:function(){var c=ctx();if(c&&c.state==='suspended'&&!hidden){try{c.resume()}catch(e){}}return c},
 init:function(){
  if(started)return;if(!ctx())return;started=true;
  try{AC.resume&&AC.resume()}catch(e){}
  SFX.forEach(load);applyMusic();
 },
 play:function(n,v){
  if(!cfg.sfx||!AC||hidden)return;v=v==null?1:v;
  var b=bufs[n];
  if(b){var s=AC.createBufferSource(),g=AC.createGain();s.buffer=b;g.gain.value=v;s.connect(g);g.connect(out);s.start()}
  else if(SYN[n]){try{SYN[n](v)}catch(e){}}
 },
 siren:function(on){
  if(!on){sirenOff();return}
  if(sirenSrc||sirenTimer||!cfg.sfx||!AC||hidden)return;
  var b=bufs.siren_hi;
  if(b){var s=AC.createBufferSource(),g=AC.createGain();s.buffer=b;s.loop=true;g.gain.value=.8;s.connect(g);g.connect(out);s.start();sirenSrc=s}
  else{var hi=false,t=function(){hi=!hi;try{SYN[hi?'siren_hi':'siren_lo'](1)}catch(e){}};t();sirenTimer=setInterval(t,420)}
 },
 music:function(n){want=n;applyMusic()},
 setCfg:function(c){cfg.sfx=c.sfx;cfg.mus=c.mus;if(!cfg.sfx)sirenOff();applyMusic()}
};
})();
