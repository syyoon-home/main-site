'use strict';

/* =========================================================
   0. 공통 유틸
   ========================================================= */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

const VALID_CHARS = {
  2: /^[01]*$/,
  8: /^[0-7]*$/,
  10: /^[0-9]*$/,
  16: /^[0-9a-fA-F]*$/,
};
const FILTER_CHARS = {
  2: /[^01]/g,
  8: /[^0-7]/g,
  10: /[^0-9]/g,
  16: /[^0-9a-fA-F]/g,
};

function toBig(str, base) {
  if (str === '' ) return null;
  try {
    if (base === 10) return BigInt(str);
    return BigInt(parseIntBig(str, base));
  } catch (e) {
    return null;
  }
}

// BigInt 안전 파서 (2/8/16진수 문자열 -> BigInt)
function parseIntBig(str, base) {
  let result = 0n;
  const b = BigInt(base);
  const lower = str.toLowerCase();
  for (const ch of lower) {
    const digit = parseInt(ch, base);
    if (Number.isNaN(digit)) throw new Error('invalid digit');
    result = result * b + BigInt(digit);
  }
  return result;
}

function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

/* =========================================================
   1. 테마 토글
   ========================================================= */
(function initTheme() {
  const root = document.documentElement;
  const btn = $('#themeToggle');
  const stored = localStorage.getItem('rb-theme');
  if (stored === 'light') root.classList.add('light');
  updateBtn();

  btn.addEventListener('click', () => {
    root.classList.toggle('light');
    localStorage.setItem('rb-theme', root.classList.contains('light') ? 'light' : 'dark');
    updateBtn();
  });

  function updateBtn() {
    const isLight = root.classList.contains('light');
    btn.setAttribute('aria-pressed', String(isLight));
    btn.setAttribute('aria-label', isLight ? '다크 모드로 전환' : '라이트 모드로 전환');
  }
})();

/* =========================================================
   2. 메인 진수 변환기
   ========================================================= */
const fields = {
  2: $('#inputBin'),
  8: $('#inputOct'),
  10: $('#inputDec'),
  16: $('#inputHex'),
};
const errEls = {
  2: $('#errBin'),
  8: $('#errOct'),
  10: $('#errDec'),
  16: $('#errHex'),
};
const rows = {
  2: $('.readout-row[data-base="2"]'),
  8: $('.readout-row[data-base="8"]'),
  10: $('.readout-row[data-base="10"]'),
  16: $('.readout-row[data-base="16"]'),
};

const negToggle = $('#negToggle');
const negOptions = $('#negOptions');
const errOverflow = $('#errOverflow');
const bitGrid = $('#bitGrid');
const bitvizCaption = $('#bitvizCaption');

let state = {
  bitwidth: 8,
  negmode: '2comp',
  negEnabled: false,
};

function clearErrors() {
  Object.values(errEls).forEach(el => (el.textContent = ''));
  Object.values(rows).forEach(r => r.classList.remove('has-error'));
  errOverflow.textContent = '';
}

function setError(base, msg) {
  errEls[base].textContent = msg;
  rows[base].classList.add('has-error');
}

function rangeFor(bitwidth, mode) {
  const max = 2n ** BigInt(bitwidth - 1) - 1n;
  const min = mode === '2comp' ? -(2n ** BigInt(bitwidth - 1)) : -(2n ** BigInt(bitwidth - 1) - 1n);
  return { min, max };
}

function encodeSigned(signed, bitwidth, mode) {
  const { min, max } = rangeFor(bitwidth, mode);
  if (signed < min || signed > max) return null; // overflow
  const full = 2n ** BigInt(bitwidth);
  if (signed >= 0n) return signed;
  if (mode === '2comp') return full + signed;
  if (mode === '1comp') return (full - 1n) - (-signed);
  // signmag
  const mask = 2n ** BigInt(bitwidth - 1);
  return mask | (-signed);
}

function decodeSigned(unsigned, bitwidth, mode) {
  const half = 2n ** BigInt(bitwidth - 1);
  const full = 2n ** BigInt(bitwidth);
  if (mode === '2comp') {
    return unsigned >= half ? unsigned - full : unsigned;
  }
  if (mode === '1comp') {
    return unsigned >= half ? -((full - 1n) - unsigned) : unsigned;
  }
  // signmag
  const mask = half;
  if (unsigned >= mask) return -(unsigned - mask);
  return unsigned;
}

