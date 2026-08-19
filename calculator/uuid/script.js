(function () {
  let mode = 'uuid4';
  let total = 0;
  const history = [];

  const tabs = document.querySelectorAll('.tab');
  const uuidOptions = document.getElementById('uuidOptions');
  const randomOptions = document.getElementById('randomOptions');
  const cryptokeyOptions = document.getElementById('cryptokeyOptions');
  const ledger = document.getElementById('ledger');
  const emptyState = document.getElementById('emptyState');
  const totalCountEl = document.getElementById('totalCount');
  const lenRange = document.getElementById('lenRange');
  const lenVal = document.getElementById('lenVal');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      mode = tab.dataset.mode;
      uuidOptions.style.display = (mode === 'uuid4' || mode === 'uuid7') ? 'block' : 'none';
      randomOptions.style.display = mode === 'random' ? 'block' : 'none';
      cryptokeyOptions.style.display = mode === 'cryptokey' ? 'block' : 'none';
    });
  });

  lenRange.addEventListener('input', () => { lenVal.textContent = lenRange.value; });

  document.querySelectorAll('.chip input').forEach(cb => {
    cb.addEventListener('change', () => {
      cb.closest('.chip').classList.toggle('on', cb.checked);
      if (cb.dataset.set === 'hexOnly' && cb.checked) {
        document.querySelectorAll('.chip input').forEach(other => {
          if (other !== cb) {
            other.checked = false;
            other.closest('.chip').classList.remove('on');
          }
        });
      } else if (cb.dataset.set !== 'hexOnly' && cb.checked) {
        const hexCb = document.querySelector('[data-set="hexOnly"]');
        hexCb.checked = false;
        hexCb.closest('.chip').classList.remove('on');
      }
    });
  });

  function randomBytes(n) {
    const arr = new Uint32Array(n);
    crypto.getRandomValues(arr);
    return arr;
  }

  function genUUID4() {
    return crypto.randomUUID();
  }

  // UUID v7: time-ordered UUID (draft RFC 9562)
  function genUUID7() {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    const ts = BigInt(Date.now());
    bytes[0] = Number((ts >> 40n) & 0xffn);
    bytes[1] = Number((ts >> 32n) & 0xffn);
    bytes[2] = Number((ts >> 24n) & 0xffn);
    bytes[3] = Number((ts >> 16n) & 0xffn);
    bytes[4] = Number((ts >> 8n) & 0xffn);
    bytes[5] = Number(ts & 0xffn);
    bytes[6] = (bytes[6] & 0x0f) | 0x70; // version 7
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant
    const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    return [hex.slice(0,8), hex.slice(8,12), hex.slice(12,16), hex.slice(16,20), hex.slice(20)].join('-');
  }

  function formatUUID(raw) {
    const caseMode = document.getElementById('uuidCase').value;
    const hyphenMode = document.getElementById('uuidHyphen').value;
    let v = raw;
    if (hyphenMode === 'off') v = v.replace(/-/g, '');
    if (caseMode === 'upper') v = v.toUpperCase();
    return v;
  }

  function genRandomString() {
    const hexOnly = document.querySelector('[data-set="hexOnly"]').checked;
    let charset = '';
    if (hexOnly) {
      charset = '0123456789abcdef';
    } else {
      if (document.querySelector('[data-set="lower"]').checked) charset += 'abcdefghijklmnopqrstuvwxyz';
      if (document.querySelector('[data-set="upper"]').checked) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if (document.querySelector('[data-set="digits"]').checked) charset += '0123456789';
      if (document.querySelector('[data-set="symbols"]').checked) charset += '!@#$%^&*-_=+';
    }
    if (!charset) charset = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const len = parseInt(lenRange.value, 10);
    const rnd = randomBytes(len);
    let out = '';
    for (let i = 0; i < len; i++) {
      out += charset[rnd[i] % charset.length];
    }
    return out;
  }

  function genCryptoKey() {
    const bits = parseInt(document.getElementById('keyBits').value, 10);
    const byteLen = bits / 8;
    const bytes = new Uint8Array(byteLen);
    crypto.getRandomValues(bytes);
    const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    const prefix = document.getElementById('keyPrefix').value === '0x' ? '0x' : '';
    return prefix + hex;
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(() => legacyCopy(text));
    }
    return legacyCopy(text);
  }

  function legacyCopy(text) {
    return new Promise((resolve, reject) => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        ok ? resolve() : reject(new Error('execCommand failed'));
      } catch (err) {
        document.body.removeChild(ta);
        reject(err);
      }
    });
  }

  function generateOne() {
    if (mode === 'uuid4') return formatUUID(genUUID4());
    if (mode === 'uuid7') return formatUUID(genUUID7());
    if (mode === 'cryptokey') return genCryptoKey();
    return genRandomString();
  }

  function addToLedger(value) {
    total += 1;
    totalCountEl.textContent = total;
    history.unshift(value);
    if (emptyState) { emptyState.remove(); }

    const item = document.createElement('div');
    item.className = 'stamp-item';
    item.innerHTML = `
      <span class="stamp-idx">${String(total).padStart(3, '0')}</span>
      <span class="stamp-value">${value}</span>
      <button class="stamp-copy">복사</button>
    `;
    item.querySelector('.stamp-copy').addEventListener('click', (e) => {
      const btn = e.target;
      copyToClipboard(value).then(() => {
        btn.textContent = '완료';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = '복사'; btn.classList.remove('copied'); }, 1200);
      }).catch(() => {
        btn.textContent = '실패';
        setTimeout(() => { btn.textContent = '복사'; }, 1500);
      });
    });
    ledger.prepend(item);

    // cap visible items for performance
    while (ledger.children.length > 300) {
      ledger.removeChild(ledger.lastChild);
    }
  }

  document.getElementById('genBtn').addEventListener('click', () => {
    const count = Math.max(1, Math.min(100, parseInt(document.getElementById('genCount').value, 10) || 1));
    for (let i = 0; i < count; i++) {
      addToLedger(generateOne());
    }
  });

  document.getElementById('clearBtn').addEventListener('click', () => {
    ledger.innerHTML = '<div class="empty-state" id="emptyState">생성 버튼을 누르면 여기에 결과가 쌓입니다</div>';
    history.length = 0;
    total = 0;
    totalCountEl.textContent = 0;
  });

  document.getElementById('copyAllBtn').addEventListener('click', (e) => {
    if (!history.length) return;
    const btn = e.target;
    const orig = btn.textContent;
    copyToClipboard(history.slice().reverse().join('\n')).then(() => {
      btn.textContent = '복사됨';
      setTimeout(() => { btn.textContent = orig; }, 1200);
    }).catch(() => {
      btn.textContent = '실패';
      setTimeout(() => { btn.textContent = orig; }, 1500);
    });
  });

  // 초기 로드 시 예시 하나 생성
  addToLedger(generateOne());
})();
