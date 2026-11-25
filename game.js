(function(){
var W=360,H=640,RX=56,LW=62,N=4,PY=480;
var DPR=Math.min(window.devicePixelRatio||1,2);
var C=document.getElementById('c'),X=C.getContext('2d');
var O=document.createElement('canvas'),OX=O.getContext('2d');
C.width=O.width=W*DPR;C.height=O.height=H*DPR;
X.setTransform(DPR,0,0,DPR,0,0);OX.setTransform(DPR,0,0,DPR,0,0);
var M=document.getElementById('m'),lastMenu=null;
var best=0;try{best=+localStorage.getItem('pr_best')||0}catch(e){}
function lx(i){return RX+LW*i+LW/2}
function rnd(a,b){return a+Math.random()*(b-a)}
function pick(a){return a[Math.floor(Math.random()*a.length)]}
function cl(v,a,b){return Math.max(a,Math.min(b,v))}
var G=null,keys={},gasOn=false,brkOn=false,PY0=480,PYMIN=150,PYMAX=545;

/* ---------- JALUR ASET GAMBAR, VIDEO & AUDIO ---------- */
var MENU_BG_PATHS={
 video:'assets/menu/bg_menu.mp4',
 image:'assets/menu/bg_menu.jpg'
};

var ICONS={};
var ICON_PATHS={
 player:'icons/player.png',
 ambulance:'icons/ambulance.png',
 mobil:'icons/mobil.png',
 motor:'icons/motor.png',
 angkot:'icons/angkot.png',
 bus:'icons/bus.png',
 truk:'icons/truk.png',
 becak:'icons/becak.png',
 gas:'icons/gas.png',
 rem:'icons/rem.png',
 klakson:'icons/klakson.png',
 speedo:'icons/speedo.png',
 shop_fuel:'icons/shop_fuel.png',
 shop_repair:'icons/shop_repair.png',
 shop_armor:'icons/shop_armor.png',
 shop_tank:'icons/shop_tank.png',
 shop_horn:'icons/shop_horn.png',
 shop_jerrycan:'icons/shop_jerrycan.png'
};
for(var ik in ICON_PATHS){(function(k,src){var im=new Image();im.src=src;ICONS[k]=im})(ik,ICON_PATHS[ik])}

var AUDIO_PATHS={
 sfx_gas:'assets/sfx/gas.mp3',
 sfx_rem:'assets/sfx/rem.mp3',
 sfx_horn_0:'assets/sfx/horn_0.mp3',
 sfx_horn_1:'assets/sfx/horn_1.mp3',
 sfx_horn_2:'assets/sfx/horn_2.mp3',
 sfx_horn_3:'assets/sfx/horn_3.mp3',
 mus_warning:'assets/music/warning.mp3',
 sfx_buy_ok:'assets/sfx/buy_ok.mp3',
 sfx_buy_fail:'assets/sfx/buy_fail.mp3'
};
var AUDIOS={},AUDIO_BUFS={},AUDIO_LOADING={},AUDIO_ERR={},SYNTH={gas:null,rem:null,warnTimer:null,warnStep:0,hornBufSrc:null};
function decodeAB(k,ab){
 var ctx=getAC();
 if(!ctx||!ctx.decodeAudioData){AUDIO_LOADING[k]=false;return;}
 ctx.decodeAudioData(ab,function(buf){
  AUDIO_BUFS[k]=buf;
  AUDIO_LOADING[k]=false;
 },function(){
  AUDIO_ERR[k]=true;
  AUDIO_LOADING[k]=false;
 });
}
function loadAudioBuffer(k,src){
 if(AUDIO_BUFS[k]||AUDIO_LOADING[k]||AUDIO_ERR[k])return;
 AUDIO_LOADING[k]=true;
 if(window.fetch){
  fetch(src).then(function(r){
   if(!r.ok)throw new Error('404');
   return r.arrayBuffer();
  }).then(function(ab){decodeAB(k,ab)}).catch(function(){
   try{
    var xhr=new XMLHttpRequest();xhr.open('GET',src,true);xhr.responseType='arraybuffer';
    xhr.onload=function(){if(xhr.response)decodeAB(k,xhr.response);else{AUDIO_ERR[k]=true;AUDIO_LOADING[k]=false;}};
    xhr.onerror=function(){AUDIO_ERR[k]=true;AUDIO_LOADING[k]=false;};
    xhr.send();
   }catch(e){AUDIO_ERR[k]=true;AUDIO_LOADING[k]=false;}
  });
 }
}
for(var ak in AUDIO_PATHS){(function(k,src){
 var au=new Audio();au.preload='auto';au.src=src;
 if(k==='mus_warning'||k==='sfx_gas'||k==='sfx_rem')au.loop=true;
 au.addEventListener('error',function(){AUDIO_ERR[k]=true});
 AUDIOS[k]=au;
 if(k.indexOf('sfx_horn_')===0||k==='sfx_buy_ok'||k==='sfx_buy_fail'){
  loadAudioBuffer(k,src);
 }
})(ak,AUDIO_PATHS[ak])}

function getAC(){
 if(!AC)try{AC=new(window.AudioContext||window.webkitAudioContext)({latencyHint:'interactive'})}catch(e){try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e2){}}
 if(AC&&AC.state==='suspended')try{AC.resume()}catch(e){}
 return AC;
}
function synthLoop(type,on){
 var ctx=getAC();if(!ctx)return;
 if(type==='gas'){
  if(on){
   if(SYNTH.gas)return;
   var o=ctx.createOscillator(),o2=ctx.createOscillator(),g=ctx.createGain(),f=ctx.createBiquadFilter();
   o.type='sawtooth';o.frequency.setValueAtTime(68,ctx.currentTime);o.frequency.linearRampToValueAtTime(118,ctx.currentTime+1.2);
   o2.type='triangle';o2.frequency.setValueAtTime(34,ctx.currentTime);o2.frequency.linearRampToValueAtTime(59,ctx.currentTime+1.2);
   f.type='lowpass';f.frequency.value=320;
   g.gain.setValueAtTime(0.001,ctx.currentTime);g.gain.linearRampToValueAtTime(0.14,ctx.currentTime+0.12);
   o.connect(f);o2.connect(f);f.connect(g);g.connect(ctx.destination);
   o.start();o2.start();
   SYNTH.gas={o:o,o2:o2,g:g};
  }else if(SYNTH.gas){
   try{SYNTH.gas.g.gain.setTargetAtTime(0.0001,ctx.currentTime,0.04);SYNTH.gas.o.stop(ctx.currentTime+0.12);SYNTH.gas.o2.stop(ctx.currentTime+0.12)}catch(e){}
   SYNTH.gas=null;
  }
 }else if(type==='rem'){
  if(on){
   if(SYNTH.rem)return;
   var o=ctx.createOscillator(),g=ctx.createGain(),f=ctx.createBiquadFilter();
   o.type='sawtooth';o.frequency.setValueAtTime(210,ctx.currentTime);o.frequency.exponentialRampToValueAtTime(75,ctx.currentTime+0.7);
   f.type='bandpass';f.frequency.value=420;f.Q.value=2.5;
   g.gain.setValueAtTime(0.001,ctx.currentTime);g.gain.linearRampToValueAtTime(0.13,ctx.currentTime+0.08);
   o.connect(f);f.connect(g);g.connect(ctx.destination);
   o.start();
   SYNTH.rem={o:o,g:g};
  }else if(SYNTH.rem){
   try{SYNTH.rem.g.gain.setTargetAtTime(0.0001,ctx.currentTime,0.04);SYNTH.rem.o.stop(ctx.currentTime+0.1)}catch(e){}
   SYNTH.rem=null;
  }
 }else if(type==='warning'){
  if(on){
   if(SYNTH.warnTimer)return;
   var beat=function(){
    if(!cfg.mus)return;
    var c=getAC();if(!c)return;
    var hi=(SYNTH.warnStep%2===0);SYNTH.warnStep++;
    var o=c.createOscillator(),g=c.createGain();
    o.type='square';o.frequency.setValueAtTime(hi?880:660,c.currentTime);
    g.gain.setValueAtTime(0.09,c.currentTime);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+0.18);
    o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+0.19);
   };
   beat();
   SYNTH.warnTimer=setInterval(beat,340);
  }else if(SYNTH.warnTimer){
   clearInterval(SYNTH.warnTimer);SYNTH.warnTimer=null;SYNTH.warnStep=0;
  }
 }
}
function synthOnce(type){
 var ctx=getAC();if(!ctx)return;
 if(type==='buy_ok'){
  [523.25,659.25,783.99,1046.5].forEach(function(freq,idx){
   var o=ctx.createOscillator(),g=ctx.createGain(),t0=ctx.currentTime+idx*0.06;
   o.type='triangle';o.frequency.setValueAtTime(freq,t0);
   g.gain.setValueAtTime(0.14,t0);g.gain.exponentialRampToValueAtTime(0.001,t0+0.18);
   o.connect(g);g.connect(ctx.destination);o.start(t0);o.stop(t0+0.19);
  });
 }else if(type==='buy_fail'){
  [240,175].forEach(function(freq,idx){
   var o=ctx.createOscillator(),g=ctx.createGain(),t0=ctx.currentTime+idx*0.11;
   o.type='sawtooth';o.frequency.setValueAtTime(freq,t0);
   g.gain.setValueAtTime(0.13,t0);g.gain.exponentialRampToValueAtTime(0.001,t0+0.16);
   o.connect(g);g.connect(ctx.destination);o.start(t0);o.stop(t0+0.17);
  });
 }else if(type.indexOf('horn_')===0){
  var lv=parseInt(type.split('_')[1],10)||0;
  var patterns=[
   [[420,0,0.22]],
   [[392,0,0.16],[493.88,0.17,0.22]],
   [[392,0,0.12],[493.88,0.13,0.12],[587.33,0.26,0.24]],
   [[392,0,0.11],[493.88,0.12,0.11],[587.33,0.24,0.11],[659.25,0.36,0.12],[783.99,0.49,0.26]]
  ];
  stopHornAudio();
  SYNTH.hornNodes=[];
  var seq=patterns[cl(lv,0,3)];
  seq.forEach(function(step){
   var o=ctx.createOscillator(),o2=ctx.createOscillator(),g=ctx.createGain(),t0=ctx.currentTime+step[1];
   o.type='sawtooth';o.frequency.setValueAtTime(step[0],t0);
   o2.type='square';o2.frequency.setValueAtTime(step[0]*0.5,t0);
   g.gain.setValueAtTime(0.14,t0);g.gain.exponentialRampToValueAtTime(0.001,t0+step[2]);
   o.connect(g);o2.connect(g);g.connect(ctx.destination);o.start(t0);o2.start(t0);o.stop(t0+step[2]+0.01);o2.stop(t0+step[2]+0.01);
   SYNTH.hornNodes.push(o,o2);
  });
 }
}

function playCustomAudio(k,on){
 var isMus=(k.indexOf('mus_')===0);
 var enabled=isMus?cfg.mus:cfg.sfx;
 var a=AUDIOS[k];
 if(!enabled){
  if(a&&!a.paused){a.pause();a.currentTime=0}
  if(k==='sfx_gas')synthLoop('gas',false);
  else if(k==='sfx_rem')synthLoop('rem',false);
  else if(k==='mus_warning')synthLoop('warning',false);
  return;
 }
 var isOneShot=(k==='sfx_buy_ok'||k==='sfx_buy_fail'||k.indexOf('sfx_horn_')===0);
 var synthKey=(k==='sfx_buy_ok'?'buy_ok':(k==='sfx_buy_fail'?'buy_fail':k.replace('sfx_','')));
 if(isOneShot){
  var ctx=getAC();
  if(ctx&&AUDIO_BUFS[k]){
   try{
    var srcNode=ctx.createBufferSource();
    srcNode.buffer=AUDIO_BUFS[k];
    srcNode.connect(ctx.destination);
    srcNode.start(ctx.currentTime);
    if(k.indexOf('sfx_horn_')===0)SYNTH.hornBufSrc=srcNode;
    return;
   }catch(e){}
  }
  if(!AUDIO_BUFS[k]&&!AUDIO_ERR[k])loadAudioBuffer(k,AUDIO_PATHS[k]);
  synthOnce(synthKey);
  return;
 }
 if(on){
  if(a&&!AUDIO_ERR[k]){
   if(a.paused){
    a.currentTime=0;
    var pr=a.play();
    if(pr&&pr.catch)pr.catch(function(){
     if(k==='sfx_gas')synthLoop('gas',true);
     else if(k==='sfx_rem')synthLoop('rem',true);
     else if(k==='mus_warning')synthLoop('warning',true);
    });
   }
  }else{
   if(k==='sfx_gas')synthLoop('gas',true);
   else if(k==='sfx_rem')synthLoop('rem',true);
   else if(k==='mus_warning')synthLoop('warning',true);
  }
 }else{
  if(a&&!a.paused){a.pause();a.currentTime=0}
  if(k==='sfx_gas')synthLoop('gas',false);
  else if(k==='sfx_rem')synthLoop('rem',false);
  else if(k==='mus_warning')synthLoop('warning',false);
 }
}

function stopHornAudio(){
 if(SYNTH.hornBufSrc){
  try{SYNTH.hornBufSrc.stop(0)}catch(e){}
  SYNTH.hornBufSrc=null;
 }
 for(var i=0;i<=3;i++){
  var ha=AUDIOS['sfx_horn_'+i];
  if(ha&&!ha.paused){try{ha.pause();ha.currentTime=0}catch(e){}}
 }
 if(SYNTH.hornNodes){
  SYNTH.hornNodes.forEach(function(n){try{n.stop()}catch(e){}});
  SYNTH.hornNodes=null;
 }
}
function stopAllCustomAudio(){
 playCustomAudio('sfx_gas',false);
 playCustomAudio('sfx_rem',false);
 playCustomAudio('mus_warning',false);
 stopHornAudio();
}

var TYPES={
 mobil:{w:34,h:60,v:[130,190],c:['#d62828','#2a9d8f','#e9c46a','#8d99ae','#f1f1f1']},
 motor:{w:18,h:40,v:[190,240],c:['#222','#c1121f','#0077b6']},
 angkot:{w:38,h:68,v:[120,150],c:['#f4d35e']},
 bus:{w:42,h:104,v:[150,180],c:['#e76f51','#3a86ff','#2d6a4f']},
 truk:{w:44,h:112,v:[100,125],c:['#9c6644','#6c757d','#bc4749']},
 becak:{w:26,h:52,v:[40,60],c:['#ffbe0b','#fb5607']}
};

/* ---------- KONFIGURASI & TATA LETAK ---------- */
var DEF_LAY={
 sp:{x:150,y:622,s:1.22},
 gas:{x:316,y:578,s:1.25},
 rem:{x:242,y:588,s:1.22},
 horn:{x:316,y:485,s:1.10}
};
var cfg={
 mode:'dyn',
 ctrl:'btn',
 sfx:1,
 mus:1,
 lay:JSON.parse(JSON.stringify(DEF_LAY))
};
try{
 var sc=JSON.parse(localStorage.getItem('pr_cfg')||'null');
 if(sc){
  for(var kk in sc){
   if(kk==='lay'&&sc.lay){
    for(var lk in DEF_LAY){
     if(sc.lay[lk]){
      cfg.lay[lk]={
       x:sc.lay[lk].x,
       y:sc.lay[lk].y,
       s:cl(sc.lay[lk].s||DEF_LAY[lk].s,0.5,2.0)
      };
     }
    }
   }else{
    cfg[kk]=sc[kk];
   }
  }
 }
}catch(e){}
function saveCfg(){try{localStorage.setItem('pr_cfg',JSON.stringify(cfg))}catch(e){}PRAudio.setCfg(cfg)}
function resetLayout(){cfg.lay=JSON.parse(JSON.stringify(DEF_LAY));saveCfg();applyControlLayout()}

