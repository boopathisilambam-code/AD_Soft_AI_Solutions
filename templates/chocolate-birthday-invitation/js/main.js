var root=document.documentElement,v=document.getElementById('v'),hero=document.getElementById('hero'),snd=document.getElementById('snd'),tap=document.getElementById('tap');
var QS=new URLSearchParams(location.search),EMB=window.parent!==window,CARD=QS.get('card')==='1',PREV=QS.get('embed')==='preview',SKIP=QS.get('skip')==='1',INV={};
function still(){hero.style.background="url('assets/hero-end.jpg') center/cover no-repeat";v.style.display='none'}
if(CARD||SKIP)still();
if(!CARD){v.src=v.getAttribute('data-src');v.preload='auto'}
v.addEventListener('error',function(){v.style.display='none';hero.classList.add('done','reveal')});
root.classList.add('locked');
v.addEventListener('ended',function(){hero.classList.add('done');snd.hidden=true;root.classList.remove('locked')});
function start(){v.muted=false;v.play().catch(function(){v.muted=true;v.play().then(function(){snd.hidden=false}).catch(function(){tap.style.display='flex'})})}
snd.onclick=function(){v.muted=false;snd.hidden=true};
tap.firstElementChild.onclick=function(){tap.style.display='none';v.muted=false;v.play()};
window.addEventListener('scroll',function(){if(root.classList.contains('locked'))scrollTo(0,0)});
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.15});
document.querySelectorAll('.rv').forEach(function(el){io.observe(el)});
/* marquee duplicate */
var jt=document.getElementById('jt');function dupJourney(){jt.innerHTML=jt.dataset.base||jt.innerHTML;jt.dataset.base=jt.innerHTML;jt.innerHTML+=jt.dataset.base}dupJourney();
/* countdown */
var T=new Date('2026-12-20T17:00:00+05:30');
function tick(){var n=Math.max(0,T-new Date()),f=function(i,x){document.getElementById(i).textContent=x};f('d',Math.floor(n/864e5));f('h',Math.floor(n/36e5)%24);f('m',Math.floor(n/6e4)%60);f('s',Math.floor(n/1e3)%60)}
tick();setInterval(tick,1000);
/* game */
var g=document.getElementById('grid'),msg=document.getElementById('msg'),cells=[],M,path,draw,won,mt;
function bfs(m){var q=[[6,0,1]],seen={'6,0':1};while(q.length){var a=q.shift(),y=a[0],x=a[1];if(m[y][x]=='G')return a[2];[[1,0],[-1,0],[0,1],[0,-1]].forEach(function(d){var ny=y+d[0],nx=x+d[1],k=ny+','+nx;if(ny<0||ny>6||nx<0||nx>5||seen[k]||m[ny][nx]=='B')return;seen[k]=1;q.push([ny,nx,a[2]+1])})}return -1}
function gen(){var m,L,t=0;do{m=[];for(var y=0;y<7;y++){var r='';for(var x=0;x<6;x++)r+=(y==6&&x==0)?'C':(y==0&&x==5)?'G':(Math.random()<.34?'B':'.');m.push(r)}L=bfs(m);t++}while(L<0||(L<13&&t<300));return m}
function mood(m,ms){var k=document.getElementById('kitty');if(!k)return;k.dataset.m=m;clearTimeout(mt);if(ms)mt=setTimeout(function(){k.dataset.m=won?'win':draw?'draw':'idle'},ms)}
function build(){g.innerHTML='';cells=[];M.forEach(function(r,y){for(var x=0;x<6;x++){var d=document.createElement('div'),t=r[x];d.className='c'+(t=='B'?' b':t=='G'?' g':t=='C'?' k':'');d.dataset.x=x;d.dataset.y=y;if(t=='C')d.innerHTML='<div id="kitty" class="kit" data-m="idle">'+document.getElementById('catT').innerHTML+'</div>';g.appendChild(d);cells.push(d)}})}
function at(x,y){return cells[y*6+x]}
function paint(){cells.forEach(function(c){c.classList.remove('p','w')});path.forEach(function(p,i){if(i)at(p[0],p[1]).classList.add(won?'w':'p')})}
function reset(){M=gen();path=[[0,6]];draw=false;won=false;msg.textContent='';build();paint();var c=document.getElementById('choc');if(c)c.classList.remove('yum')}
function step(c){if(!c||!c.classList||!c.classList.contains('c')||won)return;var x=+c.dataset.x,y=+c.dataset.y,l=path[path.length-1];if(Math.abs(x-l[0])+Math.abs(y-l[1])!=1)return;if(c.classList.contains('b')){mood('oops',1000);return}
var q=path[path.length-2];if(q&&q[0]==x&&q[1]==y)path.pop();else if(path.some(function(p){return p[0]==x&&p[1]==y}))return;else path.push([x,y]);
if(M[y][x]=='G'){won=true;mood('win');msg.textContent=INV.gameWin||'Yum! The kitty got the chocolate 🍫😻';document.getElementById('choc').classList.add('yum')}paint()}
function pt(e){return document.elementFromPoint(e.clientX,e.clientY)}
g.addEventListener('pointerdown',function(e){var c=pt(e);c=c&&c.closest&&c.closest('.c');if(!c||won)return;var l=path[path.length-1];if(+c.dataset.x==l[0]&&+c.dataset.y==l[1]){draw=true;mood('draw')}else step(c)});
g.addEventListener('pointermove',function(e){if(draw){var c=pt(e);if(c&&c.closest)step(c.closest('.c'))}});
addEventListener('pointerup',function(){if(draw){draw=false;if(!won)mood('idle')}});
document.getElementById('rs').onclick=reset;
/* travelling chocolate */
var ch=document.getElementById('choc'),W=[],K=[],TL=[],tk=false;
v.addEventListener('ended',function(){ch.classList.add('show')});
function R(el){var t=0,l=0,e=el;while(e){t+=e.offsetTop;l+=e.offsetLeft;e=e.offsetParent}return{l:l,t:t,w:el.offsetWidth,h:el.offsetHeight}}
function calc(){var hh=R(hero);W=[{x:hh.l+hh.w*.2,y:hh.t+hh.h*.82,s:62}];
[['s-date',.84,64,66],['s-tl',.12,72,60],['s-venue',.86,84,64],['s-dress',.12,62,60],['s-jr',.86,70,66],['s-gal',.12,60,62]].forEach(function(a){var r=R(document.getElementById(a[0]));W.push({x:r.l+r.w*a[1],y:r.t+a[2],s:a[3]})});
var gc=R(document.querySelector('.c.g'));W.push({x:gc.l+gc.w/2,y:gc.t+gc.h/2,s:gc.w*.95});
var n=W.length;K=W.map(function(w,j){return w.y-innerHeight*(j==n-1?.8:.5)});TL=W.map(function(w,j){return j==n-1?0:(j%2?-10:10)})}
function sm(t){return t*t*(3-2*t)}
function target(){var n=W.length,s=pageYOffset,i=0;while(i<n-1&&s>=K[i+1])i++;var j=Math.min(i+1,n-1),e=0;
if(i<n-1){var u=Math.max(0,Math.min(1,(s-K[i])/(K[i+1]-K[i])));e=sm(Math.max(0,Math.min(1,(u-.15)/.7)))}
var a=W[i],b=W[j];return{x:a.x+(b.x-a.x)*e+Math.sin(e*Math.PI)*36,y:a.y+(b.y-a.y)*e,z:a.s+(b.s-a.s)*e,r:(i+e)*220+TL[i]*(1-e)+TL[j]*e}}
var cur=null,lt=0;
function loop(now){requestAnimationFrame(loop);if(!W.length)return;var T=target(),dt=Math.min(.05,(now-lt)/1000||.016);lt=now;if(!cur)cur=T;var f=1-Math.exp(-dt*7);
['x','y','z','r'].forEach(function(k){cur[k]+=(T[k]-cur[k])*f;if(Math.abs(T[k]-cur[k])<.05)cur[k]=T[k]});
ch.style.width=ch.style.height=cur.z+'px';ch.style.transform='translate3d('+(cur.x-cur.z/2)+'px,'+(cur.y-cur.z/2)+'px,0) rotate('+cur.r+'deg)'}
requestAnimationFrame(loop);
addEventListener('resize',calc);addEventListener('load',calc);
if(window.ResizeObserver)new ResizeObserver(calc).observe(document.body);
reset();calc();
v.addEventListener('timeupdate',function(){var r=v.duration-v.currentTime;if(r<1.7){hero.classList.add('reveal');ch.classList.add('show')}if(!v.muted&&r<1.2){try{v.volume=Math.max(0,r/1.2)}catch(e){}}});
v.addEventListener('ended',function(){hero.classList.add('reveal')});
/* intro gate */
var gate=document.getElementById('gate'),g0=document.getElementById('gc0'),gOn=false;
function openGate(){if(gOn)return;gOn=true;v.muted=false;v.play().then(function(){v.pause();v.currentTime=0}).catch(function(){});
g0.classList.add('open');document.getElementById('gh0').textContent='';var w=g0.parentNode,c=['#b5924f','#3b2412','#dd8c95','#8fc6dd','#f2d79b'];
for(var i=0;i<18;i++){var d=document.createElement('i'),a=Math.random()*6.28,r=90+Math.random()*110;d.className='cf';d.style.cssText='--dx:'+Math.cos(a)*r+'px;--dy:'+Math.sin(a)*r+'px;background:'+c[i%5];w.appendChild(d)}
setTimeout(function(){gate.classList.add('out');if(CARD)finishIntro();else{start();if(PREV)root.classList.remove('locked')}},2500);setTimeout(function(){gate.remove()},3700)}
function finishIntro(){hero.classList.add('done','reveal');ch.classList.add('show');snd.hidden=true;root.classList.remove('locked');if(window.calc)calc()}
if(SKIP){gate.remove();finishIntro()}
if(PREV)v.addEventListener('ended',function(){root.classList.remove('locked')});
g0.onclick=openGate;g0.onkeydown=function(e){if(e.key=='Enter'||e.key==' '){e.preventDefault();openGate()}};
/* greeting card */
var gc=document.getElementById('gc');
function togg(){var o=gc.classList.toggle('open');gc.setAttribute('aria-expanded',o);document.getElementById('gh').textContent=o?'Tap the card to close':'Tap the card to open';if(o)burst()}
gc.onclick=togg;gc.onkeydown=function(e){if(e.key=='Enter'||e.key==' '){e.preventDefault();togg()}};
function burst(){var w=gc.parentNode,c=['#b5924f','#3b2412','#dd8c95','#8fc6dd','#f2d79b'];for(var i=0;i<18;i++){var d=document.createElement('i'),a=Math.random()*6.28,r=90+Math.random()*110;d.className='cf';d.style.cssText='--dx:'+Math.cos(a)*r+'px;--dy:'+Math.sin(a)*r+'px;background:'+c[i%5];w.appendChild(d);setTimeout(function(x){x.remove()},1300,d)}}
/* RSVP */
var att='Joyfully Accepts 🎉',WA='919876543210',rid=0;
document.querySelectorAll('.opt').forEach(function(o){o.onclick=function(){document.querySelectorAll('.opt').forEach(function(x){x.classList.remove('sel')});o.classList.add('sel');att=o.dataset.v}});
document.getElementById('rb').onclick=function(){var n=document.getElementById('rn').value.trim(),t=document.getElementById('rt');if(!n){t.textContent='Please enter your name 🙂';return}
var m=document.getElementById('rm').value.trim(),g=document.getElementById('rg').value,txt="RSVP – "+(INV.title||"Mithra's Birthday Bash")+" ("+(INV.dateText||'20 Dec 2026')+")\nName: "+n+"\nResponse: "+att+"\nGuests: "+g+(m?"\nMessage: "+m:'');
if(WA||!EMB){var a=document.createElement('a');a.href='https://wa.me/'+(WA||'919876543210')+'?text='+encodeURIComponent(txt);a.target='_blank';a.rel='noopener';document.body.appendChild(a);a.click();a.remove();t.textContent='Thank you, '+n+'! Opening WhatsApp to send your reply 🎉'}
else{rid='r'+Date.now();t.textContent='Sending…';window.parent.postMessage({type:'inv:rsvp',id:rid,payload:{name:n,attendance:att,guests:g,message:m}},location.origin)}};
addEventListener('message',function(e){var d=e.data||{};if(e.source!==window.parent||d.type!=='inv:rsvp:result'||d.id!==rid)return;document.getElementById('rt').textContent=d.ok?'Thank you! Your reply has been sent 🎉':(d.error||'Could not send your reply. Please try again.')});
