function escapeHtml(s){
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ---------------- 글자 수 통계 ----------------
function computeStats(text){
  const withSpace = text.length;
  const noSpace = text.replace(/\s/g,'').length;
  const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).filter(Boolean).length;
  const sentences = text.split(/[.!?。！？\n]/).map(s=>s.trim()).filter(Boolean).length;
  const lines = text === '' ? 0 : text.split('\n').length;
  const pages = (withSpace / 200).toFixed(1);
  return {withSpace, noSpace, words, sentences, lines, pages};
}

function renderStats(el, stats){
  el.innerHTML = [
    [stats.withSpace, '공백 포함'],
    [stats.noSpace, '공백 제외'],
    [stats.words, '단어 수'],
    [stats.sentences, '문장 수'],
    [stats.lines, '줄 수'],
    [stats.pages + '장', '원고지(200자)'],
  ].map(([val, label]) => '<div class="stat-item"><span class="stat-num">' + val + '</span><span class="stat-label">' + label + '</span></div>').join('');
}

const textA = document.getElementById('textA');
const textB = document.getElementById('textB');
const statsA = document.getElementById('statsA');
const statsB = document.getElementById('statsB');
const goalA = document.getElementById('goalA');
const goalB = document.getElementById('goalB');
const goalWrapA = document.getElementById('goalWrapA');
const goalWrapB = document.getElementById('goalWrapB');
const goalFillA = document.getElementById('goalFillA');
const goalFillB = document.getElementById('goalFillB');
const goalTextA = document.getElementById('goalTextA');
const goalTextB = document.getElementById('goalTextB');

function updateGoal(text, goalInput, wrapEl, fillEl, textEl){
  const goal = parseInt(goalInput.value, 10);
  if(!goal || goal <= 0){
    wrapEl.classList.remove('show');
    return;
  }
  wrapEl.classList.add('show');
  const len = text.length;
  const ratio = len / goal;
  fillEl.style.width = Math.min(ratio, 1) * 100 + '%';
  fillEl.classList.remove('warn','over');
  textEl.classList.remove('over');
  if(ratio > 1){
    fillEl.classList.add('over');
    textEl.classList.add('over');
    textEl.textContent = (len - goal) + '자 초과 (' + len + ' / ' + goal + '자)';
  } else if(ratio >= 0.9){
    fillEl.classList.add('warn');
    textEl.textContent = (goal - len) + '자 남음 (' + len + ' / ' + goal + '자)';
  } else {
    textEl.textContent = (goal - len) + '자 남음 (' + len + ' / ' + goal + '자)';
  }
}

function refreshStats(){
  renderStats(statsA, computeStats(textA.value));
  renderStats(statsB, computeStats(textB.value));
  updateGoal(textA.value, goalA, goalWrapA, goalFillA, goalTextA);
  updateGoal(textB.value, goalB, goalWrapB, goalFillB, goalTextB);
}
textA.addEventListener('input', refreshStats);
textB.addEventListener('input', refreshStats);
goalA.addEventListener('input', refreshStats);
goalB.addEventListener('input', refreshStats);
refreshStats();

// ---------------- 복사 · 초기화 ----------------
function wireCopyReset(copyId, resetId, textarea){
  const copyBtn = document.getElementById(copyId);
  const resetBtn = document.getElementById(resetId);
  copyBtn.addEventListener('click', async () => {
    try{
      await navigator.clipboard.writeText(textarea.value);
      const original = copyBtn.textContent;
      copyBtn.textContent = '복사됨';
      copyBtn.classList.add('copied');
      setTimeout(() => { copyBtn.textContent = original; copyBtn.classList.remove('copied'); }, 1200);
    }catch(e){
      copyBtn.textContent = '복사 실패';
      setTimeout(() => { copyBtn.textContent = '복사'; }, 1200);
    }
  });
  resetBtn.addEventListener('click', () => {
    textarea.value = '';
    textarea.focus();
    refreshStats();
  });
}
wireCopyReset('copyA', 'resetA', textA);
wireCopyReset('copyB', 'resetB', textB);