var pauseState=false;
var layoutEdit=false;

function reset(){
 pauseState=false;layoutEdit=false;
 G={on:true,t:0,clock:12,dist:0,bonus:0,speed:200,fuel:100,inv:0,
  px:lx(1),tx:lx(1),slip:0,shake:0,flash:0,
  obs:[],haz:[],cn:[],dec:[],pop:[],rain:[],
  w:0,wTarget:0,wName:'Cerah',wTimer:20,spawn:0.5,hz:1.5,cnT:1.5,dcT:0,coins:0,ct:0,cap:100,tl:0,ar:0,leak:0,svT:5,svN:0,sv:null,auto:0,pause:false,cb:CB,tb:-1,py:480,thr:0,hl:0,hs:0,hf:0,pr:0,pw:0,smk:0,dents:[],rg:[],hw:null,mt:'',off:0,pt:[],bend:0,bT:0,bTimer:35,bDur:0,hk:0,cp:0,am:null,amT:45};
 PY=480;
 for(var i=0;i<90;i++)G.rain.push({x:rnd(0,W),y:rnd(0,H),s:rnd(.7,1.3)});
 for(var j=0;j<10;j++)addDecor(rnd(0,H));
}
function addDecor(y){
 var side=Math.random()<.5?-1:1;
 var t=pick(['pohon','pohon','pohon','warung','tiang','tiang']);
 G.dec.push({x:side<0?28:W-28,y:y,t:t,s:side});
}
function dark(h){h=((h%24)+24)%24;if(h>=19||h<5)return 1;if(h>=17)return(h-17)/2;if(h>=5&&h<7)return 1-(h-5)/2;return 0}

function sx(y){return G.bend*120*Math.pow(Math.max(0,(H-y)/H),2)}
function slope(y){return Math.atan(G.bend*240*Math.max(0,H-y)/(H*H))}
function laneFree(o,lane){var x=lx(lane);for(var i=0;i<G.obs.length;i++){var q=G.obs[i];if(q===o||q.fl)continue;if((q.lane==lane||Math.abs(q.x-x)<(q.w+o.w)/2+6)&&Math.abs(q.y-o.y)<(q.h+o.h)/2+40)return false}return true}
function freeLane(o){var c=Math.random()<.5?[-1,1]:[1,-1];for(var i=0;i<2;i++){var nl=o.lane+c[i];if(nl>=0&&nl<N&&laneFree(o,nl))return nl}return -1}
function knock(o,dd,m,silent){
 if(o.fl)return;
 o.fl=1;o.kx=dd*(o.t=='motor'||o.t=='becak'?380:o.t=='bus'||o.t=='truk'?210:300)*m;o.sp=dd*rnd(3,6);o.rot=0;o.v+=120;
 emit(o.x-dd*o.w/2,o.y,8,'255,220,120',180,.4,3,1);o.fx=.18;o.dm=1;G.rg.push({x:o.x,y:o.y,t:.3});emit(o.x,o.y,8,hexRgb(o.c),200,.7,3,0);if(!silent)PRAudio.play('crash',.6);
 if(!silent&&G.cp<=0){G.cp=1.6;G.pop.push({x:o.x+sx(o.y),y:Math.max(o.y,90),t:'Beruntun!',l:1})}
}
function tone(f,d,v){try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();var o=AC.createOscillator(),k=AC.createGain();o.type='sine';o.frequency.value=f;k.gain.setValueAtTime(v,AC.currentTime);k.gain.exponentialRampToValueAtTime(.001,AC.currentTime+d);o.connect(k);k.connect(AC.destination);o.start();o.stop(AC.currentTime+d)}catch(e){}}
function drawAmb(a){
 var w=a.w,h=a.h,f=Math.floor(G.t*8)%2,im=ICONS.ambulance;
 X.save();X.translate(a.x,a.y);
 X.fillStyle='rgba(0,0,0,.25)';X.fillRect(-w/2+3,-h/2+4,w,h);
 if(im&&im.complete&&im.naturalWidth){
  X.drawImage(im,-w/2,-h/2,w,h);
 }else{
  rr(-w/2,-h/2,w,h,6,'#f4f4f4');rr(-w/2+3,-h/2+6,w-6,14,3,'#1d3557');
  X.fillStyle='#d62828';X.fillRect(-2,-4,4,16);X.fillRect(-6,2,12,4);
 }
 X.fillStyle=f?'#ff2a2a':'#2a6bff';X.fillRect(-w/2+3,-h/2+22,12,5);
 X.fillStyle=f?'#2a6bff':'#ff2a2a';X.fillRect(w/2-15,-h/2+22,12,5);
 X.restore();
}
function speedo(){
 var g=G,cx=cfg.lay.sp.x,cy=cfg.lay.sp.y,sc=cfg.lay.sp.s||1,r=40,kmh=Math.round(g.speed*.45),f=cl(kmh/260,0,1),imSp=ICONS.speedo;
 X.save();X.translate(cx,cy);X.scale(sc,sc);X.translate(-cx,-cy);X.lineCap='round';
 if(imSp&&imSp.complete&&imSp.naturalWidth){
  X.drawImage(imSp,cx-r-8,cy-r-8,(r+8)*2,r+14);
  var na=Math.PI+Math.PI*f;
  X.lineWidth=2.5;X.strokeStyle='#ff4d6d';
  X.beginPath();X.moveTo(cx,cy);X.lineTo(cx+Math.cos(na)*(r-11),cy+Math.sin(na)*(r-11));X.stroke();
  X.fillStyle='#ff4d6d';X.beginPath();X.arc(cx,cy,4.5,0,Math.PI*2);X.fill();
  X.fillStyle='#fff';X.textAlign='center';X.font='bold 13px Verdana';X.fillText(kmh,cx,cy-10);
  X.restore();return;
 }
 var bg=X.createRadialGradient(cx,cy,6,cx,cy,r+9);
 bg.addColorStop(0,'rgba(18,24,38,.92)');bg.addColorStop(1,'rgba(8,12,20,.82)');
 X.fillStyle=bg;X.beginPath();X.arc(cx,cy,r+8,Math.PI,2*Math.PI);X.closePath();X.fill();
 X.lineWidth=2;X.strokeStyle='rgba(255,255,255,.22)';X.stroke();
 X.lineWidth=6;X.strokeStyle='rgba(255,255,255,.12)';X.beginPath();X.arc(cx,cy,r-1,Math.PI,2*Math.PI);X.stroke();
 var col=f<.5?'#2ec4b6':f<.8?'#ffbe0b':'#ff3b5c';
 X.save();X.shadowColor=col;X.shadowBlur=8;X.strokeStyle=col;
 X.beginPath();X.arc(cx,cy,r-1,Math.PI,Math.PI+Math.PI*f);X.stroke();X.restore();
 for(var i=0;i<=10;i++){
  var a=Math.PI+Math.PI*i/10,c=Math.cos(a),s=Math.sin(a),maj=i%2==0;
  X.lineWidth=maj?1.6:1;X.strokeStyle=maj?'rgba(255,255,255,.8)':'rgba(255,255,255,.35)';
  X.beginPath();X.moveTo(cx+c*(r-(maj?12:9)),cy+s*(r-(maj?12:9)));X.lineTo(cx+c*(r-5),cy+s*(r-5));X.stroke();
 }
 var na=Math.PI+Math.PI*f;
 X.lineWidth=2.5;X.strokeStyle='#ff4d6d';
 X.beginPath();X.moveTo(cx,cy);X.lineTo(cx+Math.cos(na)*(r-11),cy+Math.sin(na)*(r-11));X.stroke();
 X.fillStyle='#ff4d6d';X.beginPath();X.arc(cx,cy,4.5,0,Math.PI*2);X.fill();
 X.fillStyle='#fff';X.beginPath();X.arc(cx,cy,2,0,Math.PI*2);X.fill();
 X.fillStyle='rgba(0,0,0,.55)';rr(cx-21,cy-25,42,17,5,'rgba(0,0,0,.55)');
 X.fillStyle='#fff';X.textAlign='center';X.font='bold 14px Verdana';X.fillText(kmh,cx,cy-12);
 X.font='bold 8px Verdana';X.fillStyle='#94a3b8';X.fillText('KM/J',cx,cy-1);
 X.restore();
}
function ambHud(){
 var g=G,A=g.am;if(!A||A.st!='warn')return;
 var f=Math.floor(g.t*5)%2,s=sx(H-120);
 X.fillStyle=f?'rgba(214,40,40,.85)':'rgba(40,100,255,.85)';X.fillRect(0,56,W,24);
 X.fillStyle='#fff';X.font='bold 13px Verdana';X.textAlign='center';X.fillText('AMBULANCE DARI BELAKANG! Beri jalan',W/2,73);
 X.fillStyle=f?'rgba(214,40,40,.28)':'rgba(40,100,255,.28)';X.fillRect(RX+LW*A.lane+s,H-260,LW,260);
 X.fillStyle='#fff';X.font='bold 26px Verdana';X.fillText('\u25B2',lx(A.lane)+s,H-150);
}
var SVL=1220,RATE=3,TKC=[15,30,50,75],ARC=[18,35,55,80],HLC=[15,30,50],HR=[170,260,380,520],CB=Math.ceil((100+25*4)/RATE);
function svZone(){var S=G.sv;if(!S||S.st!='on')return false;var e=S.y+SVL;return e>PY-110&&e-960<PY}
function txMin(){if(!G)return RX+16;if(G.auto)return 0;var S=G.sv;return S&&S.st=='on'&&!S.used&&S.side<0&&svZone()?30:RX+16}
function txMax(){if(!G)return RX+LW*N-16;if(G.auto)return W;var S=G.sv;return S&&S.st=='on'&&!S.used&&S.side>0&&svZone()?W-30:RX+LW*N-16}
function leakHit(){var g=G,sf=Math.pow(g.speed/250,2);g.leak=Math.min(4.5,g.leak+(.32+.52*sf)*(1-.18*g.ar));g.pop.push({x:g.px,y:PY-70,t:'Tangki bocor!',l:1.1})}
function drawSv(){
 var g=G,S=g.sv;if(!S||S.st!='on')return;
 var cx=S.side<0?29:W-29,e=S.y+SVL,y1=Math.min(e,H+10),ie=S.side<0?RX-3:RX+LW*N+1;
 for(var y=Math.floor(Math.max(S.y,-10)/6)*6;y<y1;y+=6){
  var s=sx(y+3),edge=(y>e-180||y<S.y+120);
  X.fillStyle='#4a4f57';X.fillRect(cx-23+s,y,46,7);
  if(!edge||((Math.floor(y/12))&1)){X.fillStyle=edge?'rgba(255,255,255,.8)':'#f2c230';X.fillRect(ie-1+s,y,3,7)}
  X.fillStyle='rgba(255,255,255,.55)';X.fillRect(S.side<0?cx-23+s:cx+21+s,y,2,7);
 }
}
function drawSvTop(){
 var g=G,S=g.sv;if(!S||S.st!='on')return;
 var cx=S.side<0?29:W-29,pom=S.k=='pom',mini=S.k=='pertamini';
 var nm=pom?'PERTAMINA':(mini?'PERTAMINI':'BENGKEL');
 var acc=pom?'#d62828':(mini?'#f59e0b':'#2b6cb0');
 var ry=S.y+SVL+140;
 if(ry>-60&&ry<H+60){
  var bx=(S.side<0?28:W-28)+sx(ry);
  X.save();X.translate(bx,ry);
  X.fillStyle='#334155';X.fillRect(-3,16,6,18);
  rr(-27,-24,54,42,5,'#0f172a');
  X.lineWidth=2;X.strokeStyle=acc;
  if(X.roundRect){X.beginPath();X.roundRect(-27,-24,54,42,5);X.stroke()}else{X.strokeRect(-27,-24,54,42)}
  rr(-25,-22,50,12,3,acc);
  X.fillStyle='#fff';X.font='bold 7.5px Verdana';X.textAlign='center';
  X.fillText(nm,0,-13);
  X.fillStyle='#fde047';X.font='bold 7px Verdana';
  X.fillText('WELCOME',0,-1);
  X.fillStyle='#fff';X.font='bold 6.5px Verdana';
  X.fillText('DISINI '+(S.side<0?'↖':'↗'),0,8);
  var blink=Math.floor(g.t*5)%2;
  X.fillStyle=blink?'#4ade80':'#fde047';X.font='bold 10px Verdana';
  X.fillText(S.side<0?'⬆ MASUK':'MASUK ⬆',0,16);
  X.restore();
 }
 var cy=S.y+SVL/2;if(cy<-80||cy>H+80)return;
 X.save();X.translate(sx(cy)+cx,cy);
 X.globalAlpha=.72;X.fillStyle=acc;X.fillRect(-32,-56,64,112);
 X.fillStyle=pom?'#f4f4f4':(mini?'#1e3a8a':'#cbd5e0');for(var i=0;i<7;i++)if(i%2)X.fillRect(-32,-56+i*16,64,16);
 X.globalAlpha=1;X.fillStyle='#fff';X.fillRect(-32,-56,64,3);X.fillRect(-32,53,64,3);X.fillRect(-28,-9,56,18);
 X.fillStyle='#111';X.font='bold '+(mini?'9px':'11px')+' Verdana';X.textAlign='center';X.fillText(nm,0,4);
 X.restore();
}
function svHud(){
 var g=G,S=g.sv;if(!S)return;
 var f=Math.floor(g.t*4)%2,nm=S.k=='pom'?'PERTAMINA':(S.k=='pertamini'?'PERTAMINI':'BENGKEL'),sd=S.side<0?'kiri':'kanan';
 if(S.st=='warn'){
  X.fillStyle=f?'rgba(0,150,90,.88)':'rgba(0,110,70,.88)';X.fillRect(0,56,W,24);
  var mRem=Math.max(1,Math.ceil(S.distWarn/5)*5);
  X.fillStyle='#fff';X.font='bold 12px Verdana';X.textAlign='center';X.fillText(nm+' '+mRem+' m lagi, lajur '+sd,W/2,73);
  X.font='bold 28px Verdana';X.fillStyle=f?'#fff':'rgba(255,255,255,.4)';X.textAlign=S.side<0?'left':'right';X.fillText(S.side<0?'\u25C0':'\u25B6',S.side<0?8:W-8,330);
 }else if(!S.used&&S.y+SVL>120&&S.y<PY+40){
  X.fillStyle='rgba(0,0,0,.55)';X.fillRect(0,56,W,22);X.fillStyle='#ffd23f';X.font='bold 12px Verdana';X.textAlign='center';X.fillText('Geser ke '+sd+' untuk masuk '+nm,W/2,72);
 }
 if(g.auto){X.fillStyle='rgba(255,255,255,.85)';X.font='bold 11px Verdana';X.textAlign='center';X.fillText('AUTO DRIVE',W/2,H-94)}
}
function openService(){showCtl(false);stopAllCustomAudio();renderService()}
function clearExitLane(){
 var g=G;if(!g||!g.sv)return;
 var exitLane=g.sv.side<0?0:N-1;
 g.obs=g.obs.filter(function(o){
  if(o.fl)return true;
  if(o.lane==exitLane||Math.abs(o.x-lx(exitLane))<LW*1.15){
   if(o.y>-120&&o.y<PY+140){
    var moved=false;
    var cands=g.sv.side<0?[2,3,1]:[1,0,2];
    for(var i=0;i<cands.length;i++){
     var nl=cands[i];
     if(nl!=exitLane&&laneFree(o,nl)){o.lane=nl;o.x=lx(nl);moved=true;break;}
    }
    if(!moved)return false;
   }
  }
  return true;
 });
}
function closeService(){var g=G;if(!g||!g.pause)return;M.style.display='none';showCtl(true);g.pause=false;g.auto=3;g.inv=Math.max(g.inv,2.5);clearExitLane()}
var SHOP_SVGS={
 shop_fuel:'<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33a2.5 2.5 0 0 0 2.5 2.5c.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5a2.5 2.5 0 0 0 5 0V9c0-.69-.28-1.32-.73-1.77zM12 10H6V5h6v5z"/></svg>',
 shop_repair:'<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>',
 shop_armor:'<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>',
 shop_tank:'<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-3V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM9 4h6v2H9V4zm7 11h-3v3h-2v-3H8v-2h3v-3h2v3h3v2z"/></svg>',
 shop_horn:'<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>',
 shop_jerrycan:'<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M18 4h-4V2h-4v2H6C4.9 4 4 4.9 4 6v14c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 13h-2v-3H8v-2h3V9h2v3h3v2h-3v3z"/></svg>'
};
function shopIconHtml(key,sz){
 var s=sz||42;
 var src=ICON_PATHS[key]||'';
 var svg=SHOP_SVGS[key]||SHOP_SVGS.shop_repair;
 return '<span style="width:'+s+'px;height:'+s+'px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;filter:drop-shadow(0 3px 6px rgba(0,0,0,.45))">'+
  '<img src="'+src+'" alt="" style="width:'+s+'px;height:'+s+'px;object-fit:contain;display:block" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'inline-flex\'">'+
  '<span style="display:none;align-items:center;justify-content:center;transform:scale(1.45)">'+svg+'</span>'+
 '</span>';
}
function renderService(msg){
 var g=G;if(!g||!g.pause||!g.sv)return;var k=g.sv.k,isFuel=(k=='pom'||k=='pertamini'),rt=(k=='pertamini'?1.5:RATE);
 var title=k=='pom'?'Pom Bensin Pertamina':(k=='pertamini'?'Pertamini Eceran':'Bengkel & Toko');
 var accent=k=='pom'?'#ef4444':(k=='pertamini'?'#f59e0b':'#38bdf8');
 var h='<div style="width:92%;max-width:324px;max-height:92%;overflow-y:auto;background:linear-gradient(180deg,rgba(15,23,42,.96),rgba(10,15,28,.98));border:1.5px solid rgba(255,255,255,.16);border-radius:20px;padding:14px 14px 16px;box-sizing:border-box;box-shadow:0 16px 40px rgba(0,0,0,.85);display:flex;flex-direction:column;align-items:center">';
 h+='<div style="width:100%;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,.1);text-align:center">'+
  '<div style="font:bold 10px Verdana;letter-spacing:1.5px;color:'+accent+';text-transform:uppercase;margin-bottom:3px">'+(isFuel?'PENGISIAN BAHAN BAKAR':'SERVIS & UPGRADE')+'</div>'+
  '<h1 style="font-size:21px;margin:0 0 8px;line-height:1.15">'+title+'</h1>'+
  '<div style="display:flex;justify-content:center;gap:8px;font:bold 11.5px Verdana">'+
   '<span style="background:rgba(255,210,63,.14);border:1px solid rgba(255,210,63,.35);color:#ffd23f;padding:4px 10px;border-radius:20px">🪙 '+g.coins+' Koin</span>'+
   '<span style="background:rgba(45,198,83,.14);border:1px solid rgba(45,198,83,.35);color:#4ade80;padding:4px 10px;border-radius:20px">⛽ '+Math.ceil(g.fuel)+'/'+g.cap+' L</span>'+
  '</div>'+
 '</div>';
 if(msg)h+='<div style="width:100%;background:rgba(255,255,255,.07);border-radius:10px;padding:6px 10px;margin-top:8px;color:'+msg.c+';font-weight:bold;font-size:12px;text-align:center">'+msg.t+'</div>';
 if(isFuel){
  var mx=Math.floor(Math.min(g.cap-g.fuel,g.coins*rt));
  var note=k=='pertamini'?'Tarif eceran: 2 koin = 3 Liter':'Tarif resmi: 1 koin = '+RATE+' Liter';
  h+='<div style="width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:12px;margin-top:10px;box-sizing:border-box;text-align:center">'+
   '<div style="display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:8px">'+
    shopIconHtml('shop_fuel',52)+
    '<div style="text-align:left"><div style="font:bold 13px Verdana;color:#fff">'+note+'</div><div style="font:11px Verdana;color:#94a3b8;margin-top:2px">Geser untuk atur liter</div></div>'+
   '</div>'+
   '<input id="fs" type="range" min="0" max="'+mx+'" value="'+mx+'" style="width:100%;margin:6px 0;accent-color:#ffd23f"'+(mx<=0?' disabled':'')+'>'+
   '<p id="fc" style="font:bold 14px Verdana;color:#ffd23f;margin:6px 0 10px"></p>'+
   '<button id="fb" style="width:100%;display:flex;align-items:center;justify-content:center;gap:8px;padding:11px;border-radius:12px;font-size:14px;'+(mx<=0?'opacity:.5':'')+'"><span>⛽ Isi Bensin Sekarang</span></button>'+
  '</div>';
 }else{
  var bt=function(id,ico,titleTxt,subTxt,c,ok){
   var canBuy=(ok&&g.coins>=c);
   return '<button id="'+id+'" style="display:flex;align-items:center;gap:11px;text-align:left;margin:0;padding:8px 10px;width:100%;border-radius:13px;background:'+(canBuy?'rgba(255,255,255,.08)':'rgba(255,255,255,.03)')+';border:1px solid '+(canBuy?'rgba(255,255,255,.18)':'rgba(255,255,255,.07)')+';color:#fff;'+(canBuy?'':'opacity:.52;')+'">'+
    shopIconHtml(ico,42)+
    '<span style="flex:1;min-width:0"><span style="display:block;font:bold 12px Verdana;color:#fff;line-height:1.25">'+titleTxt+'</span><span style="display:block;font:10px Verdana;color:#cbd5e1;margin-top:2px;line-height:1.25">'+subTxt+'</span></span>'+
    '<span style="background:rgba(255,210,63,.16);border:1px solid rgba(255,210,63,.4);color:#ffd23f;padding:5px 8px;border-radius:9px;font:bold 11px Verdana;white-space:nowrap;flex-shrink:0">'+c+' 🪙</span>'+
   '</button>';
  };
  h+='<div style="width:100%;display:flex;flex-direction:column;gap:7px;margin-top:10px">'+
   '<div style="font:11px Verdana;color:'+(g.leak>.02?'#fca5a5':'#94a3b8')+';text-align:center;margin-bottom:2px">Kebocoran tangki: <b>'+g.leak.toFixed(1)+' L/dtk</b></div>'+
   bt('b1','shop_repair','Perbaiki Bodi & Bocor','Tambal tangki & hilangkan penyok',8,g.leak>.02||g.dents.length>0)+
   bt('b2','shop_armor','Perkuat Bodi (Lv '+g.ar+'/4)','Kurangi risiko bocor -18%',ARC[Math.min(g.ar,3)],g.ar<4)+
   bt('b3','shop_tank','Tangki +25 L (Lv '+g.tl+'/4)','Kapasitas saat ini '+g.cap+' L',TKC[Math.min(g.tl,3)],g.tl<4)+
   bt('b4','shop_horn','Upgrade Klakson (Lv '+g.hl+'/3)','Jangkauan '+HR[g.hl]+(g.hl<3?' → '+HR[g.hl+1]:'')+' · Bus/Truk 1x',HLC[Math.min(g.hl,2)],g.hl<3)+
   bt('b5','shop_jerrycan','Bensin Eceran (+15 L)','Isi darurat langsung ke tangki',7,g.fuel<g.cap)+
  '</div>';
 }
 h+='<button id="lv" style="width:100%;background:#3a86ff;color:#fff;margin-top:12px;padding:11px;border-radius:12px;font-size:14px">▶ Lanjut Jalan</button></div>';
 M.innerHTML=h;M.style.display='flex';
 var $=function(i){return document.getElementById(i)};
 if(isFuel){
  var fs=$('fs'),fc=$('fc'),up=function(){var v=+fs.value;fc.textContent='+'+v+' L = '+Math.ceil(v/rt)+' koin'};
  fs.oninput=up;up();
  $('fb').onclick=function(){
   var v=+fs.value,c=Math.ceil(v/rt);
   if(v>0&&c<=g.coins){g.coins-=c;g.fuel=Math.min(g.cap,g.fuel+v);playCustomAudio('sfx_buy_ok',true);renderService({t:'Berhasil isi +'+v+' L bensin!',c:'#4ade80'})}
   else{playCustomAudio('sfx_buy_fail',true);renderService({t:g.fuel>=g.cap?'Tangki sudah penuh!':'Koin tidak cukup!',c:'#ff6b6b'})}
  };
 }else{
  $('b1').onclick=function(){
   if((g.leak>.02||g.dents.length>0)&&g.coins>=8){g.coins-=8;g.leak=0;g.dents=[];playCustomAudio('sfx_buy_ok',true);renderService({t:'Bodi & tangki berhasil diperbaiki!',c:'#4ade80'})}
   else{playCustomAudio('sfx_buy_fail',true);renderService({t:g.coins<8?'Koin tidak cukup!':'Mobil masih dalam kondisi prima!',c:'#ff6b6b'})}
  };
  $('b2').onclick=function(){
   var c=ARC[g.ar];
   if(g.ar<4&&g.coins>=c){g.coins-=c;g.ar++;playCustomAudio('sfx_buy_ok',true);renderService({t:'Bodi berhasil diperkuat!',c:'#4ade80'})}
   else{playCustomAudio('sfx_buy_fail',true);renderService({t:g.ar>=4?'Level bodi sudah maksimal!':'Koin tidak cukup!',c:'#ff6b6b'})}
  };
  $('b3').onclick=function(){
   var c=TKC[g.tl];
   if(g.tl<4&&g.coins>=c){g.coins-=c;g.tl++;g.cap=100+25*g.tl;playCustomAudio('sfx_buy_ok',true);renderService({t:'Kapasitas tangki bertambah!',c:'#4ade80'})}
   else{playCustomAudio('sfx_buy_fail',true);renderService({t:g.tl>=4?'Kapasitas tangki sudah maksimal!':'Koin tidak cukup!',c:'#ff6b6b'})}
  };
  $('b4').onclick=function(){
   var c=HLC[g.hl];
   if(g.hl<3&&g.coins>=c){g.coins-=c;g.hl++;playCustomAudio('sfx_buy_ok',true);renderService({t:'Klakson berhasil di-upgrade!',c:'#4ade80'})}
   else{playCustomAudio('sfx_buy_fail',true);renderService({t:g.hl>=3?'Level klakson sudah maksimal!':'Koin tidak cukup!',c:'#ff6b6b'})}
  };
  $('b5').onclick=function(){
   if(g.fuel<g.cap&&g.coins>=7){g.coins-=7;g.fuel=Math.min(g.cap,g.fuel+15);playCustomAudio('sfx_buy_ok',true);renderService({t:'Berhasil beli +15 L bensin eceran!',c:'#4ade80'})}
   else{playCustomAudio('sfx_buy_fail',true);renderService({t:g.fuel>=g.cap?'Tangki sudah penuh!':'Koin tidak cukup!',c:'#ff6b6b'})}
  };
 }
 $('lv').onclick=closeService;
}
function hexRgb(c){c=c||'#ccc';if(c.charAt(0)!='#')return '200,200,200';if(c.length==4)c='#'+c[1]+c[1]+c[2]+c[2]+c[3]+c[3];return parseInt(c.slice(1,3),16)+','+parseInt(c.slice(3,5),16)+','+parseInt(c.slice(5,7),16)}
function crashFx(x,y,dd,col,pw){
 var g=G;g.rg.push({x:x,y:y,t:.35});
 emit(x,y,14,hexRgb(col),260,.7,4,0);emit(x,y,10,'255,77,109',220,.7,3,0);emit(x,y,14,'255,210,100',300,.4,3,1);
 g.hs=.06;g.hf=.35;g.pw=dd*4;g.shake=Math.max(g.shake,10+pw*8);g.smk=3.5;
 if(g.dents.length<6)g.dents.push({x:rnd(-14,6),y:rnd(-26,16),w:rnd(6,12),h:rnd(5,10)});
 PRAudio.play('crash');
}

