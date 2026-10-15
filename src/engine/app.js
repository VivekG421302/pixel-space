// Interactive engine: timer, tasks, calendar, roaming buddy, banner library, garden editor,
// tile manager, sprite-sheet slicer and pixel creator.
// It was ported from the original single-file build and attaches to the markup rendered by the
// React components in src/components. Image data now lives in src/assets and src/data.
import SHEET from '../assets/cats.png';
import SAGA from '../assets/saga.png';
import ATLAS from '../assets/atlas.png';
import { META } from '../data/atlasMeta.js';
import { getTalk } from '../data/funFacts.js';
import { BUILTIN_TS, SPRITE_TYPES, gardenDto, imageDataToMatrix, spriteDto, taskDto, userDto } from '../data/dto.js';
import { pwa, promptInstall } from '../pwa.js';

let started = false;

export function initApp() {
  if (started) return;
  started = true;
  const $=s=>document.querySelector(s),LS=k=>{try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}},SV=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}};
  const MODES={pomo:{n:'POMODORO',f:25,b:5,c:['#78c850','#68b840','#48a030']},r52:{n:'52/17',f:52,b:17,c:['#68b8e8','#58a8d8','#3878c8']},u90:{n:'90-MIN',f:90,b:20,c:['#a890d0','#9880c0','#6850a0']},tbx:{n:'TIMEBOX',f:60,b:10,c:['#f8a050','#e89040','#d06820']},cus:{n:'CUSTOM',f:30,b:10,c:['#b8b8a8','#a8a898','#707868']}};
  const DK={play:' ',reset:'r',skip:'s',mode:'m',task:'n',tabs:'t',sound:'x',menu:',',garden:'g',banner:'b',dark:'d'};
  let S=Object.assign({mode:'pomo',snd:true,vol:60,pet:'cat3',dur:{},tasks:[],custom:null,banner:'default',cover:null,kb:true,auto:false,keys:{},theme:'leaf',scheme:'light',a11y:{},talk:{}},LS('focusquest')||{},{cover:LS('fq_cover'),custom:LS('fq_custom')});{const sk=S.keys||{};S.keys={...DK,...sk};if(!sk.menu&&sk.settings)S.keys.menu=sk.settings;delete S.keys.settings;delete S.keys.about;if(S.theme==='night'){S.theme='leaf';S.scheme='dark'}S.a11y={font:'pixel',text:'normal',contrast:'normal',motion:'auto',...S.a11y};S.talk={on:true,mode:'both',...S.talk}}
  const save=()=>{const{cover,custom,...r}=S;SV('focusquest',r);SV('fq_custom',custom);return SV('fq_cover',cover)};
  const dur=m=>({f:S.dur[m]?.f??MODES[m].f,b:S.dur[m]?.b??MODES[m].b});
  let phase='focus',left=dur(S.mode).f*60,run=false,endAt=0,tick;
  const total=()=>dur(S.mode)[phase==='focus'?'f':'b']*60;

  /* ---- 8-bit audio ---- */
  let AC;const ctx=()=>AC||(AC=new (window.AudioContext||window.webkitAudioContext)());
  function tone(f,t,d,type='square',g=.12){if(!S.snd)return;const c=ctx(),o=c.createOscillator(),v=c.createGain(),s=c.currentTime+t;o.type=type;o.frequency.value=f;v.gain.setValueAtTime(g*S.vol/100,s);v.gain.setValueAtTime(g*S.vol/100,s+d*.7);v.gain.linearRampToValueAtTime(.0001,s+d);o.connect(v).connect(c.destination);o.start(s);o.stop(s+d+.02)}
  const click=()=>tone(1046,0,.05),check=()=>{tone(784,0,.1);tone(1175,.1,.2)},meow=()=>{tone(880,0,.08);tone(660,.08,.14)};
  const done=()=>[523,659,784,1047,0,784,1047,1319].forEach((f,i)=>f&&tone(f,i*.14,.18));

  /* ---- sprite definitions (cat sheet: 10x10 cells of 56x62) ---- */
  const CW=56,CH=62,FOOT=5;
  const BASES={cat1:[0,20],cat2:[30,25],cat3:[50,70],cat4:[80,75]}; // [base for poses 0-19, base for poses 20-24]
  const pi=(k,p)=>{const[b,e]=BASES[k];return p<20?b+p:e+p-20};
  function catDef(k,n){const f=a=>a.map(p=>pi(k,p));return{n,src:SHEET,cols:10,rows:10,cw:CW,ch:CH,face:-1,walk:f([2,3,4,14]),idle:f([7,8]),sleep:f([12]),jump:f([20,13,6]),happy:f([9,17]),groom:f([18,16]),wave:f([24]),stretch:f([22])}}
  const PETS={cat1:catDef('cat1','SNOW'),cat2:catDef('cat2','SHADOW'),cat3:catDef('cat3','GINGER'),cat4:catDef('cat4','TUXEDO')};
  const SG_NAMES={12:'FAIRY',23:'SNOWMAN',31:'ELEPHANT'};
  function sagaDef(r){const b=r*7,f=a=>a.map(k=>b+k);return{n:SG_NAMES[r]||'SAGA '+String(r+1).padStart(2,'0'),src:SAGA,cols:7,rows:32,cw:32,ch:32,face:-1,foot:0,tz:2,walk:f([3,4,5,4]),idle:f([1]),sleep:f([r===9?1:6]),jump:f([4,5,4]),happy:f([0,2]),groom:f([0,1]),wave:f([0,2]),stretch:f([1])}}
  for(let r=0;r<32;r++)PETS['sg'+r]=sagaDef(r);
  const pdef=()=>S.pet==='custom'&&S.custom?S.custom:PETS[S.pet]||PETS.cat3;

  /* ---- roaming buddy: walks panel edges, hops between them, reacts to the UI ---- */
  const el=$('#pet'),bub=$('#bub');
  const P={x:0,y:-999,lid:null,st:'idle',t:0,tx:0,dir:-1,hold:1,jt:null,after:null,bt:0,bs:'',bp:0,pend:null,nt:6};
  let L=[],lastL=-1e9,sc=2,SH=124,lastPos='';
  const rnd=(a,b)=>a+Math.random()*(b-a);
  function size(){sc=innerWidth<640?1.5:2;const p=pdef();SH=p.ch*sc;Object.assign(el.style,{width:p.cw*sc+'px',height:SH+'px',backgroundImage:`url(${p.src})`,backgroundSize:`${p.cols*p.cw*sc}px ${p.rows*p.ch*sc}px`});lastPos=''}
  function ledges(){L=[...document.querySelectorAll('[data-l]')].map(e=>{const r=e.getBoundingClientRect();return{id:e.dataset.l,e,x1:r.left+12,x2:r.right-12,y:r.top}}).filter(l=>l.x2-l.x1>30&&l.y>SH&&l.y<innerHeight-4);L.push({id:'floor',e:null,x1:12,x2:innerWidth-12,y:innerHeight-6})}
  function cur(){const l=L.find(l=>l.id===P.lid);if(!l)return null;if(l.e){const r=l.e.getBoundingClientRect();l.x1=r.left+12;l.x2=r.right-12;l.y=r.top}else{l.x1=12;l.x2=innerWidth-12;l.y=innerHeight-6}return l}
  function hop(id,tx,after){const l=L.find(l=>l.id===id)||L[0|rnd(0,L.length)];if(!l)return;const x2=Math.max(l.x1,Math.min(l.x2,tx??rnd(l.x1+15,l.x2-15)));
   P.jt={x1:P.x,y1:P.y,x2,id:l.id,t:0,d:Math.min(.6,.34+Math.hypot(x2-P.x,l.y-P.y)/1100)};P.st='jump';P.after=after||null;P.dir=x2>=P.x?1:-1}
  const MAXJ=()=>70*sc;
  function go(id,tx,after,tries){if(P.st==='jump'||P.st==='held'||P.st==='fall')return false;const l=L.find(l=>l.id===id);if(!l||id===P.lid)return false;
   if(Math.abs(l.y-P.y)>300)return false;
   const nx=Math.max(l.x1,Math.min(l.x2,P.x)),dx=nx-P.x,m=MAXJ();
   if(Math.abs(dx)<=m){let t=tx??nx+rnd(-m*.6,m*.6);t=Math.max(l.x1,Math.min(l.x2,t));t=Math.max(P.x-m,Math.min(P.x+m,t));hop(id,t,after);return true}
   if(tries)return false;const c=cur();if(!c)return false;
   P.tx=Math.max(c.x1,Math.min(c.x2,P.x+Math.sign(dx)*(Math.abs(dx)-m*.5)));P.pend={id,tx,after};P.st='walk';P.t=0;return true}
  const gap=l=>Math.abs(Math.max(l.x1,Math.min(l.x2,P.x))-P.x);
  function next(c){P.t=0;P.pend=null;if((P.hov||reducedMotion())&&phase!=='break'){P.st='idle';P.hold=P.hov?.8:8;return}const brk=phase==='break',busy=run&&phase==='focus';
   if(P.lid==='floor'&&!brk&&Math.random()<.4){const hi=L.filter(l=>l.id!=='floor').sort((a,b)=>b.y-a.y)[0];if(hi){go(hi.id)||hop(hi.id);return}}
   if(brk){if(P.lid!=='clock'){if(!go('clock'))hop('clock');return}P.tx=(c.x1+c.x2)/2+rnd(-30,30);return P.st='walk'}
   const r=Math.random(),oth=L.filter(l=>l.id!==P.lid&&l.id!=='floor'&&Math.abs(l.y-P.y)<=300).sort((a,b)=>gap(a)-gap(b)).slice(0,2);
   if(r<(busy?.15:.22)&&oth.length&&go(oth[0|rnd(0,oth.length)].id,undefined,undefined,Math.random()<.35?0:1))return;
   if(r<.7){P.tx=rnd(c.x1,c.x2);return P.st='walk'}
   if(r<.88){P.st='idle';P.hold=busy?rnd(.6,1.4):rnd(2,4);return}
   P.st='groom';P.hold=rnd(1.5,2.5)}
  function burst(x,y,ch){for(let i=0;i<10;i++){const s=document.createElement('span'),a=rnd(0,6.28),d=rnd(40,95);s.className='pt';s.textContent=ch[i%ch.length];s.style.cssText=`left:${x}px;top:${y}px;--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d-30}px;color:${['#e84860','#f8d030','#48c8f8','#fff'][i%4]}`;document.body.appendChild(s);setTimeout(()=>s.remove(),950)}
   const r=document.createElement('i');r.className='ring';r.style.cssText=`left:${x}px;top:${y}px`;document.body.appendChild(r);setTimeout(()=>r.remove(),600)}
  /* ---- speech bubbles: events > timer milestones > ambient chatter ---- */
  const pick=a=>a[0|Math.random()*a.length],REC=[];
  const fresh=a=>{const f=a.filter(x=>!REC.includes(x)),t=pick(f.length?f:a);REC.push(t);if(REC.length>9)REC.shift();return t};
  const IMGC=new Map(),HTC=new Map();
  function headTop(p,i){const k=p.src.length+':'+p.src.slice(-24)+':'+i;if(HTC.has(k))return HTC.get(k);
   let im=IMGC.get(p.src);if(!im){im=new Image();im.src=p.src;IMGC.set(p.src,im)}
   if(!im.complete||!im.naturalWidth)return 0;
   const w=Math.round(p.cw),h=Math.round(p.ch),c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d',{willReadFrequently:true});
   x.drawImage(im,(i%p.cols)*p.cw,Math.floor(i/p.cols)*p.ch,p.cw,p.ch,0,0,w,h);
   const d=x.getImageData(0,0,w,h).data;let t=h-1;
   o:for(let y=0;y<h;y++)for(let xx=0;xx<w;xx++)if(d[(y*w+xx)*4+3]>20){t=y;break o}
   HTC.set(k,t);return t}
  function talk(t,d,pr=1){if(P.bt>0&&pr<P.bp)return;P.bs=t;P.bt=d||Math.min(7,2.2+t.length*.07);P.bp=pr}
  const JOKES=['Why do programmers prefer dark mode? Light attracts bugs.','I told my timer a joke. It said it would get back to me in 25 minutes.','There are 10 kinds of people: those who get binary and those who do not.','Why did the cat sit on the laptop? To keep an eye on the mouse.','A SQL query walks into a bar, sees two tables and asks: can I join you?','My code works and I have no idea why. Nobody touch it.','Procrastination is just future-me\'s problem. Hi, future me!','Cats nap 12 to 16 hours a day. Goals.','Debugging: a detective story where you are also the culprit.','I would tell you a UDP joke, but you might not get it.','It works on my machine! Ship the machine.'];
  const FACTS=['Pomodoro is Italian for tomato, after a tomato-shaped kitchen timer.','The Pomodoro Technique was created by Francesco Cirillo in the late 1980s.','Cats have 32 muscles in each ear.','A group of cats is called a clowder.','The first computer bug was a real moth, found in 1947.','Octopuses have three hearts.','Honey never spoils. Edible honey has been found in ancient tombs.','We blink much less while staring at screens. Blink more!','Sunlight takes about 8 minutes to reach Earth.','Short breaks help your brain lock in what you just learned.','The 20-20-20 rule: every 20 min, look 20 feet away for 20 seconds.','Bananas are berries. Strawberries are not.'];
  const FOCUS=['Keep going. {m} min left.','One thing at a time.','Quiet mind, steady progress.','You have got this, trainer!','Stay with it. {m} min to go.','Deep breath, back to the task.'];
  const TIPS=['Drink some water.','Stand up and stretch.','Look far away for 20 seconds.','Roll your shoulders back.','Close your eyes for a minute.','Take a few deep breaths.','Walk around a little.'];
  const READY=['Ready when you are!','Pick a mission, then press start.','Tiny steps still count.','Press START when you are set.'];
  const tod=h=>h>=5&&h<12?'Good morning! Fresh brain, fresh start.':h>=12&&h<17?'Afternoon already? Sip some water.':h>=17&&h<21?'Good evening! Nice work today.':'It is getting late. Do not forget to rest!';
  function ambient(){if(document.hidden||P.bt>0||P.st==='jump'||P.st==='spin'||P.st==='held'||P.st==='fall')return;
   const r=Math.random(),m=Math.max(1,Math.ceil(left/60)),h=new Date().getHours();
   const pool=phase==='break'?(r<.45?TIPS:r<.75?JOKES:FACTS):run?(r<.4?FOCUS:r<.65?FACTS:r<.9?JOKES:[tod(h)]):(r<.3?READY:r<.55?JOKES:r<.8?FACTS:[tod(h)]);
   talk(fresh(pool).replace('{m}',m),null,1)}
  function react(k,x){if(!L.length||P.st==='held'||P.st==='fall')return;
   if(k==='task'){talk(pick(['Mission complete!','Nice one!','Another one down!','Well done!']),2.6,3);if(!go('tasks',x,'happy',1)){P.st='happy';P.t=0;P.hold=1.6;P.pend=null;burst(P.x,P.y-SH*.5,['★','♥'])}}
   else if(k==='play'){const f=phase==='focus';talk(left>=total()-1?(f?`Let's focus for ${Math.round(total()/60)} min!`:'Break time. Rest up!'):(f?'Back at it!':'Resuming your break.'),3,2);if(P.lid!=='clock')go('clock')}
   else if(k==='pause')talk('Paused. Take a breath.',2.4,2);
   else if(k==='skip')talk(phase==='break'?'Break time! Go rest.':'Back to work!',3,2);
   else if(k==='done'){talk(phase==='break'?pick(['Session done! Time to rest.','Great work! Take a break.','Break time! Stretch and breathe.']):pick(['Break is over. Let us go!','Rested? Back to focus.','Ready for the next round?']),5,3);P.pend=null;P.st='wave';P.t=0;P.hold=2.2;burst(P.x,P.y-SH*.5,['★','✦','♥'])}
   else if(k==='pet'){if(P.st==='sleep'){talk('Zzz...',1.6,2);burst(P.x,P.y-SH*.6,['z','Z'])}else if(P.st!=='jump'){talk(pick(['Meow!','Purr~','Nyaa!','♥']),1.6,2);P.st='spin';P.t=0;P.pend=null;burst(P.x,P.y-SH*.5,['♥','★','✦'])}}}
  el.onclick=()=>{meow();react('pet')};
  const RATE={walk:9,idle:1.5,groom:3,happy:6,sleep:.8,wave:4,stretch:1};
  let lastTs=0;
  function frame(ts){requestAnimationFrame(frame);const dt=Math.min(.05,(ts-lastTs)/1000||0);lastTs=ts;
   if(ts-lastL>200){ledges();lastL=ts}
   if(!L.length)return;
   const p=pdef();
   if(P.y===-999){const l=L.find(l=>l.id==='clock')||L[0];P.lid=l.id;P.x=(l.x1+l.x2)/2;P.y=l.y}
   P.t+=dt;if(P.bt>0)P.bt-=dt;P.nt-=dt;if(P.nt<=0){P.nt=rnd(16,30);ambient()}
   const brk=phase==='break',busy=run&&phase==='focus';let off=0,rot=0;
   if(P.st==='held'){rot=Math.sin(P.t*9)*9}
   else if(P.st==='fall'){P.vy+=1900*dt;P.y+=P.vy*dt;const l=L.find(l=>l.id===P.ft)||L[L.length-1];if(P.y>=l.y){P.y=l.y;P.lid=l.id;P.st='idle';P.t=0;P.hold=.8;talk(pick(['Oof!','Landed!','Meow!']),1.4,3);burst(P.x,P.y-6,['·','▪','·'])}}
   else if(P.st==='jump'){const j=P.jt,l=L.find(l=>l.id===j.id);
    if(!l){P.st='idle';P.lid=null;P.hold=.3}
    else{j.t+=dt/j.d;const k=Math.min(1,j.t);P.x=j.x1+(j.x2-j.x1)*k;const base=j.y1+(l.y-j.y1)*k,h=Math.max(0,Math.min(22+Math.abs(l.y-j.y1)*.12,40,base-SH-4));P.y=base-Math.sin(k*Math.PI)*h;
     if(k>=1){P.lid=l.id;P.y=l.y;P.t=0;P.hold=rnd(.4,1);P.st=P.after||'idle';if(P.after){P.hold=1.6;P.after=null;burst(P.x,P.y-SH*.5,['★','♥'])}}}}
   else{const c=cur();
    if(!c){const o=L.filter(l=>l.id!==P.lid);if(o.length)hop(o[0|rnd(0,o.length)].id)}
    else{P.y=c.y;P.x=Math.max(c.x1,Math.min(c.x2,P.x));if(P.hov&&P.st==='walk'){P.st='idle';P.t=0;P.hold=.6}
     if(brk&&P.st!=='sleep'&&P.st!=='walk'&&P.st!=='happy'&&P.st!=='wave')next(c);
     if(P.st==='walk'){const sp=(busy?100:62)*sc/2,d=P.tx-P.x;P.dir=d>=0?1:-1;P.x+=Math.sign(d)*Math.min(Math.abs(d),sp*dt);if(Math.abs(d)<3){if(P.pend){const q=P.pend;P.pend=null;if(!go(q.id,q.tx,q.after,1))next(c)}else if(brk&&P.lid==='clock'){P.st='sleep';P.t=0}else next(c)}}
     else if(P.st==='sleep'){off=Math.sin(P.t*2)*1.5;if(!brk){P.st='stretch';P.t=0;P.hold=1.1;P.bs='!';P.bt=1}}
     else if(P.st==='spin'){const k=Math.min(1,P.t/.9);off=-Math.sin(k*Math.PI)*46;rot=k*360*(P.dir>0?1:-1);if(P.t>.9)next(c)}
     else if(P.st==='happy'){off=-Math.abs(Math.sin(P.t*9))*14;if(P.t>P.hold)next(c)}
     else if(P.t>P.hold)next(c)}}
   const key=P.st==='spin'?'happy':P.st,list=(p[key]&&p[key].length?p[key]:P.st==='jump'?p.walk:p.idle);let i;
   if(P.st==='held')i=p.jump[0]??list[0];else if(P.st==='fall')i=p.jump[1]??list[0];else if(P.st==='jump'){const k=P.jt?Math.min(1,P.jt.t):0;i=p.jump[k<.3?0:k<.75?1:2]??list[0]}else i=list[Math.floor(P.t*(P.st==='spin'?10:RATE[P.st]||2))%list.length];
   const cc=i%p.cols,rr=Math.floor(i/p.cols),pos=`-${cc*p.cw*sc}px -${rr*p.ch*sc}px`;if(pos!==lastPos){el.style.backgroundPosition=pos;lastPos=pos}
   const fl=P.dir!==p.face?-1:1,tx=P.x-p.cw*sc/2,ty=P.y-SH+(p.foot??FOOT)*sc+off;
   el.style.transform=`translate(${tx}px,${ty}px) scaleX(${fl}) rotate(${rot}deg)`;
   const txt=P.bt>0?P.bs:P.st==='sleep'?'Z z z':'';
   if(txt){if(bub.textContent!==txt)bub.textContent=txt;bub.style.display='block';const w=bub.offsetWidth,hh=bub.offsetHeight,bx=Math.max(6,Math.min(innerWidth-w-6,P.x-w/2));bub.style.setProperty('--tx',Math.max(10,Math.min(w-10,P.x-bx))+'px');bub.style.transform=`translate(${bx}px,${Math.max(6,ty+headTop(p,i)*sc-hh-9)}px)`}else bub.style.display='none'}

  /* ---- dialog typewriter ---- */
  let tw,last='',annKey=null;function say(t){if(t===last)return;last=t;clearInterval(tw);const e=$('#status');if(reducedMotion()){e.textContent=t;return}let i=0;e.textContent='';tw=setInterval(()=>{e.textContent=t.slice(0,++i);if(i>=t.length)clearInterval(tw)},28)}

  /* ---- timer ---- */
  /* ---- themes (tokens live in index.css; grass colours are tinted here) ---- */
  const THEMES={leaf:{n:'LEAF'},berry:{n:'BERRY',g:['#ffb3cf',.5],a:['#d94c82',.55]}};
  const DARK={g:['#0b1510',.66],a:['#0b1510',.12]},SCHEMES={light:'LIGHT',dark:'DARK',auto:'AUTO'};
  const sysDark=matchMedia('(prefers-color-scheme: dark)'),isDark=()=>S.scheme==='dark'||(S.scheme==='auto'&&sysDark.matches);
  const tint=(h,t)=>t?hexOf(rgbOf(h).map((v,i)=>v+(rgbOf(t[0])[i]-v)*t[1])):h;
  const lum=h=>{const[r,g,b]=rgbOf(h).map(v=>{v/=255;return v<=.03928?v/12.92:((v+.055)/1.055)**2.4});return .2126*r+.7152*g+.0722*b};
  const ratio=(a,b)=>{const x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
  const fit=(h,against,min,toward)=>{let c=h;for(let i=0;i<24&&ratio(c,against)<min;i++)c=tint(c,[toward,.1]);return c}; // nudge a colour until it meets a WCAG contrast ratio
  function thUI(){const e=$('#ths');if(e)e.innerHTML=Object.entries(THEMES).map(([k,t])=>`<button class="gb sm ${S.theme===k?'on':''}" data-th="${k}" aria-pressed="${S.theme===k}">${t.n}</button>`).join('');const n=$('#mthn');if(n)n.textContent=(THEMES[S.theme]||THEMES.leaf).n;
   const d=$('#dks');if(d)d.innerHTML=Object.entries(SCHEMES).map(([k,l])=>`<button class="gb sm ${S.scheme===k?'on':''}" data-sc="${k}" aria-pressed="${S.scheme===k}">${l}</button>`).join('');const m=$('#mdkn');if(m)m.textContent=SCHEMES[S.scheme]||'LIGHT'}
  function thSet(k){if(!THEMES[k])return;S.theme=k;save();ui();thUI()}
  function schSet(k){if(!SCHEMES[k])return;S.scheme=k;save();ui();thUI()}
  const schemeNext=()=>{const ks=Object.keys(SCHEMES);schSet(ks[(ks.indexOf(S.scheme)+1)%ks.length])};
  $('#dks').onclick=e=>{const b=e.target.closest('[data-sc]');if(b){click();schSet(b.dataset.sc)}};
  sysDark.addEventListener&&sysDark.addEventListener('change',()=>{if(S.scheme==='auto')ui()});
  const themeNext=()=>{const ks=Object.keys(THEMES);thSet(ks[(ks.indexOf(S.theme)+1)%ks.length])};
  $('#ths').onclick=e=>{const b=e.target.closest('[data-th]');if(b){click();thSet(b.dataset.th)}};
  const Q={focusfalse:['A wild {m} session appeared! Press START (or Space) to begin.','Ready when you are, trainer.','Your buddy is stretching. Start the timer!','Pick a mission, then press START.'],focustrue:['Deep focus protocol active!','Keep going, trainer!','Your buddy is cheering you on.','Quiet mind, steady progress.'],breakfalse:['Break is ready. Press START to rest.','Time to recharge. Press START.','You earned this one.'],breaktrue:['Break time! Your buddy is napping.','Stretch, sip some water, breathe.','Rest up. The next round is coming.']};
  let qk='',qt='';function quip(k,m){if(k!==qk){qk=k;const a=Q[k];qt=a[0|Math.random()*a.length].replace('{m}',m.n)}return qt}
  function ui(){const m=MODES[S.mode],r=document.documentElement.style;
   const th=THEMES[S.theme]||THEMES.leaf,dk=isDark(),dg=dk&&DARK.g,da=dk&&DARK.a;document.documentElement.dataset.theme=THEMES[S.theme]?S.theme:'leaf';document.documentElement.dataset.scheme=dk?'dark':'light';r.setProperty('--g1',tint(tint(m.c[0],th.g),dg));r.setProperty('--g2',tint(tint(m.c[1],th.g),dg));{const ar=tint(tint(m.c[2],th.a),da),hc=S.a11y.contrast==='high',boxC=hc?(dk?'#000000':'#ffffff'):dk?'#262a35':S.theme==='berry'?'#fff3f7':'#f8f8f8';r.setProperty('--acc',fit(ar,'#ffffff',4.5,'#000000'));r.setProperty('--acc-text',dk?fit(ar,boxC,4.5,'#ffffff'):fit(ar,boxC,4.5,'#000000'))}
   const s=Math.max(0,Math.ceil(left)),mm=String(Math.floor(s/60)).padStart(2,'0'),ss=String(s%60).padStart(2,'0');$('#mm').textContent=mm;$('#ss').textContent=ss;$('#mm').style.fontSize=mm.length>2?'calc(var(--w)*.29)':'';$('#clock').classList.toggle('run',run);document.title=mm+':'+ss+' · Focus Quest';
   const pc=Math.max(0,Math.min(100,left/total()*100));$('#hpb').style.width=pc+'%';$('#hpb').style.background=pc>50?'#48d848':pc>20?'#f8d030':'#f85838';$('#hpl').textContent=phase==='focus'?'TIME LEFT':'BREAK LEFT';{const hp=$('.hp[role=progressbar]');hp.setAttribute('aria-valuenow',Math.round(pc));hp.setAttribute('aria-valuetext',`${+mm} minutes ${+ss} seconds left`);$('#clock').setAttribute('aria-label',`Time remaining: ${+mm} minutes ${+ss} seconds. ${phase==='focus'?'Focus':'Break'} ${run?'running':'paused'}`)}$('#badge').textContent=chiming?'DING!':phase==='focus'?'FOCUS':'REST';
   say(quip(phase+run,m));{const ak=phase+run;if(annKey!==null&&annKey!==ak)announce(run?(phase==='focus'?`Focus started. ${Math.round(total()/60)} minutes.`:'Break started.'):(annKey.endsWith('true')?'Paused.':phase==='focus'?'Ready to focus.':'Break ready.'));annKey=ak}
   $('#plabel').textContent=chiming?'WAIT':run?'PAUSE':(phase==='break'||left<total()?'RESUME':'START');
   $('#msel').value=S.mode;autoUI();pipUI()}
  const M={};
  function mile(){const t=total();
   if(phase==='focus'){if(!M.h&&t>=600&&left<=t/2){M.h=1;talk('Halfway there! Keep it up.',4,2)}
    if(!M.f&&t>=900&&left<=300){M.f=1;talk('5 minutes left. Finish strong!',4,2)}
    if(!M.l&&t>=180&&left<=60){M.l=1;talk('Last minute! Almost there.',4,2)}}
   else{if(!M.h&&t>=360&&left<=t/2){M.h=1;talk('Break is halfway done.',3.5,2)}
    if(!M.l&&t>=120&&left<=60){M.l=1;talk('One minute left. Get ready!',3.5,2)}}}
  function loop(){left=(endAt-Date.now())/1000;if(left<=0&&S.auto){left=0;run=false;clearInterval(tick);chimeThenNext();ui();return}if(left<=0){left=0;run=false;clearInterval(tick);done();phase=phase==='focus'?'break':'focus';left=total();for(const k in M)delete M[k];react('done');annKey=phase+run;announce(phase==='break'?'Focus session finished. Time for a break.':'Break over. Ready to focus.')}else mile();ui()}
  function toggle(){click();if(chiming){stopChime(true);ui();return}if(run){run=false;clearInterval(tick);react('pause')}else{const t=total();if(left<t/2-2)M.h=1;if(left<298)M.f=1;if(left<58)M.l=1;run=true;endAt=Date.now()+left*1000;tick=setInterval(loop,250);react('play')}ui()}
  function reset(full=true){stopChime(false);clearInterval(tick);run=false;if(full)phase='focus';left=total();for(const k in M)delete M[k];ui()}
  $('#play').onclick=toggle;$('#reset').onclick=()=>{click();reset()};$('#skip').onclick=()=>{click();phase=phase==='focus'?'break':'focus';reset(false);react('skip')};
  $('#msel').innerHTML=Object.entries(MODES).map(([k,m])=>`<option value="${k}">${m.n}</option>`).join('');
  $('#msel').onchange=e=>{click();S.mode=e.target.value;save();reset()};

  /* ---- auto cycle: focus > 5 s chime > break > 5 s chime > focus ... ---- */
  const CHIME_MS=5000;let chiming=false,chimeT=0;
  const chimeLong=()=>{const n=[523,659,784,1047,0,784,1047,1319];[0,1.25,2.5,3.75].forEach(o=>n.forEach((f,i)=>f&&tone(f,o+i*.14,.18)))};
  function flipPhase(){phase=phase==='focus'?'break':'focus';left=total();for(const k in M)delete M[k]}
  function chimeThenNext(){const was=phase;chiming=true;chimeLong();announce(was==='focus'?'Focus session finished. Break starts in 5 seconds.':'Break over. Focus starts in 5 seconds.');react('done');
   chimeT=setTimeout(()=>{if(!chiming)return;chiming=false;flipPhase();run=true;endAt=Date.now()+left*1000;tick=setInterval(loop,250);annKey=phase+run;announce(phase==='focus'?`Focus started. ${Math.round(total()/60)} minutes.`:'Break started.');react('play');ui()},CHIME_MS)}
  function stopChime(advance){if(!chiming)return;clearTimeout(chimeT);chiming=false;if(advance)flipPhase()}
  function autoUI(){const b=$('#auto'),s=$('#autos');if(b){b.classList.toggle('on',!!S.auto);b.setAttribute('aria-pressed',!!S.auto);b.title='Auto cycle: '+(S.auto?'ON':'OFF')+' (focus, chime, break, chime, repeat)'}if(s){s.textContent=S.auto?'ON':'OFF';s.classList.toggle('on',!!S.auto);s.setAttribute('aria-pressed',!!S.auto)}}
  function autoSet(v){S.auto=v;save();click();if(v&&!run&&!chiming)toggle();else ui();announce(v?'Auto cycle on.':'Auto cycle off.')}
  $('#auto').onclick=()=>autoSet(!S.auto);$('#autos').onclick=()=>autoSet(!S.auto);

  /* ---- picture in picture: Document PiP where available (live, with buttons), else a canvas video ---- */
  var pipWin=null,pipVid=null,pipCv=null;
  const pipCan=()=>'documentPictureInPicture' in window||!!(document.pictureInPictureEnabled&&HTMLVideoElement.prototype.requestPictureInPicture);
  const pipTime=()=>{const s=Math.max(0,Math.ceil(left));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};
  const pipLabel=()=>chiming?'DING!':phase==='focus'?'FOCUS':'REST';
  function pipBtn(){const b=$('#pip');if(!b)return;const on=!!(pipWin||pipVid);b.classList.toggle('on',on);b.setAttribute('aria-pressed',on);b.title=on?'Close the floating clock':'Pop the clock out into a small floating window';if(!pipCan()){b.disabled=true;b.title='Picture in picture is not supported in this browser'}}
  function pipDraw(){if(!pipCv)return;const c=pipCv.getContext('2d'),cs=getComputedStyle(document.documentElement),v=n=>cs.getPropertyValue(n).trim()||'#000',W=pipCv.width,H=pipCv.height,pc=Math.max(0,Math.min(1,left/total())),f='"Press Start 2P", monospace';
   c.fillStyle=v('--box');c.fillRect(0,0,W,H);c.strokeStyle=v('--line');c.lineWidth=8;c.strokeRect(4,4,W-8,H-8);
   c.textAlign='center';c.textBaseline='middle';
   const lb=pipLabel();c.font='20px '+f;const bw=c.measureText(lb).width+28;c.fillStyle=v('--acc');c.fillRect((W-bw)/2,28,bw,36);c.fillStyle='#fff';c.fillText(lb,W/2,47);
   c.fillStyle=v('--ink');c.font='64px '+f;c.fillText(pipTime(),W/2,H/2+14);
   c.fillStyle=v('--panel');c.fillRect(30,H-58,W-60,22);c.fillStyle=pc>.5?'#48d848':pc>.2?'#f8d030':'#f85838';c.fillRect(30,H-58,(W-60)*pc,22);c.strokeStyle=v('--line');c.lineWidth=4;c.strokeRect(30,H-58,W-60,22)}
  function pipUI(){if(pipWin){const d=pipWin.document,g=id=>d.getElementById(id);if(!g('pt'))return;g('pb').textContent=pipLabel();{const t=pipTime();g('pm').textContent=t.slice(0,2);g('ps').textContent=t.slice(3);g('pt').setAttribute('aria-label',`${pipLabel()} ${+t.slice(0,2)} minutes ${+t.slice(3)} seconds`)}const h=$('#hpb');g('ph').style.width=h.style.width;g('ph').style.background=h.style.background;g('pplay').textContent=$('#plabel').textContent;d.title=pipTime()+' · Focus Quest';
    const r=document.documentElement;d.documentElement.dataset.theme=r.dataset.theme;d.documentElement.dataset.scheme=r.dataset.scheme;d.documentElement.style.cssText=r.style.cssText}
   else if(pipVid)pipDraw()}
  function pipClosed(){pipWin=null;pipVid=null;pipCv=null;pipBtn()}
  async function pipToggle(){
   if(pipWin){pipWin.close();pipClosed();return}
   if(pipVid){try{await document.exitPictureInPicture()}catch(e){}pipClosed();return}
   try{
    if('documentPictureInPicture' in window){
     const w=await window.documentPictureInPicture.requestWindow({width:340,height:S.pipSize==='xs'?100:210});pipWin=w;
     document.querySelectorAll('link[rel=stylesheet]').forEach(n=>{const l=w.document.createElement('link');l.rel='stylesheet';l.href=n.href;w.document.head.appendChild(l)});
     document.querySelectorAll('style').forEach(n=>w.document.head.appendChild(n.cloneNode(true)));
     w.document.body.className=document.body.className;
     w.document.body.innerHTML='<div class="pip" role="timer" id="pt"><span class="bdg" id="pb"></span><div class="pdig" aria-hidden="true"><div class="dg" id="pm"></div><div class="colon"><i></i><i></i></div><div class="dg" id="ps"></div></div><div class="pbar" aria-hidden="true"><div id="ph"></div></div><div class="pc"><button class="gb sm" id="prst">RESET</button><button class="gb sm" id="pplay"></button><button class="gb sm" id="pskip">SKIP</button></div></div>';
     {const g=id=>w.document.getElementById(id);g('prst').onclick=()=>$('#reset').click();g('pplay').onclick=()=>$('#play').click();g('pskip').onclick=()=>$('#skip').click();
      w.document.body.addEventListener('dblclick',e=>{if(e.target.closest('button'))return;try{w.resizeTo(w.outerWidth,w.innerHeight<150?210:100+(w.outerHeight-w.innerHeight))}catch(x){}})}
     w.addEventListener('pagehide',pipClosed);w.addEventListener('resize',()=>{const z=w.innerHeight<150?'xs':'sm';if(S.pipSize!==z){S.pipSize=z;save()}});
    }else{
     pipCv=document.createElement('canvas');pipCv.width=480;pipCv.height=270;pipDraw();
     const v=document.createElement('video');v.muted=true;v.playsInline=true;v.srcObject=pipCv.captureStream(10);await v.play();pipVid=v;
     v.addEventListener('leavepictureinpicture',pipClosed);
     try{navigator.mediaSession.setActionHandler('play',()=>{if(!run)$('#play').click()});navigator.mediaSession.setActionHandler('pause',()=>{if(run)$('#play').click()})}catch(e){}
     await v.requestPictureInPicture()}
    pipBtn();pipUI();announce('Clock popped out into a floating window.')
   }catch(e){pipWin=null;pipVid=null;pipCv=null;pipBtn();announce('Picture in picture is not available right now.')}}
  $('#pip').onclick=()=>{click();pipToggle()};pipBtn();

  /* ---- PWA: install, offline and updates (the state lives in src/pwa.js) ---- */
  let pwaAsked=false,pwaHeard=false;
  function pwaUI(){const ib=$('#minst'),si=$('#pwai'),st=$('#pwast'),h=$('#pwah'),pu=$('#pwau');if(!st)return;
   const can=!!pwa.installEvent&&!pwa.installed,ready=pwa.offlineReady||!!(navigator.serviceWorker&&navigator.serviceWorker.controller);
   if(ib)ib.hidden=pwa.installed||!pwa.supported;si.disabled=!can;si.textContent=pwa.installed?'INSTALLED':'INSTALL';
   st.textContent=import.meta.env.DEV?'Offline support and updates are active in the built app (npm run build, then npm run preview).':!pwa.supported?'This browser cannot install the app or run it offline.':[pwa.installed?'Running as an installed app.':'Running in the browser.',ready?'Works offline.':'Preparing offline use...',navigator.onLine?'':'You are offline.',pwa.needRefresh?'An update is ready.':''].filter(Boolean).join(' ');
   h.textContent=pwa.installed||can||!pwa.supported?'':pwa.ios?'On iPhone or iPad: tap Share, then Add to Home Screen.':'Your browser offers to install the app when it is ready (look for an install icon in the address bar or the browser menu).';
   pu.textContent=pwa.needRefresh?'RELOAD':'CHECK NOW'}
  $('#minst').onclick=$('#pwai').onclick=async()=>{click();if(pwa.installEvent){if(await promptInstall()==='accepted')announce('Installing Focus Quest.')}else{const m=pwa.ios?'On iPhone or iPad: tap Share, then Add to Home Screen.':'Use the install icon in your browser address bar or menu.';say(m);announce(m)}};
  $('#pwau').onclick=async()=>{click();if(pwa.needRefresh){pwa.update(true);return}const b=$('#pwau');
   if(!pwa.registration){announce('Updates are checked automatically in the built app.');return}
   b.textContent='CHECKING...';try{await pwa.registration.update()}catch(e){}
   setTimeout(()=>{pwaUI();announce(pwa.needRefresh?'An update is ready.':'You have the latest version.')},800)};
  function pwaEvent(){pwaUI();
   if(pwa.offlineReady&&!pwaHeard){pwaHeard=true;announce('Focus Quest is ready to work offline.')}
   if(pwa.needRefresh&&!pwaAsked){pwaAsked=true;
    if(run)announce('A new version is ready. Reload from Settings when your timer is done.');
    else ask('A new version of Focus Quest is ready. Reload now?','RELOAD','UPDATE READY').then(ok=>{if(ok)pwa.update(true)})}}
  addEventListener('fq:pwa',pwaEvent);pwaUI();

  /* ---- calendar ---- */
  let vd=new Date();vd.setDate(1);
  function cal(){const t=new Date(),y=vd.getFullYear(),m=vd.getMonth(),first=vd.getDay(),days=new Date(y,m+1,0).getDate();
   $('#cm').textContent=vd.toLocaleString(undefined,{month:'long',year:'numeric'}).toUpperCase();
   const names=[...Array(7)].map((_,i)=>new Date(2023,0,1+i).toLocaleDateString(undefined,{weekday:'long'}));
   let h='<table class="caltab"><thead><tr>'+names.map(n=>`<th scope="col"><abbr title="${n}">${n[0].toUpperCase()}</abbr></th>`).join('')+'</tr></thead><tbody>';
   let d=1-first;for(let r=0;r<Math.ceil((first+days)/7);r++){h+='<tr>';for(let c=0;c<7;c++,d++){const today=d>=1&&d<=days&&t.getFullYear()==y&&t.getMonth()==m&&t.getDate()==d;h+=d<1||d>days?'<td></td>':`<td><span class="day ${today?'today':''}"${today?' aria-current="date"':''}>${d}</span></td>`}h+='</tr>'}
   $('#cal').innerHTML=h+'</tbody></table>'}
  $('#pm').onclick=()=>{click();vd.setMonth(vd.getMonth()-1);cal()};$('#nm').onclick=()=>{click();vd.setMonth(vd.getMonth()+1);cal()};

  /* ---- tasks ---- */
  const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  function tasks(){const a=S.tasks.filter(t=>!t.done);
   $('#tl').innerHTML=a.length?a.map(t=>`<li class="flex items-center gap-2"><button type="button" class="chk" role="checkbox" aria-checked="false" data-id="${t.id}" aria-label="Mark as done: ${esc(t.text)}"></button><span class="flex-1 break-words">${esc(t.text)}</span><button type="button" class="delbtn" data-del="${t.id}" aria-label="Delete mission: ${esc(t.text)}"><span aria-hidden="true">✕</span></button></li>`).join(''):'<li class="hint">No missions yet. Type one above and press Enter.</li>';
   const g={};S.tasks.filter(t=>t.done).sort((x,y)=>y.at-x.at).forEach(t=>{const d=new Date(t.at).toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric',year:'numeric'});(g[d]=g[d]||[]).push(t)});
   $('#his').innerHTML=Object.keys(g).length?Object.entries(g).map(([d,l])=>`<h3 class="mt-3 mb-2" style="color:var(--acc-text)">${d}</h3><ul class="space-y-2">${l.map(t=>`<li class="flex gap-2 items-center"><span class="chk d" aria-hidden="true">✓</span><span class="line-through"><span class="sr-only">Completed: </span>${esc(t.text)}</span></li>`).join('')}</ul>`).join(''):'<p class="hint">Completed missions show up here, grouped by day.</p>'}
  function add(){const v=$('#ti').value.trim();if(!v)return;click();S.tasks.push({id:Date.now()+Math.random(),text:v,done:false});$('#ti').value='';save();tasks();announce('Mission added: '+v)}
  $('#ta').onclick=add;$('#ti').onkeydown=e=>{if(e.key==='Enter')add()};
  $('#tl').onclick=e=>{const c=e.target.closest('[data-id]'),d=e.target.closest('[data-del]');
   const refocus=()=>($('#tl .chk')||$('#ti')).focus();
   if(c){const r=c.getBoundingClientRect(),t=S.tasks.find(t=>t.id==c.dataset.id);t.done=true;t.at=t.u=Date.now();check();react('task',r.left+r.width/2);save();tasks();announce('Mission completed: '+t.text);refocus()}
   if(d){const t=S.tasks.find(t=>t.id==d.dataset.del);click();S.tasks=S.tasks.filter(t=>t.id!=d.dataset.del);save();tasks();announce('Mission deleted: '+(t?t.text:''));refocus()}};
  function tabs(n){click();$('#act').classList.toggle('hidden',n!=1);$('#his').classList.toggle('hidden',n!=2);$('#t1').classList.toggle('on',n==1);$('#t2').classList.toggle('on',n==2);$('#t1').setAttribute('aria-selected',n==1);$('#t2').setAttribute('aria-selected',n==2)}
  $('#t1').onclick=()=>tabs(1);$('#t2').onclick=()=>tabs(2);

  /* ---- settings & about ---- */
  function tile(k,p){const f=p.idle[0],c=f%p.cols,r=Math.floor(f/p.cols),s=p.tz||Math.min(1.2,56/p.cw,62/p.ch);
   return `<button class="tile ${S.pet===k?'on':''}" data-pet="${k}"><i style="width:${p.cw*s}px;height:${p.ch*s}px;background-image:url(${p.src});background-size:${p.cols*p.cw*s}px ${p.rows*p.ch*s}px;background-position:-${c*p.cw*s}px -${r*p.ch*s}px"></i>${p.n||'MINE'}</button>`}
  function settings(){thUI();a11yUI();tkUI();pwaUI();$('#durs').innerHTML='<span></span><span class="h">FOCUS</span><span class="h">REST</span>'+Object.entries(MODES).map(([k,m])=>`<span>${m.n}</span><input type="number" min="1" max="240" data-k="${k}" data-p="f" aria-label="${m.n} focus minutes" value="${dur(k).f}"><input type="number" min="1" max="120" data-k="${k}" data-p="b" aria-label="${m.n} rest minutes" value="${dur(k).b}">`).join('');
   $('#snd').textContent=S.snd?'ON':'OFF';$('#snd').classList.toggle('on',S.snd);$('#snd').setAttribute('aria-pressed',S.snd);$('#vol').value=S.vol;
   const pe=Object.entries(PETS);$('#pets').innerHTML=pe.filter(([k])=>!k.startsWith('sg')).map(([k,p])=>tile(k,p)).join('')+(S.custom?tile('custom',S.custom):'');$('#pets2').innerHTML=pe.filter(([k])=>k.startsWith('sg')).map(([k,p])=>tile(k,p)).join('');keysUI()}
  document.querySelectorAll('#pets,#pets2').forEach(g=>g.onclick=e=>{const b=e.target.closest('[data-pet]');if(!b)return;S.pet=b.dataset.pet;save();click();size();settings()});
  const open=(id,v)=>{binding=null;$(id).classList.toggle('open',v);const sb=$(id+' .sb');if(v&&sb)sb.scrollTop=0};
  $('#bs').onclick=()=>{click();settings();open('#ms',1)};
  $('#ba').onclick=()=>{click();$('#ab').innerHTML=Object.values(MODES).map(m=>`<div class="row"><span>${m.n}</span><span>${dur(Object.keys(MODES).find(k=>MODES[k]===m)).f} / ${dur(Object.keys(MODES).find(k=>MODES[k]===m)).b} min</span></div>`).join('');open('#ma',1)};
  document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>{click();open('#'+b.closest('.modal').id,0)});
  $('#sc').onclick=()=>{click();document.querySelectorAll('#durs input').forEach(i=>{const k=i.dataset.k;S.dur[k]=S.dur[k]||{};S.dur[k][i.dataset.p]=Math.max(1,+i.value||1)});save();open('#ms',0);if(!run)reset(false)};
  $('#snd').onclick=()=>{S.snd=!S.snd;save();settings();click()};$('#vol').oninput=e=>{S.vol=+e.target.value;save()};$('#vol').onchange=click;
  $('#cs').onclick=()=>{const f=$('#cf').files[0];if(!f)return;const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const cols=+$('#cc').value||1,rows=+$('#cr').value||1,l=s=>s.split(',').map(n=>+n.trim()).filter(n=>!isNaN(n)&&n>=0),idle=l($('#cid').value),w=l($('#cwk').value);
    S.custom={n:'MINE',src:r.result,cols,rows,cw:im.width/cols,ch:im.height/rows,face:+$('#cfc').value,walk:w.length?w:idle,idle:idle.length?idle:[0],sleep:l($('#csl').value),jump:l($('#cj').value),happy:idle,groom:idle,wave:idle,stretch:idle};
    if(S.custom.jump.length<3)S.custom.jump=[idle[0]||0,idle[0]||0,idle[0]||0];S.pet='custom';save();size();settings();click()};im.src=r.result};r.readAsDataURL(f)};
  $('#rs').onclick=async()=>{if(await ask('This deletes your missions, settings, banners, tiles and garden on this device. It cannot be undone.','DELETE ALL','RESET ALL DATA')){['focusquest','fq_cover','fq_custom','fq_garden'].forEach(k=>localStorage.removeItem(k));try{indexedDB.deleteDatabase('focusquest')}catch(e){}location.reload()}};
  document.querySelectorAll('.modal').forEach(m=>m.onclick=e=>e.target===m&&m.classList.remove('open'));
  addEventListener('resize',()=>{size();ledges()});
  /* ---- keyboard shortcuts (configurable; paused while typing or in dialogs) ---- */
  /* ---- game-style menu ---- */
  const mnItems=()=>[...document.querySelectorAll('#mlist .mi:not([hidden])')];let mnI=0;
  const mnSet=i=>{const a=mnItems();mnI=(i+a.length)%a.length;a.forEach((b,n)=>b.classList.toggle('on',n===mnI))};
  $('#mlist').addEventListener('mouseover',e=>{const b=e.target.closest('.mi');if(b)mnSet(mnItems().indexOf(b))});
  $('#mlist').addEventListener('click',e=>{const b=e.target.closest('.mi');if(!b)return;if(b.id==='mth'){click();themeNext();return}if(b.id==='mdk'){click();schemeNext();return}if(b.id==='mks'){click();open('#mnu',0);settings();open('#ms',1);setTimeout(()=>{const k=$('#keys');if(k)k.scrollIntoView({block:'start'})},60);return}open('#mnu',0);const go=b.dataset.go;if(go)$(go).click()});
  $('#bm').onclick=()=>{click();mnSet(0);thUI();open('#mnu',1)};
  addEventListener('keydown',e=>{if(!$('#mnu').classList.contains('open'))return;
   if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();click();mnSet(mnI+(e.key==='ArrowDown'?1:-1))}
   else if(e.key==='Enter'){e.preventDefault();mnItems()[mnI]?.click()}
   else if(S.kb&&e.key===S.keys.menu&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!e.repeat){e.preventDefault();e.stopImmediatePropagation();open('#mnu',0)}});
  const ACT={play:'Start / pause',reset:'Reset',skip:'Skip phase',mode:'Next timer mode',task:'New mission',tabs:'Tasks / history',sound:'Toggle sound',menu:'Open menu',garden:'Open garden',banner:'Banner library',dark:'Toggle dark mode'};
  const ACTS={play:()=>$('#play').click(),reset:()=>$('#reset').click(),skip:()=>$('#skip').click(),menu:()=>$('#bm').click(),garden:()=>$('#bg').click(),banner:()=>$('#cvc').click(),dark:()=>{click();schSet(isDark()?'light':'dark')},
   mode:()=>{const ks=Object.keys(MODES);S.mode=ks[(ks.indexOf(S.mode)+1)%ks.length];click();save();reset()},
   task:()=>{tabs(1);$('#ti').focus()},tabs:()=>tabs($('#his').classList.contains('hidden')?2:1),sound:()=>{S.snd=!S.snd;save();click()}};
  const kn=k=>k===' '?'SPACE':k.toUpperCase();let binding=null;
  function hints(){$('#kp').textContent=S.kb?kn(S.keys.play):'';$('#kr').textContent=S.kb?kn(S.keys.reset):'';$('#ks').textContent=S.kb?kn(S.keys.skip):''}
  function keysUI(){$('#kbt').textContent=S.kb?'ON':'OFF';$('#kbt').classList.toggle('on',S.kb);
   $('#keys').innerHTML=Object.keys(ACT).map(a=>`<div class="row"><span>${ACT[a]}</span><button class="gb sm ${binding===a?'on':''}" data-a="${a}" style="min-width:92px">${binding===a?'PRESS KEY':kn(S.keys[a])}</button></div>`).join('');hints()}
  $('#keys').onclick=e=>{const b=e.target.closest('[data-a]');if(b){click();binding=b.dataset.a;keysUI()}};
  $('#kbt').onclick=()=>{S.kb=!S.kb;save();click();keysUI()};$('#kbr').onclick=()=>{S.keys={...DK};save();click();keysUI()};
  const nativeActivate=t=>t.closest&&t.closest('button,a[href],[role=button],[role=checkbox],[role=tab],[role=menuitem],summary');
  const typing=t=>t.closest&&t.closest('input,textarea,select,[contenteditable]');
  addEventListener('keydown',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;
   if(binding){e.preventDefault();if(k==='Escape'){binding=null;keysUI();return}if(['Shift','Control','Alt','Meta'].includes(k))return;
    const old=S.keys[binding];for(const a in S.keys)if(S.keys[a]===k&&a!==binding)S.keys[a]=old;S.keys[binding]=k;binding=null;save();keysUI();return}
   if(k==='Escape'){if($('#mg').classList.contains('open')&&gfsOn()){gfsSet(false);return}const o=[...document.querySelectorAll('.modal.open')];if(o.length)o[o.length-1].classList.remove('open');return}
   if(!S.kb||e.ctrlKey||e.metaKey||e.altKey||e.repeat||typing(e.target)||document.querySelector('.modal.open,.amodal.open'))return;
   if(k===' '&&nativeActivate(e.target))return; // Space must still press a focused button
   const a=Object.keys(S.keys).find(a=>S.keys[a]===k);if(a&&ACTS[a]){e.preventDefault();ACTS[a]()}});
  addEventListener('keyup',e=>{if(S.kb&&e.key===' '&&S.keys.play===' '&&!typing(e.target)&&!nativeActivate(e.target))e.preventDefault()});
  /* ---- banner library (IndexedDB keeps uploads and history) ---- */
  const DB=new Promise(res=>{try{const q=indexedDB.open('focusquest',2);q.onupgradeneeded=()=>{const d=q.result;['banners','tiles'].forEach(n=>{if(!d.objectStoreNames.contains(n))d.createObjectStore(n,{keyPath:'id'})})};q.onsuccess=()=>res(q.result);q.onerror=()=>res(null)}catch(e){res(null)}});
  const idb=(m,fn,st='banners')=>DB.then(db=>db?new Promise(r=>{try{const t=db.transaction(st,m),q=fn(t.objectStore(st));t.oncomplete=()=>r(q&&q.result);t.onerror=t.onabort=()=>r(null)}catch(e){r(null)}}):null);
  const BN=[],bmsg=t=>$('#bmsg').textContent=t;
  function cover(){const b=BN.find(x=>x.id===S.banner),none=S.banner==='none';$('#bento').classList.toggle('nocover',none);$('#cov').style.backgroundImage=b?`url(${b.url})`:'none';$('#ban').classList.toggle('empty',!b&&!none);$('#addcov').style.display=none?'':'none'}
  function bnUI(){$('#bgrid').innerHTML=BN.length?BN.map(b=>`<div class="bt ${b.id===S.banner?'on':''}" data-b="${b.id}" title="${esc(b.name)}"><i style="background-image:url(${b.url})"></i><button class="gb" data-bdel="${b.id}" aria-label="Delete banner">✕</button></div>`).join(''):'<p class="opacity-[.86] col-span-full">No banners yet. Upload one!</p>'}
  async function bnLoad(){const rows=await idb('readonly',s=>s.getAll());(rows||[]).sort((a,b)=>b.at-a.at).forEach(r=>{r.url=URL.createObjectURL(r.blob);BN.push(r)});cover();bnUI()}
  function bnDel(id,quiet){const i=BN.findIndex(b=>b.id===id);if(i<0)return;URL.revokeObjectURL(BN[i].url);BN.splice(i,1);idb('readwrite',s=>s.delete(id));if(S.banner===id){S.banner='default';save()}if(!quiet){cover();bnUI()}}
  async function bnAdd(f){if(!f)return;if(!f.type.startsWith('image/')){bmsg('Please choose an image file.');return}if(f.size>15e6){bmsg('That file is over 15 MB. Try a smaller one.');return}
   const r={id:'b'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),name:f.name,blob:f,at:Date.now(),url:URL.createObjectURL(f)};BN.unshift(r);
   await idb('readwrite',s=>s.put({id:r.id,name:r.name,blob:r.blob,at:r.at}));
   while(BN.length>24){const o=[...BN].reverse().find(b=>b.id!==S.banner&&b!==r);if(!o)break;bnDel(o.id,true)}
   S.banner=r.id;save();cover();bnUI();bmsg('Banner added. Past banners stay in this list.')}
  $('#cvc').onclick=$('#addcov').onclick=$('#bsb').onclick=()=>{click();bnUI();open('#mb',1)};
  $('#cvr').onclick=$('#bno').onclick=()=>{click();S.banner='none';save();cover();bnUI()};
  $('#bup').onclick=$('#bup2').onclick=()=>{click();$('#cvf').click()};
  $('#cvf').onchange=e=>{bnAdd(e.target.files[0]);e.target.value=''};
  $('#bgrid').onclick=e=>{const d=e.target.closest('[data-bdel]');if(d){click();bnDel(d.dataset.bdel);return}const t=e.target.closest('[data-b]');if(t){click();S.banner=t.dataset.b;save();cover();bnUI()}};
  addEventListener('dragover',e=>{if(e.dataTransfer&&[...e.dataTransfer.types].includes('Files'))e.preventDefault()});
  addEventListener('drop',e=>{const f=e.dataTransfer&&e.dataTransfer.files[0];if(f&&f.type.startsWith('image/')){e.preventDefault();bnAdd(f)}});

  /* ---- pick up the buddy: it lands on the nearest surface below, otherwise falls to the ground ---- */
  const dm=$('#dm');let drag=null,jd=false;
  function dropTarget(){ledges();return L.filter(l=>l.id!=='floor'&&P.x>=l.x1-6&&P.x<=l.x2+6&&l.y>=P.y-14).sort((a,b)=>a.y-b.y)[0]||L[L.length-1]}
  el.onclick=()=>{if(jd){jd=false;return}meow();react('pet');buddyTalk()};
  el.addEventListener('pointerdown',e=>{if(e.button>0)return;try{el.setPointerCapture(e.pointerId)}catch(_){}drag={id:e.pointerId,sx:e.clientX,sy:e.clientY,moved:false}});
  el.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;
   if(!drag.moved){if(Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy)<6)return;drag.moved=true;P.st='held';P.t=0;P.pend=null;P.jt=null;P.after=null;talk(pick(['Whoa!','Put me down!','Wheee!']),1.5,3)}
   P.x=Math.max(20,Math.min(innerWidth-20,e.clientX));P.y=Math.max(SH,Math.min(innerHeight,e.clientY+SH*.45));
   const t=dropTarget();dm.style.cssText=`display:block;left:${P.x-32}px;top:${t.y-2}px;width:64px`});
  const endDrag=e=>{if(!drag||(e&&e.pointerId!==drag.id))return;const m=drag.moved;drag=null;dm.style.display='none';
   if(m){jd=true;setTimeout(()=>jd=false,60);const t=dropTarget();P.ft=t.id;P.vy=0;P.st='fall';P.t=0}};
  el.addEventListener('pointerup',endDrag);el.addEventListener('pointercancel',endDrag);

  /* ---- garden: 128 x 256 tile ground, sprite dock, 2 stacked layers per tile ---- */
  const AH=826,AW=512,GW=128,GH=256,TS=16,AI=new Image();
  const GRS=META.map((m,i)=>m[0]==='g'?i:-1).filter(i=>i>=0),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const G={cells:new Map(),z:innerWidth<640?2:3,cx:GW*TS/2,cy:GH*TS/2,tool:'paint',sel:META.findIndex(m=>m[0]==='n'),cat:'NATURE',mv:null,grid:true,hov:null,space:false};
  try{(LS('fq_garden')||[]).forEach(a=>G.cells.set(a[0],a.slice(1)))}catch(e){}
  const BI=META.map((m,i)=>({id:i,mode:m[0]==='g'||m[0]==='p'?m[0]:'o',cat:m[5]||{g:'GROUND',p:'PROPS',n:'NATURE'}[m[0]],x:m[1],y:m[2],w:m[3],h:m[4],fr:m[6]||1})); // m[5] category, m[6] animation frames (stacked vertically)
  const CT=[],CTM=new Map(),ITEM=id=>typeof id==='number'?BI[id]:CTM.get(id);
  for(const[k,a]of[...G.cells]){const n=a.filter(x=>typeof x!=='number'||x<META.length);if(n.length!==a.length){if(n.length)G.cells.set(k,n);else G.cells.delete(k)}}
  const cats=()=>{const s=[...new Set(BI.map(i=>i.cat))];CT.forEach(t=>{if(!s.includes(t.cat))s.push(t.cat)});return s};
  document.documentElement.style.setProperty('--atl',`url(${ATLAS})`);
  let gsT,gq=false;const GM=Object.assign({created:null,updated:null},LS('fq_garden_meta')||{});
  const gsave=()=>{clearTimeout(gsT);const now=Date.now();GM.updated=now;if(!GM.created)GM.created=now;gsT=setTimeout(()=>{SV('fq_garden',[...G.cells].map(([k,a])=>[k,...a]));SV('fq_garden_meta',GM);dtoChanged('garden changed')},400)};
  const gcv=$('#gc'),gx=gcv.getContext('2d'),gd=()=>{if(!gq){gq=true;requestAnimationFrame(gdraw)}};
  AI.onload=gd;AI.src=ATLAS;
  function gplace(c,r,id){const k=r*GW+c;let a=G.cells.get(k);if(a&&a[a.length-1]===id)return false;gtouch(k);if(!a){a=[];G.cells.set(k,a)}if(a[a.length-1]===id)return false;if(a.length<2)a.push(id);else a[1]=id;return true}
  function gerase(c,r){const k=r*GW+c,a=G.cells.get(k);if(!a)return false;gtouch(k);a.pop();if(!a.length)G.cells.delete(k);return true}
  /* undo / redo: each stroke (paint drag, erase drag, one move, a clear) stores the cells it changed as they were before */
  Object.assign(G,{hist:[],redo:[],cur:null});
  const ghUI=()=>{const u=$('#gund'),r=$('#gred');if(u)u.disabled=!G.hist.length;if(r)r.disabled=!G.redo.length};
  function gtouch(k){if(!G.cur||G.cur.has(k))return;const a=G.cells.get(k);G.cur.set(k,a?a.slice():null)}
  const gsame=(a,b)=>(!a&&!b)||(a&&b&&a.join()===b.join());
  function gcommit(){const m=G.cur;G.cur=null;if(!m)return;for(const[k,p]of[...m])if(gsame(p,G.cells.get(k)))m.delete(k);if(!m.size)return;G.hist.push(m);if(G.hist.length>100)G.hist.shift();G.redo=[];ghUI()}
  function gstep(redo){const from=redo?G.redo:G.hist,to=redo?G.hist:G.redo,m=from.pop();if(!m)return;const inv=new Map();for(const[k,p]of m){const c=G.cells.get(k);inv.set(k,c?c.slice():null);if(p)G.cells.set(k,p.slice());else G.cells.delete(k)}to.push(inv);tone(redo?700:440,0,.05);gsave();ghUI();gd()}
  const ghClear=()=>{G.hist=[];G.redo=[];G.cur=null;ghUI()};
  function gdraw(){gq=false;if(!$('#mg').classList.contains('open')||!AI.complete)return;
   const W=gcv.width,H=gcv.height,z=G.z,ts=TS*z,ox=Math.round(W/2-G.cx*z),oy=Math.round(H/2-G.cy*z);
   G.anim=false;gx.imageSmoothingEnabled=false;gx.fillStyle='#86bba5';gx.fillRect(0,0,W,H);
   const c0=Math.max(0,Math.floor(-ox/ts)),c1=Math.min(GW-1,Math.floor((W-ox)/ts)),r0=Math.max(0,Math.floor(-oy/ts)),r1=Math.min(GH-1,Math.floor((H-oy)/ts));
   const put=(id,c,r,al)=>{const it=ITEM(id);if(!it||(it.img&&!it.img.complete))return;const ag=it.mode!=='o',dx=ag?ox+c*ts:ox+Math.round((c*TS+TS/2-it.w/2)*z),dy=ag?oy+r*ts:oy+Math.round(((r+1)*TS-it.h-1)*z);if(al)gx.globalAlpha=al;if(it.img)gx.drawImage(it.img,0,0,it.w,it.h,dx,dy,it.w*z,it.h*z);else{let fy=it.y;if(it.fr>1){G.anim=true;if(!reducedMotion())fy+=(Math.floor(performance.now()/160)%it.fr)*it.h}gx.drawImage(AI,it.x,fy,it.w,it.h,dx,dy,it.w*z,it.h*z)}if(al)gx.globalAlpha=1};
   const ra=Math.max(0,r0-8),rb=Math.min(GH-1,r1+5),ca=Math.max(0,c0-8),cb=Math.min(GW-1,c1+3);
   {const gi=ITEM(GRS[0]);if(gi)for(let r=Math.floor(-oy/ts);r<=Math.floor((H-oy)/ts);r++)for(let c=Math.floor(-ox/ts);c<=Math.floor((W-ox)/ts);c++)put(GRS[0],c,r)} // base: plain green grass only, edge to edge
   for(let r=ra;r<=r1;r++)for(let c=ca;c<=cb;c++){const a=G.cells.get(r*GW+c);if(a)a.forEach(id=>{if(ITEM(id)?.mode==='g')put(id,c,r)})}
   for(let r=ra;r<=rb;r++)for(let c=ca;c<=cb;c++){const a=G.cells.get(r*GW+c);if(a)a.forEach(id=>{const m=ITEM(id)?.mode;if(m&&m!=='g')put(id,c,r)})}
   if(G.grid&&!gfsOn()){gx.strokeStyle='rgba(255,255,255,.14)';gx.lineWidth=1;gx.beginPath();for(let c=c0;c<=c1+1;c++){gx.moveTo(ox+c*ts+.5,oy+r0*ts);gx.lineTo(ox+c*ts+.5,oy+(r1+1)*ts)}for(let r=r0;r<=r1+1;r++){gx.moveTo(ox+c0*ts,oy+r*ts+.5);gx.lineTo(ox+(c1+1)*ts,oy+r*ts+.5)}gx.stroke()}
   gx.strokeStyle='#fff';gx.lineWidth=3;gx.strokeRect(ox,oy,GW*ts,GH*ts);
   if(G.mv&&!gfsOn()){const[fc,fr]=G.mv.from;gx.strokeStyle='#f8d030';gx.lineWidth=2;gx.strokeRect(ox+fc*ts+1,oy+fr*ts+1,ts-2,ts-2)}
   if(G.hov){const[c,r]=G.hov,gi=G.mv?G.mv.id:G.tool==='paint'?G.sel:null;if(gi!=null)put(gi,c,r,.6);gx.strokeStyle=G.tool==='erase'?'#f85838':'#fff';gx.lineWidth=2;gx.strokeRect(ox+c*ts+1,oy+r*ts+1,ts-2,ts-2)}}
  const gcell=e=>{const b=gcv.getBoundingClientRect(),c=Math.floor(((e.clientX-b.left-gcv.width/2)/G.z+G.cx)/TS),r=Math.floor(((e.clientY-b.top-gcv.height/2)/G.z+G.cy)/TS);return c>=0&&c<GW&&r>=0&&r<GH?[c,r]:null};
  const hud=()=>{const h=G.hov;$('#gpos').textContent=h?`X ${h[0]}  Y ${h[1]}  LAYERS ${(G.cells.get(h[1]*GW+h[0])||[]).length}/2`:''};
  let gp=null;const gvis=new Set();
  function gact(e,erase){const h=gcell(e);if(!h)return;const k=h[1]*GW+h[0];if(gvis.has(k))return;gvis.add(k);
   if(erase){if(gerase(h[0],h[1])){tone(330,0,.05);gsave()}}else if(ITEM(G.sel)&&gplace(h[0],h[1],G.sel)){tone(660,0,.04);gsave()}}
  gcv.addEventListener('pointerdown',e=>{gcv.setPointerCapture(e.pointerId);gvis.clear();const pv=gfsOn();if(!pv&&G.tool==='move'&&e.button===0&&!G.space){const h=gcell(e),a=h&&G.cells.get(h[1]*GW+h[0]);if(a&&a.length){G.mv={from:h,id:a[a.length-1]};G.cur=new Map();gp={mv:true};gd()}return}const pan=pv||G.tool==='hand'||e.button===1||G.space;gp={x:e.clientX,y:e.clientY,pan,erase:e.button===2||G.tool==='erase'};if(!pan){G.cur=new Map();gact(e,gp.erase)}hud();gd()});
  gcv.addEventListener('pointermove',e=>{G.hov=gfsOn()?null:gcell(e);hud();if(gp){if(gp.pan){G.cx=clamp(G.cx-(e.clientX-gp.x)/G.z,0,GW*TS);G.cy=clamp(G.cy-(e.clientY-gp.y)/G.z,0,GH*TS);gp.x=e.clientX;gp.y=e.clientY}else if(!gp.mv)gact(e,gp.erase)}gd()});
  gcv.addEventListener('pointerup',()=>{if(G.mv){const f=G.mv.from,h=G.hov;if(h&&(h[0]!==f[0]||h[1]!==f[1])){gerase(f[0],f[1]);gplace(h[0],h[1],G.mv.id);tone(520,0,.05);gsave()}G.mv=null;gd()}gp=null;gcommit()});gcv.addEventListener('pointercancel',()=>{G.mv=null;gp=null;gcommit();gd()});gcv.addEventListener('pointerleave',()=>{if(!gp){G.hov=null;hud();gd()}});
  gcv.addEventListener('contextmenu',e=>e.preventDefault());
  function gzoomAt(d,cx,cy){const nz=clamp(G.z+d,1,6);if(nz===G.z)return;const b=gcv.getBoundingClientRect(),px=cx-b.left,py=cy-b.top,wx=(px-gcv.width/2)/G.z+G.cx,wy=(py-gcv.height/2)/G.z+G.cy;G.z=nz;G.cx=clamp(wx-(px-gcv.width/2)/nz,0,GW*TS);G.cy=clamp(wy-(py-gcv.height/2)/nz,0,GH*TS);$('#gzl').textContent=nz+'x';gd()}
  const gzoom=d=>{const b=gcv.getBoundingClientRect();gzoomAt(d,b.left+b.width/2,b.top+b.height/2)};
  gcv.addEventListener('wheel',e=>{e.preventDefault();if(e.ctrlKey||e.metaKey)gzoomAt(e.deltaY<0?1:-1,e.clientX,e.clientY);else{G.cx=clamp(G.cx+e.deltaX/G.z,0,GW*TS);G.cy=clamp(G.cy+e.deltaY/G.z,0,GH*TS);gd()}},{passive:false});
  gcv.addEventListener('pointerenter',()=>{G.over=true});gcv.addEventListener('pointerleave',()=>{G.over=false});gcv.addEventListener('pointermove',e=>{G.mx=e.clientX;G.my=e.clientY});
  gcv.addEventListener('mousedown',e=>{if(e.button===1)e.preventDefault()});
  $('#gzm').onclick=()=>{click();gzoom(-1)};$('#gzp').onclick=()=>{click();gzoom(1)};
  $('#ggr').onclick=()=>{click();G.grid=!G.grid;$('#ggr').classList.toggle('on',G.grid);$('#ggr').setAttribute('aria-pressed',G.grid);gd()};$('#gund').onclick=()=>{click();gstep(false)};$('#gred').onclick=()=>{click();gstep(true)};
  addEventListener('keydown',e=>{if(!$('#mg').classList.contains('open')||typing(e.target)||!(e.ctrlKey||e.metaKey))return;const k=e.key.toLowerCase();if(k==='z'||k==='y'){e.preventDefault();gstep(k==='y'||e.shiftKey)}});$('#gpvm').onclick=()=>{click();gzoom(-1)};$('#gpvp').onclick=()=>{click();gzoom(1)};$('#gce').onclick=()=>{click();G.cx=GW*TS/2;G.cy=GH*TS/2;gd()};
  $('#gcl').onclick=async()=>{if(await ask('Remove everything you have placed in the garden?','CLEAR GARDEN','CLEAR GARDEN?')){G.cur=new Map();for(const k of G.cells.keys())gtouch(k);G.cells.clear();gcommit();gsave();click();gd()}};
  const toolUI=()=>document.querySelectorAll('[data-tool]').forEach(b=>b.classList.toggle('on',b.dataset.tool===G.tool));
  document.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>{click();G.tool=b.dataset.tool;toolUI();gd()});
  const thumb=(it,m)=>{const s=Math.min(3,m/Math.max(it.w,it.h)),b=`width:${it.w*s}px;height:${it.h*s}px;`;return it.img?b+`background-image:url(${it.url});background-size:100% 100%`:b+`background-size:${AW*s}px ${AH*s}px;background-position:-${it.x*s}px -${it.y*s}px`};
  function gpal(){if(!cats().includes(G.cat))G.cat='NATURE';
   $('#gtb').innerHTML=cats().map(c=>`<button class="gb sm ${G.cat===c?'on':''}" data-cat="${esc(c)}">${esc(c)}</button>`).join('');
   $('#gpal').innerHTML=[...BI,...CT].filter(i=>i.cat===G.cat).map(i=>`<button class="gt ${G.sel===i.id?'on':''}" data-i="${i.id}" title="${esc(i.name||'')}" aria-label="${esc(i.name||'Sprite '+i.id)}"><i style="${thumb(i,40)}"></i></button>`).join('')||'<span class="text-[length:calc(10px*var(--ts))] opacity-[.86]">Nothing here yet. Add tiles in the Tile Manager.</span>'}
  $('#gtb').onclick=e=>{const b=e.target.closest('[data-cat]');if(b){click();G.cat=b.dataset.cat;gpal()}};
  $('#gpal').onclick=e=>{const b=e.target.closest('[data-i]');if(b){click();G.sel=/^\d+$/.test(b.dataset.i)?+b.dataset.i:b.dataset.i;G.tool='paint';toolUI();gpal();gd()}};

  /* ---- custom tiles: stored in IndexedDB, editable in the Tile Manager ---- */
  const cb=c=>new Promise(r=>c.toBlob(r,'image/png')),mk=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
  const loadImg=f=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=URL.createObjectURL(f)});
  const ctPut=(it,touch=true)=>{if(touch)it.updated=Date.now();return idb('readwrite',s=>s.put({id:it.id,sid:it.sid,name:it.name,cat:it.cat,mode:it.mode,blob:it.blob,w:it.w,h:it.h,order:it.order,created:it.created,updated:it.updated}),'tiles').then(r=>{dtoChanged('sprites changed');return r})};
  const nextSid=()=>{let n=Math.max(1000,+localStorage.getItem('fq_sid_seq')||0,...CT.map(x=>x.sid||0))+1;try{localStorage.setItem('fq_sid_seq',String(n))}catch(e){}return n};
  function ctAdopt(r){const url=URL.createObjectURL(r.blob),img=new Image();img.onload=()=>{gd();tmUI()};img.src=url;const it={id:r.id,sid:r.sid,name:r.name,cat:r.cat,mode:r.mode,w:r.w,h:r.h,order:r.order,blob:r.blob,url,img,created:r.created,updated:r.updated};CT.push(it);CTM.set(r.id,it);
   if(!it.sid||!it.created){it.sid=it.sid||nextSid();it.created=it.created||Date.now();it.updated=it.updated||it.created;ctPut(it,false)}return it}
  async function ctNew(cv,name,cat,mode){const id='c'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),blob=await cb(cv),order=CT.reduce((m,t)=>Math.max(m,t.order||0),0)+1,it=ctAdopt({id,sid:nextSid(),name,cat,mode,blob,w:cv.width,h:cv.height,order,created:Date.now(),updated:Date.now()});await ctPut(it,false);return it}
  async function ctLoad(){const rows=await idb('readonly',s=>s.getAll(),'tiles');(rows||[]).sort((a,b)=>a.order-b.order).forEach(ctAdopt);tmUI();gpal();gd();
   await Promise.all(CT.map(it=>it.img.complete?1:new Promise(r=>{it.img.addEventListener('load',r,{once:true});it.img.addEventListener('error',r,{once:true})})));dtoReady=true;dtoPrint('page load')}
  const TM={sel:null,crop:null},tcur=()=>CTM.get(TM.sel),tmsg=t=>$('#tmmsg').textContent=t,upCat=v=>(v||'CUSTOMS').toUpperCase().trim().slice(0,14)||'CUSTOMS';
  function tmUI(){const g=$('#tmg');$('#tcats').innerHTML=cats().map(c=>`<option value="${esc(c)}">`).join('');
   if(!CT.length){g.innerHTML='<p class="opacity-[.86]">No custom tiles yet. Upload tiles or import a sprite sheet.</p>';$('#tme').style.display='none';return}
   const gr={};CT.forEach(t=>(gr[t.cat]=gr[t.cat]||[]).push(t));
   g.innerHTML=Object.entries(gr).map(([c,l])=>`<div class="tmh">${esc(c)} (${l.length})</div><div class="cbar">${l.map(t=>`<button class="gt ${t.id===TM.sel?'on':''}" data-t="${t.id}" title="${esc(t.name)}" aria-label="${esc(t.name)}"><i style="${thumb(t,40)}"></i></button>`).join('')}</div>`).join('');
   const it=tcur();$('#tme').style.display=it?'':'none';if(it){if(document.activeElement!==$('#ten'))$('#ten').value=it.name;if(document.activeElement!==$('#tcat'))$('#tcat').value=it.cat;$('#tmo').value=it.mode;tdraw()}}
  function tdraw(){const it=tcur(),c=$('#tec');if(!it||!it.img||!it.img.complete)return;const k=Math.max(1,Math.min(16,Math.floor(Math.min(260/it.w,260/it.h)))),x=c.getContext('2d');c.width=it.w*k;c.height=it.h*k;x.imageSmoothingEnabled=false;x.drawImage(it.img,0,0,it.w*k,it.h*k);
   const r=TM.crop;if(r&&r.w>0&&r.h>0){x.fillStyle='rgba(0,0,0,.5)';x.fillRect(0,0,c.width,r.y*k);x.fillRect(0,(r.y+r.h)*k,c.width,c.height);x.fillRect(0,r.y*k,r.x*k,r.h*k);x.fillRect((r.x+r.w)*k,r.y*k,c.width,r.h*k);x.strokeStyle='#fff';x.lineWidth=2;x.strokeRect(r.x*k+1,r.y*k+1,r.w*k-2,r.h*k-2)}
   $('#tei').textContent=`${it.w} x ${it.h} px`+(r&&r.w>0?`  ·  crop ${r.w} x ${r.h}`:'')}
  const icv=it=>{const c=mk(it.w,it.h);c.getContext('2d').drawImage(it.img,0,0);return c};
  async function ctApply(it,cv){const blob=await cb(cv);URL.revokeObjectURL(it.url);it.blob=blob;it.url=URL.createObjectURL(blob);it.w=cv.width;it.h=cv.height;const im=new Image();await new Promise(r=>{im.onload=r;im.src=it.url});it.img=im;await ctPut(it);TM.crop=null;tmUI();gpal();gd()}
  const rot=(c,d)=>{const o=mk(c.height,c.width),x=o.getContext('2d');x.translate(o.width/2,o.height/2);x.rotate(d*Math.PI/2);x.drawImage(c,-c.width/2,-c.height/2);return o};
  const flip=(c,h)=>{const o=mk(c.width,c.height),x=o.getContext('2d');x.translate(h?c.width:0,h?0:c.height);x.scale(h?-1:1,h?1:-1);x.drawImage(c,0,0);return o};
  const cropc=(c,r)=>{const o=mk(r.w,r.h);o.getContext('2d').drawImage(c,r.x,r.y,r.w,r.h,0,0,r.w,r.h);return o};
  function trimc(c){const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let x0=c.width,y0=c.height,x1=-1,y1=-1;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(d[(y*c.width+x)*4+3]>8){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}return x1<0?c:cropc(c,{x:x0,y:y0,w:x1-x0+1,h:y1-y0+1})}
  const op=f=>async()=>{const it=tcur();if(!it)return;click();await ctApply(it,f(icv(it)))};
  $('#trl').onclick=op(c=>rot(c,-1));$('#trr').onclick=op(c=>rot(c,1));$('#tfh').onclick=op(c=>flip(c,true));$('#tfv').onclick=op(c=>flip(c,false));$('#ttr').onclick=op(trimc);
  $('#tcr').onclick=async()=>{const it=tcur(),r=TM.crop;if(!it)return;if(!r||r.w<1||r.h<1){tmsg('Drag on the preview to choose a crop area first.');return}click();await ctApply(it,cropc(icv(it),r))};
  $('#ten').oninput=e=>{const it=tcur();if(it)it.name=e.target.value};$('#ten').onchange=()=>{const it=tcur();if(it){ctPut(it);tmUI();gpal()}};
  $('#tcat').onchange=e=>{const it=tcur();if(!it)return;it.cat=upCat(e.target.value);ctPut(it);tmUI();gpal()};
  $('#tmo').onchange=e=>{const it=tcur();if(it){it.mode=e.target.value;ctPut(it);gd()}};
  $('#tmg').onclick=e=>{const b=e.target.closest('[data-t]');if(b){click();TM.sel=b.dataset.t;TM.crop=null;tmUI()}};
  function tmv(d){const it=tcur();if(!it)return;click();const i=CT.indexOf(it);let j=i+d;while(j>=0&&j<CT.length&&CT[j].cat!==it.cat)j+=d;if(j<0||j>=CT.length)return;[CT[i],CT[j]]=[CT[j],CT[i]];CT.forEach((t,n)=>{if(t.order!==n+1){t.order=n+1;ctPut(t,false)}});tmUI();gpal()}
  $('#tml').onclick=()=>tmv(-1);$('#tmr').onclick=()=>tmv(1);
  $('#tdl').onclick=async()=>{const it=tcur();if(!it||!(await ask('Delete this tile and remove it from the garden?','DELETE TILE','DELETE TILE?')))return;click();CT.splice(CT.indexOf(it),1);CTM.delete(it.id);URL.revokeObjectURL(it.url);idb('readwrite',s=>s.delete(it.id),'tiles');
   for(const[k,a]of[...G.cells]){const n=a.filter(x=>x!==it.id);if(n.length!==a.length){if(n.length)G.cells.set(k,n);else G.cells.delete(k)}}gsave();ghClear();if(G.sel===it.id)G.sel=-1;TM.sel=null;tmUI();gpal();gd()};
  const tpos=e=>{const it=tcur(),b=$('#tec').getBoundingClientRect();return[Math.max(0,Math.min(it.w,Math.round((e.clientX-b.left)*it.w/b.width))),Math.max(0,Math.min(it.h,Math.round((e.clientY-b.top)*it.h/b.height)))]};
  let tcs=null;const tec=$('#tec');
  tec.addEventListener('pointerdown',e=>{if(!tcur())return;tec.setPointerCapture(e.pointerId);tcs=tpos(e);TM.crop={x:tcs[0],y:tcs[1],w:0,h:0};tdraw()});
  tec.addEventListener('pointermove',e=>{if(!tcs)return;const p=tpos(e);TM.crop={x:Math.min(tcs[0],p[0]),y:Math.min(tcs[1],p[1]),w:Math.abs(p[0]-tcs[0]),h:Math.abs(p[1]-tcs[1])};tdraw()});
  tec.addEventListener('pointerup',()=>{tcs=null;if(TM.crop&&(TM.crop.w<1||TM.crop.h<1))TM.crop=null;tdraw()});
  $('#tupb').onclick=()=>{click();$('#tupf').click()};
  $('#tupf').onchange=async e=>{let n=0;for(const f of e.target.files){if(!f.type.startsWith('image/'))continue;const im=await loadImg(f),c=mk(im.width,im.height);c.getContext('2d').drawImage(im,0,0);const it=await ctNew(c,f.name.replace(/\.[^.]+$/,'').slice(0,24),'CUSTOMS',im.width%16===0&&im.height%16===0?'p':'o');TM.sel=it.id;n++}e.target.value='';tmsg(n?`Added ${n} tile${n>1?'s':''}. Select one to edit it.`:'Please choose image files.');tmUI();gpal();gd()};
  $('#btm').onclick=$('#gtm').onclick=()=>{click();tmUI();open('#mt',1)};

  /* ---- sprite sheet slicer: 16 / 32 / 64 / 128 / 256 or custom grids ---- */
  const SL={raw:null,pc:null,tw:32,th:32,sel:new Set(),skip:true,key:false,cols:0,rows:0,opaque:true,bgc:[0,0,0]};
  function slProc(){const c=mk(SL.raw.width,SL.raw.height),x=c.getContext('2d',{willReadFrequently:true});x.drawImage(SL.raw,0,0);
   if(SL.key){const d=x.getImageData(0,0,c.width,c.height),a=d.data,r=a[0],g=a[1],b=a[2];for(let i=0;i<a.length;i+=4)if(Math.abs(a[i]-r)+Math.abs(a[i+1]-g)+Math.abs(a[i+2]-b)<36)a[i+3]=0;x.putImageData(d,0,0)}SL.pc=c}
  function slEmpty(c,r){const tw=SL.tw,th=SL.th,d=SL.pc.getContext('2d',{willReadFrequently:true}).getImageData(c*tw,r*th,tw,th).data;let any=false,same=true;for(let i=0;i<d.length;i+=4){if(d[i+3]>8)any=true;if(same&&(d[i]!==d[0]||d[i+1]!==d[1]||d[i+2]!==d[2]||d[i+3]!==d[3]))same=false}
   return !any||(SL.opaque&&same&&Math.abs(d[0]-SL.bgc[0])+Math.abs(d[1]-SL.bgc[1])+Math.abs(d[2]-SL.bgc[2])<36)}
  function slSel(){SL.sel=new Set();for(let r=0;r<SL.rows;r++)for(let c=0;c<SL.cols;c++)if(!SL.skip||!slEmpty(c,r))SL.sel.add(r*SL.cols+c)}
  function slDraw(){if(!SL.raw)return;const p=$('#slp'),W=SL.raw.width,H=SL.raw.height,x=p.getContext('2d'),tw=SL.tw,th=SL.th;p.width=W;p.height=H;x.imageSmoothingEnabled=false;
   for(let yy=0;yy<H;yy+=16)for(let xx=0;xx<W;xx+=16){x.fillStyle=((xx+yy)/16)%2?'#c9d6cd':'#e6eee8';x.fillRect(xx,yy,16,16)}
   x.drawImage(SL.pc,0,0);const k=Math.max(1,W/(p.clientWidth||W));
   for(let r=0;r<SL.rows;r++)for(let c=0;c<SL.cols;c++){const on=SL.sel.has(r*SL.cols+c);if(!on){x.fillStyle='rgba(20,30,24,.55)';x.fillRect(c*tw,r*th,tw,th)}x.strokeStyle=on?'#48d848':'rgba(255,255,255,.55)';x.lineWidth=(on?2:1)*k;x.strokeRect(c*tw+k/2,r*th+k/2,tw-k,th-k)}
   $('#slcnt').textContent=SL.cols*SL.rows?`${SL.sel.size} of ${SL.cols*SL.rows} cells selected · ${tw} x ${th} px`:`A ${tw} x ${th} px tile is larger than the image (${W} x ${H}).`;$('#slim').textContent=`IMPORT ${SL.sel.size}`}
  function slSize(w,h){w=Math.max(1,Math.min(1024,Math.round(w)||32));h=Math.max(1,Math.min(1024,Math.round(h)||w));SL.tw=w;SL.th=h;SL.cols=Math.floor(SL.raw.width/w);SL.rows=Math.floor(SL.raw.height/h);
   document.querySelectorAll('#slg [data-g]').forEach(b=>b.classList.toggle('on',w===h&&+b.dataset.g===w));$('#slw').value=w;$('#slh').value=h;$('#slmo').value=w===16&&h===16?'g':'o';slSel();slDraw()}
  $('#slf').onchange=async e=>{const f=e.target.files[0];if(!f)return;const im=await loadImg(f),c=mk(im.width,im.height),x=c.getContext('2d',{willReadFrequently:true});x.drawImage(im,0,0);SL.raw=c;
   const d=x.getImageData(0,0,c.width,c.height).data;SL.bgc=[d[0],d[1],d[2]];SL.opaque=true;for(let i=3;i<d.length;i+=28)if(d[i]<250){SL.opaque=false;break}
   $('#slnm').value=f.name.replace(/\.[^.]+$/,'').slice(0,18)||'tile';$('#slp').style.display='block';slProc();slSize(+$('#slw').value||32,+$('#slh').value||32);$('#slmsg').textContent='Click cells to include or skip them. Tiles are cut at the width and height you set.'};
  $('#slg').onclick=e=>{const b=e.target.closest('[data-g]');if(b){click();$('#slw').value=$('#slh').value=b.dataset.g;if(SL.raw)slSize(+b.dataset.g,+b.dataset.g)}};
  const slApply=()=>{if(SL.raw)slSize(+$('#slw').value,+$('#slh').value)};
  $('#slap').onclick=()=>{click();slApply()};$('#slw').onchange=$('#slh').onchange=slApply;
  $('#slsk').onclick=e=>{click();SL.skip=!SL.skip;e.target.classList.toggle('on',SL.skip);e.target.textContent='SKIP EMPTY: '+(SL.skip?'ON':'OFF');if(SL.raw){slSel();slDraw()}};
  $('#slky').onclick=e=>{click();SL.key=!SL.key;e.target.classList.toggle('on',SL.key);e.target.textContent='CORNER COLOUR CLEAR: '+(SL.key?'ON':'OFF');if(SL.raw){slProc();slSel();slDraw()}};
  $('#sla').onclick=()=>{if(!SL.raw)return;click();SL.sel=new Set([...Array(SL.cols*SL.rows).keys()]);slDraw()};$('#sln').onclick=()=>{if(!SL.raw)return;click();SL.sel.clear();slDraw()};
  $('#slp').onclick=e=>{if(!SL.raw)return;const b=e.target.getBoundingClientRect(),c=Math.floor((e.clientX-b.left)*SL.raw.width/b.width/SL.tw),r=Math.floor((e.clientY-b.top)*SL.raw.height/b.height/SL.th);if(c<0||r<0||c>=SL.cols||r>=SL.rows)return;const k=r*SL.cols+c;SL.sel.has(k)?SL.sel.delete(k):SL.sel.add(k);tone(880,0,.03);slDraw()};
  $('#slim').onclick=async()=>{if(!SL.raw||!SL.sel.size){$('#slmsg').textContent='Choose an image and select at least one cell.';return}click();
   const list=[...SL.sel].sort((a,b)=>a-b).slice(0,600),cat=upCat($('#slcat').value),mode=$('#slmo').value,pre=$('#slnm').value.trim()||'tile',tw=SL.tw,th=SL.th;let n=0;
   for(const k of list){const c=k%SL.cols,r=Math.floor(k/SL.cols),t=mk(tw,th);t.getContext('2d').drawImage(SL.pc,c*tw,r*th,tw,th,0,0,tw,th);await ctNew(t,`${pre} ${++n}`,cat,mode);$('#slmsg').textContent=`Importing ${n} of ${list.length}...`}
   $('#slmsg').textContent=`Imported ${n} tiles into ${cat}. Find them in the garden dock and the Tile Manager.`;G.cat=cat;tmUI();gpal();gd()};
  $('#bsl').onclick=$('#bsl2').onclick=()=>{click();open('#msl',1);if(SL.raw)slDraw()};
  /* ---- pixel creator: any canvas size, a docked palette, optional faint reference image ---- */
  const hexOf=a=>'#'+a.slice(0,3).map(v=>Math.round(v).toString(16).padStart(2,'0')).join(''),rgbOf=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
  const PX={w:32,h:32,z:12,zmax:32,cv:mk(32,32),tool:'pencil',col:'#383838',pal:LS('fq_pix_pal')||['#383838','#f8f8f8','#78c850','#48a030','#e84860','#f8d030','#48c8f8','#a0623c'],hist:[],redo:[],grid:true,bs:1,fill:false,trim:false,ref:null,refOp:.35,refShow:true,rc:null,pv:null,st:null,editId:null,init:false,layer:'draw',drawShow:true,pan:null,over:false};
  const pxctx=()=>PX.cv.getContext('2d',{willReadFrequently:true}),pxmsg=m=>$('#pxmsg').textContent=m,pxsave=()=>SV('fq_pix_pal',PX.pal),inb=(x,y)=>x>=0&&y>=0&&x<PX.w&&y<PX.h;
  let pxq=false,pxt;const pxd=()=>{if(!pxq){pxq=true;requestAnimationFrame(pxdraw)}};
  const pxdraft=()=>{if(PX.editId)return;clearTimeout(pxt);pxt=setTimeout(()=>SV('fq_pix_draft',{w:PX.w,h:PX.h,png:PX.cv.toDataURL()}),700)};
  function pxsnap(){PX.hist.push(pxctx().getImageData(0,0,PX.w,PX.h));if(PX.hist.length>40)PX.hist.shift();PX.redo=[]}
  function pxundo(redo){const a=redo?PX.redo:PX.hist,b=redo?PX.hist:PX.redo;if(!a.length)return;b.push(pxctx().getImageData(0,0,PX.w,PX.h));pxctx().putImageData(a.pop(),0,0);pxd();pxdraft()}
  function pxsize(w,h,keep=true){w=Math.max(4,Math.min(256,Math.round(w)||32));h=Math.max(4,Math.min(256,Math.round(h)||32));const n=mk(w,h);if(keep)n.getContext('2d').drawImage(PX.cv,0,0);PX.cv=n;PX.w=w;PX.h=h;PX.hist=[];PX.redo=[];PX.rc=null;
   PX.zmax=Math.max(1,Math.min(32,Math.floor(2048/Math.max(w,h))));const room=Math.min(innerWidth>900?innerWidth-420:innerWidth-60,innerHeight-400);PX.z=Math.max(1,Math.min(PX.zmax,Math.floor(room/Math.max(w,h))||1));
   document.querySelectorAll('#pxs [data-s]').forEach(b=>b.classList.toggle('on',+b.dataset.s===w&&w===h));$('#pxw').value=w;$('#pxh').value=h;$('#pxmo').value=w%16===0&&h%16===0?'p':'o';$('#pxzl').textContent=PX.z+'x';pxd();pxdraft();pxcenter()}
  function pxdraw(){pxq=false;if(!$('#mp').classList.contains('open'))return;const c=$('#pxc'),z=PX.z,W=PX.w*z,H=PX.h*z;if(c.width!==W||c.height!==H){c.width=W;c.height=H}
   const x=c.getContext('2d');x.clearRect(0,0,W,H);
   if(PX.ref&&PX.refShow){const r=PX.ref;x.save();x.globalAlpha=PX.refOp;x.imageSmoothingEnabled=true;x.drawImage(r.img,r.x*z,r.y*z,r.img.width*r.s*z,r.img.height*r.s*z);x.restore()}
   x.imageSmoothingEnabled=false;if(PX.drawShow){x.drawImage(PX.cv,0,0,W,H);if(PX.pv)x.drawImage(PX.pv,0,0,W,H)}
   if(PX.grid&&z>=4){x.lineWidth=1;for(let pass=0;pass<2;pass++){x.strokeStyle=pass?'rgba(0,0,0,.32)':'rgba(0,0,0,.14)';x.beginPath();for(let i=0;i<=PX.w;i++)if((i%8===0)===!!pass){x.moveTo(i*z+.5,0);x.lineTo(i*z+.5,H)}for(let j=0;j<=PX.h;j++)if((j%8===0)===!!pass){x.moveTo(0,j*z+.5);x.lineTo(W,j*z+.5)}x.stroke()}}}
  function pxpal(){$('#pxpal').innerHTML=PX.pal.map(c=>`<button class="sw ${c===PX.col?'on':''}" data-c="${c}" style="background:${c}" aria-label="Colour ${c}" title="${c}"></button>`).join('');$('#pxcol').value=PX.col}
  const pxtool=()=>document.querySelectorAll('[data-px]').forEach(b=>b.classList.toggle('on',b.dataset.px===PX.tool));
  function pxline(a,b,f){let[x0,y0]=a,[x1,y1]=b;const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let er=dx+dy;for(let n=0;n<4096;n++){f(x0,y0);if(x0===x1&&y0===y1)break;const e2=2*er;if(e2>=dy){er+=dy;x0+=sx}if(e2<=dx){er+=dx;y0+=sy}}}
  function pxdot(X,x,y,erase){const s=PX.bs,o=Math.floor((s-1)/2);if(erase)X.clearRect(x-o,y-o,s,s);else{X.fillStyle=PX.col;X.fillRect(x-o,y-o,s,s)}}
  function pxshape(X,k,a,b){X.fillStyle=PX.col;if(k==='line')pxline(a,b,(x,y)=>pxdot(X,x,y));else{const x0=Math.min(a[0],b[0]),x1=Math.max(a[0],b[0]),y0=Math.min(a[1],b[1]),y1=Math.max(a[1],b[1]),s=PX.bs,w=x1-x0+1,h=y1-y0+1;if(PX.fill)X.fillRect(x0,y0,w,h);else{X.fillRect(x0,y0,w,s);X.fillRect(x0,y1-s+1,w,s);X.fillRect(x0,y0,s,h);X.fillRect(x1-s+1,y0,s,h)}}}
  function pxfill(x,y){if(!inb(x,y))return;const X=pxctx(),im=X.getImageData(0,0,PX.w,PX.h),d=im.data,W=PX.w,[r,g,b]=rgbOf(PX.col),i0=(y*W+x)*4,tr=d[i0],tg=d[i0+1],tb=d[i0+2],ta=d[i0+3];if(ta===255&&tr===r&&tg===g&&tb===b)return;pxsnap();
   const st=[[x,y]],m=i=>d[i]===tr&&d[i+1]===tg&&d[i+2]===tb&&d[i+3]===ta;while(st.length){const[px,py]=st.pop();if(px<0||py<0||px>=W||py>=PX.h)continue;const i=(py*W+px)*4;if(!m(i))continue;d[i]=r;d[i+1]=g;d[i+2]=b;d[i+3]=255;st.push([px+1,py],[px-1,py],[px,py+1],[px,py-1])}X.putImageData(im,0,0)}
  function pxrefcv(){if(!PX.ref)return null;if(!PX.rc){const c=mk(PX.w,PX.h),x=c.getContext('2d',{willReadFrequently:true}),r=PX.ref;x.imageSmoothingEnabled=true;x.drawImage(r.img,r.x,r.y,r.img.width*r.s,r.img.height*r.s);PX.rc=c}return PX.rc}
  function pxpick(p){if(!inb(p[0],p[1]))return;let d=pxctx().getImageData(p[0],p[1],1,1).data;if(d[3]<10){const rc=PX.refShow?pxrefcv():null;if(!rc)return;d=rc.getContext('2d',{willReadFrequently:true}).getImageData(p[0],p[1],1,1).data;if(d[3]<10)return}
   PX.col=hexOf([d[0],d[1],d[2]]);if(!PX.pal.includes(PX.col)){PX.pal.push(PX.col);pxsave()}pxpal()}
  function pxfitref(){const r=PX.ref;if(!r)return;const k=Math.min(PX.w/r.img.width,PX.h/r.img.height);r.base=k;r.s=k;r.x=(PX.w-r.img.width*k)/2;r.y=(PX.h-r.img.height*k)/2;PX.rc=null;$('#pxrs').value=100}
  const pxc=$('#pxc'),pxpt=e=>{const b=pxc.getBoundingClientRect();return[Math.floor((e.clientX-b.left)*PX.w/b.width),Math.floor((e.clientY-b.top)*PX.h/b.height)]};
  pxc.addEventListener('pointerdown',e=>{if(e.button===1){e.preventDefault();pxc.setPointerCapture(e.pointerId);const v=$('#pxview');PX.pan={x:e.clientX,y:e.clientY,l:v.scrollLeft,t:v.scrollTop};return}if(e.button>0)return;if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();pxc.setPointerCapture(e.pointerId);const p=pxpt(e),k=PX.tool;PX.st={p,last:p,k};
   if(k!=='ref'&&k!=='pick'&&!PX.drawShow){PX.st=null;pxmsg('Layer 2 (drawing) is hidden. Show it to draw.');return}
   if(k==='ref'){if(!PX.ref||!PX.refShow){PX.st=null;pxmsg(PX.ref?'Layer 1 (reference) is hidden. Show it to move it.':'Load a reference image first.');return}PX.st.r={x:PX.ref.x,y:PX.ref.y,sx:e.clientX,sy:e.clientY};return}
   if(k==='pick'){pxpick(p);PX.st=null;return}
   if(k==='fill'){pxfill(p[0],p[1]);PX.st=null;pxd();pxdraft();return}
   if(k==='pencil'||k==='eraser'){pxsnap();pxdot(pxctx(),p[0],p[1],k==='eraser');pxd()}else PX.pv=mk(PX.w,PX.h)});
  pxc.addEventListener('pointermove',e=>{if(PX.pan){const v=$('#pxview');v.scrollLeft=PX.pan.l-(e.clientX-PX.pan.x);v.scrollTop=PX.pan.t-(e.clientY-PX.pan.y);return}PX.mx=e.clientX;PX.my=e.clientY;const p=pxpt(e);$('#pxpos').textContent=inb(p[0],p[1])?`${p[0]}, ${p[1]}`:'';const s=PX.st;if(!s)return;
   if(s.k==='ref'){if(s.r){PX.ref.x=s.r.x+(e.clientX-s.r.sx)/PX.z;PX.ref.y=s.r.y+(e.clientY-s.r.sy)/PX.z;PX.rc=null;pxd()}return}
   if(s.k==='pencil'||s.k==='eraser'){pxline(s.last,p,(x,y)=>pxdot(pxctx(),x,y,s.k==='eraser'));s.last=p;pxd()}
   else{PX.pv=mk(PX.w,PX.h);pxshape(PX.pv.getContext('2d'),s.k,s.p,p);pxd()}});
  const pxend=e=>{if(PX.pan){PX.pan=null;return}const s=PX.st;if(!s)return;PX.st=null;if(s.k==='line'||s.k==='rect'){const p=pxpt(e);pxsnap();pxshape(pxctx(),s.k,s.p,p);PX.pv=null}if(s.k!=='ref')pxdraft();pxd()};
  pxc.addEventListener('pointerup',pxend);pxc.addEventListener('pointercancel',()=>{PX.pan=null;PX.st=null;PX.pv=null;pxd()});
  $('#pxpal').onclick=e=>{const b=e.target.closest('[data-c]');if(b){click();PX.col=b.dataset.c;pxpal()}};
  $('#pxcol').oninput=e=>{PX.col=e.target.value;document.querySelectorAll('#pxpal .sw').forEach(s=>s.classList.toggle('on',s.dataset.c===PX.col))};
  $('#pxadd').onclick=()=>{click();if(!PX.pal.includes(PX.col)){PX.pal.push(PX.col);pxsave()}pxpal()};
  $('#pxdel').onclick=()=>{click();PX.pal=PX.pal.filter(c=>c!==PX.col);pxsave();if(PX.pal.length)PX.col=PX.pal[0];pxpal()};
  $('#pxex').onclick=()=>{if(!PX.ref){pxmsg('Load a reference image first.');return}click();const c=mk(64,64),x=c.getContext('2d');x.drawImage(PX.ref.img,0,0,64,64);const d=x.getImageData(0,0,64,64).data,m=new Map();
   for(let i=0;i<d.length;i+=4){if(d[i+3]<128)continue;const k=((d[i]>>4)<<8)|((d[i+1]>>4)<<4)|(d[i+2]>>4),o=m.get(k)||[0,0,0,0];o[0]++;o[1]+=d[i];o[2]+=d[i+1];o[3]+=d[i+2];m.set(k,o)}
   const L=[...m.values()].sort((a,b)=>b[0]-a[0]).map(o=>[o[1]/o[0],o[2]/o[0],o[3]/o[0]]),out=[];for(const q of L){if(out.length>=12)break;if(out.every(w=>Math.abs(w[0]-q[0])+Math.abs(w[1]-q[1])+Math.abs(w[2]-q[2])>60))out.push(q)}
   out.forEach(q=>{const h=hexOf(q);if(!PX.pal.includes(h))PX.pal.push(h)});pxsave();pxpal();pxmsg(`Added up to ${out.length} colours from the reference.`)};
  $('#pxtr').onclick=()=>{const rc=pxrefcv();if(!rc){pxmsg('Load a reference image first.');return}if(!PX.pal.length){pxmsg('Add some palette colours first.');return}click();pxsnap();
   const rd=rc.getContext('2d',{willReadFrequently:true}).getImageData(0,0,PX.w,PX.h).data,X=pxctx(),im=X.getImageData(0,0,PX.w,PX.h),d=im.data,P=PX.pal.map(rgbOf);
   for(let i=0;i<rd.length;i+=4){if(rd[i+3]<40)continue;let b=0,bd=1e9;P.forEach((q,n)=>{const e=(q[0]-rd[i])**2+(q[1]-rd[i+1])**2+(q[2]-rd[i+2])**2;if(e<bd){bd=e;b=n}});d[i]=P[b][0];d[i+1]=P[b][1];d[i+2]=P[b][2];d[i+3]=255}
   X.putImageData(im,0,0);pxd();pxdraft();pxmsg('Traced the reference with your palette. Tidy it up with the tools.')};
  $('#pxrl').onclick=()=>{click();$('#pxrf').click()};
  $('#pxrf').onchange=async e=>{const f=e.target.files[0];if(!f)return;const im=await loadImg(f);PX.ref={img:im,x:0,y:0,s:1,base:1};pxfitref();PX.refShow=true;layerUI();pxd();pxmsg('Reference loaded. Adjust opacity and scale, or drag it with MOVE REF.');e.target.value=''};
  $('#pxrfit').onclick=()=>{click();pxfitref();pxd()};
  $('#pxrx').onclick=()=>{click();PX.ref=null;PX.rc=null;layerUI();pxd()};
    $('#pxro').oninput=e=>{PX.refOp=e.target.value/100;pxd()};
  $('#pxrs').oninput=e=>{const r=PX.ref;if(!r)return;const cx=r.x+r.img.width*r.s/2,cy=r.y+r.img.height*r.s/2;r.s=r.base*e.target.value/100;r.x=cx-r.img.width*r.s/2;r.y=cy-r.img.height*r.s/2;PX.rc=null;pxd()};
  document.querySelectorAll('[data-px]').forEach(b=>b.onclick=()=>{click();pxset(b.dataset.px)});
  $('#pxs').onclick=e=>{const b=e.target.closest('[data-s]');if(b){click();pxsize(+b.dataset.s,+b.dataset.s)}};
  $('#pxap').onclick=()=>{click();pxsize(+$('#pxw').value,+$('#pxh').value)};
  $('#pxbs').onchange=e=>PX.bs=+e.target.value;
  $('#pxfl').onclick=e=>{click();PX.fill=!PX.fill;e.target.classList.toggle('on',PX.fill);e.target.textContent='RECT FILL: '+(PX.fill?'ON':'OFF')};
  $('#pxtm').onclick=e=>{click();PX.trim=!PX.trim;e.target.classList.toggle('on',PX.trim);e.target.textContent='TRIM EDGES: '+(PX.trim?'ON':'OFF')};
  $('#pxcl').onclick=async()=>{if(await ask('Clear the whole canvas? You can undo this.','CLEAR CANVAS','CLEAR CANVAS?')){pxsnap();pxctx().clearRect(0,0,PX.w,PX.h);pxd();pxdraft()}};
  $('#pxu').onclick=()=>{click();pxundo(false)};$('#pxr').onclick=()=>{click();pxundo(true)};
  const pxz=d=>{const v=$('#pxview').getBoundingClientRect();pxzoomAt(PX.z+d,v.left+v.width/2,v.top+v.height/2)};$('#pxzm').onclick=()=>{click();pxz(-1)};$('#pxzp').onclick=()=>{click();pxz(1)};
  $('#pxgr').onclick=()=>{click();PX.grid=!PX.grid;pxd()};
  function pxout(){const o=mk(PX.w,PX.h);o.getContext('2d').drawImage(PX.cv,0,0);const d=o.getContext('2d').getImageData(0,0,PX.w,PX.h).data;let any=false;for(let i=3;i<d.length;i+=4)if(d[i]>0){any=true;break}if(!any)return null;return PX.trim?trimc(o):o}
  $('#pxad').onclick=async()=>{const o=pxout();if(!o){pxmsg('The canvas is empty. Draw something first.');return}click();const nm=$('#pxnm').value.trim()||'pixel art',cat=upCat($('#pxcat').value),it=await ctNew(o,nm.slice(0,24),cat,$('#pxmo').value);
   G.cat=it.cat;G.sel=it.id;TM.sel=it.id;tmUI();gpal();gd();pxmsg(`Added "${it.name}" to ${cat}. It is selected in the garden dock.`)};
  $('#pxup').onclick=async()=>{const it=CTM.get(PX.editId),o=pxout();if(!it||!o){pxmsg('Nothing to update.');return}click();it.name=$('#pxnm').value.trim().slice(0,24)||it.name;it.cat=upCat($('#pxcat').value);it.mode=$('#pxmo').value;await ctApply(it,o);pxmsg(`Updated "${it.name}".`)};
  $('#pxpn').onclick=()=>{const o=pxout();if(!o){pxmsg('The canvas is empty.');return}o.toBlob(b=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=($('#pxnm').value.trim()||'pixel-art')+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1500)})};
  function pxopen(tile){const was=PX.editId;open('#mp',1);
   if(!PX.init){PX.init=true;const dr=LS('fq_pix_draft');if(dr&&dr.png){const im=new Image();im.onload=()=>{pxsize(dr.w,dr.h,false);pxctx().drawImage(im,0,0);pxd()};im.src=dr.png}else pxsize(32,32,false)}
   if(tile){if(tile.w>256||tile.h>256)pxmsg('Tiles larger than 256 px cannot be edited here.');else{PX.editId=tile.id;pxsize(tile.w,tile.h,false);pxctx().drawImage(tile.img,0,0);$('#pxnm').value=tile.name;$('#pxcat').value=tile.cat;$('#pxmo').value=tile.mode;pxmsg('Editing an existing tile. Press UPDATE TILE to save your changes.')}}
   else if(was){PX.editId=null;pxsize(32,32,false);pxmsg('Started a fresh canvas.')}
   $('#pxup').style.display=PX.editId?'':'none';pxpal();pxtool();layerUI();pxd();pxcenter()}
  $('#bpx').onclick=$('#bpx2').onclick=$('#gpx').onclick=()=>{click();pxopen()};
  $('#tepx').onclick=()=>{const it=tcur();if(it){click();pxopen(it)}};
  addEventListener('keydown',e=>{if(!$('#mp').classList.contains('open')||typing(e.target))return;const k=e.key.toLowerCase();
   if((e.ctrlKey||e.metaKey)&&(k==='z'||k==='y')){e.preventDefault();pxundo(k==='y'||e.shiftKey);return}if(e.ctrlKey||e.metaKey||e.altKey)return;
   const m={p:'pencil',e:'eraser',f:'fill',i:'pick',l:'line',r:'rect',m:'ref'}[k];if(m)pxset(m);else if(k==='g'){PX.grid=!PX.grid;pxd()}else if(k==='['||k===']'){PX.bs=Math.max(1,Math.min(4,PX.bs+(k===']'?1:-1)));$('#pxbs').value=PX.bs}});
  /* layers: 1 = reference image (under), 2 = drawing (on top); each can be hidden */
  function pxset(k){PX.tool=k;PX.layer=k==='ref'?'ref':'draw';pxtool();layerUI()}
  function layerUI(){$('#lyre').classList.toggle('off',!PX.refShow);$('#lyde').classList.toggle('off',!PX.drawShow);
   document.querySelectorAll('[data-ly]').forEach(l=>l.classList.toggle('on',l.dataset.ly===PX.layer));document.querySelectorAll('.lyrsel').forEach(b=>b.setAttribute('aria-pressed',b.closest('[data-ly]').dataset.ly===PX.layer));$('#lyrs').textContent='IMAGE · '+(PX.ref?(PX.refShow?'loaded':'hidden'):'none')}
  $('#lyre').onclick=e=>{e.stopPropagation();click();PX.refShow=!PX.refShow;layerUI();pxd()};
  $('#lyde').onclick=e=>{e.stopPropagation();click();PX.drawShow=!PX.drawShow;layerUI();pxd()};
  const lyPick=l=>{click();if(l==='ref'){if(!PX.ref)pxmsg('Layer 1 holds a reference image. Press LOAD to add one.');pxset('ref')}else pxset(PX.tool==='ref'?'pencil':PX.tool)};
  document.querySelectorAll('[data-ly]').forEach(l=>{l.onclick=()=>lyPick(l.dataset.ly);l.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();lyPick(l.dataset.ly)}}});
  /* canvas zoom: Ctrl +/-/0 and Ctrl + wheel (only while the pointer is over the canvas), middle mouse pans */
  function pxcenter(){requestAnimationFrame(()=>{const v=$('#pxview');v.scrollLeft=(v.scrollWidth-v.clientWidth)/2;v.scrollTop=(v.scrollHeight-v.clientHeight)/2})}
  function pxzoomAt(nz,cx,cy){nz=Math.max(1,Math.min(PX.zmax,nz));if(nz===PX.z)return;const c=$('#pxc'),b=c.getBoundingClientRect(),u=(cx-b.left)/PX.z,w=(cy-b.top)/PX.z;PX.z=nz;$('#pxzl').textContent=nz+'x';pxq=true;pxdraw();
   const b2=c.getBoundingClientRect(),v=$('#pxview');v.scrollLeft+=b2.left+u*nz-cx;v.scrollTop+=b2.top+w*nz-cy}
  pxc.addEventListener('pointerenter',()=>{PX.over=true});pxc.addEventListener('pointerleave',()=>{PX.over=false});pxc.addEventListener('mousedown',e=>{if(e.button===1)e.preventDefault()});
  pxc.addEventListener('wheel',e=>{if(!(e.ctrlKey||e.metaKey))return;e.preventDefault();pxzoomAt(PX.z+(e.deltaY<0?1:-1)*Math.max(1,Math.round(PX.z*.2)),e.clientX,e.clientY)},{passive:false});
  addEventListener('keydown',e=>{if(!(e.ctrlKey||e.metaKey))return;const k=e.key,up=k==='+'||k==='='||k==='Add',dn=k==='-'||k==='_'||k==='Subtract',rs=k==='0';if(!up&&!dn&&!rs)return;
   if(PX.over&&$('#mp').classList.contains('open')){e.preventDefault();if(rs){const v=$('#pxview').getBoundingClientRect();pxzoomAt(Math.max(1,Math.floor(Math.min(innerWidth>900?innerWidth-420:innerWidth-60,innerHeight-400)/Math.max(PX.w,PX.h))),v.left+v.width/2,v.top+v.height/2)}else pxzoomAt(PX.z+(up?1:-1)*Math.max(1,Math.round(PX.z*.2)),PX.mx,PX.my)}
   else if(G.over&&$('#mg').classList.contains('open')){e.preventDefault();if(rs)gzoomAt(3-G.z,G.mx,G.my);else gzoomAt(up?1:-1,G.mx,G.my)}},true);
  addEventListener('resize',()=>pxd());
  new ResizeObserver(()=>{const v=$('#gview');gcv.width=v.clientWidth;gcv.height=v.clientHeight;gd()}).observe($('#gview'));
  /* ---- animated garden sprites (torches, fire, doors, chests): redraw only while one is on screen ---- */
  setInterval(()=>{if(G.anim&&!document.hidden&&!reducedMotion()&&$('#mg').classList.contains('open'))gd()},160);

  /* ---- garden fullscreen ---- */
  const gfsOn=()=>$('#mg').classList.contains('full');
  function gfsSet(v){const m=$('#mg'),b=$('#gfs');m.classList.toggle('full',v);b.dataset.tip=v?'Exit preview · Esc':'Full screen · preview your world';b.setAttribute('aria-label',v?'Exit full screen preview':'Full screen world preview');b.setAttribute('aria-pressed',v);G.hov=null;hud();
   if(v){if(m.requestFullscreen&&!document.fullscreenElement){const p=m.requestFullscreen();if(p&&p.catch)p.catch(()=>{})}}
   else if(document.fullscreenElement&&document.exitFullscreen){const p=document.exitFullscreen();if(p&&p.catch)p.catch(()=>{})}
   gd()}
  $('#gfs').onclick=()=>{click();gfsSet(!gfsOn())};
  document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&gfsOn())gfsSet(false)});
  new MutationObserver(()=>{if(!$('#mg').classList.contains('open')&&gfsOn())gfsSet(false)}).observe($('#mg'),{attributes:true,attributeFilter:['class']});
  $('#bg').onclick=()=>{click();$('#gzl').textContent=G.z+'x';open('#mg',1);toolUI();gpal();gd()};
  /* ---- tooltips for [data-tip] buttons: hover, keyboard focus, or press and hold on touch ---- */
  {const tip=document.createElement('div');tip.id='tip';tip.setAttribute('role','tooltip');tip.hidden=true;document.body.appendChild(tip);let hideT,lp;
   const show=el=>{clearTimeout(hideT);tip.textContent=el.dataset.tip;tip.hidden=false;const b=el.getBoundingClientRect(),t=tip.getBoundingClientRect();let x,y;
    if(el.closest('.gl')&&innerWidth>=768){x=b.right+8;y=b.top+(b.height-t.height)/2}else{x=b.left+(b.width-t.width)/2;y=b.top<innerHeight/2?b.bottom+8:b.top-t.height-8}
    tip.style.left=clamp(x,4,Math.max(4,innerWidth-t.width-4))+'px';tip.style.top=clamp(y,4,Math.max(4,innerHeight-t.height-4))+'px'};
   const off=()=>{clearTimeout(hideT);tip.hidden=true},near=e=>e.target.closest&&e.target.closest('[data-tip]');
   document.addEventListener('pointerover',e=>{if(e.pointerType==='touch')return;const el=near(e);if(el)show(el)});
   document.addEventListener('pointerout',e=>{if(near(e))off()});
   document.addEventListener('focusin',e=>{const el=near(e);if(el&&e.target.matches(':focus-visible'))show(el)});document.addEventListener('focusout',off);
   document.addEventListener('pointerdown',e=>{off();clearTimeout(lp);if(e.pointerType!=='touch')return;const el=near(e);if(!el)return;lp=setTimeout(()=>{el.dataset.held='1';show(el);hideT=setTimeout(off,1800)},420)});
   const stop=()=>clearTimeout(lp);document.addEventListener('pointerup',stop);document.addEventListener('pointercancel',stop);document.addEventListener('pointermove',e=>{if(e.pointerType==='touch'&&Math.abs(e.movementX||0)+Math.abs(e.movementY||0)>2)stop()});
   document.addEventListener('click',e=>{const el=near(e);if(el&&el.dataset.held){delete el.dataset.held;e.preventDefault();e.stopImmediatePropagation()}},true);  // a long press only shows the name
   document.addEventListener('contextmenu',e=>{if(near(e))e.preventDefault()})}
  addEventListener('keydown',e=>{if($('#mg').classList.contains('open')&&e.key===' '&&!typing(e.target)){G.space=true;e.preventDefault()}});addEventListener('keyup',e=>{if(e.key===' ')G.space=false});
  /* ---- accessibility settings: font, text size, contrast, motion ---- */
  const A11Y={font:{id:'a11yfont',o:{pixel:'PIXEL',readable:'READABLE'}},text:{id:'a11ytext',o:{normal:'NORMAL',l:'LARGE',xl:'EXTRA'}},contrast:{id:'a11ycon',o:{normal:'NORMAL',high:'HIGH'}},motion:{id:'a11ymo',o:{auto:'AUTO',reduced:'REDUCED',full:'FULL'}}};
  function reducedMotion(){const m=document.documentElement.dataset.motion;return m==='reduced'||(m!=='full'&&matchMedia('(prefers-reduced-motion: reduce)').matches)}
  function applyA11y(){const d=document.documentElement.dataset,a=S.a11y;d.font=a.font==='readable'?'readable':'pixel';d.text=a.text;d.contrast=a.contrast;d.motion=a.motion;
   if(a.font==='readable'&&!document.getElementById('fq-readable-font')){const l=document.createElement('link');l.id='fq-readable-font';l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap';document.head.appendChild(l)}ui()}
  function a11yUI(){for(const k in A11Y){const e=$('#'+A11Y[k].id);if(e)e.innerHTML=Object.entries(A11Y[k].o).map(([v,l])=>`<button class="gb sm ${S.a11y[k]===v?'on':''}" data-a="${k}:${v}" aria-pressed="${S.a11y[k]===v}">${l}</button>`).join('')}}
  Object.values(A11Y).forEach(g=>{$('#'+g.id).onclick=e=>{const b=e.target.closest('[data-a]');if(!b)return;const[k,v]=b.dataset.a.split(':');click();S.a11y[k]=v;save();applyA11y();a11yUI()}});
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener&&matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',()=>{ui()});
  /* announcements for screen readers (polite live region in the Buddy component) */
  function announce(m){const e=$('#sr');if(!e)return;e.textContent='';setTimeout(()=>{e.textContent=m},60)}
  /* ---- in-app confirm dialog (replaces window.confirm) ---- */
  let pendingAsk=null;
  function ask(msg,yes='CONFIRM',title='ARE YOU SURE?'){if(pendingAsk)pendingAsk(false);return new Promise(res=>{$('#mcft').textContent=title;$('#mcfm').textContent=msg;$('#mcfy').textContent=yes;
   const done=v=>{pendingAsk=null;open('#mcf',0);res(v)};pendingAsk=res;$('#mcfy').onclick=()=>{click();done(true)};$('#mcfn').onclick=()=>{click();done(false)};open('#mcf',1)})}
  /* ---- dialog accessibility: inert background, focus in and back out, Tab trap, scroll lock ---- */
  {let trigger=null,top=null,count=0;
   const focusables=m=>[...m.querySelectorAll('button:not([disabled]),[href],input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(e=>e.offsetParent!==null||e===document.activeElement);
   const sync=()=>{const open=[...document.querySelectorAll('.modal.open')],n=open.length+(document.querySelector('.amodal.open')?1:0);
    ['.frame','#pet','.skip'].forEach(s=>document.querySelectorAll(s).forEach(e=>n?e.setAttribute('inert',''):e.removeAttribute('inert')));
    document.body.style.overflow=n?'hidden':'';
    if(n&&!count)trigger=document.activeElement;
    const tp=open[open.length-1]||null;
    if(tp&&tp!==top){const f=tp.querySelector('[data-autofocus],.mi.on,.sb input:not([type=hidden]):not([type=file]),.sb select,.sb button,button');requestAnimationFrame(()=>(f||tp).focus())}
    top=tp;if(!n&&count&&trigger&&document.contains(trigger))requestAnimationFrame(()=>trigger.focus());count=n;
    if(pendingAsk&&!$('#mcf').classList.contains('open')){const r=pendingAsk;pendingAsk=null;r(false)}};
   new MutationObserver(sync).observe(document.body,{subtree:true,attributes:true,attributeFilter:['class']});
   addEventListener('keydown',e=>{if(e.key!=='Tab')return;const o=[...document.querySelectorAll('.modal.open')];if(!o.length)return;const m=o[o.length-1],f=focusables(m);if(!f.length){e.preventDefault();return}const a=f[0],z=f[f.length-1];
    if(!m.contains(document.activeElement)){e.preventDefault();a.focus()}else if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}},true)}
  /* ---- buddy facts and jokes: hover, focus, tap or Enter; fresh ones come from public APIs (see src/data/funFacts.js) ---- */
  let tkTimer=null,tkBusy=false,tkLast=null,tkAt=0,tkSeq=0;
  function tkUI(){const on=$('#tkon');if(on){on.textContent=S.talk.on?'ON':'OFF';on.classList.toggle('on',S.talk.on);on.setAttribute('aria-pressed',S.talk.on)}
   const m=$('#tkm');if(m)m.innerHTML=[['both','BOTH'],['facts','FACTS'],['jokes','JOKES']].map(([v,l])=>`<button class="gb sm ${S.talk.mode===v?'on':''}" data-tm="${v}" aria-pressed="${S.talk.mode===v}">${l}</button>`).join('')}
  $('#tkon').onclick=()=>{click();S.talk.on=!S.talk.on;save();tkUI()};
  $('#tkm').onclick=e=>{const b=e.target.closest('[data-tm]');if(b){click();S.talk.mode=b.dataset.tm;tkLast=null;save();tkUI()}};
  function showTalk(it,replay){const label=(it.kind==='joke'?'JOKE':'FACT')+(it.offline?' (OFFLINE)':''),full=it.punch?`${it.text}\n${it.punch}`:it.text,dur=Math.min(16,3.5+full.length*.065);
   if(it.punch&&!replay&&!reducedMotion()){const first=`${label}: ${it.text}`;talk(first,2.6,5);setTimeout(()=>{if(P.bs===first)talk(`${label}: ${full}`,dur,5)},2500)}else talk(`${label}: ${full}`,dur,5);
   if(!replay)announce(`${label.toLowerCase()}: ${full.replace('\n',' ')}`)}
  async function buddyTalk(){if(!S.talk.on||drag||tkBusy)return;
   if(tkLast&&Date.now()-tkAt<20000){showTalk(tkLast,true);return}
   tkBusy=true;const my=++tkSeq;talk('...',4,5);let it;try{it=await getTalk(S.talk.mode)}finally{tkBusy=false}
   if(my!==tkSeq)return;tkLast=it;tkAt=Date.now();showTalk(it)}
  el.addEventListener('pointerenter',e=>{if(e.pointerType==='touch'||drag)return;P.hov=true;clearTimeout(tkTimer);tkTimer=setTimeout(buddyTalk,260)});
  el.addEventListener('pointerleave',()=>{P.hov=false;clearTimeout(tkTimer);if(P.bt>2)P.bt=2});
  el.addEventListener('focus',()=>{P.hov=true;buddyTalk()});el.addEventListener('blur',()=>{P.hov=false});
  el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();meow();react('pet');buddyTalk()}});
  /* ---- backend DTOs: the same data in the shapes documented in README "Backend API reference" ---- */
  // Sprites (built-in ids 1..N, custom ids from 1001), the 2-layer garden grid, tasks and the signed-in user are rebuilt
  // from the live state on demand and printed to the console on every page load. Nothing here is sent anywhere yet.
  let authUser=null,dtoReady=false,dtT;const BOOT=Date.now(),uid=()=>authUser?authUser.id??null:null;
  const sidOf=id=>typeof id==='number'?id+1:(CTM.get(id)?.sid||0);
  function pxMatrix(src,x,y,w,h){const c=mk(w,h),cx=c.getContext('2d',{willReadFrequently:true});cx.drawImage(src,x,y,w,h,0,0,w,h);return imageDataToMatrix(cx.getImageData(0,0,w,h))}
  function builtinSprites(){if(!AI.complete)return [];const n={};return BI.map(it=>{n[it.cat]=(n[it.cat]||0)+1;return spriteDto({id:it.id+1,clientId:'builtin-'+(it.id+1),name:`${it.cat} ${n[it.cat]}`,category:it.cat,type:SPRITE_TYPES[it.mode],data:pxMatrix(AI,it.x,it.y,it.w,it.h),user:null,created:BUILTIN_TS,updated:BUILTIN_TS,system:true})})}
  function customSprites(){return CT.filter(it=>it.img&&it.img.complete).map(it=>spriteDto({id:it.sid,clientId:it.id,name:it.name,category:it.cat,type:SPRITE_TYPES[it.mode],data:pxMatrix(it.img,0,0,it.w,it.h),user:uid(),created:it.created,updated:it.updated}))}
  function gardenData(){const l1=[],l2=[];for(let r=0;r<GH;r++){const a=new Array(GW).fill(0),b=new Array(GW).fill(0);for(let c=0;c<GW;c++){const cell=G.cells.get(r*GW+c);if(cell){a[c]=sidOf(cell[0])||0;if(cell.length>1)b[c]=sidOf(cell[1])||0}}l1.push(a);l2.push(b)}
   return gardenDto({layer1:l1,layer2:l2,sizeX:GW,sizeY:GH,tileSize:TS,user:uid(),created:GM.created||GM.updated||BOOT,updated:GM.updated||GM.created||BOOT})}
  const dto={user:()=>userDto(authUser),tasks:()=>S.tasks.map((x,i)=>taskDto(x,i,uid())),sprites:o=>[...(o&&o.builtin?builtinSprites():[]),...customSprites()],garden:gardenData,
   all:o=>({user:dto.user(),tasks:dto.tasks(),sprites:dto.sprites(o),garden:dto.garden()})};
  function dtoPrint(why){const d=dto.all(),f=m=>m.flat().filter(Boolean).length;
   console.groupCollapsed(`%c[Pixel Space] backend DTOs · ${why}`,'color:#48a030;font-weight:bold');
   console.log('user',d.user);console.log(`tasks (${d.tasks.length})`,d.tasks);console.log(`sprites (${d.sprites.length} custom)`,d.sprites);
   console.log(`garden ${GW}x${GH} · layer-1 cells: ${f(d.garden['layer-1'])} · layer-2 cells: ${f(d.garden['layer-2'])}`,d.garden);
   console.info(`Built-in sprites are ids 1..${BI.length} (docs/seed/builtin-sprites.json). Helpers: fq.dto.all({builtin:true}), fq.dto.garden(), fq.dto.sprites(), fq.dto.tasks(), fq.dto.user()`);console.groupEnd()}
  function dtoChanged(why){if(!dtoReady||localStorage.getItem('fq_debug_dto')!=='1')return;clearTimeout(dtT);dtT=setTimeout(()=>dtoPrint(why),500)}
  addEventListener('fq:auth-changed',e=>{authUser=e.detail.user||null;if(dtoReady&&e.detail.status!=='checking')dtoPrint('auth '+e.detail.status)});
  window.fq={dto,print:()=>dtoPrint('manual'),dtoVersion:1};
  cal();tasks();reset();size();keysUI();cover();bnLoad();gpal();ctLoad();layerUI();thUI();applyA11y();tkUI();requestAnimationFrame(frame);
}
