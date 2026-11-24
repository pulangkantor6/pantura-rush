(function(){
var W=360,H=640,RX=56,LW=62,N=4,PY=510;
var DPR=Math.min(window.devicePixelRatio||1,2);
var C=document.getElementById('c'),X=C.getContext('2d');
var O=document.createElement('canvas'),OX=O.getContext('2d');
C.width=O.width=W*DPR;C.height=O.height=H*DPR;
X.setTransform(DPR,0,0,DPR,0,0);OX.setTransform(DPR,0,0,DPR,0,0);
var M=document.getElementById('m'),NB=document.getElementById('nb'),HB=document.getElementById('hb');
var best=0;try{best=+localStorage.getItem('pr_best')||0}catch(e){}
function lx(i){return RX+LW*i+LW/2}
function rnd(a,b){return a+Math.random()*(b-a)}
function pick(a){return a[Math.floor(Math.random()*a.length)]}
function cl(v,a,b){return Math.max(a,Math.min(b,v))}
var G=null,keys={},boost=false,ptr=null;

var TYPES={
 mobil:{w:34,h:60,v:[130,190],c:['#d62828','#2a9d8f','#e9c46a','#8d99ae','#f1f1f1']},
 motor:{w:18,h:40,v:[190,240],c:['#222','#c1121f','#0077b6']},
 angkot:{w:38,h:68,v:[120,150],c:['#f4d35e']},
 bus:{w:42,h:104,v:[150,180],c:['#e76f51','#3a86ff','#2d6a4f']},
 truk:{w:44,h:112,v:[100,125],c:['#9c6644','#6c757d','#bc4749']},
 becak:{w:26,h:52,v:[40,60],c:['#ffbe0b','#fb5607']}
};

function reset(){
 G={on:true,t:0,clock:16,dist:0,bonus:0,speed:200,fuel:100,nitro:30,hp:3,inv:0,
  px:lx(1),tx:lx(1),slip:0,shake:0,flash:0,
  obs:[],haz:[],pk:[],dec:[],pop:[],rain:[],
  w:0,wTarget:0,wName:'Cerah',wTimer:20,spawn:0.5,hz:1.5,pkT:8,dcT:0,off:0,pt:[],bend:0,bT:0,bTimer:35,bDur:0,hk:0,cp:0,am:null,amT:45};
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
 emit(o.x-dd*o.w/2,o.y,8,'255,220,120',180,.4,3,1);
 if(!silent&&G.cp<=0){G.cp=1.6;G.pop.push({x:o.x+sx(o.y),y:Math.max(o.y,90),t:'Beruntun!',l:1})}
}
function tone(f,d,v){try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();var o=AC.createOscillator(),k=AC.createGain();o.type='sine';o.frequency.value=f;k.gain.setValueAtTime(v,AC.currentTime);k.gain.exponentialRampToValueAtTime(.001,AC.currentTime+d);o.connect(k);k.connect(AC.destination);o.start();o.stop(AC.currentTime+d)}catch(e){}}
function drawAmb(a){
 var w=a.w,h=a.h,f=Math.floor(G.t*8)%2;
 X.save();X.translate(a.x,a.y);
 X.fillStyle='rgba(0,0,0,.25)';X.fillRect(-w/2+3,-h/2+4,w,h);
 rr(-w/2,-h/2,w,h,6,'#f4f4f4');rr(-w/2+3,-h/2+6,w-6,14,3,'#1d3557');
 X.fillStyle='#d62828';X.fillRect(-2,-4,4,16);X.fillRect(-6,2,12,4);
 X.fillStyle=f?'#ff2a2a':'#2a6bff';X.fillRect(-w/2+3,-h/2+22,12,5);
 X.fillStyle=f?'#2a6bff':'#ff2a2a';X.fillRect(w/2-15,-h/2+22,12,5);
 X.restore();
}
function speedo(){
 var g=G,cx=W/2,cy=H-28,r=48,kmh=Math.round(g.speed*.45),f=cl(kmh/300,0,1);
 X.save();X.lineCap='round';
 X.fillStyle='rgba(0,0,0,.5)';X.beginPath();X.arc(cx,cy,r+8,Math.PI,2*Math.PI);X.closePath();X.fill();
 X.lineWidth=7;X.strokeStyle='rgba(255,255,255,.15)';X.beginPath();X.arc(cx,cy,r-2,Math.PI,2*Math.PI);X.stroke();
 X.strokeStyle=f<.5?'#2dc653':f<.8?'#ffd166':'#ff4d4d';X.beginPath();X.arc(cx,cy,r-2,Math.PI,Math.PI+Math.PI*f);X.stroke();
 X.lineWidth=1.5;X.strokeStyle='rgba(255,255,255,.7)';
 for(var i=0;i<=6;i++){var a=Math.PI+Math.PI*i/6,c=Math.cos(a),s=Math.sin(a);X.beginPath();X.moveTo(cx+c*(r-13),cy+s*(r-13));X.lineTo(cx+c*(r-8),cy+s*(r-8));X.stroke()}
 var na=Math.PI+Math.PI*f;X.lineWidth=2.5;X.strokeStyle='#ff4d6d';X.beginPath();X.moveTo(cx,cy);X.lineTo(cx+Math.cos(na)*(r-15),cy+Math.sin(na)*(r-15));X.stroke();
 X.fillStyle='#fff';X.textAlign='center';X.font='bold 18px Verdana';X.fillText(kmh,cx,cy-10);
 X.font='9px Verdana';X.fillStyle='#bbb';X.fillText('km/j',cx,cy-1);
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
function emit(x,y,n,c,sp,l,s,add){for(var i=0;i<n;i++)G.pt.push({x:x,y:y,vx:rnd(-sp,sp),vy:rnd(-sp,sp)*.8,l:l*rnd(.6,1),m:l,c:c,s:s,a:add})}
function spawnObs(){
 var r=Math.random(),t=r<.3?'mobil':r<.52?'motor':r<.67?'angkot':r<.77?'bus':r<.9?'truk':'becak';
 var lane=Math.floor(rnd(0,N));
 if(t=='becak')lane=Math.random()<.5?0:N-1;
 var busy={};
 G.obs.forEach(function(o){if(o.y<120)busy[o.lane]=1});
 if(Object.keys(busy).length>=N-1&&!busy[lane])return;
 if(busy[lane])return;
 var d=TYPES[t];
 G.obs.push({t:t,lane:lane,x:lx(lane),y:-d.h,w:d.w,h:d.h,v:rnd(d.v[0],d.v[1]),v0:0,c:pick(d.c),n:0,br:0,ch:rnd(1,3)});
 var o=G.obs[G.obs.length-1];o.v0=o.v;
}

function update(dt){
 var g=G;g.t+=dt;g.clock+=dt/14;g.off+=g.speed*dt;
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
  if(g.bTimer<=0){g.bT=pick([-1,-.7,.7,1]);g.bDur=rnd(10,15);
   g.pop.push({x:W/2,y:200,t:g.bT>0?'Tikungan kanan \u2192':'\u2190 Tikungan kiri',l:2})}}
 else{g.bDur-=dt;if(g.bDur<=0){g.bT=0;g.bTimer=rnd(42,70)}}
 g.bend+=(g.bT-g.bend)*Math.min(1,dt*.5);
 g.tx-=g.bend*55*(g.speed/300)*dt;
 // kontrol
 var dir=(keys.ArrowRight||keys.d?1:0)-(keys.ArrowLeft||keys.a?1:0);
 if(dir)g.tx=cl(g.tx+dir*190*dt,RX+16,RX+LW*N-16);
 var grip=(dir?6:11)*(1-.6*g.w);
 if(g.slip>0){g.slip-=dt;g.tx+=Math.sin(g.t*14)*160*dt;grip*=.4}
 g.tx=cl(g.tx,RX+16,RX+LW*N-16);
 g.px+=(g.tx-g.px)*Math.min(1,grip*dt);
 // kecepatan
 var base=250+Math.min(g.dist/14,150);
 var bo=(boost||keys[' '])&&g.nitro>0;
 if(bo){g.nitro=Math.max(0,g.nitro-34*dt)}
 g.boosting=bo;
 var tgt=base*(bo?1.55:1);
 g.speed+=(tgt-g.speed)*Math.min(1,dt*(bo?3:1.2));
 g.dist+=g.speed*dt/18;
 g.fuel-=dt*(2.3+(bo?2.2:0));
 if(g.fuel<=0)return over('Bensin habis di jalan');
 g.hk=Math.max(0,g.hk-dt);g.inv=Math.max(0,g.inv-dt);g.shake=Math.max(0,g.shake-dt*25);
 // spawn
 g.spawn-=dt;
 if(g.spawn<=0){spawnObs();g.spawn=Math.max(.4,1-g.dist/3200)*rnd(.7,1.2)}
 g.hz-=dt;
 if(g.hz<=0){
  var rain=g.w>.5,lane=Math.floor(rnd(0,N));
  g.haz.push(rain&&Math.random()<.65?{t:'genang',x:lx(lane),y:-30,w:50,h:34}:{t:'lubang',x:lx(lane)+rnd(-12,12),y:-30,w:26,h:18});
  g.hz=rnd(1.8,3.4);
 }
 g.pkT-=dt;
 if(g.pkT<=0){g.pk.push({x:lx(Math.floor(rnd(0,N))),y:-30});g.pkT=rnd(9,14)}
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
   else if(g.inv<=0){g.speed*=.65;g.shake=8;vib(40)}
  }
 });
 g.haz=g.haz.filter(function(h){return h.y<H+40});
 g.pk.forEach(function(k){k.y+=g.speed*dt;
  if(!k.got&&Math.hypot(k.x-p.x,k.y-p.y)<32){k.got=1;g.fuel=Math.min(100,g.fuel+28);g.pop.push({x:p.x,y:p.y-50,t:'+BBM',l:1});vib(15)}});
 g.pk=g.pk.filter(function(k){return k.y<H+30&&!k.got});
 g.obs.forEach(function(o){
  // perilaku
  if(o.t=='motor'&&!o.fl){o.ch-=dt;if(o.ch<=0&&o.y>-20&&o.y<300){var nl=cl(o.lane+(Math.random()<.5?-1:1),0,N-1);if(nl!=o.lane&&laneFree(o,nl)){o.lane=nl;o.sw=2.5}o.ch=rnd(1.2,2.5)}}
  if(!o.fl){
   if(o.br>0)o.br-=dt;
   else if(o.t=='angkot'&&o.y>40&&o.y<350&&Math.random()<dt*.35)o.br=1.3;
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
  o.y+=(g.speed-o.v)*dt;
  // tabrakan
  var dx=Math.abs(o.x-p.x),dy=Math.abs(o.y-p.y);
  var hw=(o.w+p.w)/2-3,hh=(o.h+p.h)/2-5;
  if(!o.hit&&dx<hw&&dy<hh&&g.inv<=0){
   o.hit=1;g.hp--;g.inv=1.4;g.speed*=.4;g.fuel=Math.max(0,g.fuel-8);g.shake=14;vib(120);
   var dd=o.x>p.x?1:o.x<p.x?-1:pick([-1,1]);
   knock(o,dd,1,1);
   g.tx-=dd*34;g.px-=dd*20;emit(o.x-dd*o.w/2,o.y,10,'255,220,120',200,.4,3,1);
   g.pop.push({x:p.x,y:p.y-50,t:'Brak!',l:1});emit(p.x,p.y,18,'255,200,80',240,.55,3,1);
   if(g.hp<=0)return over('Mobilmu hancur');
  }
  // nyaris
  if(!o.n&&!o.hit&&o.y>p.y-10){
   o.n=1;
   var gap=dx-(o.w+p.w)/2;
   if(gap>-2&&gap<16){
    g.nitro=Math.min(100,g.nitro+14);g.fuel=Math.min(100,g.fuel+4);g.bonus+=25;
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
 if(!g.am){g.amT-=dt;if(g.amT<=0){var al=Math.round(cl((g.px-RX-LW/2)/LW,0,N-1));g.am={st:'warn',t:4.5,lane:al,x:lx(al),y:H+150,w:38,h:78,sir:0};g.pop.push({x:W/2,y:215,t:'Dengar sirene...',l:2})}}
 else{
  var A=g.am;A.sir-=dt;
  if(A.sir<=0){A.sir=.42;A.hi=!A.hi;tone(A.hi?960:720,.4,.04)}
  if(A.st=='warn'){A.t-=dt;if(A.t<=0)A.st='run'}
  else{
   A.y-=280*dt;
   g.obs.forEach(function(o){
    if(o.fl)return;
    if(o.lane==A.lane&&o.y<A.y&&A.y-o.y<460&&!o.ya){var nl=freeLane(o);if(nl>=0){o.lane=nl;o.sw=1.1;o.ya=1}}
    if(Math.abs(o.x-A.x)<(o.w+A.w)/2-2&&Math.abs(o.y-A.y)<(o.h+A.h)/2-3)knock(o,o.x>=A.x?1:-1,1.2);
   });
   if(!A.hit&&g.inv<=0&&Math.abs(A.x-g.px)<(A.w+30)/2-2&&Math.abs(A.y-PY)<(A.h+56)/2-5){
    A.hit=1;g.hp--;g.inv=1.4;g.speed*=.6;g.shake=14;vib(120);
    var dd2=A.x>=g.px?1:-1;g.tx-=dd2*60;g.px-=dd2*30;
    g.pop.push({x:g.px,y:PY-50,t:'Ditabrak ambulance!',l:1.4});emit(g.px,PY,14,'255,200,80',220,.5,3,1);
    if(g.hp<=0)return over('Ditabrak ambulance');
   }
   if(!A.ok&&!A.hit&&A.y<PY-90){A.ok=1;g.bonus+=60;g.pop.push({x:g.px,y:PY-50,t:'Ambulance lewat +60',l:1.4})}
   if(A.y<-160){g.am=null;g.amT=rnd(55,85)}
  }
 }
 g.pop.forEach(function(q){q.l-=dt;q.y-=30*dt});
 g.pop=g.pop.filter(function(q){return q.l>0});
 var sp=g.speed;
 if(g.slip>0&&Math.random()<.8)emit(g.px+rnd(-12,12),PY+26,1,'200,200,210',40,.7,rnd(5,9),0);
 if(g.boosting)emit(g.px+rnd(-6,6),PY+34,2,'255,150,40',90,.35,rnd(2,4),1);
 g.pt.forEach(function(q){q.x+=q.vx*dt;q.y+=(q.vy+sp*.7)*dt;q.l-=dt});
 g.pt=g.pt.filter(function(q){return q.l>0});
 g.rain.forEach(function(r){r.y+=900*r.s*dt;r.x-=120*r.s*dt;if(r.y>H){r.y=-20;r.x=rnd(0,W+60)}});
}
function vib(n){try{navigator.vibrate&&navigator.vibrate(n)}catch(e){}}
function score(){return Math.floor(G.dist)+G.bonus}
function over(why){
 G.on=false;NB.style.display='none';HB.style.display='none';
 var s=score(),nb=s>best;
 if(nb){best=s;try{localStorage.setItem('pr_best',best)}catch(e){}}
 showMenu('Tamat',why+'.<br>Skor <b>'+s+'</b> · '+Math.floor(G.dist)+' m'+(nb?'<br>Rekor baru!':'<br>Rekor: '+best),'Main lagi');
}

/* ---------- gambar ---------- */
function rr(x,y,w,h,r,c){X.fillStyle=c;X.beginPath();X.roundRect?X.roundRect(x,y,w,h,r):X.rect(x,y,w,h);X.fill()}
function drawVeh(o){
 var x=o.x,y=o.y,w=o.w,h=o.h,t=o.t;
 X.save();X.translate(x,y);
 X.fillStyle='rgba(0,0,0,.25)';X.fillRect(-w/2+3,-h/2+4,w,h);
 if(t=='motor'){
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
 var g=G;if(g.inv>0&&Math.floor(g.t*14)%2)return;
 X.save();X.translate(g.px+sx(PY),PY);X.rotate((g.tx-g.px)*.004+slope(PY));
 if(g.boosting){var gr=X.createLinearGradient(0,28,0,80);gr.addColorStop(0,'rgba(255,160,40,.9)');gr.addColorStop(1,'rgba(255,60,0,0)');X.fillStyle=gr;X.fillRect(-9,28,18,52+Math.random()*14)}
 X.fillStyle='rgba(0,0,0,.3)';X.fillRect(-14,-24,34,60);
 rr(-16,-30,32,60,9,'#ff4d6d');rr(-12,-14,24,12,3,'#14213d');rr(-12,10,24,9,3,'#14213d');
 X.fillStyle='#fff';X.fillRect(-2,-30,4,60);
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
 g.dec.forEach(function(d){X.save();X.translate(sx(d.y),0);drawDecor(d);X.restore()});
 g.haz.forEach(function(h){X.save();X.translate(sx(h.y),0);
  if(h.t=='genang'){X.fillStyle='rgba(120,160,200,.45)';X.beginPath();X.ellipse(h.x,h.y,h.w/2,h.h/2,0,0,7);X.fill();X.strokeStyle='rgba(255,255,255,.4)';X.stroke()}
  else{X.fillStyle='#1d1f22';X.beginPath();X.ellipse(h.x,h.y,h.w/2,h.h/2,0,0,7);X.fill()}
  X.restore();
 });
 g.pk.forEach(function(k){X.save();X.translate(sx(k.y),0);rr(k.x-10,k.y-12,20,24,4,'#2dc653');X.fillStyle='#fff';X.font='bold 9px Verdana';X.textAlign='center';X.fillText('BBM',k.x,k.y+3);X.restore()});
 g.obs.forEach(function(o){var a=slope(o.y)+(o.fl?0:(lx(o.lane)-o.x)*.012)+(o.rot||0);X.save();X.translate(sx(o.y)+o.x,o.y);X.rotate(a);X.translate(-o.x,-o.y);drawVeh(o);X.restore()});
 if(g.am&&g.am.st=='run'){var A=g.am;X.save();X.translate(sx(A.y)+A.x,A.y);X.rotate(slope(A.y));X.translate(-A.x,-A.y);drawAmb(A);X.restore()}
 drawPlayer();
 // partikel
 g.pt.forEach(function(q){var a=cl(q.l/q.m,0,1);X.globalCompositeOperation=q.a?'lighter':'source-over';X.fillStyle='rgba('+q.c+','+(a*(q.a?1:.45))+')';X.beginPath();X.arc(q.x,q.y,q.s*(q.a?a:2-a),0,7);X.fill()});
 X.globalCompositeOperation='source-over';
 // garis kecepatan
 var sl=cl((g.speed-300)/260,0,.55);
 if(sl>.02){X.strokeStyle='rgba(255,255,255,'+sl*.5+')';X.lineWidth=1.5;X.beginPath();for(var i=0;i<16;i++){var lx2=(i*67+13)%W,ly=((i*131+g.off*2.2)%(H+120))-60;X.moveTo(lx2,ly);X.lineTo(lx2,ly+30+g.speed/9)}X.stroke()}
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
  OX.globalCompositeOperation='source-over';
  X.drawImage(O,0,0,W,H);
  // lampu belakang
  if(d>.05){X.globalCompositeOperation='lighter';
   g.obs.forEach(function(v){if(v.fl)return;var c=v.br>0?'rgba(255,40,40,.95)':'rgba(255,40,40,.6)';X.fillStyle=c;var by=v.y+v.h/2;
    X.fillStyle='rgba(255,60,60,'+.25*g.w+')';X.fillRect((v.x+sx(v.y))-v.w/2+3,by,5,28*g.w);X.fillRect((v.x+sx(v.y))+v.w/2-8,by,5,28*g.w);X.fillStyle=c;if(v.t=='motor'){X.fillRect((v.x+sx(v.y))-2,by-3,4,3)}else{X.fillRect((v.x+sx(v.y))-v.w/2+2,by-4,7,4);X.fillRect((v.x+sx(v.y))+v.w/2-9,by-4,7,4)}});
   g.dec.forEach(function(e){if(e.t=='tiang'){var r3=X.createRadialGradient(e.ex,e.y,1,e.ex,e.y,22);r3.addColorStop(0,'rgba(255,220,130,'+d*.9+')');r3.addColorStop(1,'rgba(255,200,100,0)');X.fillStyle=r3;X.fillRect(e.ex-22,e.y-22,44,44)}});
   X.globalCompositeOperation='source-over'}
 }
 if(g.am&&g.am.st=='run'){var A2=g.am,fx=Math.floor(g.t*8)%2,ax=A2.x+sx(A2.y);X.globalCompositeOperation='lighter';var gl=X.createRadialGradient(ax,A2.y-20,2,ax,A2.y-20,60);gl.addColorStop(0,fx?'rgba(255,40,40,.5)':'rgba(40,100,255,.5)');gl.addColorStop(1,'rgba(0,0,0,0)');X.fillStyle=gl;X.fillRect(ax-60,A2.y-80,120,120);X.globalCompositeOperation='source-over'}
 if(dusk>0){X.fillStyle='rgba(255,110,30,'+dusk*.2+')';X.fillRect(0,0,W,H)}
 if(g.w>.05){X.fillStyle='rgba(60,75,90,'+g.w*.22+')';X.fillRect(0,0,W,H);
  if(g.w>.5){X.strokeStyle='rgba(200,220,255,'+(.15+g.w*.3)+')';X.lineWidth=1;X.beginPath();
   var n=Math.floor(g.rain.length*g.w);for(var k=0;k<n;k++){var r=g.rain[k];X.moveTo(r.x,r.y);X.lineTo(r.x+3,r.y-14)}X.stroke()}}
 if(g.flash>0){X.fillStyle='rgba(255,255,255,'+g.flash+')';X.fillRect(0,0,W,H)}
 var vg=X.createRadialGradient(W/2,H*.55,H*.35,W/2,H*.55,H*.8);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,'+(.3+d*.25+(g.boosting?.2:0))+')');X.fillStyle=vg;X.fillRect(-20,-20,W+40,H+40);
 X.restore();
 hud();ambHud();
}
function bar(x,y,w,v,c,lab){X.fillStyle='rgba(0,0,0,.55)';X.fillRect(x,y,w,9);X.fillStyle=c;X.fillRect(x,y,w*cl(v/100,0,1),9);X.fillStyle='#fff';X.font='bold 9px Verdana';X.textAlign='left';X.fillText(lab,x,y-3)}
function hud(){
 var g=G;X.textAlign='left';X.fillStyle='rgba(0,0,0,.45)';X.fillRect(0,0,W,52);
 var h=Math.floor(g.clock)%24,m=Math.floor((g.clock%1)*60/10)*10;
 X.fillStyle='#fff';X.font='bold 20px Verdana';
 X.fillText((h<10?'0':'')+h+':'+(m<10?'0':'')+m,10,24);
 var d=dark(g.clock),per=d>.9?'Malam':d<.1?'Siang':(g.clock%24>=12?'Senja':'Subuh');
 X.font='11px Verdana';X.fillStyle='#ffd166';X.fillText(per+' · '+g.wName,10,43);
 X.textAlign='right';X.fillStyle='#fff';X.font='bold 20px Verdana';X.fillText(score(),W-10,24);
 speedo();
 bar(100,22,70,g.fuel,g.fuel<25?'#ff4d4d':'#2dc653','BBM');
 bar(100,41,70,g.nitro,'#ff7b00','NITRO');
 X.textAlign='center';X.font='16px Verdana';
 for(var i=0;i<3;i++){X.fillStyle=i<g.hp?'#ff4d6d':'#444';X.fillText('\u2665',W/2+20+i*16,24)}
 g.pop.forEach(function(q){X.globalAlpha=cl(q.l,0,1);X.fillStyle='#ffd166';X.font='bold 14px Verdana';X.textAlign='center';X.fillText(q.t,q.x,q.y);X.globalAlpha=1});
}

/* ---------- loop & kontrol ---------- */
var last=0;
function loop(ts){
 var dt=Math.min(.05,(ts-last)/1000||0);last=ts;
 if(G&&G.on){update(dt);if(G)draw()}
 requestAnimationFrame(loop);
}
var AC=null;
function beep(){try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();[420,520].forEach(function(f){var o=AC.createOscillator(),k=AC.createGain();o.type='square';o.frequency.value=f;k.gain.setValueAtTime(.06,AC.currentTime);k.gain.exponentialRampToValueAtTime(.001,AC.currentTime+.45);o.connect(k);k.connect(AC.destination);o.start();o.stop(AC.currentTime+.45)})}catch(e){}}
function honk(){
 if(!G||!G.on||G.hk>0)return;G.hk=.6;beep();vib(20);
 G.pop.push({x:G.px,y:PY-60,t:'Tiiin!',l:.9});
 G.obs.forEach(function(o){
  if(o.fl||o.y>=PY||PY-o.y>340||Math.abs(o.x-G.px)>LW*.8)return;
  var big=o.t=='bus'||o.t=='truk';
  if(big){
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
function showMenu(h,body,btn){
 M.innerHTML='<h1>'+h+'</h1><p>'+body+'</p><button id="go">'+btn+'</button>';
 M.style.display='flex';
 document.getElementById('go').onclick=start;
}
function start(){reset();M.style.display='none';NB.style.display='block';HB.style.display='block';draw()}
function setTx(e){var r=C.getBoundingClientRect();if(G)G.tx=cl((e.clientX-r.left)/r.width*W,RX+16,RX+LW*N-16)}
C.addEventListener('pointerdown',function(e){ptr=e.pointerId;setTx(e)});
C.addEventListener('pointermove',function(e){if(ptr===e.pointerId)setTx(e)});
window.addEventListener('pointerup',function(e){if(ptr===e.pointerId)ptr=null});
HB.addEventListener('pointerdown',function(e){e.stopPropagation();honk()});
NB.addEventListener('pointerdown',function(e){e.stopPropagation();boost=true});
['pointerup','pointercancel','pointerleave'].forEach(function(n){NB.addEventListener(n,function(){boost=false})});
window.addEventListener('keydown',function(e){keys[e.key]=true;if(e.key=='h'||e.key=='H')honk();if(e.key==' ')e.preventDefault()});
window.addEventListener('keyup',function(e){keys[e.key]=false});
reset();G.on=false;draw();
showMenu('PANTURA RUSH','Salip bus, truk, angkot, motor, dan becak di jalur Pantura. Siang berganti malam, cerah berganti hujan.<br><br>Geser jari di layar untuk menyetir (atau tombol panah). Tahan tombol NITRO untuk ngebut (atau Spasi). Tekan KLAKSON (atau H) agar kendaraan di depan minggir. Lewati kendaraan dengan jarak tipis untuk isi nitro dan BBM.<br><span class="s">Rekor: '+best+'</span>','Mulai');
requestAnimationFrame(loop);
if('serviceWorker' in navigator)window.addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){})});
})();