function tg(id,t,bgCol){return '<button id="'+id+'" style="background:'+(bgCol||'#2a3441')+';color:#f4efe0;font-size:12px;padding:9px 12px;margin:0;width:100%">'+t+'</button>'}
function emit(x,y,n,c,sp,l,s,add){for(var i=0;i<n;i++)G.pt.push({x:x,y:y,vx:rnd(-sp,sp),vy:rnd(-sp,sp)*.8,l:l*rnd(.6,1),m:l,c:c,s:s,a:add})}
function spawnObs(){
 var r=Math.random(),t=r<.3?'mobil':r<.52?'motor':r<.67?'angkot':r<.77?'bus':r<.9?'truk':'becak';
 var lane=Math.floor(rnd(0,N));
 if(t=='becak')lane=Math.random()<.5?0:N-1;
 if(G.auto>0&&G.sv){var exL=G.sv.side<0?0:N-1;if(lane==exL)lane=G.sv.side<0?N-1:0;}
 var busy={};
 G.obs.forEach(function(o){if(o.y<120)busy[o.lane]=1});
 if(Object.keys(busy).length>=N-1&&!busy[lane])return;
 if(busy[lane])return;
 var d=TYPES[t];
 G.obs.push({t:t,lane:lane,x:lx(lane),y:-d.h,w:d.w,h:d.h,v:rnd(d.v[0],d.v[1]),v0:0,c:pick(d.c),n:0,br:0,ch:rnd(1,3)});
 var o=G.obs[G.obs.length-1];o.v0=o.v;
}

