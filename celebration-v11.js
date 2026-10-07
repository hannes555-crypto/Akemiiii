'use strict';
// Serpentinas y dos intentos de quemar la carta. El tercer desenlace es abrirla.
// Quema: tres oleadas de fragmentos de neón con anillos (estilo mundo abstracto)
// + glitch real: separación RGB, franjas rasgadas y parpadeo de fragmentos.
if (document.body.dataset.page === 'birthday') {
  (() => {
    const get = id => document.getElementById(id);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const palette = ['#ed9fbe', '#f2cb87', '#a18adc', '#8dbdb4'];
    for(let i=0;i<38;i++){
      const piece=document.createElement('span');piece.className='party-spark';
      piece.style.left=`${i%2===0?3+(i%7)*2.8:81+(i%7)*2.4}%`;
      piece.style.top=`${8+(i*13)%72}%`;
      piece.style.background=palette[i%4];piece.style.animationDelay=`${(i%9)*.37}s`;
      piece.style.rotate=`${i*37}deg`;get('streamers').append(piece);
    }
    const modal = get('burnDialog'), canvas = get('burnCanvas'), c = canvas.getContext('2d');
    // Lienzos auxiliares para el glitch (se redimensionan junto al principal).
    const snap = document.createElement('canvas'), tint = document.createElement('canvas');
    const sc = snap.getContext('2d'), tc = tint.getContext('2d');
    let attempts = 0, active = false, start = null, raf = null, intensity = 0, runId = 0;
    let W = 400, H = 300, shards = [];
    function resize() {
      W = Math.min(960, Math.max(390, Math.round(innerWidth)));
      H = Math.round(W * innerHeight / innerWidth);
      canvas.width = W; canvas.height = H; c.imageSmoothingEnabled = true;
      snap.width = tint.width = W; snap.height = tint.height = H;
    }
    window.addEventListener('resize', resize);
    function box(x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.ceil(w),Math.ceil(h));}
    const hash=(a,b)=>{const x=Math.sin(a*127.1+b*311.7)*43758.5453;return x-Math.floor(x);};
    const bump=p=>p>0&&p<1?Math.sin(p*Math.PI):0;
    const easeBack=x=>1+2.70158*Math.pow(x-1,3)+1.70158*Math.pow(x-1,2);

    function fire(t){
      const floor=H*.77,u=Math.max(1,W/440);
      const glow=c.createRadialGradient(W/2,floor-20*u,2,W/2,floor-20*u,110*u);
      glow.addColorStop(0,'#f9863b44');glow.addColorStop(1,'#f9863b00');c.fillStyle=glow;c.fillRect(0,floor-140*u,W,230*u);
      for(let i=0;i<9;i++){
        const x=W/2+(i-4)*7*u,h=(26+Math.sin(i*1.8+t*(reduced?0:2.5))*8+(4-Math.abs(i-4))*10)*u;
        c.beginPath();c.moveTo(x-8*u,floor);c.bezierCurveTo(x-20*u,floor-h*.45,x+12*u,floor-h*.8,x+Math.sin(t+i)*7*u,floor-h);c.bezierCurveTo(x+20*u,floor-h*.55,x+14*u,floor-5*u,x+8*u,floor);c.closePath();
        const g=c.createLinearGradient(0,floor,0,floor-h);g.addColorStop(0,'#ffe4a5');g.addColorStop(.4,'#fca24e');g.addColorStop(1,'#b83636aa');c.fillStyle=g;c.fill();
      }
      for(let i=0;i<25&&!reduced;i++){const a=(t*.25+i/25)%1;c.globalAlpha=(1-a)*.8;box(W/2+Math.sin(i*2+t)*34*u,floor-15*u-a*130*u,2,2,'#ffb36d');}c.globalAlpha=1;
    }

    // ---------- FRAGMENTOS DE NEÓN ----------
    // Tres oleadas: cada fragmento aparece con un "pop", flota girando y desaparece.
    const waves = reduced
      ? [{at:.6},{at:1.5},{at:2.4}]
      : [{at:2.6},{at:4.2},{at:5.8}];
    const schemes = [            // [color base, anillo A, anillo B]
      ['#fff23a','#ffffff','#ffd21a'],   // amarillo
      ['#ff2bd6','#ffd9f4','#fff23a'],   // magenta
      ['#19f0ff','#ffffff','#14b8e6'],   // cian
      ['#d9a8ff','#ff2bd6','#ffffff'],   // lavanda
      ['#ff6ad5','#ffffff','#19f0ff']    // rosa
    ];
    function makeShards(runSeed){
      let sd = 1000 + runSeed * 7919;
      const rnd = () => { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; };
      const list = []; let id = 0;
      waves.forEach(w => {
        for(let i=0;i<(reduced?9:15);i++){
          const n = rnd() > .7 ? 5 : 4;
          const R = rnd() < .35 ? 6 + rnd()*7 : 13 + rnd()*24;     // algunos pequeños, otros grandes
          const base = rnd() * Math.PI * 2, pts = [];
          for(let k=0;k<n;k++){
            const a = base + k*Math.PI*2/n + (rnd()-.5)*.7;
            const r = n === 4 ? R*(k%2 ? .4+rnd()*.3 : .8+rnd()*.3) : R*(.6+rnd()*.4);
            pts.push([Math.cos(a)*r*1.35, Math.sin(a)*r]);           // alargados, como rombos
          }
          list.push({
            id: id++, pts, R,
            x: .06 + rnd()*.88, y: .06 + rnd()*.74,
            at: w.at + (reduced ? 0 : rnd()*.4), life: reduced ? .8 : 1.35 + rnd()*.25,
            vx: (rnd()-.5)*26, vy: (rnd()-.65)*26,
            rot: rnd()*6.28, spin: (rnd()-.5)*1.4,
            flip: 1.5 + rnd()*2, ph: rnd()*6.28,
            cols: schemes[Math.floor(rnd()*schemes.length)]
          });
        }
      });
      return list;
    }
    function drawShard(s,t,glitch,step){
      const age = t - s.at;
      if(age < 0 || age > s.life) return;
      const u = Math.max(1,W/440);
      const inK = Math.min(1, age/.32), outK = Math.min(1, (s.life-age)/.3);
      const size = (reduced ? inK : Math.max(0,easeBack(inK))) * Math.max(0,outK);
      if(size <= 0) return;
      if(!reduced && glitch > .05 && hash(s.id, step) < glitch*.4) return;   // parpadeo
      const x = s.x*W + (reduced ? 0 : s.vx*age*u), y = s.y*H + (reduced ? 0 : s.vy*age*u);
      const flip = reduced ? 1 : .35 + .65*Math.abs(Math.cos(age*s.flip + s.ph));  // giro falso en 3D
      c.save();
      c.translate(x,y);
      c.rotate(s.rot + (reduced ? 0 : s.spin*age));
      c.scale(size*flip*u, size*u);
      c.beginPath();
      s.pts.forEach((p,k)=>k?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));
      c.closePath();
      c.shadowColor = s.cols[0];
      c.shadowBlur = (16 + (reduced ? 0 : 7*Math.sin(age*5 + s.ph))) * u;
      c.fillStyle = s.cols[0]; c.fill();
      c.shadowBlur = 0;
      c.clip();
      const radii = [.85,.66,.47,.28,.12], fills = [s.cols[1],s.cols[0],s.cols[2],s.cols[1],s.cols[0]];
      radii.forEach((r,k)=>{
        c.beginPath();c.ellipse(0,0,s.R*r*1.35,s.R*r,0,0,Math.PI*2);
        c.fillStyle = fills[k]; c.fill();
      });
      c.restore();
    }

    // ---------- GLITCH ----------
    // Separa los canales R/G/B y rasga franjas horizontales usando copias del lienzo.
    function glitchPass(strength,t,step){
      const u = Math.max(1,W/440);
      sc.globalCompositeOperation = 'copy'; sc.drawImage(canvas,0,0); sc.globalCompositeOperation = 'source-over';
      const split = Math.round((3 + 11*strength) * u * (hash(step,7) > .5 ? 1 : -1));
      const bands = []; let y = 0, i = 0;
      while(y < H){
        const h = Math.max(2, Math.round(H*(.012 + hash(step,i)*.07)));
        const torn = hash(step,i+50) < strength*.5;
        const shift = torn ? Math.round((hash(step,i+90)-.5)*W*.24*strength) : 0;
        bands.push([y, Math.min(h,H-y), shift]);
        y += h; i++;
      }
      c.globalAlpha = 1; box(0,0,W,H,'#000');
      c.globalCompositeOperation = 'lighter';
      [['#ff0000',-split],['#00ff00',0],['#0000ff',split]].forEach(([col,dx])=>{
        tc.globalCompositeOperation = 'copy'; tc.drawImage(snap,0,0);
        tc.globalCompositeOperation = 'multiply'; tc.fillStyle = col; tc.fillRect(0,0,W,H);
        tc.globalCompositeOperation = 'source-over';
        for(const [by,bh,bs] of bands) c.drawImage(tint,0,by,W,bh,dx+bs,by,W,bh);
      });
      c.globalCompositeOperation = 'source-over';
    }

    function queueFrame(){
      const thisRun=runId;
      raf=requestAnimationFrame(ms=>{if(active&&thisRun===runId)draw(ms);});
    }
    function draw(ms){
      if(!active)return;
      if(start===null) start=ms;
      const t=(ms-start)/1000, duration=reduced?3.5:7.8;
      const contact=reduced?.6:1.7;
      const consumed=Math.max(0,Math.min(1,(t-contact)/(reduced?1:2.6)));
      intensity=Math.max(0,Math.min(1,(t-contact)/(reduced?1.4:3.2)));
      const step=Math.floor(t*14);
      c.globalAlpha=1;c.globalCompositeOperation='source-over';box(0,0,W,H,'#030207');
      const haze=c.createRadialGradient(W*.5,H*.55,0,W*.5,H*.55,H*.8);haze.addColorStop(0,'#2a1636');haze.addColorStop(1,'#030207');c.globalAlpha=intensity*.55;c.fillStyle=haze;c.fillRect(0,0,W,H);c.globalAlpha=1;
      // Fuerza del glitch: golpe fuerte cuando aparece cada oleada y otro cuando se va.
      let glitch=0;
      if(!reduced) for(const w of waves){
        glitch=Math.max(glitch,bump((t-w.at)/.75),bump((t-(w.at+1.3))/.6));
      }
      for(const s of shards) drawShard(s,t,glitch,step);
      const descent=Math.min(1,t/contact);
      const y=H*.24+(H*.77-16-H*.24)*(1-Math.pow(1-descent,2));
      const sway=reduced?0:Math.sin(t*2)*12*(1-descent);
      if(consumed<1){
        c.save();c.translate(W/2+sway,y);c.rotate(reduced?0:Math.sin(t*1.6)*.16);
        const u=Math.max(1,W/440);c.scale(u,u);
        const w=90, h=58;
        // Se consume por filas de píxeles, de abajo hacia arriba.
        for(let row=0;row<h;row+=3){for(let col=0;col<w;col+=3){
          const jag=Math.sin(col*.7)*3;
          if(row>h*(1-consumed)+jag)continue;
          const edge=consumed>0&&row>h*(1-consumed)-6+jag;
          box(col-w/2,row-h,3,3,edge?'#e8954b':(row>h*.7?'#dba4b1':'#f7d7cb'));
        }}
        if(consumed<.45){box(-14,-31,28,1,'#b77d88');box(-8,-24,16,1,'#b77d88');box(-3,-17,6,5,'#ac5875');}
        c.restore();
      }
      fire(t);
      if(glitch>.02) glitchPass(glitch,t,step);
      const cap=get('burnCaption');
      cap.textContent = '¿Por qué me odias? 😭😭😭';
      cap.classList.toggle('abstracted',intensity>.5);
      cap.style.transform = glitch>.05 ? `translate(${((hash(step,3)-.5)*14*glitch).toFixed(1)}px,0)` : '';
      if(t>=duration){finish();return;}
      queueFrame();
    }
    function finish(){
      if(!active)return;active=false;runId++;cancelAnimationFrame(raf);raf=null;start=null;intensity=0;
      get('burnCaption').style.transform='';
      document.body.classList.remove('abstraction','burning-letter');
      if(modal.open)modal.close();
      get('openLetter').disabled=false;get('readLetter').disabled=false;
      const invitation=document.querySelector('.letter-invitation');invitation.classList.remove('returned');void invitation.offsetWidth;invitation.classList.add('returned');
      if(attempts>=2){get('burnLetter').hidden=true;get('letterChoices').classList.add('only-open');get('choicePrompt').textContent='Algunas cartas están destinadas a ser leídas. ♡';}
      else{get('burnLetter').disabled=false;get('choicePrompt').textContent='La carta volvió… ¿quemarla o abrirla?';}
      get('readLetter').focus({preventScroll:true});
    }
    get('burnLetter').addEventListener('click',()=>{
      if(active||attempts>=2)return;
      attempts++;runId++;cancelAnimationFrame(raf);raf=null;active=true;start=null;intensity=0;resize();
      shards=makeShards(attempts);   // cada quema genera fragmentos distintos
      get('burnCaption').textContent = '¿Por qué me odias? 😭😭😭';
      get('burnCaption').classList.remove('abstracted');
      get('openLetter').disabled=true;get('readLetter').disabled=true;get('burnLetter').disabled=true;
      document.body.classList.add('abstraction','burning-letter');
      modal.showModal();get('skipBurn').focus({preventScroll:true});queueFrame();
    });
    get('skipBurn').addEventListener('click',finish);
    modal.addEventListener('cancel',event=>{event.preventDefault();finish();});
    // Un evento de cierre pendiente de la primera quema no cancela la segunda.
    modal.addEventListener('close',()=>{if(!modal.open&&active)finish();});
  })();
}
