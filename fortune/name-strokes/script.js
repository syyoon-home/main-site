// ---------- stroke tables ----------
// order matches Unicode Hangul composition order
const CHO = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
const CHO_STROKES = [1,2,1,2,4,3,3,4,8,2,4,1,2,4,3,2,3,4,3];

const JUNG = ["ㅏ","ㅐ","ㅑ","ㅒ","ㅓ","ㅔ","ㅕ","ㅖ","ㅗ","ㅘ","ㅙ","ㅚ","ㅛ","ㅜ","ㅝ","ㅞ","ㅟ","ㅠ","ㅡ","ㅢ","ㅣ"];
const JUNG_STROKES = [2,3,3,4,2,3,3,4,2,4,5,3,3,2,4,5,3,3,1,2,1];

const JONG = ["","ㄱ","ㄲ","ㄳ","ㄴ","ㄵ","ㄶ","ㄷ","ㄹ","ㄺ","ㄻ","ㄼ","ㄽ","ㄾ","ㄿ","ㅀ","ㅁ","ㅂ","ㅄ","ㅅ","ㅆ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
const JONG_STROKES = [0,1,2,3,1,3,4,2,3,4,6,7,5,6,7,6,3,4,6,2,4,1,2,3,2,3,4,3];

function decomposeSyllable(ch){
  const code = ch.charCodeAt(0) - 0xAC00;
  if(code < 0 || code > 11171) return null; // not a composed hangul syllable
  const choIdx = Math.floor(code / (21*28));
  const jungIdx = Math.floor((code % (21*28)) / 28);
  const jongIdx = code % 28;
  const strokes = CHO_STROKES[choIdx] + JUNG_STROKES[jungIdx] + JONG_STROKES[jongIdx];
  return {
    ch,
    cho: CHO[choIdx], choS: CHO_STROKES[choIdx],
    jung: JUNG[jungIdx], jungS: JUNG_STROKES[jungIdx],
    jong: JONG[jongIdx], jongS: JONG_STROKES[jongIdx],
    strokes
  };
}

function parseName(str){
  const out = [];
  const skipped = [];
  for(const ch of str.trim()){
    if(ch === " " || ch === "\t") continue;
    const d = decomposeSyllable(ch);
    if(d) out.push(d);
    else skipped.push(ch);
  }
  return { list: out, skipped };
}

function interleave(a, b){
  const out = [];
  const len = Math.max(a.length, b.length);
  for(let i=0;i<len;i++){
    if(a[i]) out.push({ ...a[i], source: 'a' });
    if(b[i]) out.push({ ...b[i], source: 'b' });
  }
  return out;
}

function buildPyramid(firstRow){
  const rows = [firstRow.slice()];
  let cur = firstRow.slice();
  while(cur.length > 2){
    const next = [];
    for(let i=0;i<cur.length-1;i++){
      next.push((cur[i]+cur[i+1]) % 10);
    }
    rows.push(next);
    cur = next;
  }
  return rows;
}

// ---------- UI wiring ----------
const name1Input = document.getElementById('name1');
const name2Input = document.getElementById('name2');
const calcBtn = document.getElementById('calcBtn');
const resetBtn = document.getElementById('resetBtn');
const errorMsg = document.getElementById('errorMsg');
const infoNote = document.getElementById('infoNote');
const stage2 = document.getElementById('stage2');
const stage3 = document.getElementById('stage3');
const decompEl = document.getElementById('decomp');
const pyramidEl = document.getElementById('pyramid');
const resultEl = document.getElementById('result');
const percentNum = document.getElementById('percentNum');
const meterFill = document.getElementById('meterFill');
const messageEl = document.getElementById('message');
const shareBtn = document.getElementById('shareBtn');
const shareHint = document.getElementById('shareHint');
const cardCanvas = document.getElementById('cardCanvas');

function messageFor(p){
  if(p >= 90) return "천생연분! 최고의 궁합이에요 💛";
  if(p >= 70) return "아주 좋은 궁합, 잘 맞는 편이에요 😊";
  if(p >= 50) return "무난한 궁합, 서로 맞춰가면 좋아요 🙂";
  if(p >= 30) return "티키타카가 조금 필요한 궁합이에요 🤔";
  return "정반대 매력! 다름을 즐겨보세요 😅";
}

function reset(){
  stage2.style.display = 'none';
  stage3.style.display = 'none';
  resultEl.classList.remove('show');
  decompEl.innerHTML = '';
  pyramidEl.innerHTML = '';
  errorMsg.textContent = '';
  infoNote.textContent = '';
  infoNote.classList.remove('show');
  meterFill.style.width = '0%';
  percentNum.innerHTML = '--<span>%</span>';
  messageEl.textContent = '';
  lastResult = null;
}

resetBtn.addEventListener('click', () => {
  name1Input.value = '';
  name2Input.value = '';
  reset();
});

function renderDecomp(label, list, delayStart){
  const line = document.createElement('div');
  line.className = 'name-line';
  const tag = document.createElement('div');
  tag.className = 'name-tag';
  tag.textContent = label;
  line.appendChild(tag);
  decompEl.appendChild(line);

  list.forEach((d, i) => {
    const chip = document.createElement('div');
    chip.className = 'syll';
    chip.style.animationDelay = (delayStart + i*140) + 'ms';
    chip.innerHTML = `
      <span class="ch">${d.ch}</span>
      <span class="jamos"><b>${d.cho}${d.choS}</b>+<b>${d.jung}${d.jungS}</b>${d.jongS?('+<b>'+d.jong+d.jongS+'</b>'):''}</span>
      <span class="eq">${d.strokes}</span>
    `;
    line.appendChild(chip);
  });
}

function renderPyramidStepwise(rows, onDone){
  pyramidEl.innerHTML = '';
  let rowIndex = 0;

  function renderRow(idx){
    if(idx >= rows.length){ onDone(); return; }
    const rowData = rows[idx];
    const prow = document.createElement('div');
    prow.className = 'prow';
    pyramidEl.appendChild(prow);

    rowData.forEach((val, i) => {
      const cell = document.createElement('div');
      cell.className = 'cell' + (idx===0 ? ' first-row' : '') + (idx===rows.length-1 ? ' final' : '');
      cell.textContent = val;
      cell.style.animationDelay = (i*90) + 'ms';
      prow.appendChild(cell);
    });

    const rowDuration = 260 + rowData.length*90;
    setTimeout(() => renderRow(idx+1), rowDuration);
  }
  renderRow(0);
}

function animatePercent(target){
  resultEl.classList.add('show');
  let cur = 0;
  const steps = 24;
  const stepVal = target/steps;
  const iv = setInterval(() => {
    cur += stepVal;
    if(cur >= target){ cur = target; clearInterval(iv); }
    percentNum.innerHTML = Math.round(cur) + '<span>%</span>';
  }, 30);
  meterFill.style.width = target + '%';
  messageEl.textContent = messageFor(target);
}

let lastResult = null; // { name1, name2, percent } for share card

calcBtn.addEventListener('click', () => {
  reset();
  const n1raw = name1Input.value;
  const n2raw = name2Input.value;

  if(n1raw.trim() === '' || n2raw.trim() === ''){
    errorMsg.textContent = '이름 1, 이름 2를 모두 입력해 주세요.';
    return;
  }

  const p1 = parseName(n1raw);
  const p2 = parseName(n2raw);
  const list1 = p1.list;
  const list2 = p2.list;

  // 태명/닉네임처럼 한글 외 문자가 섞였을 때는 조용히 버리지 않고 알려준다
  const skippedAll = [...new Set([...p1.skipped, ...p2.skipped])].filter(c => c.trim() !== '');
  if(skippedAll.length > 0){
    infoNote.textContent = `ⓘ '${skippedAll.join(' ')}' 는(은) 한글 글자가 아니라서 계산에서 제외했어요.`;
    infoNote.classList.add('show');
  }

  // 외자(한 글자) 이름은 정상 지원. 다만 두 이름 모두 유효 글자가 있어야 함.
  if(list1.length === 0 || list2.length === 0){
    errorMsg.textContent = '두 이름 모두 한글이 1글자 이상 포함되어야 해요. (외자, 태명, 닉네임도 가능해요!)';
    return;
  }

  stage2.style.display = 'block';
  renderDecomp(n1raw.trim(), list1, 0);
  renderDecomp(n2raw.trim(), list2, list1.length*140 + 120);

  const decompTotalDelay = (list1.length + list2.length) * 140 + 500;

  setTimeout(() => {
    stage3.style.display = 'block';
    const seq = interleave(list1, list2);
    const firstRow = seq.map(d => d.strokes);
    const sourceTags = seq.map(d => d.source);
    const rows = buildPyramid(firstRow);
    renderPyramidStepwise(rows, () => {
      const last = rows[rows.length-1];
      // 유효 글자 합이 2개뿐이면(예: 외자+외자) rows는 이미 첫 줄=마지막 줄
      let percent;
      if(last.length >= 2){
        percent = last[0]*10 + last[1];
      } else {
        // 이론상 도달하지 않지만 안전장치
        percent = (last[0] * 11) % 100;
      }
      lastResult = { name1: n1raw.trim(), name2: n2raw.trim(), percent, rows, sourceTags };
      setTimeout(() => animatePercent(percent), 300);
    });
  }, decompTotalDelay);
});

name2Input.addEventListener('keydown', e => { if(e.key === 'Enter') calcBtn.click(); });

// ---------- shareable result card ----------
async function ensureFontsLoaded(){
  try{
    await Promise.all([
      document.fonts.load('700 64px Gaegu'),
      document.fonts.load('700 40px Gaegu'),
      document.fonts.load('400 26px Gaegu'),
      document.fonts.load('800 22px "Nanum Gothic"')
    ]);
  }catch(e){ /* font loading best-effort; canvas still renders with fallback font */ }
}

function drawResultCard(name1, name2, rows, sourceTags, percent){
  const ctx = cardCanvas.getContext('2d');
  const W = 900;

  // --- figure out pyramid geometry first (needed to size the canvas) ---
  const marginX = 50;
  const availableWidth = W - marginX*2;
  const firstRowLen = rows[0].length;
  const gap = 12;
  let cellSize = Math.floor((availableWidth - (firstRowLen-1)*gap) / firstRowLen);
  cellSize = Math.max(22, Math.min(52, cellSize));
  const rowGap = 16;
  const pyramidHeight = rows.length * cellSize + (rows.length-1)*rowGap;

  const headerHeight = 210;
  const pyramidTop = headerHeight + 10;
  const afterPyramidGap = 50;
  const resultSectionHeight = 560;
  const H = pyramidTop + pyramidHeight + afterPyramidGap + resultSectionHeight;

  cardCanvas.width = W;
  cardCanvas.height = H;

  // paper background
  ctx.fillStyle = '#f3eedb';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(185,203,224,0.9)';
  ctx.lineWidth = 2;
  for(let y = 90; y < H; y += 46){
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  ctx.fillStyle = 'rgba(200,90,74,0.55)';
  ctx.fillRect(64, 0, 3, H);

  // eyebrow
  ctx.fillStyle = '#b8412f';
  ctx.font = '700 20px "Nanum Gothic", sans-serif';
  ctx.fillText('이름 획수 궁합 · 숫자 줄여가기', 96, 60);

  // names
  ctx.fillStyle = '#223c5a';
  ctx.font = '700 42px Gaegu, sans-serif';
  ctx.fillText(`${name1}  ❤  ${name2}`, 96, 130);

  // legend
  ctx.font = '400 16px "Nanum Gothic", sans-serif';
  ctx.fillStyle = '#2b6cb0';
  ctx.fillText(`● ${name1}`, 96, 170);
  ctx.fillStyle = '#c2528f';
  ctx.fillText(`● ${name2}`, 96 + ctx.measureText(`● ${name1}   `).width + 30, 170);

  // --- pyramid ---
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  rows.forEach((row, ri) => {
    const rowWidth = row.length*cellSize + (row.length-1)*gap;
    const startX = (W - rowWidth)/2 + cellSize/2;
    const y = pyramidTop + ri*(cellSize+rowGap) + cellSize/2;
    const isFinal = ri === rows.length-1;

    row.forEach((val, ci) => {
      const x = startX + ci*(cellSize+gap);
      ctx.beginPath();
      ctx.arc(x, y, cellSize/2, 0, Math.PI*2);

      if(isFinal){
        ctx.fillStyle = '#b8412f';
      } else if(ri === 0){
        ctx.fillStyle = '#fff3d6';
      } else {
        ctx.fillStyle = '#ffffff';
      }
      ctx.fill();

      let borderColor = '#55708c';
      if(ri === 0 && sourceTags){
        borderColor = sourceTags[ci] === 'a' ? '#2b6cb0' : '#c2528f';
      } else if(ri === 0){
        borderColor = '#c8932f';
      }
      if(isFinal) borderColor = '#7f2b1f';

      ctx.lineWidth = 2;
      ctx.strokeStyle = borderColor;
      ctx.stroke();

      ctx.fillStyle = isFinal ? '#ffffff' : '#223c5a';
      ctx.font = `700 ${Math.max(13, Math.floor(cellSize*0.42))}px Gaegu, sans-serif`;
      ctx.fillText(String(val), x, y+2);
    });
  });

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // --- result section below pyramid ---
  const resultTop = pyramidTop + pyramidHeight + afterPyramidGap;
  const cx = W/2, cy = resultTop + 210, r = 175;
  const grad = ctx.createLinearGradient(cx-r, cy-r, cx+r, cy+r);
  grad.addColorStop(0, '#c8932f');
  grad.addColorStop(1, '#b8412f');
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI*2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 12;
  ctx.strokeStyle = grad;
  ctx.stroke();

  ctx.fillStyle = '#b8412f';
  ctx.textAlign = 'center';
  ctx.font = '700 108px Gaegu, sans-serif';
  ctx.fillText(percent + '%', cx, cy + 38);

  ctx.fillStyle = '#223c5a';
  ctx.font = '400 30px Gaegu, sans-serif';
  ctx.fillText(messageFor(percent), cx, resultTop + 440);

  ctx.fillStyle = '#55708c';
  ctx.font = '400 18px "Nanum Gothic", sans-serif';
  ctx.fillText('한글 자모 획수로 계산한 궁합 · 재미로만 봐주세요', cx, resultTop + 500);
  ctx.textAlign = 'left';
}

async function buildCardBlob(){
  await ensureFontsLoaded();
  drawResultCard(lastResult.name1, lastResult.name2, lastResult.rows, lastResult.sourceTags, lastResult.percent);
  return new Promise(resolve => cardCanvas.toBlob(resolve, 'image/png'));
}

shareBtn.addEventListener('click', async () => {
  if(!lastResult) return;
  shareBtn.disabled = true;
  const originalLabel = shareBtn.textContent;
  shareBtn.textContent = '이미지 만드는 중...';

  try{
    const blob = await buildCardBlob();
    const fileName = `이름궁합_${lastResult.name1}_${lastResult.name2}_${lastResult.percent}.png`;
    const file = new File([blob], fileName, { type: 'image/png' });

    if(navigator.canShare && navigator.canShare({ files: [file] })){
      await navigator.share({
        files: [file],
        title: '이름 획수 궁합',
        text: `${lastResult.name1} ❤ ${lastResult.name2} 궁합은 ${lastResult.percent}%!`
      });
      shareHint.textContent = '공유 완료! 카카오톡 등 원하는 곳으로 보냈어요';
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      shareHint.textContent = '이미지가 저장됐어요! 카카오톡 대화방에 첨부해서 보내보세요';
    }
  }catch(err){
    if(err && err.name !== 'AbortError'){
      shareHint.textContent = '이미지 생성 중 문제가 발생했어요. 다시 시도해 주세요.';
    }
  }finally{
    shareBtn.disabled = false;
    shareBtn.textContent = originalLabel;
  }
});