var joyAudioState=0;
function update(dt){
 var g=G;if(g.pause||pauseState||layoutEdit)return;if(g.hs>0){g.hs-=dt;return}g.t+=dt;g.clock+=dt/14;g.off+=g.speed*dt;
 var ez=g.tb<0?.35:.35+.65*cl((g.t-g.tb)/240,0,1);
 // cuaca
 g.wTimer-=dt;
 if(g.wTimer<=0){
  var n=pick(['Cerah','Cerah','Mendung','Hujan','Hujan']);
  g.wName=n;g.wTarget=n=='Cerah'?0:n=='Mendung'?.45:1;g.wTimer=rnd(25,40);
  if(n=='Hujan')g.pop.push({x:W/2,y:200,t:'Hujan turun, jalan licin!',l:2.2});
 }
 g.w+=(g.wTarget-g.w)*Math.min(1,dt*.6);
 if(g.w>.85&&Math.random()<dt*.25)g.flash=.6;
 g.flash=Math.max(0,g.flash-dt*2.5);
 if(g.bT==0){g.bTimer-=dt;
  if(g.bTimer<=0){g.bT=pick([-1,-.7,.7,1])*(.5+.5*ez);g.bDur=rnd(10,15);
   g.pop.push({x:W/2,y:200,t:g.bT>0?'Tikungan kanan \u2192':'\u2190 Tikungan kiri',l:2})}}
 else{g.bDur-=dt;if(g.bDur<=0){g.bT=0;g.bTimer=rnd(42,70)}}
 g.bend+=(g.bT-g.bend)*Math.min(1,dt*.5);
 if(!g.auto)g.tx-=g.bend*55*(g.speed/300)*dt;
 if(g.sv){
 var S=g.sv;
 if(S.st=='warn'){S.distWarn-=g.speed*dt/18;S.tk-=dt;if(S.tk<=0){S.tk=1;PRAudio.play('warn',.6)}if(S.distWarn<=0)S.st='on'}
 else{
  S.y+=g.speed*dt;
  var cxs=S.side<0?29:W-29,cyb=S.y+SVL/2;
  if(!S.used&&!g.auto&&svZone()&&(S.side<0?g.px<RX-4:g.px>RX+LW*N+4)){S.used=1;g.auto=1}
  if(g.auto==1){g.tx=cxs;g.slip=0;var D=PY-cyb;if(D<=3||(D<14&&g.speed<18)){g.speed=0;g.auto=2;g.pause=true;openService()}}
  else if(g.auto==3){g.slip=0;clearExitLane();var mg=PY-S.y<210;g.tx=mg?lx(S.side<0?0:N-1):cxs;if(mg&&Math.abs(g.px-g.tx)<5){g.auto=0;g.tx=g.px;g.inv=Math.max(g.inv,1.8)}}
  if(S.y>H+20){if(S.k=='bengkel'&&g.tb<0)g.tb=g.t;g.sv=null;g.svT=rnd(6,10);if(g.auto)g.auto=0}
 }
}else if(!g.auto){
 g.svT-=dt;
 if(g.svT<=0){g.svN++;var k2='pom';
  if(g.svN==1)k2='pom';
  else if(g.svN==2)k2='bengkel';
  else{var rsv=Math.random();k2=rsv<.45?'pertamini':(rsv<.80?'bengkel':'pom');}
  g.lastK=k2;
  g.cb=CB;g.sv={k:k2,side:Math.random()<.5?-1:1,st:'warn',t:3,distWarn:160,y:-SVL,used:0,tk:0};
  var popTxt=k2=='pom'?'Pom bensin Pertamina di depan!':(k2=='pertamini'?'Pertamini di depan!':'Bengkel di depan!');
  g.pop.push({x:W/2,y:215,t:popTxt,l:2});PRAudio.play('warn')}
}
 // kontrol setir
 var dir=(keys.ArrowRight||keys.d||keys.D?1:0)-(keys.ArrowLeft||keys.a||keys.A?1:0);
 var ax=dir?dir*.62:stick.x;if(ax&&!g.auto)g.tx=cl(g.tx+ax*310*dt,txMin(),txMax());
 var grip=(g.auto?4:dir?6:stick.x?8:11)*(1-.6*g.w);
 if(g.slip>0){g.slip-=dt;g.tx+=Math.sin(g.t*14)*160*dt;grip*=.4}
 g.tx=cl(g.tx,txMin(),txMax());
 g.px+=(g.tx-g.px)*Math.min(1,grip*dt);

 // kecepatan (mendukung mode tombol & mode full joystick)
 var base=(250+Math.min(g.dist/14,150))*(.8+.2*ez);
 var thr=0;
 if(!g.auto){
  var keyThr=((keys.ArrowUp||keys.w||keys.W)?1:0)-((keys.ArrowDown||keys.s||keys.S)?1:0);
  if(cfg.ctrl==='joy'){
   thr=keyThr!==0?keyThr:stick.y;
   var jState=(g.fuel>0&&thr>.18)?1:(thr<-.18?-1:0);
   if(jState!==joyAudioState){
    joyAudioState=jState;
    playCustomAudio('sfx_gas',jState===1);
    playCustomAudio('sfx_rem',jState===-1);
   }
  }else{
   thr=(gasOn?1:0)-(brkOn?1:0);
   if(keyThr!==0)thr=keyThr;
  }
 }
 if(g.fuel<=0&&!g.auto){
  thr=Math.min(0,thr);
  if(!g.dryWarn){g.dryWarn=1;g.pop.push({x:g.px,y:PY-65,t:'Bensin habis! Melambat...',l:2.2})}
 }else if(g.fuel>0){
  g.dryWarn=0;
 }
 g.thr+=(thr-g.thr)*Math.min(1,dt*3);
 var bo=(g.fuel>0&&g.thr>.6);g.boosting=bo;
 g.py+=((g.auto?PY0:PY0-(g.thr>0?PY0-PYMIN:PYMAX-PY0)*g.thr)-g.py)*Math.min(1,dt*2.5);PY=g.py;
 var tgt=base*(1+(g.thr>0?.35:.45)*g.thr),rate=1.2;
 if(g.fuel<=0&&!g.auto){
  tgt=0;
  rate=(thr<-0.1)?1.4:0.42;
 }else if(g.auto==1){tgt=cl((PY-(g.sv.y+SVL/2))*1.4,14,90);rate=3}
 else if(g.auto==3)rate=.45;
 g.speed+=(tgt-g.speed)*Math.min(1,dt*rate);
 g.dist+=g.speed*dt/18;
 g.fuel=Math.max(0,g.fuel-dt*((0.7+Math.max(0,g.thr)*0.6)*(g.auto?.3:1)+g.leak));
 g.leak=g.leak>.03?g.leak-(g.leak*.05+.005)*dt:0;
 if(g.fuel<=0&&!g.auto&&g.speed<=4)return over('Bensin habis & mobil berhenti');
 g.hk=Math.max(0,g.hk-dt);g.inv=Math.max(0,g.inv-dt);g.shake=Math.max(0,g.shake-dt*25);
 // spawn
 g.spawn-=dt;
 if(g.spawn<=0){spawnObs();g.spawn=Math.max(.4,1-g.dist/3200)*rnd(.7,1.2)/Math.max(.35,ez)}
 g.hz-=dt;
 if(g.hz<=0){
  var rain=g.w>.5,lane=Math.floor(rnd(0,N));
  g.haz.push(rain&&Math.random()<.65?{t:'genang',x:lx(lane),y:-30,w:50,h:34}:{t:'lubang',x:lx(lane)+rnd(-12,12),y:-30,w:26,h:18});
  g.hz=rnd(1.8,3.4)/Math.max(.4,ez);
 }
 g.cnT-=dt;
 if(g.cnT<=0){g.cnT=rnd(1.8,2.8);
  if(g.cb>0){var cn=Math.min(pick([3,4,5]),g.cb),cln=Math.floor(rnd(0,N)),gold=Math.random()<.12&&g.cb>=cn+4;
   for(var ci=0;ci<cn;ci++){var cv=gold&&ci==0?5:1;g.cn.push({x:lx(cln),y:-24-ci*36,v:cv});g.cb-=cv}}}
 g.dcT-=dt;if(g.dcT<=0){addDecor(-40);g.dcT=rnd(.5,1.2)}
 // objek
 var p={x:g.px,y:PY,w:30,h:56};
 g.dec.forEach(function(d){d.y+=g.speed*dt});
 g.dec=g.dec.filter(function(d){return d.y<H+60});
 g.haz.forEach(function(h){
  h.y+=g.speed*dt;
  if(!h.hit&&Math.abs(h.x-p.x)<(h.w+p.w)/2-6&&Math.abs(h.y-p.y)<(h.h+p.h)/2-6){
   h.hit=1;
   if(h.t=='genang'){g.slip=.9;g.pop.push({x:p.x,y:p.y-50,t:'Selip!',l:1})}
   else if((g.inv<=0&&!g.auto)){g.speed*=.65;g.shake=8;vib(40)}
  }
 });
 g.haz=g.haz.filter(function(h){return h.y<H+40});
 g.cn.forEach(function(k){k.y+=g.speed*dt;
  if(!k.got&&Math.abs(k.x-p.x)<24&&Math.abs(k.y-p.y)<36){k.got=1;g.coins+=k.v;g.ct+=k.v;PRAudio.play(k.v>1?'coin_gold':'coin',0.25);if(k.v>1)g.pop.push({x:p.x,y:p.y-50,t:'+5 koin',l:.9})}});
 g.cn=g.cn.filter(function(k){return k.y<H+30&&!k.got});
 g.obs.forEach(function(o){
  if(o.t=='motor'&&!o.fl){o.ch-=dt;if(o.ch<=0&&o.y>-20&&o.y<300){var nl=cl(o.lane+(Math.random()<.5?-1:1),0,N-1);if(nl!=o.lane&&laneFree(o,nl)){o.lane=nl;o.sw=2.5}o.ch=rnd(1.2,2.5)/Math.max(.35,ez)}}
  if(!o.fl){
   if(o.br>0)o.br-=dt;
   else if(o.t=='angkot'&&o.y>40&&o.y<350&&Math.random()<dt*.35*ez)o.br=1.3;
   var want=o.br>0?30:o.v0;
   for(var m=0;m<g.obs.length;m++){var q=g.obs[m];
    if(q===o||q.fl)continue;
    if(Math.abs(q.x-o.x)<(q.w+o.w)/2+2&&q.y<o.y){
     var gap=o.y-q.y-(o.h+q.h)/2;
     if(gap<45){want=Math.min(want,q.v-(gap<12?25:0));if(gap<2)o.y=q.y+(o.h+q.h)/2+2}
    }}
   o.v+=(want-o.v)*Math.min(1,dt*4);
  }
  if(o.fl){o.x+=o.kx*dt;o.kx*=Math.pow(.55,dt);o.rot=(o.rot||0)+o.sp*dt;o.sp*=Math.pow(.6,dt);if(Math.random()<dt*14)emit(o.x,o.y,1,'90,90,90',20,.8,6,0)}
  else o.x+=(lx(o.lane)-o.x)*Math.min(1,dt*(o.sw||3));
  if(o.fx>0)o.fx-=dt;o.y+=(g.speed-o.v)*dt;
  var dx=Math.abs(o.x-p.x),dy=Math.abs(o.y-p.y);
  var hw=(o.w+p.w)/2-3,hh=(o.h+p.h)/2-5;
  if(!o.hit&&dx<hw&&dy<hh&&(g.inv<=0&&!g.auto)){
   o.hit=1;g.inv=0.85;leakHit();var spd=g.speed;g.speed*=.58;g.shake=10;vib(90);
   var dd=o.x>p.x?1:o.x<p.x?-1:pick([-1,1]);
   knock(o,dd,1,1);crashFx((o.x+p.x)/2,(o.y+p.y)/2,dd,o.c,spd/480);
   g.tx-=dd*26;g.px-=dd*15;emit(o.x-dd*o.w/2,o.y,10,'255,220,120',200,.4,3,1);
   g.pop.push({x:p.x,y:p.y-50,t:'Brak!',l:.9});emit(p.x,p.y,18,'255,200,80',240,.55,3,1);
  }
  if(!o.n&&!o.hit&&o.y>p.y-10){
   o.n=1;
   var gap=dx-(o.w+p.w)/2;
   if(gap>-2&&gap<16){
    if(g.cb>=2){g.cb-=2;g.coins+=2;g.ct+=2}g.bonus+=25;
    g.pop.push({x:o.x,y:p.y-30,t:'Nyaris! +25',l:1});vib(10);
   }
  }
 });
 var ob=g.obs;
 for(var i=0;i<ob.length;i++)for(var j=i+1;j<ob.length;j++){
  var a=ob[i],b=ob[j];if(a.fl&&b.fl)continue;
  if(Math.abs(a.x-b.x)<(a.w+b.w)/2-2&&Math.abs(a.y-b.y)<(a.h+b.h)/2-3){
   if(a.fl||b.fl){var f=a.fl?a:b,s2=a.fl?b:a;f.kx*=.6;knock(s2,s2.x>f.x?1:s2.x<f.x?-1:pick([-1,1]),.9)}
   else{var d2=a.x>b.x?1:a.x<b.x?-1:pick([-1,1]);knock(a,d2,.8);knock(b,-d2,.8)}
  }}
 g.obs=g.obs.filter(function(o){return o.y<H+130&&o.y>-300&&!(o.hit&&o.y>p.y+80)});
 g.cp=Math.max(0,g.cp-dt);
 if(!g.am){g.amT-=dt;if(g.amT<=0&&!g.sv&&!g.auto){var al=Math.round(cl((g.px-RX-LW/2)/LW,0,N-1));g.am={st:'warn',t:4.5,lane:al,x:lx(al),y:H+150,w:38,h:78,sir:0};g.pop.push({x:W/2,y:215,t:'Dengar sirene...',l:2})}}
 else{
  var A=g.am;A.sir-=dt;
  if(A.sir<=0){A.sir=.42;A.hi=!A.hi;PRAudio.play(A.hi?'siren_hi':'siren_lo')}
  if(A.st=='warn'){A.t-=dt;if(A.t<=0)A.st='run'}
  else{
   A.y-=280*dt;
   g.obs.forEach(function(o){
    if(o.fl)return;
    if(o.lane==A.lane&&o.y<A.y&&A.y-o.y<460&&!o.ya){var nl=freeLane(o);if(nl>=0){o.lane=nl;o.sw=1.1;o.ya=1}}
    if(Math.abs(o.x-A.x)<(o.w+A.w)/2-2&&Math.abs(o.y-A.y)<(o.h+A.h)/2-3)knock(o,o.x>=A.x?1:-1,1.2);
   });
   if(!A.hit&&(g.inv<=0&&!g.auto)&&Math.abs(A.x-g.px)<(A.w+30)/2-2&&Math.abs(A.y-PY)<(A.h+56)/2-5){
    A.hit=1;g.inv=0.85;leakHit();g.speed*=.72;g.shake=10;vib(90);
    var dd2=A.x>=g.px?1:-1;g.tx-=dd2*45;g.px-=dd2*22;crashFx(g.px,PY,dd2,'#f4f4f4',.85);
    g.pop.push({x:g.px,y:PY-50,t:'Ditabrak ambulance!',l:1.2});emit(g.px,PY,14,'255,200,80',220,.5,3,1);
   }
   if(!A.ok&&!A.hit&&A.y<PY-90){A.ok=1;g.bonus+=60;g.pop.push({x:g.px,y:PY-50,t:'Ambulance lewat +60',l:1.4})}
   if(A.y<-160){g.am=null;g.amT=rnd(55,85)}
  }
 }
 g.pop.forEach(function(q){q.l-=dt;q.y-=30*dt});
 g.pop=g.pop.filter(function(q){return q.l>0});
 var sp=g.speed;
 var fuelPct=g.fuel/g.cap;
 /* Peringatan musik & aura bahan bakar: 25% kuning, 20% merah */
 var wm=fuelPct<=.20?'warning':(dark(g.clock)>.6?'night':'day');
 if(wm!==g.mt){
  g.mt=wm;
  if(wm==='warning'){
   PRAudio.music('stop');
   playCustomAudio('mus_warning',true);
  }else{
   playCustomAudio('mus_warning',false);
   PRAudio.music(wm);
  }
 }else if(wm==='warning'){
  playCustomAudio('mus_warning',true);
 }
 g.hf=Math.max(0,g.hf-dt*2);g.pw+=(-g.pr*70-g.pw*8)*dt;g.pr+=g.pw*dt;
 if(g.hw)g.hw.t-=dt;
 if(g.smk>0){g.smk-=dt;if(Math.random()<dt*18)emit(g.px+rnd(-6,6),PY-26,1,'70,70,70',20,.9,rnd(6,10),0)}
 g.rg.forEach(function(r){r.t-=dt});g.rg=g.rg.filter(function(r){return r.t>0});
 if(g.leak>.05&&Math.random()<dt*10*Math.min(1,g.leak))emit(g.px+rnd(-8,8),PY+30,1,'235,200,50',15,.9,3,0);
 if(g.slip>0&&Math.random()<.8)emit(g.px+rnd(-12,12),PY+26,1,'200,200,210',40,.7,rnd(5,9),0);
 if(g.boosting)emit(g.px+rnd(-6,6),PY+34,2,'255,150,40',90,.35,rnd(2,4),1);
 g.pt.forEach(function(q){q.x+=q.vx*dt;q.y+=(q.vy+sp*.7)*dt;q.l-=dt});
 g.pt=g.pt.filter(function(q){return q.l>0});
 g.rain.forEach(function(r){r.y+=900*r.s*dt;r.x-=120*r.s*dt;if(r.y>H){r.y=-20;r.x=rnd(0,W+60)}});
}
function vib(n){try{navigator.vibrate&&navigator.vibrate(n)}catch(e){}}
function score(){return Math.floor(G.dist)+G.bonus}
function over(why){
 G.on=false;pauseState=false;layoutEdit=false;showCtl(false);stopAllCustomAudio();
 var s=score(),nb=s>best;
 if(nb){best=s;try{localStorage.setItem('pr_best',best)}catch(e){}}
 showOverMenu(why,s,nb);
}