function renderBitGrid(binStr, bitwidth) {
  bitGrid.innerHTML = '';
  const padded = binStr.padStart(Math.ceil(binStr.length / 4) * 4 || 4, '0');
  const groups = [];
  for (let i = padded.length; i > 0; i -= 4) {
    groups.unshift(padded.slice(Math.max(0, i - 4), i));
  }
  groups.forEach((g, idx) => {
    const wrap = document.createElement('div');
    wrap.className = 'bit-nibble';
    wrap.style.background = idx % 2 === 0 ? 'var(--nibble-1)' : 'var(--nibble-2)';
    for (const bit of g) {
      const cell = document.createElement('span');
      cell.className = 'bit-cell' + (bit === '1' ? ' on' : '');
      cell.textContent = bit;
      wrap.appendChild(cell);
    }
    bitGrid.appendChild(wrap);
  });
  bitvizCaption.textContent = state.negEnabled
    ? `${bitwidth}비트 · 4비트씩 색으로 구분됩니다`
    : `총 ${binStr.length}비트 · 4비트씩 색으로 구분됩니다`;
}

function flashRow(base) {
  const row = rows[base];
  row.classList.remove('flash');
  // force reflow to restart animation
  void row.offsetWidth;
  row.classList.add('flash');
}

function setFieldValue(base, str) {
  if (document.activeElement !== fields[base]) {
    fields[base].value = str;
  } else {
    fields[base].value = str;
  }
}

const pushHistoryDebounced = debounce(() => pushHistory(), 700);

function updateFromPlain(sourceBase, value) {
  const big = toBig(value, sourceBase);
  if (big === null) {
    return;
  }
  clearErrors();
  fields[2].value = big.toString(2);
  fields[8].value = big.toString(8);
  fields[10].value = big.toString(10);
  fields[16].value = big.toString(16).toUpperCase();
  [2, 8, 10, 16].forEach(b => { if (b !== sourceBase) flashRow(b); });
  renderBitGrid(big.toString(2), state.bitwidth);
  pushHistoryDebounced();
}

function updateFromNegative(sourceBase, rawValue) {
  clearErrors();
  const bw = state.bitwidth;
  const mode = state.negmode;

  if (sourceBase === 10) {
    if (rawValue === '' || rawValue === '-') return;
    let signed;
    try { signed = BigInt(rawValue); } catch (e) { setError(10, '올바른 정수를 입력하세요.'); return; }
    const unsigned = encodeSigned(signed, bw, mode);
    if (unsigned === null) {
      const { min, max } = rangeFor(bw, mode);
      errOverflow.textContent = `${bw}비트 · ${modeLabel(mode)} 범위를 벗어났습니다 (허용 범위: ${min} ~ ${max}).`;
      return;
    }
    applyUnsignedPattern(unsigned, bw, signed, 10);
  } else {
    if (rawValue === '') return;
    const unsigned = toBig(rawValue, sourceBase);
    if (unsigned === null) { setError(sourceBase, '잘못된 입력입니다.'); return; }
    if (unsigned >= 2n ** BigInt(bw)) {
      errOverflow.textContent = `${bw}비트 폭을 초과하는 값입니다.`;
      return;
    }
    const signed = decodeSigned(unsigned, bw, mode);
    applyUnsignedPattern(unsigned, bw, signed, sourceBase);
  }
}

function applyUnsignedPattern(unsigned, bw, signed, sourceBase) {
  const binStr = unsigned.toString(2).padStart(bw, '0');
  const hexStr = unsigned.toString(16).toUpperCase().padStart(bw / 4, '0');
  const octStr = unsigned.toString(8);

  fields[2].value = binStr;
  fields[8].value = octStr;
  fields[10].value = signed.toString();
  fields[16].value = hexStr;
  [2, 8, 10, 16].forEach(b => { if (b !== sourceBase) flashRow(b); });
  renderBitGrid(binStr, bw);
  pushHistoryDebounced();
}

function modeLabel(mode) {
  return { '2comp': '2의 보수', '1comp': '1의 보수', signmag: '부호-크기' }[mode];
}

function handleInput(base) {
  const el = fields[base];
  const filterRe = FILTER_CHARS[base];
  let val = el.value;

  if (state.negEnabled && base === 10) {
    // 음수 허용: 숫자 + 맨 앞 '-' 만 허용
    const neg = val.startsWith('-');
    val = val.replace(/[^0-9]/g, '');
    val = (neg ? '-' : '') + val;
  } else {
    val = val.replace(filterRe, '');
  }
  el.value = val;

  if (val === '' || val === '-') {
    clearErrors();
    return;
  }

  if (state.negEnabled) {
    updateFromNegative(base, val);
  } else {
    updateFromPlain(base, val);
  }
}

