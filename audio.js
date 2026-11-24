/* Pantura Rush - audio manager.
   Memuat berkas dari assets/sfx dan assets/music (.ogg atau .mp3) bila ada.
   Bila berkas tidak ditemukan, SFX memakai suara sintetis bawaan dan musik dilewati. */
(function(){
var AC=null,out=null,cfg={sfx:1,mus:1},bufs={},started=false,want=null,cur=null,MV=.5;
var SFX=['horn','horn_strong','crash','coin','coin_gold','siren_hi','siren_lo','warn'],MUS=['menu','day','night'];
function ctx(){if(AC)return AC;var C=window.AudioContext||window.webkitAudioContext;if(!C)return null;try{AC=new C();out=AC.createGain();out.connect(AC.destination)}catch(e){AC=null}return AC}
function load(kind,name){
 var base='assets/'+kind+'/'+name,ext=['.ogg','.mp3'];
 (function next(i){
  if(i>=ext.length)return;
  try{fetch(base+ext[i]).then(function(r){if(!r.ok)throw 0;return r.arrayBuffer()})
   .then(function(b){return new Promise(function(res,rej){AC.decodeAudioData(b,res,rej)})})
   .then(function(buf){bufs[kind+name]=buf;if(kind=='music')applyMusic()})
   .catch(function(){next(i+1)})}catch(e){next(i+1)}
 })(0);
}
function stopMusic(){
 if(!cur||!AC)return;var c=cur;cur=null;
 try{c.g.gain.cancelScheduledValues(AC.currentTime);c.g.gain.setValueAtTime(c.g.gain.value,AC.currentTime);c.g.gain.linearRampToValueAtTime(0,AC.currentTime+.8);c.s.stop(AC.currentTime+.9)}catch(e){}
}
function applyMusic(){
 if(!AC)return;
 if(!cfg.mus||!want){stopMusic();return}
 if(cur&&cur.name==want)return;
 var buf=bufs['music'+want];if(!buf){stopMusic();return}
 stopMusic();
 var s=AC.createBufferSource(),g=AC.createGain();s.buffer=buf;s.loop=true;g.gain.value=0;s.connect(g);g.connect(out);s.start();
 g.gain.linearRampToValueAtTime(MV,AC.currentTime+1.2);cur={name:want,s:s,g:g};
}
function osc(f,d,v,type,t0,f2){var o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime+(t0||0);o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(out);o.start(t);o.stop(t+d)}
function noise(d,v){var n=Math.floor(AC.sampleRate*d),b=AC.createBuffer(1,n,AC.sampleRate),a=b.getChannelData(0);for(var i=0;i<n;i++)a[i]=(Math.random()*2-1)*(1-i/n);var s=AC.createBufferSource(),g=AC.createGain(),f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=1400;s.buffer=b;g.gain.value=v;s.connect(f);f.connect(g);g.connect(out);s.start()}
var SYN={
 horn:function(v){osc(420,.45,.06*v,'square');osc(520,.45,.06*v,'square')},
 horn_strong:function(v){osc(360,.7,.07*v,'square');osc(450,.7,.07*v,'square');osc(560,.7,.05*v,'square')},
 crash:function(v){noise(.35,.5*v);osc(110,.3,.25*v,'sine',0,50)},
 coin:function(v){osc(1000,.09,.04*v,'sine',0,1500)},
 coin_gold:function(v){osc(1300,.12,.05*v,'sine',0,1900)},
 siren_hi:function(v){osc(960,.4,.04*v)},
 siren_lo:function(v){osc(720,.4,.04*v)},
 warn:function(v){osc(660,.18,.05*v,'triangle')}
};
window.PRAudio={
 init:function(){if(started)return;if(!ctx())return;started=true;try{AC.resume&&AC.resume()}catch(e){}SFX.forEach(function(n){load('sfx',n)});MUS.forEach(function(n){load('music',n)});applyMusic()},
 play:function(n,v){if(!cfg.sfx||!AC)return;v=v==null?1:v;var b=bufs['sfx'+n];
  if(b){var s=AC.createBufferSource(),g=AC.createGain();s.buffer=b;g.gain.value=v;s.connect(g);g.connect(out);s.start()}
  else if(SYN[n]){try{SYN[n](v)}catch(e){}}},
 music:function(n){want=n;applyMusic()},
 setCfg:function(c){cfg.sfx=c.sfx;cfg.mus=c.mus;applyMusic()}
};
})();