/* ---------- gambar ---------- */
function rr(x,y,w,h,r,c){X.fillStyle=c;X.beginPath();X.roundRect?X.roundRect(x,y,w,h,r):X.rect(x,y,w,h);X.fill()}
function drawVeh(o){
 var x=o.x,y=o.y,w=o.w,h=o.h,t=o.t,im=ICONS[t];
 X.save();X.translate(x,y);
 X.fillStyle='rgba(0,0,0,.25)';X.fillRect(-w/2+3,-h/2+4,w,h);
 if(im&&im.complete&&im.naturalWidth){
  X.drawImage(im,-w/2,-h/2,w,h);
 }else if(t=='motor'){
  rr(-4,-h/2,8,h,4,o.c);X.fillStyle='#e0b48a';X.beginPath();X.arc(0,-2,6,0,7);X.fill();
  X.fillStyle=o.c;X.beginPath();X.arc(0,-4,5,0,7);X.fill();
 }else if(t=='becak'){
  rr(-w/2,-h/2,w,h,5,o.c);rr(-w/2+3,-h/2+8,w-6,h*.5,6,'#1d3557');rr(-w/2+4,h/2-14,w-8,10,3,'#e0b48a');
 }else{
  rr(-w/2,-h/2,w,h,t=='mobil'?9:5,o.c);
  if(t=='angkot'){rr(-w/2+2,-h/2+14,w-4,10,2,'#1d3557');X.fillStyle='#2b9348';X.fillRect(-w/2,-4,w,5)}
  else if(t=='bus'){X.fillStyle='#1d3557';for(var i=0;i<4;i++)X.fillRect(-w/2+4,-h/2+12+i*22,w-8,12);X.fillStyle='rgba(255,255,255,.5)';X.fillRect(-w/2,h/2-30,w,4)}
  else if(t=='truk'){rr(-w/2+2,-h/2+2,w-4,28,4,'#b8c0c8');rr(-w/2+3,-h/2+34,w-6,h-40,2,'#d9c9a3');X.strokeStyle='rgba(0,0,0,.3)';X.strokeRect(-w/2+3,-h/2+34,w-6,h-40)}
  else{rr(-w/2+4,-h/2+10,w-8,12,3,'#1d3557');rr(-w/2+5,h/2-20,w-10,8,3,'#1d3557')}
 }
 X.restore();
}
function drawPlayer(){
 var g=G,im=ICONS.player;if(g.inv>0&&Math.floor(g.t*14)%2)return;
 X.save();X.translate(g.px+sx(PY),PY);X.rotate((g.tx-g.px)*.004+slope(PY)+g.pr);
 if(g.boosting){var gr=X.createLinearGradient(0,28,0,80);gr.addColorStop(0,'rgba(255,160,40,.9)');gr.addColorStop(1,'rgba(255,60,0,0)');X.fillStyle=gr;X.fillRect(-9,28,18,52+Math.random()*14)}
 X.fillStyle='rgba(0,0,0,.3)';X.fillRect(-14,-24,34,60);
 if(im&&im.complete&&im.naturalWidth){
  X.drawImage(im,-16,-30,32,60);
 }else{
  rr(-16,-30,32,60,9,'#ff4d6d');rr(-12,-14,24,12,3,'#14213d');rr(-12,10,24,9,3,'#14213d');
  X.fillStyle='#fff';X.fillRect(-2,-30,4,60);
 }
 g.dents.forEach(function(d){X.fillStyle='rgba(30,0,10,.55)';X.fillRect(d.x,d.y,d.w,d.h);X.strokeStyle='rgba(255,255,255,.5)';X.lineWidth=1;X.beginPath();X.moveTo(d.x,d.y);X.lineTo(d.x+d.w,d.y+d.h);X.stroke()});
 X.restore();
}
function drawDecor(d){
 X.save();X.translate(d.x,d.y);
 if(d.t=='pohon'){X.fillStyle='rgba(0,0,0,.2)';X.beginPath();X.arc(4,4,18,0,7);X.fill();X.fillStyle='#2d6a2f';X.beginPath();X.arc(0,0,17,0,7);X.fill();X.fillStyle='#3f8f3a';X.beginPath();X.arc(-4,-4,9,0,7);X.fill()}
 else if(d.t=='warung'){rr(-20,-16,40,32,3,'#c9a66b');rr(-22,-18,44,12,2,'#b5442e');X.fillStyle='#fff3';X.fillRect(-14,0,28,8)}
 else{X.fillStyle='#555';X.fillRect(-2,-2,4,4);X.fillStyle='#777';X.fillRect(d.s<0?0:-14,-2,14,3)}
 X.restore();
}
function draw(){
 var g=G,d=dark(g.clock),dusk=(d>0&&d<1)?Math.sin(d*Math.PI):0;
 X.save();
 if(g.shake>0)X.translate(rnd(-g.shake,g.shake)*.5,rnd(-g.shake,g.shake)*.5);
 g.dec.forEach(function(d){d.ex=d.x+sx(d.y)});
 var rw=LW*N;
 for(var y=0;y<H;y+=6){
  var s=sx(y+3),st=(Math.floor((y-g.off)/40))&1,dh=(Math.floor((y-g.off)/30))&1;
  X.fillStyle=st?'#69a846':'#5c9a3c';X.fillRect(-20,y,W+40,7);
  X.fillStyle='#41454b';X.fillRect(RX+s,y,rw,7);
  if(g.w>0){X.fillStyle='rgba(20,35,60,'+(g.w*.4)+')';X.fillRect(RX+s,y,rw,7)}
  X.fillStyle='#e8e8e8';X.fillRect(RX+s+2,y,3,7);X.fillRect(RX+s+rw-5,y,3,7);
  X.fillStyle='#f2c230';X.fillRect(RX+s+LW*2-1,y,2,7);
  if(dh){X.fillStyle='rgba(255,255,255,.7)';X.fillRect(RX+s+LW-1,y,2,7);X.fillRect(RX+s+LW*3-1,y,2,7)}
 }
 g.dec.forEach(function(d){X.save();X.translate(sx(d.y),0);drawDecor(d);X.restore()});drawSv();
 g.haz.forEach(function(h){X.save();X.translate(sx(h.y),0);
  if(h.t=='genang'){X.fillStyle='rgba(120,160,200,.45)';X.beginPath();X.ellipse(h.x,h.y,h.w/2,h.h/2,0,0,7);X.fill();X.strokeStyle='rgba(255,255,255,.4)';X.stroke()}
  else{X.fillStyle='#1d1f22';X.beginPath();X.ellipse(h.x,h.y,h.w/2,h.h/2,0,0,7);X.fill()}
  X.restore();
 });
 g.cn.forEach(function(k){X.save();X.translate(sx(k.y),0);var sw=Math.abs(Math.sin(g.t*5+k.y*.05))*.7+.3,r=k.v>1?9:7;X.fillStyle=k.v>1?'#ff9f1c':'#ffd23f';X.beginPath();X.ellipse(k.x,k.y,r*sw,r,0,0,7);X.fill();X.strokeStyle='rgba(120,70,0,.6)';X.lineWidth=1.5;X.stroke();X.restore()});
 g.obs.forEach(function(o){var a=slope(o.y)+(o.fl?0:(lx(o.lane)-o.x)*.012)+(o.rot||0);X.save();X.translate(sx(o.y)+o.x,o.y);X.rotate(a);X.translate(-o.x,-o.y);drawVeh(o);if(o.dm){X.fillStyle='rgba(20,0,0,.4)';X.fillRect(o.x-o.w/2+2,o.y-o.h/2+3,o.w*.5,7);X.fillRect(o.x+o.w/6,o.y+o.h/6,o.w*.3,6)}if(o.fx>0){X.fillStyle='rgba(255,255,255,'+Math.min(1,o.fx*5)+')';X.fillRect(o.x-o.w/2,o.y-o.h/2,o.w,o.h)}X.restore()});
 if(g.am&&g.am.st=='run'){var A=g.am;X.save();X.translate(sx(A.y)+A.x,A.y);X.rotate(slope(A.y));X.translate(-A.x,-A.y);drawAmb(A);X.restore()}
 drawPlayer();drawSvTop();
 // partikel
 g.rg.forEach(function(r){X.strokeStyle='rgba(255,255,255,'+Math.min(1,r.t*3)+')';X.lineWidth=3;X.beginPath();X.arc(r.x+sx(r.y),r.y,(.35-r.t)*170,0,7);X.stroke()});
 if(g.hw&&g.hw.t>0){var hk=1-g.hw.t/.5;X.strokeStyle='rgba(255,255,255,'+Math.min(.7,g.hw.t*1.4)+')';X.lineWidth=2;X.beginPath();X.arc(g.px,PY-20,40+(g.hw.r-40)*hk,Math.PI*1.15,Math.PI*1.85);X.stroke()}
 g.pt.forEach(function(q){var a=cl(q.l/q.m,0,1);X.globalCompositeOperation=q.a?'lighter':'source-over';X.fillStyle='rgba('+q.c+','+(a*(q.a?1:.45))+')';X.beginPath();X.arc(q.x,q.y,q.s*(q.a?a:2-a),0,7);X.fill()});
 X.globalCompositeOperation='source-over';
 // garis kecepatan
 var sl=cl((g.speed-300)/260,0,.55);
 if(sl>.02){X.strokeStyle='rgba(255,255,255,'+sl*.5+')';X.lineWidth=1;X.beginPath();for(var i=0;i<16;i++){var lx2=(i*67+13)%W,ly=((i*131+g.off*2.2)%(H+120))-60;X.moveTo(lx2,ly);X.lineTo(lx2,ly+30+g.speed/9)}X.stroke()}
 // gelap malam + lampu
 var a=d*.82+g.w*.12;
 if(a>.01){
  OX.globalCompositeOperation='source-over';OX.clearRect(0,0,W,H);
  OX.fillStyle='rgba(4,8,28,'+a+')';OX.fillRect(0,0,W,H);
  OX.globalCompositeOperation='destination-out';
  var px=g.px,py=PY-26,cone=d>.05?1:0;
  if(cone){
   var gr=OX.createLinearGradient(0,py,0,py-300);gr.addColorStop(0,'rgba(0,0,0,'+d+')');gr.addColorStop(1,'rgba(0,0,0,0)');
   OX.fillStyle=gr;OX.beginPath();OX.moveTo(px-12,py);OX.lineTo(px-70,py-300);OX.lineTo(px+70,py-300);OX.lineTo(px+12,py);OX.fill();
   var rg=OX.createRadialGradient(px,PY,5,px,PY,60);rg.addColorStop(0,'rgba(0,0,0,'+d*.7+')');rg.addColorStop(1,'rgba(0,0,0,0)');
   OX.fillStyle=rg;OX.fillRect(px-70,PY-70,140,140);
   g.dec.forEach(function(e){if(e.t=='tiang'){var r2=OX.createRadialGradient(e.ex,e.y,2,e.ex,e.y,70);r2.addColorStop(0,'rgba(0,0,0,'+d*.9+')');r2.addColorStop(1,'rgba(0,0,0,0)');OX.fillStyle=r2;OX.fillRect(e.ex-70,e.y-70,140,140)}});
  }
  if(d>.12){g.obs.forEach(function(o){if(o.fl||o.t=='becak')return;
   var ox=o.x+sx(o.y),ang=slope(o.y)+(lx(o.lane)-o.x)*.012+(o.rot||0),hy=-o.h/2,hw=o.t=='motor'?5:o.w/2-5;
   OX.save();OX.translate(ox,o.y);OX.rotate(ang);
   var lg=OX.createLinearGradient(0,hy,0,hy-130);lg.addColorStop(0,'rgba(0,0,0,'+d*.75+')');lg.addColorStop(1,'rgba(0,0,0,0)');
   OX.fillStyle=lg;OX.beginPath();OX.moveTo(-hw,hy);OX.lineTo(-hw-24,hy-130);OX.lineTo(hw+24,hy-130);OX.lineTo(hw,hy);OX.fill();
   var rg2=OX.createRadialGradient(0,0,3,0,0,o.h*.7);rg2.addColorStop(0,'rgba(0,0,0,'+d*.5+')');rg2.addColorStop(1,'rgba(0,0,0,0)');OX.fillStyle=rg2;OX.fillRect(-60,-80,120,160);
   OX.restore()});
   if(g.am&&g.am.st=='run'){var A3=g.am,amx=A3.x+sx(A3.y),ahy=-A3.h/2,ahw=A3.w/2-5;
    OX.save();OX.translate(amx,A3.y);OX.rotate(slope(A3.y));
    var alg=OX.createLinearGradient(0,ahy,0,ahy-210);alg.addColorStop(0,'rgba(0,0,0,'+d*.9+')');alg.addColorStop(1,'rgba(0,0,0,0)');
    OX.fillStyle=alg;OX.beginPath();OX.moveTo(-ahw,ahy);OX.lineTo(-ahw-42,ahy-210);OX.lineTo(ahw+42,ahy-210);OX.lineTo(ahw,ahy);OX.fill();
    var arg=OX.createRadialGradient(0,0,5,0,0,95);arg.addColorStop(0,'rgba(0,0,0,'+d*.8+')');arg.addColorStop(1,'rgba(0,0,0,0)');OX.fillStyle=arg;OX.fillRect(-95,-95,190,190);
    OX.restore()}
   if(g.sv&&g.sv.st=='on'){var cy2=g.sv.y+SVL/2,cx2=(g.sv.side<0?29:W-29)+sx(cy2);var r4=OX.createRadialGradient(cx2,cy2,5,cx2,cy2,110);r4.addColorStop(0,'rgba(0,0,0,.95)');r4.addColorStop(1,'rgba(0,0,0,0)');OX.fillStyle=r4;OX.fillRect(cx2-110,cy2-110,220,220)}}
  OX.globalCompositeOperation='source-over';
  X.drawImage(O,0,0,W,H);
  if(d>.05){X.globalCompositeOperation='lighter';
   g.obs.forEach(function(v){if(v.fl)return;var vx=v.x+sx(v.y),ang=slope(v.y)+(lx(v.lane)-v.x)*.012+(v.rot||0),by=v.h/2;
    var c=v.br>0?'rgba(255,40,40,.95)':'rgba(255,40,40,.6)';
    X.save();X.translate(vx,v.y);X.rotate(ang);
    X.fillStyle='rgba(255,60,60,'+.25*g.w+')';X.fillRect(-v.w/2+3,by,5,28*g.w);X.fillRect(v.w/2-8,by,5,28*g.w);
    X.fillStyle=c;if(v.t=='motor'){X.fillRect(-2,by-3,4,3)}else{X.fillRect(-v.w/2+2,by-4,7,4);X.fillRect(v.w/2-9,by-4,7,4)}
    X.restore()});
   g.obs.forEach(function(v){if(v.fl||v.t=='becak'||d<=.12)return;var vx=v.x+sx(v.y),ang=slope(v.y)+(lx(v.lane)-v.x)*.012+(v.rot||0),fy=-v.h/2+2;
    X.save();X.translate(vx,v.y);X.rotate(ang);
    X.fillStyle='rgba(255,244,190,'+Math.min(1,d*1.2)+')';
    if(v.t=='motor'){X.fillRect(-2,fy,4,4)}else{X.fillRect(-v.w/2+3,fy,7,4);X.fillRect(v.w/2-10,fy,7,4)}
    var gg=X.createRadialGradient(0,fy,1,0,fy,26);gg.addColorStop(0,'rgba(255,240,170,'+d*.35+')');gg.addColorStop(1,'rgba(255,240,170,0)');X.fillStyle=gg;X.fillRect(-26,fy-26,52,52);
    X.restore()});
   g.dec.forEach(function(e){if(e.t=='tiang'){var r3=X.createRadialGradient(e.ex,e.y,1,e.ex,e.y,22);r3.addColorStop(0,'rgba(255,220,130,'+d*.9+')');r3.addColorStop(1,'rgba(255,200,100,0)');X.fillStyle=r3;X.fillRect(e.ex-22,e.y-22,44,44)}});
   X.globalCompositeOperation='source-over'}
 }
 if(g.am&&g.am.st=='run'){var A2=g.am,fx=Math.floor(g.t*8)%2,ax=A2.x+sx(A2.y),afy=-A2.h/2+2,aby=A2.h/2;
  X.save();X.translate(ax,A2.y);X.rotate(slope(A2.y));
  X.globalCompositeOperation='lighter';
  var sa=.45+d*.5,sr=55+d*45,sy=-A2.h/2+24;
  var gl1=X.createRadialGradient(-9,sy,2,-9,sy,sr);gl1.addColorStop(0,fx?'rgba(255,35,35,'+sa+')':'rgba(40,110,255,'+sa+')');gl1.addColorStop(1,'rgba(0,0,0,0)');X.fillStyle=gl1;X.fillRect(-9-sr,sy-sr,sr*2,sr*2);
  var gl2=X.createRadialGradient(9,sy,2,9,sy,sr);gl2.addColorStop(0,fx?'rgba(40,110,255,'+sa+')':'rgba(255,35,35,'+sa+')');gl2.addColorStop(1,'rgba(0,0,0,0)');X.fillStyle=gl2;X.fillRect(9-sr,sy-sr,sr*2,sr*2);
  if(d>.05){
   X.fillStyle='rgba(255,248,200,'+Math.min(1,d*1.3)+')';X.fillRect(-A2.w/2+3,afy,8,5);X.fillRect(A2.w/2-11,afy,8,5);
   var hlg=X.createRadialGradient(0,afy,2,0,afy,42);hlg.addColorStop(0,'rgba(255,245,180,'+d*.55+')');hlg.addColorStop(1,'rgba(255,245,180,0)');X.fillStyle=hlg;X.fillRect(-42,afy-42,84,84);
   X.fillStyle='rgba(255,40,40,'+Math.min(1,d*1.1)+')';X.fillRect(-A2.w/2+3,aby-4,8,4);X.fillRect(A2.w/2-11,aby-4,8,4);
  }
  X.restore()}
 if(dusk>0){X.fillStyle='rgba(255,110,30,'+dusk*.2+')';X.fillRect(0,0,W,H)}
 if(g.w>.05){X.fillStyle='rgba(60,75,90,'+g.w*.22+')';X.fillRect(0,0,W,H);
  if(g.w>.5){X.strokeStyle='rgba(200,220,255,'+(.15+g.w*.3)+')';X.lineWidth=1;X.beginPath();
   var n=Math.floor(g.rain.length*g.w);for(var k=0;k<n;k++){var r=g.rain[k];X.moveTo(r.x,r.y);X.lineTo(r.x+3,r.y-14)}X.stroke()}}
 if(g.flash>0){X.fillStyle='rgba(255,255,255,'+g.flash+')';X.fillRect(0,0,W,H)}
 if(g.hf>0){X.fillStyle='rgba(255,60,60,'+g.hf*.5+')';X.fillRect(0,0,W,H)}
 var vg=X.createRadialGradient(W/2,H*.55,H*.35,W/2,H*.55,H*.8);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,'+(.3+d*.25+(g.boosting?.2:0))+')');X.fillStyle=vg;X.fillRect(-20,-20,W+40,H+40);

 /* LAYAR AURA BENSIN: KUNING DI 25% DAN MERAH DI 20% */
 var fp=g.fuel/g.cap;
 if(fp<=.25){
  var isRed=(fp<=.20);
  var pulse=.55+.45*Math.sin(g.t*(isRed?10:6));
  var auraRgb=isRed?'255,30,45':'255,205,0';
  var auraAlpha=(isRed?.52:.42)*pulse;
  var ag=X.createRadialGradient(W/2,H/2,Math.min(W,H)*.28,W/2,H/2,Math.max(W,H)*.72);
  ag.addColorStop(0,'rgba('+auraRgb+',0)');
  ag.addColorStop(.68,'rgba('+auraRgb+','+(auraAlpha*.35)+')');
  ag.addColorStop(1,'rgba('+auraRgb+','+auraAlpha+')');
  X.fillStyle=ag;X.fillRect(0,0,W,H);
  X.save();X.strokeStyle='rgba('+auraRgb+','+(0.45+0.45*pulse)+')';X.lineWidth=isRed?8:6;
  X.strokeRect(3,3,W-6,H-6);X.restore();
 }
 X.restore();
 hud();ambHud();svHud();
}
function bar(x,y,w,v,c,lab){X.fillStyle='rgba(0,0,0,.55)';X.fillRect(x,y,w,9);X.fillStyle=c;X.fillRect(x,y,w*cl(v/100,0,1),9);X.fillStyle='#fff';X.font='bold 9px Verdana';X.textAlign='left';X.fillText(lab,x,y-3)}
function hud(){
 var g=G;X.textAlign='left';X.fillStyle='rgba(0,0,0,.45)';X.fillRect(0,0,W,52);
 var h=Math.floor(g.clock)%24,m=Math.floor((g.clock%1)*60/10)*10;
 X.fillStyle='#fff';X.font='bold 20px Verdana';
 X.fillText((h<10?'0':'')+h+':'+(m<10?'0':'')+m,10,24);
 var d=dark(g.clock),per=d>.9?'Malam':d<.1?'Siang':(g.clock%24>=12?'Senja':'Subuh');
 X.font='11px Verdana';X.fillStyle='#ffd166';X.fillText(per+' · '+g.wName,10,43);
 X.textAlign='right';X.fillStyle='#fff';X.font='bold 18px Verdana';X.fillText(score(),W-10,21);
 X.font='bold 10px Verdana';X.fillStyle='#38bdf8';X.fillText((g.dist/1000).toFixed(2)+' km',W-10,38);
 speedo();
 bar(100,22,74,g.fuel/g.cap*100,g.fuel/g.cap<=.20?'#ff4d4d':(g.fuel/g.cap<=.25?'#ffbe0b':'#2dc653'),'BBM '+Math.ceil(g.fuel)+'/'+g.cap+' L');
 X.fillStyle='#ffd23f';X.beginPath();X.arc(194,17,6,0,7);X.fill();X.fillStyle='#fff';X.textAlign='left';X.font='bold 14px Verdana';X.fillText(g.coins,204,22);
 if(g.leak>.05){X.fillStyle=Math.floor(g.t*4)%2?'#ff4d4d':'#ffb3b3';X.font='bold 10px Verdana';X.fillText('BOCOR -'+g.leak.toFixed(1)+'/dtk',186,43)}
 g.pop.forEach(function(q){X.globalAlpha=cl(q.l,0,1);X.fillStyle='#ffd166';X.font='bold 14px Verdana';X.textAlign='center';X.fillText(q.t,q.x,q.y);X.globalAlpha=1});
}