Object.entries(fields).forEach(([base, el]) => {
  el.addEventListener('input', () => handleInput(Number(base)));
});

// 초기값
fields[10].value = '172';
updateFromPlain(10, '172');

/* ---- 전체 지우기 ---- */
$('#clearAll').addEventListener('click', () => {
  Object.values(fields).forEach(el => (el.value = ''));
  clearErrors();
  bitGrid.innerHTML = '';
  bitvizCaption.textContent = '4비트씩 색으로 구분됩니다';
});

/* ---- 음수/비트폭 모드 토글 ---- */
negToggle.addEventListener('change', () => {
  state.negEnabled = negToggle.checked;
  negOptions.hidden = !state.negEnabled;
  clearErrors();
  const decVal = fields[10].value.replace(/[^0-9-]/g, '');
  if (decVal) {
    if (state.negEnabled) updateFromNegative(10, decVal);
    else updateFromPlain(10, decVal.replace('-', '') || '0');
  }
});

$$('.pill[data-bitwidth]').forEach(pill => {
  pill.addEventListener('click', () => {
    $$('.pill[data-bitwidth]').forEach(p => p.setAttribute('aria-pressed', 'false'));
    pill.setAttribute('aria-pressed', 'true');
    state.bitwidth = Number(pill.dataset.bitwidth);
    const decVal = fields[10].value;
    if (decVal) updateFromNegative(10, decVal);
  });
});

$$('.pill[data-negmode]').forEach(pill => {
  pill.addEventListener('click', () => {
    $$('.pill[data-negmode]').forEach(p => p.setAttribute('aria-pressed', 'false'));
    pill.setAttribute('aria-pressed', 'true');
    state.negmode = pill.dataset.negmode;
    const decVal = fields[10].value;
    if (decVal) updateFromNegative(10, decVal);
  });
});

/* ---- 복사 버튼 ---- */
$$('.copy-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const targetId = btn.dataset.copyTarget;
    const val = $('#' + targetId).value;
    if (!val) return;
    try {
      await navigator.clipboard.writeText(val);
    } catch (e) {
      const tmp = document.createElement('textarea');
      tmp.value = val;
      document.body.appendChild(tmp);
      tmp.select();
      document.execCommand('copy');
      document.body.removeChild(tmp);
    }
    btn.classList.add('copied');
    setTimeout(() => btn.classList.remove('copied'), 1200);
  });
});

/* =========================================================
   3. 비트 연산기
   ========================================================= */
const bitA = $('#bitA'), bitB = $('#bitB'), bitOp = $('#bitOp'), bitBWrap = $('#bitBWrap');
const bitResDec = $('#bitResDec'), bitResBin = $('#bitResBin'), bitResHex = $('#bitResHex');
const bitError = $('#bitError');
let opBitwidth = 8;

$$('.pill[data-opbitwidth]').forEach(pill => {
  pill.addEventListener('click', () => {
    $$('.pill[data-opbitwidth]').forEach(p => p.setAttribute('aria-pressed', 'false'));
    pill.setAttribute('aria-pressed', 'true');
    opBitwidth = Number(pill.dataset.opbitwidth);
    computeBitwise();
  });
});

function computeBitwise() {
  bitError.textContent = '';
  const aStr = bitA.value.trim();
  const bStr = bitB.value.trim();
  const op = bitOp.value;
  bitBWrap.style.display = op === 'not' ? 'none' : '';

  if (aStr === '' || (!['not'].includes(op) && bStr === '')) {
    bitResDec.textContent = bitResBin.textContent = bitResHex.textContent = '—';
    return;
  }
  let a, b;
  try {
    a = BigInt(aStr);
    b = op === 'not' ? 0n : BigInt(bStr);
  } catch (e) {
    bitError.textContent = '정수만 입력할 수 있습니다.';
    return;
  }
  const mask = 2n ** BigInt(opBitwidth) - 1n;
  a = a & mask;
  b = b & mask;

  let result;
  switch (op) {
    case 'and': result = a & b; break;
    case 'or': result = a | b; break;
    case 'xor': result = a ^ b; break;
    case 'not': result = (~a) & mask; break;
    case 'shl': result = (a << b) & mask; break;
    case 'shr': result = a >> b; break;
    default: result = 0n;
  }
  result = result & mask;
  bitResDec.textContent = result.toString(10);
  bitResBin.textContent = result.toString(2).padStart(opBitwidth, '0');
  bitResHex.textContent = result.toString(16).toUpperCase().padStart(opBitwidth / 4, '0');
}