// ---------------- 파일 불러오기 (txt / docx) ----------------
function flashMsg(btn, msg){
  const original = btn.textContent;
  btn.textContent = msg;
  setTimeout(() => { btn.textContent = original; }, 1400);
}

function wireUpload(buttonId, fileInputId, textarea){
  const btn = document.getElementById(buttonId);
  const fileInput = document.getElementById(fileInputId);
  btn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    fileInput.value = '';
    if(!file) return;
    const name = file.name.toLowerCase();

    if(name.endsWith('.docx')){
      if(typeof mammoth === 'undefined'){
        flashMsg(btn, 'docx 로더 실패');
        return;
      }
      try{
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({arrayBuffer});
        textarea.value = result.value;
        refreshStats();
      }catch(e){
        flashMsg(btn, '읽기 실패');
      }
      return;
    }

    if(name.endsWith('.hwp')){
      flashMsg(btn, 'hwp 미지원');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      textarea.value = e.target.result;
      refreshStats();
    };
    reader.onerror = () => flashMsg(btn, '읽기 실패');
    reader.readAsText(file, 'UTF-8');
  });
}
wireUpload('uploadA', 'fileA', textA);
wireUpload('uploadB', 'fileB', textB);

// ---------------- 비교 모드 ----------------
const compareToggle = document.getElementById('compareToggle');
const compareLabel = document.getElementById('compareLabel');
const panels = document.getElementById('panels');
const panelB = document.getElementById('panelB');
const diffBtn = document.getElementById('diffBtn');
const diffResult = document.getElementById('diffResult');
const diffBody = document.getElementById('diffBody');

function openCompare(){
  panels.classList.add('split');
  panelB.classList.add('show');
  compareToggle.classList.add('on');
  compareLabel.textContent = '비교 닫기';
  diffBtn.style.display = 'inline-block';
}
function closeCompare(){
  panels.classList.remove('split');
  panelB.classList.remove('show');
  compareToggle.classList.remove('on');
  compareLabel.textContent = '비교할 글 추가하기';
  diffBtn.style.display = 'none';
  diffResult.classList.remove('show');
}
compareToggle.addEventListener('click', () => {
  panelB.classList.contains('show') ? closeCompare() : openCompare();
});

function buildLineAwareDiff(a, b){
  const lineHunks = Diff.diffLines(a, b);
  const parts = [];

  for(let i = 0; i < lineHunks.length; i++){
    const cur = lineHunks[i];
    const next = lineHunks[i + 1];

    if(cur.removed && next && next.added){
      const aLines = cur.value.replace(/\n$/, '').split('\n');
      const bLines = next.value.replace(/\n$/, '').split('\n');
      const pairCount = Math.min(aLines.length, bLines.length);

      for(let k = 0; k < pairCount; k++){
        const wordDiff = Diff.diffWordsWithSpace(aLines[k], bLines[k]);
        wordDiff.forEach(p => parts.push(p));
        parts.push({value: '\n'});
      }
      for(let k = pairCount; k < aLines.length; k++){
        parts.push({value: aLines[k], removed: true});
        parts.push({value: '\n'});
      }
      for(let k = pairCount; k < bLines.length; k++){
        parts.push({value: bLines[k], added: true});
        parts.push({value: '\n'});
      }
      i++; // next hunk already consumed as its pair
    } else {
      parts.push(cur);
    }
  }
  return parts;
}

diffBtn.addEventListener('click', () => {
  const a = textA.value;
  const b = textB.value;
  const diff = buildLineAwareDiff(a, b);
  let html = '';
  diff.forEach(part => {
    const val = escapeHtml(part.value);
    if(part.added) html += '<ins>' + val + '</ins>';
    else if(part.removed) html += '<del>' + val + '</del>';
    else html += val;
  });
  diffBody.innerHTML = html || '<span style="color:#AEB4C2;">비교할 내용이 없어요.</span>';
  diffResult.classList.add('show');
});