/* ---------- loop & kontrol ---------- */
var last=0;
function loop(ts){
 var dt=Math.min(.05,(ts-last)/1000||0);last=ts;
 if(G&&G.on&&!pauseState&&!layoutEdit){update(dt);if(G)draw()}
 requestAnimationFrame(loop);
}
var AC=null,AC_UNLOCKED=false;
try{AC=new(window.AudioContext||window.webkitAudioContext)({latencyHint:'interactive'})}catch(e){try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e2){}}
function unlockAC(){
 var ctx=getAC();if(!ctx)return;
 if(ctx.state==='suspended')try{ctx.resume()}catch(e){}
 if(!AC_UNLOCKED&&ctx.state==='running'){
  try{
   var b=ctx.createBuffer(1,1,22050),s=ctx.createBufferSource();
   s.buffer=b;s.connect(ctx.destination);s.start(0);
   AC_UNLOCKED=true;
  }catch(e){}
 }
}
function beep(){
 stopHornAudio();
 var lv=G?cl(G.hl||0,0,3):0;
 if(cfg.sfx){
  playCustomAudio('sfx_horn_'+lv,true);
 }
}
function honk(){
 if(!G||!G.on||G.pause||pauseState||layoutEdit||G.hk>0)return;G.hk=.6;beep();vib(20);
 G.pop.push({x:G.px,y:PY-60,t:'Tiiin!',l:.9});G.hw={t:.5,r:HR[G.hl]};
 G.obs.forEach(function(o){
  if(o.fl||o.y>=PY||PY-o.y>HR[G.hl]||Math.abs(o.x-G.px)>LW*.8)return;
  var big=o.t=='bus'||o.t=='truk';
  if(big&&G.hl<1){
   if(G.t-(o.ht||-9)>2.5)o.hc=0;
   o.ht=G.t;o.hc=(o.hc||0)+1;
   if(o.hc<2){G.pop.push({x:o.x+sx(o.y),y:o.y,t:'Klakson lagi!',l:1});return}
   o.hc=0;
  }
  var d=o.lane<=0?1:o.lane>=N-1?-1:(G.px<o.x?1:-1);
  var nl=cl(o.lane+d,0,N-1);
  if(nl==o.lane||!laneFree(o,nl)){nl=cl(o.lane-d,0,N-1);if(nl==o.lane||!laneFree(o,nl))return}
  o.lane=nl;o.sw=big?.7:1.1;o.ch=rnd(1.5,2.5);
 });
}
var deferredPrompt=null;
var appInstalledFlag=false;
try{appInstalledFlag=localStorage.getItem('pr_installed')==='1'}catch(e){}
window.addEventListener('beforeinstallprompt',function(e){
 e.preventDefault();deferredPrompt=e;
 appInstalledFlag=false;
 try{localStorage.removeItem('pr_installed')}catch(err){}
 var ib=document.getElementById('inst_card');if(ib)ib.style.display='flex';
});
window.addEventListener('appinstalled',function(){
 deferredPrompt=null;appInstalledFlag=true;
 try{localStorage.setItem('pr_installed','1')}catch(e){}
 var ib=document.getElementById('inst_card');if(ib)ib.style.display='none';
});
var swReg=null,swUpdateReady=false;

/* ---------- STYLE ANIMASI & FONT ARCADE PANTURA RUSH ---------- */
(function(){
 var st=document.createElement('style');
 st.textContent='@import url("https://fonts.googleapis.com/css2?family=Black+Ops+One&family=Russo+One&display=swap");'+
 '@keyframes prPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.06);opacity:.62}}'+
 '@keyframes prTitleFloat{0%,100%{transform:translateY(0) skewX(-5deg)}50%{transform:translateY(-4px) skewX(-5deg)}}'+
 '.pr-title{font-family:"Black Ops One","Russo One",Impact,"Arial Black",sans-serif;text-transform:uppercase;line-height:.92;letter-spacing:2px;background:linear-gradient(180deg,#fff7ae 0%,#ffd23f 42%,#ff7b00 88%,#d62828 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;filter:drop-shadow(0 5px 0 #1f0a00) drop-shadow(0 0 18px rgba(255,140,0,.55));animation:prTitleFloat 3s ease-in-out infinite;margin:0}'+
 '.pr-press{font-family:"Russo One",Verdana,sans-serif;letter-spacing:2.5px;text-transform:uppercase;animation:prPulse 1.35s ease-in-out infinite;text-shadow:0 2px 10px rgba(0,0,0,.9),0 0 14px rgba(255,210,63,.7)}';
 document.head.appendChild(st);
})();