[bitA, bitB].forEach(el => el.addEventListener('input', () => {
  el.value = el.value.replace(/[^0-9]/g, '');
  computeBitwise();
}));
bitOp.addEventListener('change', computeBitwise);
computeBitwise();

/* =========================================================
   4. 진법 덧셈 / 뺄셈 계산기
   ========================================================= */
const calcA = $('#calcA'), calcB = $('#calcB');
const calcABase = $('#calcABase'), calcBBase = $('#calcBBase');
const calcResBin = $('#calcResBin'), calcResOct = $('#calcResOct'), calcResDec = $('#calcResDec'), calcResHex = $('#calcResHex');
const calcError = $('#calcError');
let calcOp = 'add';

$$('.pill[data-calcop]').forEach(pill => {
  pill.addEventListener('click', () => {
    $$('.pill[data-calcop]').forEach(p => p.setAttribute('aria-pressed', 'false'));
    pill.setAttribute('aria-pressed', 'true');
    calcOp = pill.dataset.calcop;
    computeCalc();
  });
});

function computeCalc() {
  calcError.textContent = '';
  const aRaw = calcA.value.trim();
  const bRaw = calcB.value.trim();
  if (aRaw === '' || bRaw === '') {
    calcResBin.textContent = calcResOct.textContent = calcResDec.textContent = calcResHex.textContent = '—';
    return;
  }
  const aBase = Number(calcABase.value);
  const bBase = Number(calcBBase.value);
  const aVal = toBig(aRaw.replace(/^-/, ''), aBase);
  const bVal = toBig(bRaw.replace(/^-/, ''), bBase);
  if (aVal === null || bVal === null) {
    calcError.textContent = '선택한 진법에 맞는 값을 입력하세요.';
    return;
  }
  const aSigned = aRaw.startsWith('-') ? -aVal : aVal;
  const bSigned = bRaw.startsWith('-') ? -bVal : bVal;
  let result = calcOp === 'add' ? aSigned + bSigned : aSigned - bSigned;

  const neg = result < 0n;
  const abs = neg ? -result : result;
  calcResBin.textContent = (neg ? '-' : '') + abs.toString(2);
  calcResOct.textContent = (neg ? '-' : '') + abs.toString(8);
  calcResDec.textContent = result.toString(10);
  calcResHex.textContent = (neg ? '-' : '') + abs.toString(16).toUpperCase();
}

[calcA, calcB].forEach(el => el.addEventListener('input', computeCalc));
[calcABase, calcBBase].forEach(el => el.addEventListener('change', computeCalc));

/* =========================================================
   5. 변환 기록 (localStorage)
   ========================================================= */
const HISTORY_KEY = 'rb-history';
const historyList = $('#historyList');
const historyEmpty = $('#historyEmpty');

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch (e) {
    return [];
  }
}
function saveHistory(list) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
}

function pushHistory() {
  const dec = fields[10].value;
  if (dec === '' || dec === '-') return;
  const entry = {
    bin: fields[2].value,
    oct: fields[8].value,
    dec,
    hex: fields[16].value,
    ts: Date.now(),
  };
  const list = loadHistory();
  // 동일한 dec 값 연속 중복은 갱신만
  if (list[0] && list[0].dec === entry.dec) {
    list[0] = entry;
  } else {
    list.unshift(entry);
  }
  saveHistory(list.slice(0, 20));
  renderHistory();
}

function renderHistory() {
  const list = loadHistory();
  historyList.innerHTML = '';
  historyEmpty.classList.toggle('hidden', list.length > 0);
  list.forEach(item => {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.tabIndex = 0;
    const time = new Date(item.ts).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    li.innerHTML = `
      <span class="hi-values">
        <span><b>DEC</b> ${escapeHtml(item.dec)}</span>
        <span><b>BIN</b> ${escapeHtml(item.bin)}</span>
        <span><b>HEX</b> ${escapeHtml(item.hex)}</span>
      </span>
      <span class="hi-time">${time}</span>
    `;
    li.addEventListener('click', () => restoreHistory(item));
    li.addEventListener('keydown', e => { if (e.key === 'Enter') restoreHistory(item); });
    historyList.appendChild(li);
  });
}

function restoreHistory(item) {
  if (state.negEnabled) {
    negToggle.checked = false;
    state.negEnabled = false;
    negOptions.hidden = true;
  }
  fields[10].value = item.dec;
  updateFromPlain(10, item.dec);
  $('#converter').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

$('#clearHistory').addEventListener('click', () => {
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
});

renderHistory();
