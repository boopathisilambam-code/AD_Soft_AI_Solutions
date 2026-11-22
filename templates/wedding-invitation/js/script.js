var $=function(s){return document.querySelector(s)};
function fl(s){return '<svg class="f" viewBox="-50 -50 100 100"><use href="#'+s+'"/></svg>'}
// gallery crops of the photo
var G=[['50% 8%','230%','Flower arch'],['50% 50%','300%','Sea view'],['22% 74%','300%','Lanterns & steps'],['50% 100%','230%','Petal aisle']];
$('#gal').innerHTML=G.map(function(g){return '<div class="ph" style="--p:'+g[0]+';--s:'+g[1]+'"><em>'+g[2]+'</em></div>'}).join('');
document.querySelectorAll('.ph,.cp').forEach(function(p){p.addEventListener('pointermove',function(e){var r=p.getBoundingClientRect();p.style.setProperty('--t',((e.clientX-r.left)/r.width-.5)*16+'deg');p.style.setProperty('--u',-((e.clientY-r.top)/r.height-.5)*16+'deg')});p.addEventListener('pointerleave',function(){p.style.setProperty('--t','0deg');p.style.setProperty('--u','0deg')})});
// petals
function petals(n){for(var i=0;i<n;i++){var d=document.createElement('div');d.className='petal';d.style.left=Math.random()*100+'vw';d.style.setProperty('--dx',(Math.random()*200-100)+'px');d.style.setProperty('--r',(Math.random()*720)+'deg');d.style.animationDuration=(5+Math.random()*5)+'s';d.style.animationDelay=Math.random()*1.5+'s';d.innerHTML=fl(Math.random()>.5?'rose':'pink');document.body.appendChild(d);setTimeout(function(x){x.remove()},12000,d)}}
var v=$('#vid');
$('#openBtn').onclick=function(){$('#gate').classList.add('open');document.body.classList.remove('locked');petals(24);try{v.play()}catch(e){}};
// scroll motion
var veil=$('#veil'),fxs=document.querySelectorAll('.fx'),tk=false;
function onS(){var y=scrollY,h=innerHeight,p=Math.min(1.4,y/h);v.style.transform='scale('+(1.05+p*.16)+') translateY('+(-p*5)+'%)';veil.style.opacity=Math.min(1,Math.max(0,(p-.35)*1.7));
fxs.forEach(function(e){e.style.translate='0 '+(-(y*(+e.dataset.s))%160)+'px'});tk=false}
addEventListener('scroll',function(){if(!tk){tk=true;requestAnimationFrame(onS)}},{passive:true});onS();
// tilt
var card=$('#card');
function tilt(x,y){card.style.setProperty('--ry',x*12+'deg');card.style.setProperty('--rx',-y*10+'deg')}
addEventListener('pointermove',function(e){tilt(e.clientX/innerWidth-.5,e.clientY/innerHeight-.5)});
addEventListener('deviceorientation',function(e){if(e.gamma!=null)tilt(Math.max(-1,Math.min(1,e.gamma/40))/2,Math.max(-1,Math.min(1,(e.beta-45)/40))/2)});
// countdown
var T=new Date('2027-02-15T07:30:00+05:30').getTime();
function cd(){var d=Math.max(0,T-Date.now()),a=[[Math.floor(d/864e5),'Days'],[Math.floor(d%864e5/36e5),'Hours'],[Math.floor(d%36e5/6e4),'Minutes'],[Math.floor(d%6e4/1e3),'Seconds']];$('#cd').innerHTML=a.map(function(x){return '<div><b>'+x[0]+'</b><small>'+x[1]+'</small></div>'}).join('')}
cd();setInterval(cd,1000);
document.querySelectorAll('.fl').forEach(function(b){b.onclick=function(){b.classList.toggle('on')}});
// rsvp
var att=true;
$('#yes').onclick=function(){att=true;$('#yes').classList.add('on');$('#no').classList.remove('on')};
$('#no').onclick=function(){att=false;$('#no').classList.add('on');$('#yes').classList.remove('on')};
$('#send').onclick=function(){var n=$('#nm').value.trim(),o=$('#ok');o.style.display='block';if(!n){o.textContent='Please enter your name.';return}o.textContent=att?'Thank you, '+n+'. We can’t wait to celebrate with you.':'Thank you, '+n+'. You will be missed.';if(att)petals(20)};
var msg='You are warmly invited to the wedding of Karthik & Meenakshi on 15 February 2027, Chennai. ';
$('#wa').href='https://wa.me/?text='+encodeURIComponent(msg+location.href);
$('#cp').onclick=function(){var b=$('#cp');try{navigator.clipboard.writeText(location.href).then(function(){b.textContent='Link copied'},function(){b.textContent='Copy not allowed'})}catch(e){b.textContent='Copy not allowed'}};
var C=[['50% 8%','230%'],['50% 50%','300%'],['22% 74%','300%'],['50% 100%','230%'],['85% 30%','300%'],['10% 20%','300%']];
var bt=C.map(function(c){return '<i style="--p:'+c[0]+';--s:'+c[1]+'"></i>'}).join('');$('#belt').innerHTML=bt+bt;
var J=[['2019','First hello','A chance meeting that turned into long talks.',1],['2020','Coffee dates','Every weekend became ours.',4],['2022','Sunset walks','The sea became our favourite place.',2],['2024','The proposal','One question, one happy yes.',0],['2026','Engagement','Both families came together.',5],['2027','Wedding day','Forever begins by the sea.',3]];
var jh=J.map(function(j){var c=C[j[3]];return '<div class="jc"><div class="im" style="--p:'+c[0]+';--s:'+c[1]+'"></div><div class="tx"><small>'+j[0]+'</small><b>'+j[1]+'</b><p>'+j[2]+'</p></div></div>'}).join('');$('#trk').innerHTML=jh+jh;
// footer touch
var sh=$('#shore');sh.addEventListener('pointerdown',function(e){var r=sh.getBoundingClientRect(),d=document.createElement('div');d.className='rip';d.style.left=(e.clientX-r.left)+'px';d.style.top=(e.clientY-r.top)+'px';sh.appendChild(d);setTimeout(function(){d.remove()},1600);petals(8)});
function applyBase(data){
  var groom=data.groom||'Karthik',bride=data.bride||'Meenakshi';
  var names=document.querySelector('.names');names.textContent='';
  var amp=document.createElement('span');amp.className='amp';amp.textContent='&';
  names.append(document.createTextNode(groom),amp,document.createTextNode(bride));
  document.querySelectorAll('.cp h3').forEach(function(e,i){e.textContent=i?bride:groom});
  document.querySelector('.shore p').firstChild.textContent='With love and blessings · '+groom+' & '+bride+' ';
  if(data.invitationMessage)document.querySelector('.hero .inv').textContent=data.invitationMessage;
  if(data.venue){
    document.querySelector('.where').textContent=data.venue;
    var venueSummary=document.querySelector('.vn').parentElement.querySelector('.sub');if(venueSummary)venueSummary.textContent=data.venue;
  }
  if(data.weddingDate){
    var date=new Date(data.weddingDate+'T00:00:00');
    if(!isNaN(date.getTime())){
      document.querySelector('.date').textContent=date.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
      T=new Date(data.weddingDate+'T'+(data.weddingTime||'12:00')+':00+05:30').getTime();cd();
    }
  }
}
/* ---------- extended, fully editable content ---------- */
var BASE=location.href;
function U(x){if(!x)return '';if(/^(https?:|data:|blob:|\/\/)/i.test(x))return x;try{return new URL(x,BASE).href}catch(e){return x}}
function E(t,c,x){var n=document.createElement(t);if(c)n.className=c;if(x!=null)n.textContent=x;return n}
var MS=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'],DS=['SUN','MON','TUE','WED','THU','FRI','SAT'],LAST={};
function chg(k,v){var j=JSON.stringify(v);if(LAST[k]===j)return false;LAST[k]=j;return true}
function applyExtra(d){
  document.querySelectorAll('[data-b]').forEach(function(n){var k=n.getAttribute('data-b');if(d[k]!=null)n.textContent=d[k]});
  var par=document.querySelectorAll('.cp p');if(d.groomParents!=null&&par[0])par[0].textContent=d.groomParents;if(d.brideParents!=null&&par[1])par[1].textContent=d.brideParents;
  var root=document.documentElement;
  if(d.mainPhoto)root.style.setProperty('--img','url("'+U(d.mainPhoto)+'")');
  var pts=document.querySelectorAll('.pt');
  [d.groomPhoto,d.bridePhoto].forEach(function(src,i){if(src&&pts[i])pts[i].style.setProperty('--pic','url("'+U(src)+'")')});
  if(Array.isArray(d.gallery)&&chg('gal',d.gallery)){
    var g=$('#gal');g.innerHTML='';
    var list=d.gallery.filter(function(x){return x&&x.src});
    list.forEach(function(x){var ph=E('div','ph');ph.style.background='url("'+U(x.src)+'") center/cover no-repeat';if(x.alt)ph.appendChild(E('em','',x.alt));g.appendChild(ph)});
    if(!list.length)g.innerHTML=G.map(function(c){return '<div class="ph" style="--p:'+c[0]+';--s:'+c[1]+'"><em>'+c[2]+'</em></div>'}).join('');
  }
  if(Array.isArray(d.journey)&&chg('jr',d.journey)){
    var tk=$('#trk');tk.innerHTML='';
    var html=document.createElement('div');
    d.journey.forEach(function(j,i){var c=E('div','jc'),im=E('div','im'),cr=C[i%C.length];
      if(j.image)im.style.background='url("'+U(j.image)+'") center/cover no-repeat';else{im.style.setProperty('--p',cr[0]);im.style.setProperty('--s',cr[1])}
      var tx=E('div','tx');tx.appendChild(E('small','',j.year||''));tx.appendChild(E('b','',j.title||''));tx.appendChild(E('p','',j.description||''));c.appendChild(im);c.appendChild(tx);html.appendChild(c)});
    tk.innerHTML=html.innerHTML+html.innerHTML;
  }
  if(Array.isArray(d.events)&&chg('ev',d.events)){
    var ev=$('#evList');ev.innerHTML='';
    d.events.forEach(function(x){var dt=new Date((x.date||'')+'T00:00:00'),ok=!isNaN(dt.getTime());
      var r=E('div','evc'),a=E('div','dt');a.appendChild(E('b','',ok?dt.getDate():''));a.appendChild(E('small','',ok?MS[dt.getMonth()]+' · '+DS[dt.getDay()]:''));
      var b=document.createElement('div');b.appendChild(E('h3','',x.title||''));b.appendChild(E('p','tm',x.time||''));
      if(x.place)b.appendChild(E('p','',x.place));if(x.note)b.appendChild(E('p','',x.note));r.appendChild(a);r.appendChild(b);ev.appendChild(r)});
  }
  if(Array.isArray(d.schedule)&&chg('sch',d.schedule)){
    var t=$('#schTbl');t.innerHTML='';
    d.schedule.forEach(function(x){var dt=new Date((x.date||'')+'T00:00:00'),tr=document.createElement('tr'),a=document.createElement('td'),b=E('td','',x.time||'');
      a.appendChild(document.createTextNode(x.title||''));if(!isNaN(dt.getTime()))a.appendChild(E('small','',dt.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short',year:'numeric'})));
      tr.appendChild(a);tr.appendChild(b);t.appendChild(tr)});
  }
  var vi=$('#vInfo');
  if(vi&&chg('vi',[d.address,d.parking,d.arriveBy,d.helpPhone])){
    vi.innerHTML='';[['Address',d.address],['Parking',d.parking],['Please arrive by',d.arriveBy],['Help on the day',d.helpPhone]].forEach(function(x){
      if(!x[1])return;if(vi.firstChild)vi.appendChild(document.createElement('br'));vi.appendChild(E('b','',x[0]+':'));vi.appendChild(document.createTextNode(' '+x[1]))});
  }
  var q=d.mapQuery||d.address||d.venue;
  if(q){$('#mapOpen').href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q);$('#mapDir').href='https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(q);
    var mf=document.querySelector('.vn iframe'),mu='https://maps.google.com/maps?q='+encodeURIComponent(q)+'&z=14&output=embed';if(mf&&mf.getAttribute('data-u')!==mu){mf.setAttribute('data-u',mu);mf.src=mu}}
  var nm=((d.groom||'')+' & '+(d.bride||''));
  msg='You are warmly invited to the wedding of '+nm+' on '+$('.date').textContent+', '+(d.venue||'')+'. ';$('#wa').href='https://wa.me/?text='+encodeURIComponent(msg+location.href);
  document.title=nm+' – Wedding Invitation';
}
function applyInvitation(d){d=d||{};applyBase(d);applyExtra(d)}
/* RSVP reaches the host's dashboard when opened as a real invitation */
var RID=0;
$('#send').addEventListener('click',function(){var n=$('#nm').value.trim();if(!n||window.parent===window)return;RID='r'+Date.now();
  window.parent.postMessage({type:'inv:rsvp',id:RID,payload:{name:n,attendance:att?'Joyfully Accepts':'Regretfully Declines',guests:parseInt($('#gs').value,10)||1}},location.origin)});
window.addEventListener('message',function(event){
  if(event.source!==window.parent||event.origin!==location.origin||!event.data)return;
  var m=event.data;
  if(m.type==='inv:data'){if(m.base)BASE=m.base;applyInvitation(m.data||{})}
  else if(m.type==='inv:rsvp:result'&&m.id===RID&&!m.ok){$('#ok').textContent=m.error||'Could not send your reply. Please try again.'}
  else if(m.type==='inv:scrollTo'&&typeof m.selector==='string'&&!document.body.classList.contains('locked')){try{var t=document.querySelector(m.selector);if(t)t.scrollIntoView({behavior:'smooth',block:'start'})}catch(x){}}
});
if(window.parent!==window)window.parent.postMessage({type:'inv:ready'},location.origin);

if(new URLSearchParams(location.search).get('skip')==='1'){setTimeout(function(){var b=document.getElementById('openBtn');if(b)b.click()},50)}