/* ---------- MAIN SCREEN (ARCADE START + BACKGROUND VIDEO/GAMBAR + KARTU INSTALL) ---------- */
var installCardDismissed=false;
function applyAppUpdate(){
 var btn=document.getElementById('upd_btn');
 if(btn){btn.textContent='⏳ Mengunduh...';btn.disabled=true;}
 var doReload=function(){
  if(swReg&&swReg.waiting){
   swReg.waiting.postMessage({type:'SKIP_WAITING'});
  }
  setTimeout(function(){window.location.reload()},350);
 };
 if(window.caches){
  caches.keys().then(function(ks){return Promise.all(ks.map(function(k){return caches.delete(k)}))}).then(function(){
   if(swReg)swReg.update().then(doReload).catch(doReload);
   else doReload();
  }).catch(doReload);
 }else{
  doReload();
 }
}
function showMainScreen(){
 lastMenu=['main'];
 var isStandalone=(window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches)||window.navigator.standalone;
 var showInstall=(!isStandalone&&!appInstalledFlag&&!installCardDismissed);

 var installCardHTML='';
 if(showInstall){
  installCardHTML='<div id="inst_card" style="position:relative;z-index:10;width:90%;max-width:312px;background:linear-gradient(135deg,rgba(15,23,42,.95),rgba(30,41,59,.95));border:1.5px solid #2dc653;border-radius:14px;padding:10px 12px;margin-bottom:10px;display:flex;align-items:center;gap:10px;box-shadow:0 8px 24px rgba(0,0,0,.75);backdrop-filter:blur(4px);text-align:left">'+
   '<div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#2dc653,#1b4332);display:flex;align-items:center;justify-content:center;font-size:19px;flex-shrink:0">📲</div>'+
   '<div style="flex:1;min-width:0">'+
    '<div style="font:bold 11.5px Verdana;color:#fff;margin-bottom:2px">Install Aplikasi</div>'+
    '<div style="font:9.5px Verdana;color:#cbd5e1;line-height:1.3">Pasang di layar utama untuk main offline & layar penuh!</div>'+
   '</div>'+
   '<button id="inst_btn" style="background:#2dc653;color:#081c15;font:bold 11px Verdana;padding:7px 11px;border-radius:8px;margin:0;flex-shrink:0;cursor:pointer">Install</button>'+
   '<button id="inst_close" title="Tutup" style="background:transparent;color:#94a3b8;font:bold 14px Verdana;padding:2px 5px;margin:0;flex-shrink:0;cursor:pointer">✕</button>'+
  '</div>';
 }

 var updateCardHTML='<div id="upd_card" style="position:relative;z-index:10;width:90%;max-width:312px;background:linear-gradient(135deg,rgba(30,58,138,.94),rgba(15,23,42,.95));border:1.5px solid #38bdf8;border-radius:12px;padding:8px 12px;margin-bottom:10px;display:'+(swUpdateReady?'flex':'none')+';align-items:center;justify-content:space-between;gap:8px;box-shadow:0 6px 20px rgba(0,0,0,.7)">'+
  '<div style="text-align:left"><div style="font:bold 11px Verdana;color:#fff">🚀 Pembaruan Tersedia!</div><div style="font:9.5px Verdana;color:#bae6fd">Versi terbaru siap diunduh</div></div>'+
  '<button id="upd_btn" style="background:#38bdf8;color:#082f49;font:bold 11px Verdana;padding:6px 11px;border-radius:8px;margin:0;flex-shrink:0;cursor:pointer">Update</button>'+
 '</div>';

 M.innerHTML=
  '<div id="main_screen" style="position:absolute;inset:0;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between;align-items:center;padding:16px 16px 24px;box-sizing:border-box;cursor:pointer;user-select:none">'+
   '<img id="bg_img" src="'+MENU_BG_PATHS.image+'" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;pointer-events:none" onerror="this.style.display=\'none\'">'+
   '<video id="bg_vid" autoplay loop muted playsinline preload="auto" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:1;pointer-events:none">'+
    '<source src="'+MENU_BG_PATHS.video+'" type="video/mp4">'+
   '</video>'+
   '<div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 35%,rgba(10,15,28,.25) 0%,rgba(6,10,20,.78) 100%);z-index:2;pointer-events:none"></div>'+

   '<div style="position:relative;z-index:10;width:100%;display:flex;justify-content:space-between;align-items:center">'+
    '<div style="background:rgba(15,23,42,.78);border:1px solid rgba(255,210,63,.45);border-radius:10px;padding:6px 10px;font:bold 11px Verdana;color:#ffd23f;backdrop-filter:blur(3px)">🏆 REKOR: '+best+'</div>'+
    '<div style="display:flex;gap:8px;align-items:center">'+
     '<button id="main_chk_upd" title="Cek & Unduh Pembaruan" style="height:40px;padding:0 10px;border-radius:12px;background:rgba(15,23,42,.78);border:1.5px solid rgba(56,189,248,.5);color:#38bdf8;font:bold 11px Verdana;display:flex;align-items:center;gap:4px;margin:0;cursor:pointer;backdrop-filter:blur(4px)">🔄 Update</button>'+
     '<button id="main_cfg" title="Pengaturan" style="width:40px;height:40px;border-radius:12px;background:rgba(15,23,42,.78);border:1.5px solid rgba(255,255,255,.32);color:#fff;font-size:18px;display:flex;align-items:center;justify-content:center;padding:0;margin:0;cursor:pointer;backdrop-filter:blur(4px);box-shadow:0 4px 12px rgba(0,0,0,.45)">⚙</button>'+
    '</div>'+
   '</div>'+

   '<div style="position:relative;z-index:5;text-align:center;margin-top:4px;pointer-events:none">'+
    '<div style="display:inline-block;background:rgba(214,40,40,.9);color:#fff;font:bold 10px Verdana;letter-spacing:2.5px;padding:4px 12px;border-radius:20px;margin-bottom:8px;box-shadow:0 3px 10px rgba(0,0,0,.5)">JALUR UTAMA JAWA</div>'+
    '<h1 class="pr-title" style="font-size:48px">PANTURA<br><span style="font-size:56px">RUSH</span></h1>'+
    '<div style="margin-top:8px;font:11px Verdana;color:#e2e8f0;text-shadow:0 2px 6px rgba(0,0,0,.9)">Salip · Klakson · Kumpulkan Koin · Isi BBM</div>'+
   '</div>'+

   '<div style="position:relative;z-index:10;width:100%;display:flex;flex-direction:column;align-items:center">'+
    updateCardHTML+
    installCardHTML+
    '<div id="press_start_area" style="padding:11px 24px;border-radius:16px;background:rgba(0,0,0,.5);border:1.5px solid rgba(255,210,63,.6);backdrop-filter:blur(3px);text-align:center">'+
     '<div class="pr-press" style="font-size:19px;color:#ffd23f">PRESS START</div>'+
     '<div style="font:bold 11px Verdana;color:#ffffff;letter-spacing:1.5px;margin-top:3px;opacity:.92">( TOUCH TO START )</div>'+
    '</div>'+
   '</div>'+
  '</div>';

 M.style.display='flex';
 PRAudio.music('menu');

 var vid=document.getElementById('bg_vid');
 if(vid){
  vid.addEventListener('error',function(){vid.style.display='none'},true);
  var srcEl=vid.querySelector('source');
  if(srcEl)srcEl.addEventListener('error',function(){vid.style.display='none'});
  var vp=vid.play();
  if(vp&&vp.catch)vp.catch(function(){});
 }

 var cfgBtn=document.getElementById('main_cfg');
 if(cfgBtn)cfgBtn.onclick=function(e){e.stopPropagation();openSettings('main')};

 var chkUpdBtn=document.getElementById('main_chk_upd');
 if(chkUpdBtn)chkUpdBtn.onclick=function(e){
  e.stopPropagation();
  chkUpdBtn.textContent='⏳ Cek...';
  if(swReg){
   swReg.update().then(function(){
    if(swReg.waiting||swUpdateReady){
     applyAppUpdate();
    }else{
     applyAppUpdate();
    }
   }).catch(function(){applyAppUpdate()});
  }else{
   applyAppUpdate();
  }
 };

 var updBtn=document.getElementById('upd_btn');
 if(updBtn)updBtn.onclick=function(e){e.stopPropagation();applyAppUpdate()};

 var instCard=document.getElementById('inst_card');
 if(instCard)instCard.onclick=function(e){e.stopPropagation()};

 var instBtn=document.getElementById('inst_btn');
 if(instBtn)instBtn.onclick=function(e){
  e.stopPropagation();
  if(deferredPrompt){
   deferredPrompt.prompt();
   deferredPrompt.userChoice.then(function(res){
    if(res&&res.outcome==='accepted'){appInstalledFlag=true;try{localStorage.setItem('pr_installed','1')}catch(err){}}
    deferredPrompt=null;showMainScreen();
   });
  }else{
   alert('Untuk menginstall aplikasi Pantura Rush:\n\n• Android / Chrome: Ketuk menu titik tiga (⋮) di pojok kanan atas browser lalu pilih "Install aplikasi" atau "Tambahkan ke Layar utama".\n• iPhone / Safari: Ketuk tombol Bagikan (Share) lalu pilih "Add to Home Screen".');
  }
 };

 var instClose=document.getElementById('inst_close');
 if(instClose)instClose.onclick=function(e){
  e.stopPropagation();
  installCardDismissed=true;
  if(instCard)instCard.style.display='none';
 };

 var ms=document.getElementById('main_screen');
 if(ms)ms.onclick=function(){start()};
}

function showOverMenu(why,s,nb){
 lastMenu=['over',why,s,nb];
 M.innerHTML=
  '<div style="position:relative;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;box-sizing:border-box">'+
   '<button id="over_cfg" title="Pengaturan" style="position:absolute;top:16px;right:16px;width:40px;height:40px;border-radius:12px;background:rgba(15,23,42,.78);border:1.5px solid rgba(255,255,255,.32);color:#fff;font-size:18px;display:flex;align-items:center;justify-content:center;padding:0;margin:0;cursor:pointer">⚙</button>'+
   '<h1 style="font-size:34px;margin-bottom:6px">TAMAT</h1>'+
   '<p>'+why+'.<br>Skor <b>'+s+'</b> · Trip <b>'+(G.dist/1000).toFixed(2)+' km</b> ('+Math.floor(G.dist)+' m) · '+G.ct+' koin'+(nb?'<br><span style="color:#4ade80;font-weight:bold">🏆 Rekor Baru!</span>':'<br>Rekor: '+best)+'</p>'+
   '<button id="go" style="margin-top:8px">Main Lagi</button>'+
   '<button id="to_home" style="background:#2a3441;color:#f4efe0;font-size:13px;padding:10px 18px;margin-top:8px">🏠 Menu Utama</button>'+
  '</div>';
 M.style.display='flex';
 PRAudio.music('menu');
 document.getElementById('go').onclick=start;
 document.getElementById('over_cfg').onclick=function(){openSettings('over')};
 document.getElementById('to_home').onclick=showMainScreen;
}

function openPause(){
 if(!G||!G.on||G.pause||pauseState||layoutEdit)return;
 pauseState=true;
 gasOn=false;brkOn=false;joyAudioState=0;
 stopAllCustomAudio();
 showCtl(false);
 M.innerHTML='<h1 style="font-size:28px">JEDA</h1>'+
  '<p>Skor: <b>'+score()+'</b> · Koin: <b>'+G.coins+'</b> · BBM: <b>'+Math.ceil(G.fuel)+'/'+G.cap+' L</b></p>'+
  '<div style="display:flex;flex-direction:column;gap:10px;width:230px;margin-top:8px">'+
  '<button id="p_res" style="background:#2dc653;color:#081c15;width:100%">▶ Lanjut Main</button>'+
  '<button id="p_set" style="background:#3a86ff;color:#fff;width:100%">⚙ Pengaturan</button>'+
  '<button id="p_hom" style="background:#d62828;color:#fff;width:100%">🏠 Kembali ke Menu</button>'+
  '</div>';
 M.style.display='flex';
 document.getElementById('p_res').onclick=resumeGame;
 document.getElementById('p_set').onclick=function(){openSettings('pause')};
 document.getElementById('p_hom').onclick=function(){
  pauseState=false;G.on=false;stopAllCustomAudio();showCtl(false);
  showMainScreen();
 };
}

function resumeGame(){
 if(!G||!G.on)return;
 pauseState=false;layoutEdit=false;
 M.style.display='none';
 showCtl(true);
 last=performance.now();
}

var settingsOrigin='main';
function openSettings(from){
 if(from)settingsOrigin=from;
 var origin=settingsOrigin;
 var backLabel=(origin==='pause')?'▶ Selesai & Lanjut Main':'✔ Selesai & Kembali';
 M.innerHTML='<div style="position:relative;z-index:20;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;pointer-events:auto">'+
  '<h1 style="font-size:24px;margin-bottom:10px">PENGATURAN</h1>'+
  '<div style="display:flex;flex-direction:column;gap:8px;width:260px">'+
  tg('st_ctrl','Kontrol Gas & Rem: '+(cfg.ctrl==='joy'?'Full Joystick':'Tombol Layar'),cfg.ctrl==='joy'?'#2b6cb0':'#2a3441')+
  tg('st_joy','Posisi Joystick: '+(cfg.mode=='dyn'?'Dinamis (Sentuh Bebas)':'Tetap (Kiri Bawah)'))+
  tg('st_sfx','Efek Suara (SFX): '+(cfg.sfx?'Hidup':'Mati'))+
  tg('st_mus','Musik & Peringatan: '+(cfg.mus?'Hidup':'Mati'))+
  tg('st_lay','📐 Atur Tata Letak Tombol & Speedo','#d97706')+
  '</div>'+
  '<button id="st_back" type="button" style="position:relative;z-index:30;background:#2dc653;color:#081c15;margin-top:16px;width:260px;min-height:46px;font-weight:bold;font-size:14px;cursor:pointer;touch-action:manipulation">'+backLabel+'</button>'+
 '</div>';
 M.style.display='flex';
 var $=function(i){return document.getElementById(i)};
 $('st_ctrl').onclick=function(e){
  e.stopPropagation();
  cfg.ctrl=(cfg.ctrl==='btn'?'joy':'btn');
  saveCfg();applyControlLayout();openSettings(origin);
 };
 $('st_joy').onclick=function(e){
  e.stopPropagation();
  cfg.mode=(cfg.mode=='dyn'?'fix':'dyn');
  saveCfg();openSettings(origin);
 };
 $('st_sfx').onclick=function(e){
  e.stopPropagation();
  cfg.sfx=cfg.sfx?0:1;saveCfg();openSettings(origin);
 };
 $('st_mus').onclick=function(e){
  e.stopPropagation();
  cfg.mus=cfg.mus?0:1;if(!cfg.mus)playCustomAudio('mus_warning',false);
  saveCfg();openSettings(origin);
 };
 $('st_lay').onclick=function(e){e.stopPropagation();openLayoutEditor(origin)};
 var backDone=false;
 var goBack=function(e){
  if(e){e.preventDefault();e.stopPropagation();}
  if(backDone)return;
  backDone=true;
  if(origin==='pause'&&G&&G.on)resumeGame();
  else if(origin==='over'&&lastMenu&&lastMenu[0]==='over')showOverMenu(lastMenu[1],lastMenu[2],lastMenu[3]);
  else showMainScreen();
 };
 var backBtn=$('st_back');
 backBtn.addEventListener('pointerdown',goBack,{passive:false});
 backBtn.onclick=goBack;
}

/* ---------- EDITOR TATA LETAK DRAG & DROP + SKALA 50% - 200% ---------- */
var layoutOverlay=null;
function openLayoutEditor(from){
 layoutEdit=true;
 M.style.display='none';
 showCtl(false);
 if(G)draw();

 if(layoutOverlay)layoutOverlay.remove();
 layoutOverlay=document.createElement('div');
 layoutOverlay.style.cssText='position:absolute;inset:0;z-index:40;background:rgba(5,10,20,.65);touch-action:none;user-select:none;';

 var selectedKey='gas';
 var proxyEls={};
 var keyNames={sp:'SPEEDOMETER',gas:'TOMBOL GAS',rem:'TOMBOL REM',horn:'TOMBOL KLAKSON'};

 var banner=document.createElement('div');
 banner.style.cssText='position:absolute;top:56px;left:10px;right:10px;background:rgba(15,23,42,.95);border:1px solid rgba(255,255,255,.28);border-radius:12px;padding:9px 10px;text-align:center;color:#fff;font-family:Verdana,sans-serif;font-size:11px;z-index:45;box-shadow:0 6px 20px rgba(0,0,0,.6);';
 banner.innerHTML='<b>ATUR POSISI & UKURAN</b><br><span style="color:#ffd166;font-size:10px">Ketuk/seret komponen lalu atur ukuran (50% - 200%)</span>'+
  '<div style="margin-top:8px;padding:6px 8px;background:rgba(255,255,255,.07);border-radius:8px">'+
   '<div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:4px">'+
    '<span id="ly_sel_lbl" style="color:#38bdf8;font-weight:bold">TOMBOL GAS</span>'+
    '<span id="ly_sc_val" style="color:#fde047;font-weight:bold">125%</span>'+
   '</div>'+
   '<div style="display:flex;align-items:center;gap:6px">'+
    '<button id="ly_min" style="background:#334155;color:#fff;font-size:12px;padding:3px 9px;margin:0;border-radius:6px">-</button>'+
    '<input id="ly_rng" type="range" min="50" max="200" step="5" value="125" style="flex:1;margin:0;accent-color:#fde047">'+
    '<button id="ly_pls" style="background:#334155;color:#fff;font-size:12px;padding:3px 9px;margin:0;border-radius:6px">+</button>'+
   '</div>'+
  '</div>'+
  '<div style="display:flex;gap:8px;justify-content:center;margin-top:8px">'+
  '<button id="ly_rst" style="background:#64748b;color:#fff;font-size:11px;padding:6px 10px;margin:0">Reset Default</button>'+
  '<button id="ly_ok" style="background:#2dc653;color:#081c15;font-size:11px;padding:6px 14px;margin:0;font-weight:bold">Simpan</button>'+
  '</div>';
 layoutOverlay.appendChild(banner);

 function selectProxy(key){
  selectedKey=key;
  var scPct=Math.round((cfg.lay[key].s||1)*100);
  var lbl=document.getElementById('ly_sel_lbl');
  var valEl=document.getElementById('ly_sc_val');
  var rng=document.getElementById('ly_rng');
  if(lbl)lbl.textContent=keyNames[key]||key.toUpperCase();
  if(valEl)valEl.textContent=scPct+'%';
  if(rng)rng.value=scPct;
  for(var k in proxyEls){
   proxyEls[k].style.border=(k===key)?'2.5px solid #38bdf8':'2px dashed #fde047';
   proxyEls[k].style.zIndex=(k===key)?'44':'42';
  }
 }

 function updateProxyScale(key,pct){
  var clPct=cl(Math.round(pct/5)*5,50,200);
  var sc=clPct/100;
  cfg.lay[key].s=sc;
  var el=proxyEls[key];
  if(el)el.style.transform='translate(-50%,-50%) scale('+sc+')';
  var valEl=document.getElementById('ly_sc_val');
  var rng=document.getElementById('ly_rng');
  if(valEl)valEl.textContent=clPct+'%';
  if(rng)rng.value=clPct;
  if(key==='sp'&&G)draw();
 }

 function createProxy(key,label,w,h,bgCol,isCircle){
  var el=document.createElement('div');
  var pxLeft=(cfg.lay[key].x/W*100),pxTop=(cfg.lay[key].y/H*100);
  var sc=cfg.lay[key].s||1;
  el.style.cssText='position:absolute;left:'+pxLeft+'%;top:'+pxTop+'%;transform:translate(-50%,-50%) scale('+sc+');transform-origin:center center;width:'+w+'px;height:'+h+'px;background:'+bgCol+';border:2px dashed #fde047;border-radius:'+(isCircle?'50%':'12px')+';display:flex;align-items:center;justify-content:center;color:#fff;font:bold 10px Verdana;text-align:center;cursor:grab;box-shadow:0 4px 12px rgba(0,0,0,.6);z-index:42;';
  el.textContent=label;
  if(cfg.ctrl==='joy'&&(key==='gas'||key==='rem')){
   el.style.opacity='0.45';
   el.innerHTML=label+'<br><span style="font-size:8px;color:#fde047">(Tersembunyi)</span>';
  }
  proxyEls[key]=el;
  var dragging=false;
  el.addEventListener('pointerdown',function(e){
   e.preventDefault();e.stopPropagation();
   selectProxy(key);
   dragging=true;try{el.setPointerCapture(e.pointerId)}catch(err){}
  });
  el.addEventListener('pointermove',function(e){
   if(!dragging)return;
   var r=WR.getBoundingClientRect();
   var gx=cl((e.clientX-r.left)/r.width*W,20,W-20);
   var gy=cl((e.clientY-r.top)/r.height*H,64,H-16);
   cfg.lay[key].x=Math.round(gx);
   cfg.lay[key].y=Math.round(gy);
   el.style.left=(gx/W*100)+'%';
   el.style.top=(gy/H*100)+'%';
   if(key==='sp'&&G)draw();
  });
  ['pointerup','pointercancel'].forEach(function(ev){
   el.addEventListener(ev,function(){dragging=false});
  });
  layoutOverlay.appendChild(el);
 }

 createProxy('sp','SPEEDO',92,50,'rgba(15,23,42,.88)',false);
 createProxy('gas','GAS',54,78,'rgba(27,67,50,.9)',false);
 createProxy('rem','REM',52,62,'rgba(89,13,34,.9)',false);
 createProxy('horn','KLAKSON',50,50,'rgba(30,58,138,.9)',true);

 WR.appendChild(layoutOverlay);
 selectProxy('gas');

 document.getElementById('ly_rng').oninput=function(e){
  updateProxyScale(selectedKey,+e.target.value);
 };
 document.getElementById('ly_min').onclick=function(){
  updateProxyScale(selectedKey,Math.round((cfg.lay[selectedKey].s||1)*100)-5);
 };
 document.getElementById('ly_pls').onclick=function(){
  updateProxyScale(selectedKey,Math.round((cfg.lay[selectedKey].s||1)*100)+5);
 };
 document.getElementById('ly_rst').onclick=function(){
  resetLayout();
  openLayoutEditor(from);
 };
 document.getElementById('ly_ok').onclick=function(){
  saveCfg();applyControlLayout();
  if(layoutOverlay){layoutOverlay.remove();layoutOverlay=null;}
  layoutEdit=false;
  openSettings(from);
 };
}

