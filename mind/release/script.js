(function(){
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const textInput = document.getElementById('textInput');
  const paperWrap = document.getElementById('paperWrap');
  const paper = document.getElementById('paper');
  const burnCanvas = document.getElementById('burnCanvas');
  const flameCanvas = document.getElementById('flameCanvas');
  const burnGlow = document.getElementById('burnGlow');
  const actionsEl = document.getElementById('actions');
  const aftermathEl = document.getElementById('aftermath');
  const aftermathMsg = document.getElementById('aftermathMsg');
  const hint = document.getElementById('hint');
  const resetBtn = document.getElementById('resetBtn');
  const clearBtn = document.getElementById('clearBtn');
  const buttons = Array.from(actionsEl.querySelectorAll('button.act'));

  let busy = false;

  function showHint(){
    hint.classList.add('show');
    setTimeout(()=>hint.classList.remove('show'), 1600);
  }

  function setBusy(v){
    busy = v;
    buttons.forEach(b=>b.disabled = v);
    clearBtn.disabled = v;
    textInput.disabled = v;
  }

  clearBtn.addEventListener('click', ()=>{
    if(busy) return;
    textInput.value = '';
    textInput.focus();
  });

  function finish(message){
    aftermathMsg.textContent = message;
    paperWrap.style.display = 'none';
    actionsEl.style.display = 'none';
    aftermathEl.classList.add('show');
  }

  function resetScene(){
    paper.getAnimations().forEach(a => a.cancel());
    paper.style.cssText = '';
    paperWrap.querySelectorAll('.ghost').forEach(g=>g.remove());
    burnCanvas.style.display = 'none';
    flameCanvas.style.display = 'none';
    burnCanvas.style.opacity = '';
    flameCanvas.style.opacity = '';
    burnCanvas.getContext('2d').clearRect(0,0,burnCanvas.width, burnCanvas.height);
    flameCanvas.getContext('2d').clearRect(0,0,flameCanvas.width, flameCanvas.height);
    burnGlow.style.opacity = '0';
    textInput.value = '';
    textInput.style.opacity = '1';
    paperWrap.style.display = '';
    actionsEl.style.display = 'flex';
    aftermathEl.classList.remove('show');
    setBusy(false);
    textInput.focus();
  }

  resetBtn.addEventListener('click', resetScene);

  function spawnScraps(rect){
    const count = 9;
    for(let i=0;i<count;i++){
      const s = document.createElement('div');
      s.className = 'scrap';
      const x = rect.left + rect.width * (0.3 + Math.random()*0.4);
      const y = rect.top + rect.height * (0.3 + Math.random()*0.4);
      s.style.left = x + 'px';
      s.style.top = y + 'px';
      s.style.transform = 'rotate(' + (Math.random()*360) + 'deg)';
      document.body.appendChild(s);
      const dx = (Math.random()-0.5) * 260;
      const dy = 200 + Math.random()*220;
      const rot = (Math.random()-0.5) * 720;
      const anim = s.animate([
        { transform: s.style.transform + ' translate(0,0)', opacity: 1 },
        { transform: `rotate(${rot}deg) translate(${dx}px, ${dy}px)`, opacity: 0 }
      ], { duration: 900 + Math.random()*500, easing: 'cubic-bezier(.3,.6,.4,1)', delay: Math.random()*150 });
      anim.onfinish = ()=> s.remove();
    }
  }

  function tear(){
    const rect = paper.getBoundingClientRect();
    if(reducedMotion){
      const anim = paper.animate([{opacity:1},{opacity:0}], {duration:400, fill:'forwards'});
      anim.onfinish = ()=> finish('이제 그 마음은 여기 없어요.');
      return;
    }
    const segments = 9;
    const pts = [];
    for(let i=0;i<=segments;i++){
      const y = (i/segments)*100;
      const x = 50 + (Math.random()*16 - 8);
      pts.push([x,y]);
    }
    const midStr = pts.map(p=>`${p[0]}% ${p[1]}%`).join(',');
    const leftClip = `polygon(0% 0%, ${midStr}, 0% 100%)`;
    const rightClip = `polygon(100% 0%, ${midStr}, 100% 100%)`;

    const leftGhost = document.createElement('div');
    const rightGhost = document.createElement('div');
    [leftGhost, rightGhost].forEach(g=>{
      g.className = 'ghost';
      g.style.background = getComputedStyle(paper).backgroundImage;
      g.style.borderRadius = getComputedStyle(paper).borderRadius;
      g.style.boxShadow = getComputedStyle(paper).boxShadow;
      const txt = document.createElement('div');
      txt.style.cssText = 'padding:28px 26px;font-family:Gaegu,cursive;font-size:21px;line-height:30px;color:#3b3226;white-space:pre-wrap;word-break:break-word;';
      txt.textContent = textInput.value;
      g.appendChild(txt);
    });
    leftGhost.style.clipPath = leftClip;
    rightGhost.style.clipPath = rightClip;
    paper.style.opacity = '0';
    paperWrap.appendChild(leftGhost);
    paperWrap.appendChild(rightGhost);

    const leftAnim = leftGhost.animate([
      { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
      { transform: 'translate(-130px, 60px) rotate(-22deg)', opacity: 0.9, offset: 0.45 },
      { transform: 'translate(-280px, 190px) rotate(-40deg)', opacity: 0 }
    ], { duration: 850, easing: 'cubic-bezier(.4,0,.3,1)' });

    rightGhost.animate([
      { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
      { transform: 'translate(130px, 60px) rotate(22deg)', opacity: 0.9, offset: 0.45 },
      { transform: 'translate(280px, 190px) rotate(40deg)', opacity: 0 }
    ], { duration: 850, easing: 'cubic-bezier(.4,0,.3,1)' });

    spawnScraps(rect);

    leftAnim.onfinish = ()=> finish('이제 그 마음은 여기 없어요.');
  }

  function wrapLines(ctx, text, maxWidth){
    const rawLines = text.split('\n');
    const out = [];
    rawLines.forEach(raw=>{
      if(raw === ''){ out.push(''); return; }
      let line = '';
      for(const ch of raw){
        const test = line + ch;
        if(ctx.measureText(test).width > maxWidth && line !== ''){
          out.push(line);
          line = ch;
        } else {
          line = test;
        }
      }
      out.push(line);
    });
    return out;
  }

  function spawnEmber(x, y){
    const dot = document.createElement('div');
    dot.className = 'ember-dot';
    dot.style.left = x + 'px';
    dot.style.top = y + 'px';
    document.body.appendChild(dot);
    const dx = (Math.random()-0.5) * 40;
    const dy = -(40 + Math.random()*70);
    const anim = dot.animate([
      { transform: 'translate(0,0)', opacity: 1 },
      { transform: `translate(${dx}px, ${dy}px)`, opacity: 0 }
    ], { duration: 600 + Math.random()*500, easing: 'ease-out' });
    anim.onfinish = ()=> dot.remove();
  }

  function burn(){
    if(reducedMotion){
      const anim = paper.animate([
        {filter:'brightness(1)', opacity:1},
        {filter:'brightness(0.3) sepia(1)', opacity:0}
      ], {duration:500, fill:'forwards'});
      anim.onfinish = ()=> finish('말들이 재가 되어 사라졌어요.');
      return;
    }
    const dpr = window.devicePixelRatio || 1;
    burnCanvas.style.display = 'block';
    flameCanvas.style.display = 'block';
    const cw = paper.clientWidth;
    const ch = paper.clientHeight;
    burnCanvas.width = cw * dpr;
    burnCanvas.height = ch * dpr;
    flameCanvas.width = cw * dpr;
    flameCanvas.height = ch * dpr;
    burnCanvas.style.width = cw + 'px';
    burnCanvas.style.height = ch + 'px';
    flameCanvas.style.width = cw + 'px';
    flameCanvas.style.height = ch + 'px';
    const ctx = burnCanvas.getContext('2d');
    const fctx = flameCanvas.getContext('2d');
    ctx.scale(dpr, dpr);
    fctx.scale(dpr, dpr);

    ctx.fillStyle = '#f2e9d8';
    ctx.fillRect(0, 0, cw, ch);
    ctx.fillStyle = '#d9c9a8';
    for(let y = 29; y < ch; y += 30){
      ctx.fillRect(0, y, cw, 1);
    }

    const padX = 26, padY = 28;
    ctx.font = '21px Gaegu, cursive';
    ctx.fillStyle = '#3b3226';
    ctx.textBaseline = 'top';
    const lineHeight = 30;
    const lines = wrapLines(ctx, textInput.value || ' ', cw - padX*2 - 4);
    lines.forEach((ln, i)=>{
      ctx.fillText(ln, padX, padY + i*lineHeight);
    });

    paper.style.opacity = '0';
    burnGlow.animate([{opacity:0},{opacity:0.85}], {duration:280, fill:'forwards'});

    const colStep = 6;
    const cols = Math.ceil(cw / colStep);
    const front = new Array(cols).fill(0);
    const speed = new Array(cols).fill(0).map(()=> 2 + Math.random()*3.5);
    const delay = new Array(cols).fill(0).map(()=> Math.random()*22);
    const flameSeed = new Array(cols).fill(0).map(()=> Math.random()*100);
    let frame = 0;
    const canvasRect = burnCanvas.getBoundingClientRect();
    const tongue = 5;

    function tick(){
      frame++;
      let allDone = true;
      for(let c=0;c<cols;c++){
        if(frame < delay[c]){ allDone = false; continue; }
        if(front[c] < ch + 24){
          front[c] += speed[c];
          allDone = false;
        }
        const x = c*colStep;
        const y = Math.max(0, ch - front[c]);
        ctx.clearRect(x, y, colStep+1, ch - y + 30);
        const grad = ctx.createLinearGradient(0, y-6, 0, y+6);
        grad.addColorStop(0, 'rgba(255,200,110,0)');
        grad.addColorStop(0.5, 'rgba(255,150,60,0.8)');
        grad.addColorStop(1, 'rgba(255,90,40,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(x, y-6, colStep+1, 12);
        if(!allDone && frame % 3 === 0 && Math.random() < 0.6){
          spawnEmber(canvasRect.left + x, canvasRect.top + y);
        }
      }

      fctx.clearRect(0, 0, cw, ch);
      if(!allDone){
        for(let g=0; g<cols; g+=tongue){
          let sum = 0, n = 0;
          for(let c=g; c<Math.min(g+tongue, cols); c++){ sum += front[c]; n++; }
          if(n === 0) continue;
          const avgFront = sum / n;
          if(avgFront <= 0 || avgFront >= ch + 20) continue;
          const x = g*colStep;
          const w = tongue*colStep;
          const yBase = Math.max(0, ch - avgFront) + 3;
          const seed = flameSeed[g];
          const flick = 16 + Math.sin(frame*0.28 + seed)*6 + Math.sin(frame*0.7 + seed*2)*4;
          const h = Math.max(6, flick);
          fctx.beginPath();
          fctx.moveTo(x, yBase);
          fctx.quadraticCurveTo(x + w*0.1, yBase - h*0.55, x + w*0.45, yBase - h);
          fctx.quadraticCurveTo(x + w*0.7, yBase - h*1.1, x + w*0.5, yBase - h*1.5);
          fctx.quadraticCurveTo(x + w*0.95, yBase - h*0.5, x + w, yBase);
          fctx.closePath();
          const fg = fctx.createLinearGradient(0, yBase - h*1.5, 0, yBase);
          fg.addColorStop(0, 'rgba(255,240,170,0.95)');
          fg.addColorStop(0.45, 'rgba(255,150,55,0.92)');
          fg.addColorStop(1, 'rgba(200,50,25,0.85)');
          fctx.fillStyle = fg;
          fctx.fill();
        }
        burnGlow.style.opacity = String(0.6 + Math.sin(frame*0.35)*0.18 + Math.random()*0.06);
        requestAnimationFrame(tick);
      } else {
        burnGlow.animate([{opacity:burnGlow.style.opacity || 0.6},{opacity:0}], {duration:450, fill:'forwards'});
        const fadeOut = flameCanvas.animate([{opacity:1},{opacity:0}], {duration:400, fill:'forwards'});
        fadeOut.onfinish = ()=> finish('말들이 재가 되어 사라졌어요.');
      }
    }
    requestAnimationFrame(tick);
  }

  function buildCrumpleTexture(){
    const n = 12;
    const spots = [];
    for(let i=0;i<n;i++){
      const cx = Math.round(Math.random()*100);
      const cy = Math.round(Math.random()*100);
      const size = 16 + Math.random()*24;
      const dark = Math.random() < 0.55;
      const color = dark ? 'rgba(70,56,36,0.32)' : 'rgba(255,250,235,0.4)';
      spots.push(`radial-gradient(circle at ${cx}% ${cy}%, ${color} 0%, transparent ${size}%)`);
    }
    return spots.join(',');
  }

  function crumple(){
    if(reducedMotion){
      const anim = paper.animate([{opacity:1},{opacity:0}], {duration:400, fill:'forwards'});
      anim.onfinish = ()=> finish('멀리 던져버렸어요.');
      return;
    }
    textInput.disabled = true;
    const existingBg = getComputedStyle(paper).backgroundImage;
    paper.style.backgroundImage = buildCrumpleTexture() + ',' + existingBg;

    const rad = ()=> 14 + Math.round(Math.random()*70);
    const blob = ()=> `${rad()}% ${rad()}% ${rad()}% ${rad()}% / ${rad()}% ${rad()}% ${rad()}% ${rad()}%`;
    const rot = ()=> Math.round((Math.random()-0.5)*34);
    const skew = ()=> (Math.random()-0.5)*16;

    const finalRot = rot();
    const finalSx = (0.13 + Math.random()*0.09).toFixed(2);
    const finalSy = (0.13 + Math.random()*0.11).toFixed(2);
    const baseTransform = `rotate(${finalRot}deg) scale(${finalSx},${finalSy})`;

    const step1 = paper.animate([
      { transform:'rotate(-0.6deg) scale(1,1)', borderRadius:'3px', filter:'brightness(1) contrast(1)' },
      { transform:`rotate(${rot()}deg) scale(${(0.78+Math.random()*0.14).toFixed(2)},${(0.68+Math.random()*0.18).toFixed(2)}) skew(${skew().toFixed(1)}deg,${skew().toFixed(1)}deg)`, borderRadius: blob(), offset:0.16 },
      { transform:`rotate(${rot()}deg) scale(${(0.52+Math.random()*0.2).toFixed(2)},${(0.58+Math.random()*0.22).toFixed(2)}) skew(${skew().toFixed(1)}deg,${skew().toFixed(1)}deg)`, borderRadius: blob(), offset:0.34 },
      { transform:`rotate(${rot()}deg) scale(${(0.3+Math.random()*0.18).toFixed(2)},${(0.34+Math.random()*0.2).toFixed(2)}) skew(${skew().toFixed(1)}deg,${skew().toFixed(1)}deg)`, borderRadius: blob(), filter:'brightness(0.9) contrast(1.12)', offset:0.55 },
      { transform:`rotate(${rot()}deg) scale(${(0.19+Math.random()*0.09).toFixed(2)},${(0.21+Math.random()*0.11).toFixed(2)}) skew(${(skew()*0.5).toFixed(1)}deg,${(skew()*0.5).toFixed(1)}deg)`, borderRadius: blob(), filter:'brightness(0.85) contrast(1.18)', offset:0.8 },
      { transform: baseTransform, borderRadius: blob(), filter:'brightness(0.8) contrast(1.24)' }
    ], { duration: 640, easing:'ease-in-out', fill:'forwards' });

    step1.onfinish = ()=>{
      const paperRect = paper.getBoundingClientRect();
      const dx = (Math.random()<0.5?-1:1) * (140 + Math.random()*120);
      const dy = (window.innerHeight - paperRect.top) + 140 + Math.random()*80;
      const sxNum = parseFloat(finalSx), syNum = parseFloat(finalSy);
      const step2 = paper.animate([
        { transform: `${baseTransform} translate(0,0)`, opacity:1 },
        { transform: `scale(${sxNum},${syNum}) rotate(${finalRot+220}deg) translate(${dx*0.55}px, ${dy*0.4 - 90}px)`, opacity:1, offset:0.5 },
        { transform: `scale(${(sxNum*0.9).toFixed(2)},${(syNum*0.85).toFixed(2)}) rotate(${finalRot+430}deg) translate(${dx}px, ${dy}px)`, opacity:0.9, offset:0.9 },
        { transform: `scale(${(sxNum*0.6).toFixed(2)},${(syNum*0.58).toFixed(2)}) rotate(${finalRot+460}deg) translate(${dx}px, ${dy}px)`, opacity:0 }
      ], { duration: 620, easing:'ease-in', fill:'forwards' });
      step2.onfinish = ()=>{
        finish('멀리 던져버렸어요.');
      };
    };
  }

  buttons.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      if(busy) return;
      const text = textInput.value.trim();
      if(!text){
        paper.classList.remove('shake');
        void paper.offsetWidth;
        paper.classList.add('shake');
        showHint();
        textInput.focus();
        return;
      }
      setBusy(true);
      const action = btn.getAttribute('data-action');
      if(action === 'tear') tear();
      else if(action === 'burn') burn();
      else if(action === 'crumple') crumple();
    });
  });
})();
