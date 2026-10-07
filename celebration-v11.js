'use strict';
// Serpentinas y dos intentos de quemar la carta. El tercer desenlace es abrirla.
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
    let attempts = 0, active = false, start = null, raf = null, intensity = 0, runId = 0;
    let W = 400, H = 300;
    function resize() {
      W = Math.min(960, Math.max(390, Math.round(innerWidth)));
      H = Math.round(W * innerHeight / innerWidth);
      canvas.width = W; canvas.height = H; c.imageSmoothingEnabled = true;
    }
    window.addEventListener('resize', resize);
    const eyes=[{x:.17,y:.22,size:15,at:2.1},{x:.82,y:.38,size:13,at:2.85},{x:.29,y:.57,size:12,at:3.6},{x:.72,y:.16,size:16,at:4.35},{x:.85,y:.64,size:12,at:5.1},{x:.12,y:.42,size:14,at:5.85}];
    function box(x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.ceil(w),Math.ceil(h));}
    function eye(x,y,r,t,i){
      r*=Math.max(1,W/440);
      const blink=reduced?1:.72+.28*Math.sin(t*.8+i);
      c.save();c.translate(x,y);c.rotate(Math.sin(i)*.4);c.scale(1,blink);
      c.shadowColor=palette[i%4];c.shadowBlur=r*.7;
      c.beginPath();c.moveTo(-r,0);c.bezierCurveTo(-r*.35,-r*.85,r*.5,-r*.85,r,0);c.bezierCurveTo(r*.4,r*.8,-r*.5,r*.8,-r,0);c.fillStyle='#d6cbd9';c.fill();c.shadowBlur=0;
      const dx=reduced?0:Math.sin(t*.5+i)*r*.3;
      c.beginPath();c.ellipse(dx,0,r*.34,r*.5,0,0,Math.PI*2);c.fillStyle=palette[i%4];c.fill();
      c.beginPath();c.ellipse(dx,0,r*.14,r*.4,0,0,Math.PI*2);c.fillStyle='#09030e';c.fill();
      c.beginPath();c.arc(dx+r*.1,-r*.19,r*.08,0,Math.PI*2);c.fillStyle='#fff';c.fill();c.restore();
    }
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
    // Impactos independientes que rompen distintas zonas en momentos distintos.
    const impacts=[{x:.04,y:.15,angle:.55,at:2.9,reach:.48},{x:.96,y:.3,angle:2.8,at:4,reach:.45},{x:.19,y:.95,angle:-1.15,at:5.1,reach:.48},{x:.76,y:.02,angle:1.9,at:6.15,reach:.36}];
    function fracturePath(points,amount,width,alpha){
      if(amount<=0)return;
      const steps=Math.min(points.length-1,amount*(points.length-1));
      c.beginPath();c.moveTo(points[0].x,points[0].y);
      for(let j=1;j<=Math.ceil(steps);j++){const f=Math.min(1,steps-j+1),a=points[j-1],b=points[j];c.lineTo(a.x+(b.x-a.x)*f,a.y+(b.y-a.y)*f);}
      c.lineWidth=width+1.4;c.strokeStyle=`rgba(0,0,0,${alpha*.75})`;c.stroke();c.lineWidth=width;c.strokeStyle=`rgba(208,218,231,${alpha})`;c.stroke();
    }
    function cracks(t){
      const R=Math.min(W,H);
      impacts.forEach((hit,k)=>{
        const age=t-(reduced?.85+k*.38:hit.at);if(age<=0)return;
        const growth=Math.min(1,age/(reduced?.25:1.2)),origin={x:W*hit.x,y:H*hit.y};
        c.save();c.lineJoin='round';c.lineCap='round';
        for(let arm=0;arm<3;arm++){
          const angle=hit.angle+(arm-1)*.7,length=R*hit.reach*(arm===1?1.5:.75+arm*.16),pts=[origin];
          for(let j=1;j<=8;j++){const d=length*j/8,jag=Math.sin(j*2.4+arm*1.8+k)*length*.075;pts.push({x:origin.x+Math.cos(angle)*d+Math.cos(angle+Math.PI/2)*jag,y:origin.y+Math.sin(angle)*d+Math.sin(angle+Math.PI/2)*jag});}
          const local=Math.max(0,growth-arm*.12);fracturePath(pts,local,.8,arm===1?.73:.42);
          for(let j=2;j<=6;j+=2){const branch=Math.max(0,Math.min(1,(local-j/8)*4));if(!branch)continue;const a=pts[j],dir=angle+(j%4===0?-.65:.8),len=length*.18;fracturePath([a,{x:a.x+Math.cos(dir)*len*.5,y:a.y+Math.sin(dir)*len*.5},{x:a.x+Math.cos(dir+.3)*len,y:a.y+Math.sin(dir+.3)*len}],branch,.45,.42);}
        }
        c.globalAlpha=Math.min(1,age*3)*.45;c.beginPath();c.moveTo(origin.x-3,origin.y);c.lineTo(origin.x+5,origin.y-4);c.lineTo(origin.x+2,origin.y+7);c.closePath();c.fillStyle='#c6c1d1';c.fill();c.restore();
      });
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
      c.globalAlpha=1;box(0,0,W,H,'#050309');
      const haze=c.createRadialGradient(W*.5,H*.55,0,W*.5,H*.55,H*.8);haze.addColorStop(0,'#37203f');haze.addColorStop(1,'#050309');c.globalAlpha=intensity*.65;c.fillStyle=haze;c.fillRect(0,0,W,H);c.globalAlpha=1;
      // La imagen permanece limpia entre las tres oleadas de distorsión.
      c.globalAlpha=1;
      eyes.forEach((e,i)=>{
        const age=t-(reduced?.8+i*.3:e.at),life=reduced?.65:1.9;
        if(age<=0||age>=life)return;
        const fadeIn=Math.min(1,age/(reduced?.2:.55)),fadeOut=Math.min(1,(life-age)/.6);
        c.globalAlpha=fadeIn*fadeOut*.82;c.save();c.translate(e.x*W,e.y*H);c.scale(1,.15+.85*fadeIn);eye(0,0,e.size,t,i);c.restore();
      });c.globalAlpha=1;
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
      if(!reduced){
        const waves=[{at:2.7,duration:1.05},{at:4.35,duration:1.25},{at:6.05,duration:1.1}];
        let strength=0;
        for(const wave of waves){const phase=(t-wave.at)/wave.duration;if(phase>0&&phase<1)strength=Math.max(strength,Math.sin(phase*Math.PI));}
        if(strength>.015){
          // Copia inalterada: cada franja se desplaza sin arrastrar las anteriores.
          const pixels=c.getImageData(0,0,W,H),seed=Math.floor(t*6);
          for(let i=0;i<7;i++){
            const sy=Math.floor(((i*.137+seed*.017)%1)*H),height=3+(i%3)*5;
            const shift=Math.round(Math.sin(seed*1.7+i*3)*W*.035*strength);
            c.putImageData(pixels,shift,0,0,sy,W,Math.min(height,H-sy));
            c.globalAlpha=strength*.11;box(Math.max(0,shift),sy,W,height,i%2?'#bc609c':'#67a9b0');
          }
          c.globalAlpha=1;
          // Fragmentos pequeños alrededor de los bordes, no sobre el mensaje.
          for(let i=0;i<8;i++){
            const x=i%2?W-W*.12:0,y=(i*.113*H+seed*9)%H;
            c.globalAlpha=strength*.16;box(x,y,W*(.03+(i%3)*.035),2+i%4,'#bc9fc7');
          }
          c.globalAlpha=1;
        }
      }
      cracks(t);
      get('burnCaption').textContent = '¿Por qué me odias? 😭😭😭';
      get('burnCaption').classList.toggle('abstracted',intensity>.5);
      if(t>=duration){finish();return;}
      queueFrame();
    }
    function finish(){
      if(!active)return;active=false;runId++;cancelAnimationFrame(raf);raf=null;start=null;intensity=0;
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
