'use strict';
// Cambia aquí el nombre y los mensajes de cumpleaños.
// Tu carta: cada elemento de esta lista es un párrafo.
const LETTER_PARAGRAPHS = [
  "Gracias por ser una amiga tan increíble. Me llevo con mucho cariño cada momento contigo: comer juntos, estudiar juntos, hacer los proyectos juntos y pasar tiempo en tu casa.",
  "Me has ayudado más de lo que crees. No sé cómo explicarlo ni cómo decirlo, pero solo quería decirte, simplemente: gracias.",
  "Si necesitas algo o quieres pedirme algo, no dudes en decírmelo. Estaré ahí para ti. A pesar de no ser muy bueno en muchas cosas, aunque sea solo para escucharte, estaré ahí para apoyarte.",
  "¡Feliz cumpleaños, Akemi! Te quiero un montón."
];
const isBirthday = document.body.dataset.page === 'birthday';
const $ = (id) => document.getElementById(id);
const canvas = $('world');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const colors = ['#eaa3b9','#f6d598','#a89aca','#a8c7b5','#fff0d8'];
let state = isBirthday ? 'birthday' : 'intro', started = 0, lastTime = 0, elapsed = 0, particles = [], audio = null, musicTimer = null, musicOn = false;
let seed = 26;
function random(){ seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
const stars = Array.from({length:68},()=>({x:12+random()*376,y:8+random()*196,size:random()>.83?2:1,phase:random()*6.28}));
const sparkles = Array.from({length:16},()=>({x:45+random()*310,y:40+random()*145,phase:random()*6.28}));
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h);}
function cross(x,y,size,c){rect(x-size,y,size*2+1,1,c);rect(x,y-size,1,size*2+1,c);}
function ellipse(x,y,rx,ry,c){ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();}
function glow(x,y,r,a){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(255,186,112,${a})`);g.addColorStop(1,'rgba(255,150,90,0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);}
function flame(x,y,time,scale=1){
  const f=reduceMotion?0:Math.floor(Math.sin(time*11)*1.7);ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
  rect(-2+f,-16,3,4,'#dc754a');rect(-4+f,-12,6,5,'#ed9859');rect(-5,-7,10,9,'#ffc977');rect(-3,2,6,3,'#ed9859');rect(-2,-8,4,10,'#ffe9a6');rect(-1,-3,2,5,'#fff7dd');ctx.restore();
}
function candle(x,y,h,time,lit=true){
  rect(x-6,y,12,h,'#694451');rect(x-5,y,10,h-2,'#d88b9d');rect(x-4,y+1,3,h-3,'#f5c6c2');rect(x+3,y+1,2,h-3,'#aa5d79');
  for(let k=4;k<h-3;k+=10){rect(x-1,y+k,5,3,'#efb8b7');rect(x-4,y+k+3,3,2,'#efb8b7');}
  rect(x-5,y,10,3,'#ffdfc7');rect(x-2,y-5,2,6,'#554044');if(lit)flame(x,y-7,time);
}
function strawberry(x,y){rect(x-4,y-3,8,7,'#713247');rect(x-3,y-4,6,9,'#c35470');rect(x-2,y+5,4,2,'#a64160');rect(x-2,y-3,2,5,'#ee8f99');rect(x+1,y,1,1,'#ffd3a8');rect(x-1,y+3,1,1,'#ffd3a8');rect(x-1,y-7,2,4,'#9cae85');rect(x-4,y-5,8,2,'#779578');}
function cake(time,reveal){
  ctx.save();ctx.translate(0,reduceMotion?0:Math.round((1-reveal)*32));ctx.globalAlpha=reveal;
  glow(200,139,120,.13);ellipse(200,225,100,11,'#0a0815');
  // Bandeja con pie y borde biselado.
  rect(179,220,42,7,'#685b87');rect(163,226,74,3,'#aca3bb');rect(148,214,104,6,'#5e5577');rect(116,206,168,8,'#9a94ad');rect(109,204,182,4,'#cebdc5');rect(117,201,166,4,'#f5d9cb');
  // Bizcocho, relleno, sombras y pequeñas decoraciones.
  rect(132,143,136,60,'#713c52');rect(129,145,142,50,'#bd718a');rect(132,146,136,47,'#e5a5ad');rect(135,161,130,10,'#ba6d86');rect(135,165,130,3,'#efb3af');rect(135,184,130,8,'#b2637c');rect(136,184,128,4,'#f0bdba');rect(136,146,7,48,'#f2c1ba');rect(257,150,9,44,'#c57b92');
  rect(128,139,144,13,'#95526a');rect(130,136,140,13,'#f9ddcb');rect(136,133,128,6,'#fff0d5');
  for(let i=0;i<11;i++){let x=133+i*12;rect(x,148,9,5+(i%3)*3,'#f9ddcb');rect(x+2,152,5,3+(i%3)*3,'#f9ddcb');rect(x,197,9,4,'#fff0d5');}
  for(let i=0;i<14;i++){let x=139+i*9;rect(x,174+(i%2)*4,2,2,i%2?'#ad5979':'#fff1d1');}
  // Segundo piso.
  rect(154,114,92,24,'#b56b82');rect(156,113,88,21,'#e8a7b1');rect(159,121,82,4,'#c07c93');rect(160,116,4,15,'#f8c9c3');rect(235,115,7,17,'#c78095');rect(153,108,94,9,'#fbe4d1');rect(158,105,84,5,'#fff0d8');
  for(let i=0;i<7;i++){rect(157+i*13,115,7,5+i%2*4,'#fbe4d1');}
  [143,169,231,257].forEach(x=>strawberry(x,134));[165,234].forEach(x=>strawberry(x,103));
  [183,201,219].forEach((x,i)=>{candle(x,88-i%2*7,18+i%2*7,time+i,state!=='wish');if(state!=='wish')glow(x,75-i%2*7,27,.1);});
  // Guirlande de losetas debajo del pastel.
  for(let i=0;i<5;i++){rect(168+i*15,208,8,2,'#eee0dc');}
  ctx.restore();
}
function burst(n=75){if(reduceMotion)return;for(let i=0;i<n;i++)particles.push({x:200,y:119,vx:(Math.random()-.5)*190,vy:-50-Math.random()*160,life:3+Math.random()*2,size:2+Math.floor(Math.random()*3),color:colors[i%colors.length],spin:Math.random()*6});}
function drawParticles(dt,time){particles=particles.filter(p=>p.life>0);for(const p of particles){p.life-=dt;p.vy+=50*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;ctx.globalAlpha=Math.min(1,p.life);rect(p.x,p.y,p.size,Math.sin(time*5+p.spin)>0?p.size:1,p.color);}ctx.globalAlpha=1;}
function background(time,celebrate){
  for(const star of stars){ctx.globalAlpha=.2+(Math.sin(time*(reduceMotion?0:1.1)+star.phase)+1)*.22;rect(star.x,star.y,star.size,star.size,'#e5c7ce');}ctx.globalAlpha=1;
  for(const star of sparkles){ctx.globalAlpha=.15+(Math.sin(time*.8+star.phase)+1)*.15;cross(star.x,star.y,1,'#f5d19b');}ctx.globalAlpha=1;
}
// La primera página solo muestra fuego sobre negro absoluto.
function lonelyFire(time) {
  const pulse = reduceMotion ? 1 : 1 + Math.sin(time * 2.8) * .07;
  const progress = state === 'lighting' ? Math.min(1, (time-started)/1.4) : 0;
  glow(200,140,65 + progress*100,.14 + progress*.2);
  ctx.save();ctx.translate(200,146);ctx.scale(pulse*(1+progress*1.7),pulse*(1+progress*1.7));
  flame(0,0,time,2.2);ctx.restore();
  if (!reduceMotion) for(let i=0;i<14;i++){
    const age=(time*.24+i/14)%1;
    const x=200+Math.sin(time*1.2+i*2.4)*(7+age*24);
    ctx.globalAlpha=(1-age)*.65;
    rect(x,131-age*79,age>.6?1:2,2,i%3?'#ffc879':'#ef8852');
  }
  ctx.globalAlpha=1;
}
// Rayos y pequeñas explosiones de píxeles acompañan la llegada del pastel.
let nextBurst = .2, burstCount = 0;
function frame(ms){
  const time=ms/1000,dt=Math.min((ms-lastTime)/1000,.04);lastTime=ms;elapsed=time;
  ctx.clearRect(0,0,400,270);
  if(!isBirthday) lonelyFire(time);
  else {
    background(time,true);
    const reveal=reduceMotion?1:Math.min(1,time/1.25);
    if(!reduceMotion&&time<2.5){ctx.save();ctx.translate(200,135);ctx.globalAlpha=Math.max(0,.2*(1-time/2.5));for(let i=0;i<12;i++){ctx.rotate(Math.PI/6);rect(15,-1,145,2,'#ffc589');}ctx.restore();}
    cake(time,1-Math.pow(1-reveal,3));
    if(time>=nextBurst&&burstCount<4){burst(65);nextBurst=time+.7;burstCount++;}
    drawParticles(dt,time);
  }
  requestAnimationFrame(frame);
}
if(!isBirthday){
  $('candle').addEventListener('click',()=>{
    if(state!=='intro')return;
    state='lighting';started=elapsed;$('candle').disabled=true;
    document.body.classList.add('leaving');$('hint').textContent='Gracias por ser esa luz.';
    setTimeout(()=>{window.location.href='birthday.html?v=20261007-11';},reduceMotion?100:1450);
  });
  // El navegador puede restaurar la página desde su caché al retroceder.
  window.addEventListener('pageshow',()=>{state='intro';document.body.classList.remove('leaving');$('candle').disabled=false;$('hint').textContent='Toca la luz. Esto es para ti.';});
}else{
  const envelope=$('openLetter'),dialog=$('letterDialog');
  // El HTML de esta página es la fuente del mensaje; no se sustituye con textos de otra versión.
  const pageParagraphs=Array.from($('letterBody').querySelectorAll('p'),p=>p.textContent);
  const currentLetter=pageParagraphs.length?pageParagraphs:LETTER_PARAGRAPHS;
  function restoreLetter(){
    $('letterBody').replaceChildren();
    currentLetter.forEach(text=>{const p=document.createElement('p');p.textContent=text;$('letterBody').append(p);});
    $('blankLetter').hidden=true;
  }
  restoreLetter();
  // Animación de la carta: el papel sube y el texto se escribe palabra por palabra.
  // Tocar el papel la salta. No cambia el formato: solo cuándo aparece cada palabra.
  const paper=dialog.querySelector('.letter-paper');
  const fx=document.createElement('style');
  fx.textContent=`
.letter-paper.writing{animation:paper-rise .8s cubic-bezier(.2,.8,.25,1) both}
.letter-paper .w{display:inline-block;opacity:0;transform:translateY(7px);filter:blur(3px);animation:word-in .55s ease forwards;animation-delay:var(--d,0s)}
.letter-paper.writing .keepsake-heart{animation:heart-pop 1s cubic-bezier(.3,1.6,.5,1) var(--hd,3s) both}
.letter-paper.skipped .w{animation:none;opacity:1;transform:none;filter:none}
.letter-paper.skipped .keepsake-heart{animation:none}
@keyframes paper-rise{from{opacity:0;transform:translateY(46px) scale(.95) rotate(-.8deg)}to{opacity:1;transform:none}}
@keyframes word-in{to{opacity:1;transform:none;filter:blur(0)}}
@keyframes heart-pop{from{opacity:0;transform:scale(.2) rotate(-12deg)}to{opacity:1;transform:none}}
@media(prefers-reduced-motion:reduce){.letter-paper.writing,.letter-paper.writing .keepsake-heart{animation:none}.letter-paper .w{animation:none;opacity:1;transform:none;filter:none}}`;
  document.head.append(fx);
  function wordify(el,clock,step){
    const text=el.textContent;el.textContent='';
    text.split(/(\s+)/).forEach(tok=>{
      if(!tok)return;
      if(/^\s+$/.test(tok)){el.append(tok);return;}
      const w=document.createElement('span');w.className='w';w.textContent=tok;
      w.style.setProperty('--d',clock.t.toFixed(2)+'s');el.append(w);
      clock.t+=step+(/[.!?…]$/.test(tok)?.18:/[,:;]$/.test(tok)?.08:0);
    });
    clock.t+=.2;
  }
  function playLetter(){
    if(reduceMotion)return;
    paper.classList.remove('writing','skipped');
    const blocks=[dialog.querySelector('.letter-label'),$('letterTitle'),...$('letterBody').querySelectorAll('p')];
    const words=blocks.reduce((n,b)=>n+b.textContent.trim().split(/\s+/).length,0);
    const clock={t:.55},step=Math.min(.05,4.6/words);
    blocks.forEach(b=>wordify(b,clock,step));
    paper.style.setProperty('--hd',(clock.t+.1).toFixed(2)+'s');
    void paper.offsetWidth;paper.classList.add('writing');
  }
  paper.addEventListener('click',()=>paper.classList.add('skipped'));
  function openEnvelope(){
    if(envelope.disabled)return;
    restoreLetter();
    envelope.disabled=true;envelope.classList.add('opening');
    if(musicOn)playNotes([76,79,84],.14);
    setTimeout(()=>{dialog.showModal();dialog.scrollTop=0;$('closeLetter').focus({preventScroll:true});playLetter();},reduceMotion?0:650);
  }
  envelope.addEventListener('click',openEnvelope);
  $('readLetter').addEventListener('click',openEnvelope);
  $('closeLetter').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog){const b=dialog.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>{envelope.disabled=false;envelope.classList.remove('opening');envelope.focus();});
}
// Música original de ocho bits, generada con Web Audio. Solo suena al activarla.
function tone(note,when,duration=.23){const oscillator=audio.createOscillator(),gain=audio.createGain();oscillator.type='triangle';oscillator.frequency.value=440*Math.pow(2,(note-69)/12);gain.gain.setValueAtTime(0,when);gain.gain.linearRampToValueAtTime(.045,when+.015);gain.gain.exponentialRampToValueAtTime(.001,when+duration);oscillator.connect(gain);gain.connect(audio.destination);oscillator.start(when);oscillator.stop(when+duration+.02);}
function playNotes(notes,spacing){notes.forEach((n,i)=>tone(n,audio.currentTime+i*spacing));}
if(isBirthday) $('sound').addEventListener('click',async()=>{try{if(!audio)audio=new(window.AudioContext||window.webkitAudioContext)();if(musicOn){musicOn=false;clearInterval(musicTimer);await audio.suspend();}else{await audio.resume();musicOn=true;let step=0;const melody=[72,76,79,76,74,77,81,77,76,79,84,79,74,77,79,71];tone(melody[step++],audio.currentTime);musicTimer=setInterval(()=>{tone(melody[step%melody.length],audio.currentTime,.4);if(step%4===0)tone(melody[step%melody.length]-24,audio.currentTime,.8);step++;},360);} $('sound').setAttribute('aria-pressed',String(musicOn));$('sound').setAttribute('aria-label',musicOn?'Desactivar música':'Activar música');$('sound').querySelector('span').textContent=musicOn?'SONIDO ON':'SONIDO OFF';}catch{$('sound').querySelector('span').textContent='NO DISPONIBLE';}});
document.addEventListener('visibilitychange',()=>{if(audio&&musicOn){if(document.hidden){audio.suspend();}else{audio.resume();}}});
requestAnimationFrame(frame);