function start(){PRAudio.init();reset();M.style.display='none';showCtl(true);draw()}
var PAD=document.getElementById('pad'),SZ=document.getElementById('zone'),SB=document.getElementById('stick'),KN=document.getElementById('knob'),WR=document.getElementById('w');

/* ---------- TOMBOL PAUSE DI KANVAS GAME ---------- */
var pauseBtnEl=document.createElement('button');
pauseBtnEl.id='btn_pause';
pauseBtnEl.innerHTML='⏸';
pauseBtnEl.title='Jeda Game (Pause)';
pauseBtnEl.style.cssText='position:absolute;top:58px;right:10px;z-index:26;width:36px;height:36px;padding:0;margin:0;border-radius:10px;background:rgba(15,23,42,.72);color:#fff;border:1.5px solid rgba(255,255,255,.3);font-size:15px;display:none;align-items:center;justify-content:center;cursor:pointer;backdrop-filter:blur(2px);';
pauseBtnEl.addEventListener('pointerdown',function(e){e.preventDefault();e.stopPropagation();openPause()});
WR.appendChild(pauseBtnEl);

var stick={on:false,id:null,ox:0,oy:0,x:0,y:0},SR=48;
function stickMove(e){
 var r=WR.getBoundingClientRect(),dx=e.clientX-r.left-stick.ox,dy=e.clientY-r.top-stick.oy,l=Math.hypot(dx,dy)||1,k=Math.min(1,SR/l);
 KN.style.transform='translate('+dx*k+'px,'+dy*k+'px)';
 var vx=cl(dx/SR,-1,1);
 stick.x=Math.abs(vx)<.1?0:(vx>0?1:-1)*(Math.abs(vx)-.1)/.9;
 var vy=cl(-dy/SR,-1,1);
 stick.y=Math.abs(vy)<.15?0:(vy>0?1:-1)*(Math.abs(vy)-.15)/.85;
}
function stickEnd(){
 stick.on=false;stick.id=null;stick.x=0;stick.y=0;
 if(joyAudioState!==0){joyAudioState=0;playCustomAudio('sfx_gas',false);playCustomAudio('sfx_rem',false);}
 KN.style.transform='';if(cfg.mode=='dyn')SB.style.display='none';
}
function isExcludedZone(e){
 var r=WR.getBoundingClientRect();
 var lxPos=e.clientX-r.left,lyPos=e.clientY-r.top;
 var gx=lxPos/r.width*W,gy=lyPos/r.height*H;
 if(Math.hypot(gx-cfg.lay.sp.x,gy-cfg.lay.sp.y)<=56*(cfg.lay.sp.s||1))return true;
 if(gy<54)return true;
 if(gx>W-54&&gy<102)return true;
 var ids=['bh'];
 if(cfg.ctrl!=='joy'){ids.push('bg','br');}
 for(var i=0;i<ids.length;i++){
  var b=document.getElementById(ids[i]);
  if(b&&b.style.display!=='none'){
   var br=b.getBoundingClientRect();
   if(e.clientX>=br.left-8&&e.clientX<=br.right+8&&e.clientY>=br.top-8&&e.clientY<=br.bottom+8)return true;
  }
 }
 return false;
}
SZ.addEventListener('pointerdown',function(e){
 if(stick.on||pauseState||layoutEdit)return;
 if(cfg.mode=='dyn'&&isExcludedZone(e))return;
 e.preventDefault();
 stick.on=true;stick.id=e.pointerId;try{SZ.setPointerCapture(e.pointerId)}catch(x){}
 var r=WR.getBoundingClientRect();
 if(cfg.mode=='dyn'){stick.ox=e.clientX-r.left;stick.oy=e.clientY-r.top;SB.style.left=stick.ox+'px';SB.style.top=stick.oy+'px';SB.style.display='block'}
 else{var b=SB.getBoundingClientRect();stick.ox=b.left+b.width/2-r.left;stick.oy=b.top+b.height/2-r.top}
 stickMove(e)});
SZ.addEventListener('pointermove',function(e){if(stick.on&&e.pointerId===stick.id)stickMove(e)});
['pointerup','pointercancel'].forEach(function(n){SZ.addEventListener(n,function(e){if(e.pointerId===stick.id)stickEnd()})});

function applyControlLayout(){
 var bg=document.getElementById('bg'),br=document.getElementById('br'),bh=document.getElementById('bh');
 if(!PAD||!bg||!br||!bh)return;
 PAD.style.inset='0';
 PAD.style.width='100%';
 PAD.style.height='100%';
 PAD.style.pointerEvents='none';

 function placeEl(el,key,visible){
  var sc=cfg.lay[key].s||1;
  el.style.position='absolute';
  el.style.left=(cfg.lay[key].x/W*100)+'%';
  el.style.top=(cfg.lay[key].y/H*100)+'%';
  el.style.transform='translate(-50%,-50%) scale('+sc+')';
  el.style.transformOrigin='center center';
  el.style.pointerEvents=visible?'auto':'none';
  el.style.display=visible?'flex':'none';
 }
 var showPedals=(cfg.ctrl!=='joy');
 placeEl(bg,'gas',showPedals);
 placeEl(br,'rem',showPedals);
 placeEl(bh,'horn',true);
}

function showCtl(v){
 PAD.style.display=v?'block':'none';
 SZ.style.display=v?'block':'none';
 pauseBtnEl.style.display=(v&&G&&G.on&&!G.pause)?'flex':'none';
 if(v)applyControlLayout();
 if(SZ){
  if(cfg.mode=='dyn'){SZ.style.left='0';SZ.style.top='0';SZ.style.right='0';SZ.style.bottom='0';SZ.style.width='100%';SZ.style.height='100%';}
  else{SZ.style.left='0';SZ.style.top='0';SZ.style.right='';SZ.style.bottom='0';SZ.style.width='50%';SZ.style.height='100%';}
 }
 stickEnd();gasOn=false;brkOn=false;
 SB.className=cfg.mode=='fix'?'fix':'';SB.style.left='';SB.style.top='';SB.style.display=(v&&cfg.mode=='fix')?'block':'none';
}

function hold(id,on,off){var b=document.getElementById(id);b.addEventListener('pointerdown',function(e){e.preventDefault();e.stopPropagation();try{b.setPointerCapture(e.pointerId)}catch(x){}on()});['pointerup','pointercancel'].forEach(function(n){b.addEventListener(n,off)})}
(function(){
 var bg=document.getElementById('bg'),br=document.getElementById('br'),bh=document.getElementById('bh'),pd=document.getElementById('pad');
 if(pd&&bg&&br&&bh){
  pd.innerHTML='';
  pd.appendChild(bh);
  pd.appendChild(br);
  pd.appendChild(bg);
 }
 function setBtnIcon(el,path,svgFallback,w,h,label){
  el.innerHTML='';
  var img=document.createElement('img');
  img.src=path;img.alt=label;
  img.style.width=w+'px';img.style.height=h+'px';img.style.objectFit='contain';img.style.pointerEvents='none';
  img.onerror=function(){
   el.innerHTML=svgFallback+(label?'<span style="font:bold 9px Verdana;letter-spacing:.5px">'+label+'</span>':'');
  };
  el.appendChild(img);
  if(label){
   var sp=document.createElement('span');
   sp.style.cssText='font:bold 9px Verdana;letter-spacing:.5px';
   sp.textContent=label;
   el.appendChild(sp);
  }
 }
 if(bg){
  bg.style.width='54px';bg.style.height='78px';bg.style.padding='4px';bg.style.borderRadius='12px';
  bg.style.flexDirection='column';bg.style.alignItems='center';bg.style.justifyContent='center';bg.style.gap='3px';
  setBtnIcon(bg,ICON_PATHS.gas,'<svg width="28" height="42" viewBox="0 0 36 56" fill="none"><rect x="4" y="2" width="28" height="52" rx="7" fill="#1b4332" stroke="#95d5b2" stroke-width="2.5"/><rect x="9" y="8" width="18" height="40" rx="4" fill="#2dc653"/><line x1="12" y1="15" x2="24" y2="15" stroke="#081c15" stroke-width="2.5" stroke-linecap="round"/><line x1="12" y1="23" x2="24" y2="23" stroke="#081c15" stroke-width="2.5" stroke-linecap="round"/><line x1="12" y1="31" x2="24" y2="31" stroke="#081c15" stroke-width="2.5" stroke-linecap="round"/><line x1="12" y1="39" x2="24" y2="39" stroke="#081c15" stroke-width="2.5" stroke-linecap="round"/></svg>',30,44,'GAS');
 }
 if(br){
  br.style.width='52px';br.style.height='62px';br.style.padding='4px';br.style.borderRadius='12px';
  br.style.flexDirection='column';br.style.alignItems='center';br.style.justifyContent='center';br.style.gap='3px';
  setBtnIcon(br,ICON_PATHS.rem,'<svg width="32" height="30" viewBox="0 0 44 40" fill="none"><rect x="3" y="4" width="38" height="32" rx="7" fill="#590d22" stroke="#ffb3c1" stroke-width="2.5"/><rect x="8" y="9" width="28" height="22" rx="4" fill="#ff4d6d"/><line x1="14" y1="13" x2="14" y2="27" stroke="#590d22" stroke-width="2.5" stroke-linecap="round"/><line x1="22" y1="13" x2="22" y2="27" stroke="#590d22" stroke-width="2.5" stroke-linecap="round"/><line x1="30" y1="13" x2="30" y2="27" stroke="#590d22" stroke-width="2.5" stroke-linecap="round"/></svg>',32,30,'REM');
 }
 if(bh){
  bh.style.width='46px';bh.style.height='46px';bh.style.padding='4px';bh.style.borderRadius='50%';
  bh.style.alignItems='center';bh.style.justifyContent='center';
  setBtnIcon(bh,ICON_PATHS.klakson,'<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 10v4h3l5 4V6L7 10H4zm12.5 2c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 4.45v2.06c2.89.86 5 3.54 5 6.49s-2.11 5.63-5 6.49v2.06c4.01-.91 7-4.49 7-8.55s-2.99-7.64-7-8.55z" fill="#fff"/></svg>',26,26,'');
 }
 applyControlLayout();
})();
hold('bg',function(){if(pauseState||layoutEdit)return;gasOn=true;playCustomAudio('sfx_gas',true)},function(){gasOn=false;playCustomAudio('sfx_gas',false)});
hold('br',function(){if(pauseState||layoutEdit)return;brkOn=true;playCustomAudio('sfx_rem',true)},function(){brkOn=false;playCustomAudio('sfx_rem',false)});
hold('bh',function(){unlockAC();honk()},function(){});
WR.addEventListener('contextmenu',function(e){e.preventDefault()});
['pointerdown','touchstart','keydown'].forEach(function(n){window.addEventListener(n,function(){
 PRAudio.init();
 unlockAC();
 for(var k in AUDIO_PATHS){
  if((k.indexOf('sfx_horn_')===0||k==='sfx_buy_ok'||k==='sfx_buy_fail')&&!AUDIO_BUFS[k]&&!AUDIO_ERR[k]){
   loadAudioBuffer(k,AUDIO_PATHS[k]);
  }
 }
},{passive:true})});

window.addEventListener('keydown',function(e){
 if((e.key=='Escape'||e.key=='p'||e.key=='P')&&G&&G.on&&!G.pause&&!layoutEdit){
  if(pauseState)resumeGame();else openPause();
  return;
 }
 if(pauseState||layoutEdit)return;
 if(!keys[e.key]){
  if(e.key=='ArrowUp'||e.key=='w'||e.key=='W')playCustomAudio('sfx_gas',true);
  if(e.key=='ArrowDown'||e.key=='s'||e.key=='S')playCustomAudio('sfx_rem',true);
 }
 keys[e.key]=true;if(e.key=='h'||e.key=='H')honk();if(e.key==' ')e.preventDefault()
});
window.addEventListener('keyup',function(e){
 keys[e.key]=false;
 if(e.key=='ArrowUp'||e.key=='w'||e.key=='W')playCustomAudio('sfx_gas',false);
 if(e.key=='ArrowDown'||e.key=='s'||e.key=='S')playCustomAudio('sfx_rem',false);
});
reset();G.on=false;saveCfg();draw();
showMainScreen();
requestAnimationFrame(loop);
if('serviceWorker' in navigator){
 window.addEventListener('load',function(){
  navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).then(function(r){
   swReg=r;
   function notifyUpdate(){
    swUpdateReady=true;
    var uc=document.getElementById('upd_card');
    if(uc)uc.style.display='flex';
   }
   if(r.waiting)notifyUpdate();
   r.addEventListener('updatefound',function(){
    var nw=r.installing;
    if(nw)nw.addEventListener('statechange',function(){
     if(nw.state==='installed'&&navigator.serviceWorker.controller)notifyUpdate();
    });
   });
   r.update().catch(function(){});
  }).catch(function(){});
 });
}
})();
