(()=>{'use strict';

const env=document.getElementById('env'),seal=document.getElementById('seal');
for(let i=0;i<22;i++){const p=document.createElement('i');p.className='petal';p.style.cssText=`left:${Math.random()*100}%;animation-duration:${6+Math.random()*8}s;animation-delay:${-Math.random()*10}s`;env.prepend(p)}
seal.onclick=()=>{env.classList.add('open');setTimeout(()=>env.classList.add('zoom'),2200);setTimeout(()=>{env.classList.add('gone');document.body.classList.remove('lock')},2600)};

const bs=[...document.querySelectorAll('#cd b')];
function cdTick(){tick()}function tick(){let d=Math.max(0,(new Date(window.__T||0)-Date.now())),v=[Math.floor(d/864e5),Math.floor(d/36e5)%24,Math.floor(d/6e4)%60,Math.floor(d/1e3)%60];bs.forEach((b,i)=>b.textContent=v[i])}
tick();setInterval(tick,1000);
document.body.insertAdjacentHTML('beforeend','<svg width="0" height="0" style="position:absolute"><symbol id="fl" viewBox="0 0 100 100"><g fill="currentColor"><ellipse cx="50" cy="22" rx="14" ry="22"/><ellipse cx="50" cy="22" rx="14" ry="22" transform="rotate(72 50 50)"/><ellipse cx="50" cy="22" rx="14" ry="22" transform="rotate(144 50 50)"/><ellipse cx="50" cy="22" rx="14" ry="22" transform="rotate(216 50 50)"/><ellipse cx="50" cy="22" rx="14" ry="22" transform="rotate(288 50 50)"/></g><circle cx="50" cy="50" r="9" fill="#d9b46a"/></symbol></svg>');
document.querySelectorAll('.hero,.flw').forEach(s=>{const n=s.classList.contains('hero')?14:6;for(let i=0;i<n;i++){const z=50+Math.random()*110,e=document.createElementNS('http://www.w3.org/2000/svg','svg');e.setAttribute('class','fx');e.innerHTML='<use href="#fl"/>';e.style.cssText=`width:${z}px;height:${z}px;left:${Math.random()*92}%;top:${Math.random()*90}%;animation-delay:${-Math.random()*8}s`;s.appendChild(e)}});
const couple='<svg viewBox="0 0 100 100" fill="#fff"><circle cx="36" cy="34" r="11"/><circle cx="64" cy="34" r="11"/><path d="M16 80c0-18 9-27 20-27s20 9 20 27zM44 80c0-18 9-27 20-27s20 9 20 27z"/></svg>';

const cv=document.getElementById('sc'),cx=cv.getContext('2d');let dn=false,fin=false;
function foil(){cv.width=cv.offsetWidth;cv.height=cv.offsetHeight;const g=cx.createLinearGradient(0,0,cv.width,cv.height);g.addColorStop(0,'#8d5fd8');g.addColorStop(.5,'#d9b46a');g.addColorStop(1,'#5b2ea6');cx.fillStyle=g;cx.fillRect(0,0,cv.width,cv.height);cx.fillStyle='#fff';cx.font='italic 26px Cormorant Garamond,serif';cx.textAlign='center';cx.fillText('Scratch here',cv.width/2,cv.height/2+8)}
foil();
function sc(e){if(!dn||fin)return;const r=cv.getBoundingClientRect();cx.globalCompositeOperation='destination-out';cx.beginPath();cx.arc(e.clientX-r.left,e.clientY-r.top,24,0,7);cx.fill()}
cv.onpointerdown=e=>{dn=true;cv.setPointerCapture(e.pointerId);sc(e)};cv.onpointermove=sc;
cv.onpointerup=()=>{dn=false;const d=cx.getImageData(0,0,cv.width,cv.height).data;let c=0;for(let i=3;i<d.length;i+=16)if(!d[i])c++;if(c/(d.length/16)>.45){fin=true;cv.style.opacity=0;cv.style.pointerEvents='none'}};
/* trending effects */
const B=document.body;
B.insertAdjacentHTML('beforeend','<div id="pb"></div><div id="fz"></div><div id="dock"></div>');
const txt='Arjun ♥ Meera ✦ 14 . 02 . 2027 ✦ Save the Date ✦ ',mk=(c)=>`<div class="mq ${c}"><div>${txt.repeat(6)}</div></div>`;
document.querySelector('.gal').insertAdjacentHTML('beforebegin','<div class="mqw">'+mk('')+mk('r')+'</div>');
const gl=['🦋','💍','🌸','✨','💜','🪷','🕊️','🦋','🌷','✨','💐','💜'],fz=document.getElementById('fz'),its=gl.map((g,i)=>{const e=document.createElement('b');e.textContent=g;const o={e,x:Math.random()*92,b:Math.random()*1000,s:.12+Math.random()*.5,z:16+Math.random()*22,p:Math.random()*6};e.style.fontSize=o.z+'px';e.style.opacity=.35+o.s*.7;fz.appendChild(e);return o});
const pb=document.getElementById('pb');let tk=false;
function fr(){tk=false;const sy=scrollY,H=innerHeight+120,m=document.documentElement.scrollHeight-innerHeight;pb.style.width=(m>0?sy/m*100:0)+'%';const t=Date.now()/1000;its.forEach(o=>{const y=(((o.b-sy*o.s)%H)+H)%H-60,x=o.x*innerWidth/100+Math.sin(t+o.p)*18;o.e.style.transform=`translate3d(${x}px,${y}px,0) rotate(${Math.sin(t*.8+o.p)*18}deg)`})}
addEventListener('scroll',()=>{if(!tk){tk=true;requestAnimationFrame(fr)}},{passive:true});
(function l(){fr();requestAnimationFrame(l)})();
const ss=[...document.querySelectorAll('section')],dk=document.getElementById('dock');
[['📅',0],['🕰️',1],['📍',3],['💞',4],['🎁',5]].forEach(([i,n])=>{const b=document.createElement('button');b.textContent=i;b.onclick=()=>ss[n].scrollIntoView({behavior:'smooth'});dk.appendChild(b)});
document.querySelectorAll('.arch,.c,.pic').forEach(el=>{el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;el.style.transition='transform .1s';el.style.transform=`perspective(700px) rotateY(${x*14}deg) rotateX(${-y*14}deg) scale(1.03)`});el.addEventListener('pointerleave',()=>{el.style.transition='transform .6s';el.style.transform=''})});
let lt=0;addEventListener('pointermove',e=>{const n=Date.now();if(n-lt<45)return;lt=n;const s=document.createElement('span');s.className='sp';s.textContent='✦';s.style.left=e.clientX+'px';s.style.top=e.clientY+'px';B.appendChild(s);setTimeout(()=>s.remove(),900)});
/* remove emojis, add live butterfly */
its.length=0;fz.innerHTML='';
for(let i=0;i<10;i++){const e=document.createElementNS('http://www.w3.org/2000/svg','svg'),z=22+Math.random()*34;e.innerHTML='<use href="#fl"/>';e.style.cssText=`position:absolute;left:0;top:0;width:${z}px;height:${z}px;color:${i%3?'#9c6ee8':'#c9b3f0'};opacity:.35`;fz.appendChild(e);its.push({e,x:Math.random()*92,b:Math.random()*1000,s:.1+Math.random()*.35,z,p:Math.random()*6})}
dk.innerHTML='';
[['Date',0],['Plan',1],['Venue',3],['Story',4],['Gift',5]].forEach(([n,i])=>{const b=document.createElement('button');b.textContent=n;b.style.cssText='width:auto;height:38px;padding:0 .9rem;border-radius:20px;font:400 .72rem Jost,sans-serif;letter-spacing:.08em;color:#fff';b.onclick=()=>ss[i].scrollIntoView({behavior:'smooth'});dk.appendChild(b)});
document.querySelectorAll('.mq div').forEach(d=>d.textContent=d.textContent.replace(/\u2665/g,'&'));
B.insertAdjacentHTML('beforeend',`<div id="bf"><svg viewBox="0 0 200 200"><defs>
<radialGradient id="g1" cx=".95" cy=".7" r="1"><stop offset="0" stop-color="#d9bcff"/><stop offset=".4" stop-color="#8a55d8"/><stop offset=".8" stop-color="#4a1f94"/><stop offset="1" stop-color="#1b0a3a"/></radialGradient>
<radialGradient id="g2" cx=".95" cy=".1" r="1"><stop offset="0" stop-color="#ecd9ff"/><stop offset=".4" stop-color="#a070ec"/><stop offset=".8" stop-color="#4a1f94"/><stop offset="1" stop-color="#1b0a3a"/></radialGradient>
<g id="w"><path d="M98 94C84 62 48 30 14 36C6 52 16 84 52 100C72 104 90 100 98 98Z" fill="url(#g1)" stroke="#1b0a3a" stroke-width="3" stroke-linejoin="round"/><path d="M98 100C76 100 46 106 34 130C34 160 66 172 84 150C92 138 97 118 98 106Z" fill="url(#g2)" stroke="#1b0a3a" stroke-width="3" stroke-linejoin="round"/><ellipse cx="62" cy="74" rx="22" ry="8" transform="rotate(-28 62 74)" fill="#f0e2ff" opacity=".22"/><g fill="none" stroke="#fff" stroke-opacity=".3" stroke-width=".8"><path d="M98 94C70 70 40 50 16 40M98 96C70 84 40 80 20 70M98 98C70 96 44 96 30 90M98 102C70 112 50 130 38 140M98 104C80 125 70 145 70 160"/></g><g fill="#fff" opacity=".85"><circle cx="22" cy="44" r="2.2"/><circle cx="18" cy="57" r="2"/><circle cx="26" cy="71" r="2"/><circle cx="40" cy="87" r="1.8"/><circle cx="42" cy="142" r="2"/><circle cx="44" cy="154" r="2"/><circle cx="58" cy="162" r="2"/><circle cx="74" cy="158" r="1.8"/></g></g></defs>
<g id="wl"><use href="#w"/></g><g id="wr"><use href="#w" transform="translate(200 0) scale(-1 1)"/></g>
<ellipse cx="100" cy="104" rx="3.6" ry="28" fill="#1b0a3a"/><ellipse cx="100" cy="84" rx="5.5" ry="9" fill="#2a1250"/><circle cx="100" cy="71" r="4.6" fill="#1b0a3a"/><g stroke="#1b0a3a" stroke-width="1.4" fill="none"><path d="M98 68C92 50 84 42 78 37M102 68C108 50 116 42 122 37"/></g><circle cx="78" cy="37" r="2" fill="#1b0a3a"/><circle cx="122" cy="37" r="2" fill="#1b0a3a"/></svg></div>`);
(function(){return;
const bf=document.getElementById('bf'),WL=document.getElementById('wl'),WR=document.getElementById('wr');WL.style.transformOrigin=WR.style.transformOrigin='100px 100px';
const AN=[['.arch',.84,.07],['#cd .dbox:nth-child(2)',.8,.02],['.tl .ev:nth-child(2) i',.5,.1],['.mq.r',.72,.05],['.venue iframe',.93,.0],['.jt:nth-child(1) .pic',.78,.1],['.scr',.1,.0],['footer .btn',.7,.0]].map(([s,fx,fy])=>[document.querySelector(s),fx,fy]);
let go=false,x=0,y=0,a=0,ph=0,amp=.4,sm=0,cur=-1,last=performance.now();const SZ=innerWidth<600?54:70;bf.style.width=bf.style.height=SZ+'px';
new MutationObserver(()=>{if(!go&&env.classList.contains('zoom')){go=true;x=innerWidth+60;y=-40;bf.style.opacity=1}}).observe(env,{attributes:true,attributeFilter:['class']});
function P(i){const[e,fx,fy]=AN[i],r=e.getBoundingClientRect();return[r.left+r.width*fx,r.top+r.height*fy]}
function L(now){requestAnimationFrame(L);const dt=Math.min(.05,(now-last)/1000);last=now;if(!go||!dt)return;const vh=innerHeight,vw=innerWidth;
let bi=-1,bd=1e9,cd=1e9;AN.forEach((q,i)=>{if(!q[0])return;const d=Math.abs(P(i)[1]-vh*.42);if(d<bd){bd=d;bi=i}if(i===cur)cd=d});if(cur<0||bd<cd-90)cur=bi;
let[tx,ty]=P(cur);ty-=SZ*.3;tx=Math.max(40,Math.min(vw-40,tx));ty=Math.max(70,Math.min(vh-110,ty));
const k=1-Math.exp(-dt*2.4);let vx=(tx-x)*k,vy=(ty-y)*k;const m=Math.hypot(vx,vy),mx=dt*850;if(m>mx){vx*=mx/m;vy*=mx/m}x+=vx;y+=vy;
sm+=(m/dt-sm)*.12;const fl=sm>45;amp+=((fl?.85:.4)-amp)*.1;
ph+=(fl?24:(now%5200<450?15:1.6))*dt;const s=1-amp*(.5-.5*Math.cos(ph));WL.style.transform=WR.style.transform='scaleX('+s+')';
const tr=fl?Math.max(-55,Math.min(55,vx/(Math.abs(vx)+Math.abs(vy)+.01)*60)):-10+Math.sin(now/1400)*3;a+=(tr-a)*.08;
const f=Math.min(1,sm/300),wx=fl?Math.sin(now/95)*10*f:0,wy=fl?Math.cos(now/70)*6*f:Math.sin(now/1200)*.8;
bf.style.transform=`translate3d(${x-SZ/2+wx}px,${y-SZ/2+wy}px,0) rotate(${a}deg)`}
requestAnimationFrame(L)})();
/* natural butterfly v2 */
(function(){if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;
const bf=document.getElementById('bf'),WL=document.getElementById('wl'),WR=document.getElementById('wr'),SZ=innerWidth<600?84:112,$=s=>document.querySelector(s),R=e=>e.getBoundingClientRect(),PI=Math.PI;
bf.style.width=bf.style.height=SZ+'px';WL.style.transformOrigin=WR.style.transformOrigin='100px 100px';
const arch=(e,deg,r)=>{const b=R(e),rr=r||220*Math.min(1,b.width/440),t=deg*PI/180;return[b.left+b.width/2+rr*Math.sin(t),b.top+rr*(1-Math.cos(t))]};
const txt=(s,fx)=>{const rg=document.createRange();rg.selectNodeContents($(s));const b=rg.getBoundingClientRect();return[b.left+b.width*fx,b.top+b.height*.22]};
const A=[()=>arch($('.arch'),50),()=>{const b=R($('#cd .dbox:nth-child(3)'));return[b.left+b.width*.7,b.top+3]},()=>{const b=R($('.tl .ev:nth-child(2) i'));return[b.left+b.width/2,b.top+b.height*.3]},()=>txt('.gal .t',.9),()=>{const b=R($('.venue iframe'));return[b.right-30,b.top+4]},()=>{const e=$('.jt:nth-child(1) .pic');return arch(e,48,R(e).width/2)},()=>{const b=R($('.scr'));return[b.left+26,b.top+4]},()=>txt('footer .script',.8)];
const Pt=i=>{try{return A[i]()}catch(e){return[-999,-999]}};
let go=false,x=0,y=0,vx=0,vy=0,a=200,ph=0,amp=.4,cur=-1,st='fly',dir=1,lsy=scrollY,last=performance.now();
new MutationObserver(()=>{if(!go&&env.classList.contains('open')){const sr=R($('#seal'));go=true;x=sr.left+sr.width*.74;y=sr.top+sr.height*.12;vx=70;vy=-380;a=-14;st='fly';bf.style.zIndex=105;setTimeout(()=>bf.style.zIndex=85,3400)}}).observe(env,{attributes:true,attributeFilter:['class']});
function L(now){requestAnimationFrame(L);const dt=Math.min(.05,(now-last)/1000);last=now;if(!go||!dt)return;const vh=innerHeight,vw=innerWidth;
const d0=scrollY-lsy;if(d0>.5)dir=1;else if(d0<-.5)dir=-1;lsy=scrollY;
let bi=cur,bd=1e9,cd=1e9;A.forEach((q,i)=>{const d=Math.abs(Pt(i)[1]-vh*.42);if(d<bd){bd=d;bi=i}if(i===cur)cd=d});
if(cur<0)cur=bi;else if(bi!==cur&&bd<cd-90){cur=bi;st='fly';vy-=150}
let[tx,ty]=Pt(cur);ty-=SZ*.08;const cx=Math.max(40,Math.min(vw-40,tx)),cy=Math.max(70,Math.min(vh-110,ty)),on=cx===tx&&cy===ty;
if(st==='perch'){x=tx;y=ty;vx=vy=0}else{vx+=((cx-x)*9-vx*4.2)*dt;vy+=((cy-y)*9-vy*4.2)*dt;const m=Math.hypot(vx,vy);if(m>900){vx*=900/m;vy*=900/m}x+=vx*dt;y+=vy*dt;if(on&&Math.hypot(tx-x,ty-y)<12&&m<90){st='perch'}}
const sp=Math.hypot(vx,vy),fly=st==='fly',f=fly?Math.min(1,sp/260):0;
let hd;if(fly&&sp>60)hd=Math.atan2(vx,-vy)*180/PI;else hd=fly?a:(dir>=0?175:5)+Math.sin(now/1700)*5;
hd+=fly?Math.sin(now/260)*10*f:0;
const dd=((hd-a+540)%360)-180;a+=dd*(1-Math.exp(-dt*(fly?4:2)));
const gl=fly&&Math.sin(now/1100+1)>.75;amp+=((fly?(gl?.25:.88):.4)-amp)*.12;
ph+=(fly?(gl?3:22):(now%5200<450?15:1.6))*dt;const s=1-amp*(.5-.5*Math.cos(ph));WL.style.transform=WR.style.transform='scaleX('+s+')';
let ox=0,oy=Math.sin(now/1300)*.6;if(fly&&sp>1){const w=Math.sin(now/340)*16*f+Math.sin(now/170)*5*f;ox=-vy/sp*w;oy=vx/sp*w+Math.sin(ph)*5*f}
bf.style.transform=`translate3d(${x-SZ/2+ox}px,${y-SZ/2+oy}px,0) rotate(${a}deg)`}
requestAnimationFrame(L)})();
/* butterfly resting on the seal */
(function(){if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;
const bf=document.getElementById('bf'),WL=document.getElementById('wl'),WR=document.getElementById('wr'),sl=document.getElementById('seal'),SZ=innerWidth<600?84:112;
bf.style.width=bf.style.height=SZ+'px';bf.style.zIndex=105;bf.style.opacity=1;WL.style.transformOrigin=WR.style.transformOrigin='100px 100px';
let ph=0,last=performance.now();
function P(now){if(env.classList.contains('open'))return;requestAnimationFrame(P);const dt=Math.min(.05,(now-last)/1000);last=now;const r=sl.getBoundingClientRect(),b=now%4200<700;ph+=(b?16:1.7)*dt;const s=1-(b?.8:.45)*(.5-.5*Math.cos(ph));WL.style.transform=WR.style.transform='scaleX('+s+')';bf.style.transform=`translate3d(${r.left+r.width*.74-SZ/2}px,${r.top+r.height*.12-SZ/2+Math.sin(now/1200)*1.5}px,0) rotate(${-14+Math.sin(now/1500)*3}deg)`}
requestAnimationFrame(P)})();
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('on')}}),{threshold:.2});
document.querySelectorAll('.rv,.date').forEach(el=>io.observe(el));

