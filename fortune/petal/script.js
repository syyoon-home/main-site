(function(){
  // ---------- 배경 먼지 입자 ----------
  const dustEl = document.getElementById('dust');
  for(let i=0;i<26;i++){
    const m = document.createElement('div');
    m.className='mote';
    const left = Math.random()*100;
    const dur = 9 + Math.random()*10;
    const delay = Math.random()*12;
    const dx = (Math.random()*60-30)+'px';
    m.style.left = left+'vw';
    m.style.bottom = '-10px';
    m.style.setProperty('--dx', dx);
    m.style.animationDuration = dur+'s';
    m.style.animationDelay = delay+'s';
    m.style.width = m.style.height = (2+Math.random()*2)+'px';
    dustEl.appendChild(m);
  }

  // ---------- 상태 ----------
  const svgNS = "http://www.w3.org/2000/svg";
  const screenAsk = document.getElementById('screen-ask');
  const screenRead = document.getElementById('screen-read');
  const qInput = document.getElementById('q');
  const qDisplay = document.getElementById('qDisplay');
  const startBtn = document.getElementById('startBtn');
  const flowerSvg = document.getElementById('flowerSvg');
  const remainNum = document.getElementById('remainNum');
  const wordPop = document.getElementById('wordPop');
  const hint = document.getElementById('hint');
  const autoBtn = document.getElementById('autoBtn');
  const ground = document.getElementById('ground');
  const resultBox = document.getElementById('result');
  const resultWord = document.getElementById('resultWord');
  const resultLine = document.getElementById('resultLine');
  const retryBtn = document.getElementById('retryBtn');
  const newBtn = document.getElementById('newBtn');

  const WORDS = ['그렇다','아니다'];
  let total = 0, remaining = 0, wordIndex = 0, lastQuestion = '';

  function rand(min,max){ return Math.random()*(max-min)+min; }

  // 꽃잎 색상: 살짝씩 다른 핑크 톤
  function petalFill(i){
    const hues = ['#f0b9c7','#eab3c3','#f2c2cd','#e7a9bb'];
    return hues[i % hues.length];
  }

  function buildStem(){
    const g = document.createElementNS(svgNS,'g');
    g.innerHTML = `
      <path d="M200,192 C195,300 210,360 198,480" stroke="#5f7d55" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M199,330 C170,320 150,335 138,362 C168,368 190,358 199,338 Z" fill="#6f9160"/>
      <path d="M201,390 C232,382 252,398 262,424 C230,428 208,416 201,398 Z" fill="#638454"/>
    `;
    return g;
  }

  function buildCenter(){
    const g = document.createElementNS(svgNS,'g');
    g.innerHTML = `
      <circle cx="200" cy="178" r="26" fill="#e0a94f"/>
      <circle cx="200" cy="178" r="26" fill="url(#centerGrad)"/>
      ${Array.from({length:14}).map(()=>{
        const a = Math.random()*Math.PI*2;
        const r = rand(4,20);
        const cx = 200+Math.cos(a)*r;
        const cy = 178+Math.sin(a)*r;
        return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${rand(1,2).toFixed(1)}" fill="#a9701f" opacity="0.55"/>`;
      }).join('')}
    `;
    return g;
  }

  function petalPath(w,h){
    // 위쪽으로 향한 눈물모양 꽃잎, 중심(0,0) 기준
    return `M0,0 C${-w},${-h*0.28} ${-w*0.92},${-h*0.78} 0,${-h} C${w*0.92},${-h*0.78} ${w},${-h*0.28} 0,0 Z`;
  }

  const CX = 200, CY = 178;
  let petalList = []; // {g, angle, fill}

  function buildFlower(count){
    flowerSvg.innerHTML = `
      <defs>
        <radialGradient id="centerGrad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#f7d38f"/>
          <stop offset="60%" stop-color="#dea24a"/>
          <stop offset="100%" stop-color="#b97e2e"/>
        </radialGradient>
        <linearGradient id="petalGrad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stop-color="#d98ca2"/>
          <stop offset="100%" stop-color="#f6cdd8"/>
        </linearGradient>
      </defs>
    `;
    flowerSvg.appendChild(buildStem());

    const petalsGroup = document.createElementNS(svgNS,'g');
    petalsGroup.id = 'petalsGroup';
    const baseR = 116;
    petalList = [];

    // 균등한 각도로 배치하되, 순서는 살짝 흐트러뜨려서(지터) 자연스럽게
    const step = 360/count;

    for(let i=0;i<count;i++){
      const angle = step*i + rand(-step*0.12, step*0.12);
      const w = rand(25,29);
      const h = baseR + rand(-6,6);

      const g = document.createElementNS(svgNS,'g');
      g.setAttribute('class','petal');
      g.setAttribute('data-idx', i);
      // base(정지) 변환: 중심으로 이동 후 각도만큼 회전 — 이 값은 애니메이션 중에도 그대로 유지되는 "고정 기준"
      g.dataset.baseAngle = angle;
      g.setAttribute('transform', `translate(${CX},${CY}) rotate(${angle}) translate(0,0) rotate(0)`);

      const path = document.createElementNS(svgNS,'path');
      path.setAttribute('class','pf');
      path.setAttribute('d', petalPath(w,h));
      path.setAttribute('fill', 'url(#petalGrad)');
      path.setAttribute('stroke', '#c97b93');
      path.setAttribute('stroke-width','0.6');
      path.setAttribute('opacity','0.96');

      // 잎맥
      const vein = document.createElementNS(svgNS,'path');
      vein.setAttribute('d', `M0,-4 L0,${-h*0.88}`);
      vein.setAttribute('stroke','#c97b93');
      vein.setAttribute('stroke-width','0.7');
      vein.setAttribute('opacity','0.35');
      vein.setAttribute('fill','none');

      g.appendChild(path);
      g.appendChild(vein);
      petalsGroup.appendChild(g);

      const item = { g, angle, fill: petalFill(i), fallen:false };
      g.addEventListener('click', ()=> pluckOne(item));
      petalList.push(item);
    }
    flowerSvg.appendChild(petalsGroup);
    flowerSvg.appendChild(buildCenter());
  }

  function popWord(word){
    wordPop.textContent = word;
    wordPop.classList.remove('show');
    void wordPop.offsetWidth; // reflow to restart animation
    wordPop.classList.add('show');
  }

  function fallenPetalSVG(colorHex){
    return `<svg viewBox="0 0 40 60"><path d="M20,0 C6,10 4,30 20,60 C36,30 34,10 20,0 Z" fill="${colorHex}" opacity="0.9"/></svg>`;
  }

  function spawnFallen(originAngleDeg, fillColor){
    const el = document.createElement('div');
    el.className = 'fallen';
    const spread = Math.sin(originAngleDeg*Math.PI/180)*140;
    const leftPct = 50 + (spread/280*100)*0.6 + rand(-6,6);
    el.style.left = `calc(${leftPct}% - 10px)`;
    el.style.setProperty('--rot', rand(-70,70)+'deg');
    el.innerHTML = fallenPetalSVG(fillColor);
    ground.appendChild(el);

    const dropY = rand(6,22);
    el.animate([
      { transform:`translateY(-40px) rotate(0deg)`, opacity:0 },
      { transform:`translateY(${dropY}px) rotate(${rand(-40,40)}deg)`, opacity:0.9, offset:0.7 },
      { transform:`translateY(${dropY}px) rotate(${rand(-40,40)}deg)`, opacity:0.85 }
    ], { duration: 700, easing:'ease-out', fill:'forwards' });
  }

  // SVG 좌표계 안에서 직접 transform 속성을 갱신하는 낙하 애니메이션 (CSS/SVG 좌표계 불일치로 인한
  // 위치 오류를 피하기 위해 requestAnimationFrame으로 attribute를 직접 조작한다)
  function animateFall(item, onDone){
    const { g, angle } = item;
    const fallX = rand(-46,46);
    const fallDist = rand(150,190);
    const fallRot = rand(-150,150);
    const duration = 700;
    const start = performance.now();

    function frame(now){
      let t = Math.min(1, (now-start)/duration);
      const eased = 1 - Math.pow(1-t, 3); // ease-out cubic
      const tx = fallX*eased;
      const ty = fallDist*eased;
      const rot = fallRot*eased;
      g.setAttribute('transform', `translate(${CX},${CY}) rotate(${angle}) translate(${tx},${ty}) rotate(${rot})`);
      g.style.opacity = String(1 - eased);
      if(t < 1){
        requestAnimationFrame(frame);
      } else {
        g.style.display = 'none';
        onDone();
      }
    }
    requestAnimationFrame(frame);
  }

  function pluckOne(item){
    if(item.fallen || remaining<=0) return;
    item.fallen = true;

    const word = WORDS[wordIndex % WORDS.length];
    popWord(word);
    spawnFallen(item.angle, item.fill);
    animateFall(item, ()=>{});

    remaining -= 1;
    wordIndex += 1;
    remainNum.textContent = remaining;

    if(remaining === 1){
      hint.textContent = '마지막 꽃잎이 남았어요';
    } else if(remaining === 0){
      hint.textContent = '';
      autoBtn.style.display = 'none';
      setTimeout(()=> showResult(word), 680);
    } else if(!autoRunning){
      hint.textContent = '꽃잎을 하나씩 눌러 떼어보세요';
    }
  }

  // 순서를 살짝 섞어서 자동으로 남은 꽃잎을 하나씩 떨어뜨림
  function shuffled(arr){
    const a = arr.slice();
    for(let i=a.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [a[i],a[j]] = [a[j],a[i]];
    }
    return a;
  }

  let autoRunning = false;

  function startAuto(){
    if(autoRunning) return;
    const remainingItems = shuffled(petalList.filter(it=>!it.fallen));
    if(remainingItems.length === 0) return;

    autoRunning = true;
    autoBtn.disabled = true;
    autoBtn.textContent = '자동으로 떨어지는 중…';
    hint.textContent = '꽃잎이 하나씩 떨어지고 있어요…';
    flowerSvg.classList.add('auto-lock-all');

    const interval = 820;
    remainingItems.forEach((item, idx)=>{
      setTimeout(()=> pluckOne(item), idx*interval);
    });
    setTimeout(()=>{
      autoRunning = false;
    }, remainingItems.length*interval);
  }

  function showResult(finalWord){
    resultWord.textContent = finalWord;
    resultWord.style.color = finalWord === '그렇다' ? 'var(--gold)' : '#c9b3d6';
    const lines = finalWord === '그렇다'
      ? [`꽃잎 ${total}장이 입을 모아 그렇다고 답했습니다.`, '마음이 이미 기울어진 쪽으로 가보아도 좋겠습니다.']
      : [`꽃잎 ${total}장이 입을 모아 아니다라고 답했습니다.`, '다른 길이나 다른 때를 기다려보는 것도 방법입니다.'];
    resultLine.textContent = lines[Math.floor(Math.random()*lines.length)];
    resultBox.style.display = 'block';
  }

  function startReading(newCountOnly){
    const val = qInput.value.trim();
    if(!newCountOnly){
      lastQuestion = val || '오늘의 마음';
    }
    qDisplay.textContent = lastQuestion;

    total = Math.floor(rand(9,16)); // 9~15장
    remaining = total;
    wordIndex = Math.random()<0.5 ? 0 : 1;

    remainNum.textContent = remaining;
    hint.textContent = '꽃잎을 하나씩 눌러 떼어보세요';
    ground.innerHTML = '';
    resultBox.style.display = 'none';
    wordPop.classList.remove('show');

    autoRunning = false;
    autoBtn.disabled = false;
    autoBtn.textContent = '자동으로 떨구기';
    autoBtn.style.display = 'block';
    flowerSvg.classList.remove('auto-lock-all');

    buildFlower(total);

    screenAsk.style.display = 'none';
    screenRead.style.display = 'block';
  }

  autoBtn.addEventListener('click', startAuto);

  startBtn.addEventListener('click', ()=> startReading(false));
  qInput.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); startReading(false); }
  });

  retryBtn.addEventListener('click', ()=> startReading(true));
  newBtn.addEventListener('click', ()=>{
    screenRead.style.display = 'none';
    screenAsk.style.display = 'block';
    qInput.value = '';
    qInput.focus();
  });

})();