/* ===== data layer (platform) ===== */
const params=new URLSearchParams(location.search),origin=location.origin,embedded=window.parent!==window&&origin!=='null';
let D=null,base=document.baseURI;
const $1=s=>document.querySelector(s),send=m=>{if(embedded)window.parent.postMessage(m,origin)};
const safe=v=>{if(!v)return'';try{const u=new URL(v,base);return['http:','https:','data:','blob:'].includes(u.protocol)?u.href:''}catch(e){return''}};
const mix=(h,t,k)=>{const p=x=>[1,3,5].map(i=>parseInt(x.slice(i,i+2),16)),a=p(h),b=p(t);return'#'+a.map((v,i)=>Math.round(v+(b[i]-v)*k).toString(16).padStart(2,'0')).join('')};
const el=(t,c,x)=>{const n=document.createElement(t);if(c)n.className=c;if(x!=null)n.textContent=x;return n};
const bgImg=(n,u)=>{n.style.backgroundImage=`url("${u.replace(/"/g,'%22')}")`};
function render(){
  const g=k=>D[k]==null?'':D[k],dt=new Date(g('weddingDate')+'T12:00:00'),ok=!isNaN(dt),
    long=ok?dt.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}):'',
    compact=ok?dt.toLocaleDateString('en-GB',{day:'2-digit',month:'2-digit',year:'numeric'}).split('/').join(' . '):'',
    couple=`${g('groom')} & ${g('bride')}`,B={...D,coupleLine:couple,dateLong:long};
  document.querySelectorAll('[data-bind]').forEach(n=>{const v=B[n.dataset.bind];if(v!=null)n.textContent=v});
  document.title=couple+' | Wedding Invitation';
  window.__T=ok?`${g('weddingDate')}T${g('weddingTime')||'09:00'}:00${g('utcOffset')||'+05:30'}`:0;
  const pc=/^#[\da-f]{6}$/i.test(D.primaryColor||'')?D.primaryColor:'#7a4bc4',ac=/^#[\da-f]{6}$/i.test(D.accentColor||'')?D.accentColor:'#d9b46a',rs=document.documentElement.style;
  rs.setProperty('--vio',pc);rs.setProperty('--deep',mix(pc,'#000000',.52));rs.setProperty('--lav',mix(pc,'#ffffff',.62));rs.setProperty('--gold',ac);
  const mt=`${couple} \u2726 ${compact} \u2726 ${g('marqueeText')} \u2726 `;document.querySelectorAll('.mq div').forEach(d=>d.textContent=mt.repeat(6));
  const tl=$1('#tl');tl.replaceChildren();(D.events||[]).forEach(e=>{const n=el('div','ev rv');n.append(el('i'),el('time','',e.time),el('h3','',e.title),el('p','',e.description));tl.append(n);io.observe(n)});
  const tr=$1('#track');tr.replaceChildren();const gl=D.gallery&&D.gallery.length?D.gallery:[];for(let k=0;k<2;k++)gl.forEach((p,i)=>{const n=el('div','ph p'+(i%5+1),p.alt);const u=safe(p.src);if(u)bgImg(n,u);tr.append(n)});
  const jr=$1('#jr');jr.replaceChildren();(D.journey||[]).forEach((it,i)=>{const n=el('div','jt rv'),pic=el('div','pic'),ph=(D.journeyPhotos||[])[i],u=safe(ph&&ph.src);pic.innerHTML=couple_svg;if(u){bgImg(pic,u);pic.classList.add('has')}const tx=el('div');tx.append(el('em','',it.year),el('h3','',it.title),el('p','',it.description));n.append(pic,tx);jr.append(n);io.observe(n)});
  const ct=$1('#contact');ct.replaceChildren();String(g('contactLines')).split('\n').forEach((l,i)=>{if(i)ct.append(el('br'));ct.append(document.createTextNode(l))});
  const q=g('mapQuery')||`${g('venueName')} ${g('venueAddress')}`,mu=`https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`,mf=$1('#map');if(mf.dataset.u!==mu){mf.dataset.u=mu;mf.src=mu}
  $1('#mapLink').href=`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  $1('#rsvp').hidden=D.rsvpEnabled===false;
  const wa=String(g('whatsapp')).replace(/\D/g,''),wb=$1('#wa');wb.hidden=!wa;if(wa)wb.href=`https://wa.me/${wa}?text=${encodeURIComponent('We will attend your wedding')}`;
  const au=$1('#audio'),mu2=safe(D.music&&D.music.url);let mb=$1('#musicBtn');
  if(mu2){if(au.getAttribute('src')!==mu2)au.src=mu2;if(!mb){mb=el('button','','Music');mb.id='musicBtn';mb.style.cssText='width:auto;height:38px;padding:0 .9rem;border-radius:20px;font:400 .72rem Jost,sans-serif;letter-spacing:.08em;color:#fff';mb.onclick=()=>{au.paused?au.play().catch(()=>{}):au.pause()};dk.append(mb)}}
  else{au.pause();au.removeAttribute('src');if(mb)mb.remove()}
  cdTick();
}
const couple_svg=couple;
addEventListener('message',e=>{if(!embedded||e.source!==window.parent||e.origin!==origin)return;const m=e.data||{};
  if(m.type==='inv:data'&&m.data){if(m.base)base=m.base;const first=!D;D=m.data;render();if(first&&params.get('skip')==='1'){env.classList.add('open','zoom','gone');env.style.display='none';document.body.classList.remove('lock')}}
  else if(m.type==='inv:open'){if(!env.classList.contains('open'))seal.click()}
  else if(m.type==='inv:scrollTo'&&m.selector){const t=$1(m.selector);if(t)t.scrollIntoView({behavior:'smooth',block:'start'})}
  else if(m.type==='inv:rsvp:result'){const b=$1('#rsvpForm button'),s=$1('#success');b.disabled=false;b.textContent='Send RSVP';s.textContent=m.ok?'Thank you! Your RSVP has been received.':(m.error||'Could not send. Please try again.');s.classList.add('show');if(m.ok)$1('#rsvpForm').reset()}});
$1('#rsvpForm').addEventListener('submit',e=>{e.preventDefault();const f=e.currentTarget;if(!f.reportValidity())return;const b=$1('button',f),p=Object.fromEntries(new FormData(f).entries());b.disabled=true;b.textContent='Sending...';
  if(embedded)send({type:'inv:rsvp',id:Date.now()+'-'+Math.random(),payload:p});else{b.disabled=false;b.textContent='Send RSVP';$1('#success').textContent='Thank you, '+p.name+'!';$1('#success').classList.add('show');f.reset()}});
send({type:'inv:ready'});
})();
