(function(){
  const SAMPLE = [
    { id: 1, name: "Ari Kim", role: "Design", contact: { email: "ari@studio.dev", city: "Seoul" }, skills: ["figma","motion"] },
    { id: 2, name: "Bo Park", role: "Engineer", contact: { email: "bo@studio.dev", city: "Busan" }, skills: ["rust","wasm"] },
    { id: 3, name: "Cho Lee", role: "PM", contact: { email: "cho@studio.dev", city: "Incheon" }, skills: ["notion"] }
  ];

  const el = id => document.getElementById(id);
  const input = el('input'), output = el('output');
  const gutterIn = el('gutterIn'), gutterOut = el('gutterOut');
  const statusIn = el('statusIn'), statusOut = el('statusOut');
  const sourcePanel = document.querySelector('.panel.source');
  const outputPanel = document.querySelector('.panel.output');
  const sourceTag = el('sourceTag'), targetTag = el('targetTag');

  let sourceFmt = 'json';
  let targetFmt = 'csv';

  /* ---------------- format pill wiring ---------------- */
  function wireGroup(groupId, onPick, initial){
    const group = el(groupId);
    group.querySelectorAll('.pill').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        group.querySelectorAll('.pill').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        onPick(btn.dataset.fmt);
      });
    });
  }
  wireGroup('sourceGroup', fmt => { sourceFmt = fmt; sourcePanel.dataset.fmt = fmt; sourceTag.textContent = fmt.toUpperCase(); renderGutter(gutterIn, input.value, sourceFmt); autoConvert(); });
  wireGroup('targetGroup', fmt => { targetFmt = fmt; outputPanel.dataset.fmt = fmt; targetTag.textContent = fmt.toUpperCase(); autoConvert(); });

  el('swapBtn').addEventListener('click', ()=>{
    const tmp = sourceFmt; sourceFmt = targetFmt; targetFmt = tmp;
    document.querySelectorAll('#sourceGroup .pill').forEach(b=>b.classList.toggle('active', b.dataset.fmt===sourceFmt));
    document.querySelectorAll('#targetGroup .pill').forEach(b=>b.classList.toggle('active', b.dataset.fmt===targetFmt));
    sourcePanel.dataset.fmt = sourceFmt; sourceTag.textContent = sourceFmt.toUpperCase();
    outputPanel.dataset.fmt = targetFmt; targetTag.textContent = targetFmt.toUpperCase();
    if (output.value){ input.value = output.value; }
    renderGutter(gutterIn, input.value, sourceFmt);
    autoConvert();
  });

  /* ---------------- flatten / unflatten ---------------- */
  function flatten(obj, prefix, res){
    res = res || {};
    if (obj === null || typeof obj !== 'object'){
      res[prefix || 'value'] = obj;
      return res;
    }
    if (Array.isArray(obj)){
      res[prefix || 'value'] = JSON.stringify(obj);
      return res;
    }
    const keys = Object.keys(obj);
    if (keys.length === 0){ res[prefix || 'value'] = {}; return res; }
    keys.forEach(k=>{
      const newKey = prefix ? prefix + '.' + k : k;
      const val = obj[k];
      if (val !== null && typeof val === 'object' && !Array.isArray(val)){
        flatten(val, newKey, res);
      } else if (Array.isArray(val)){
        res[newKey] = JSON.stringify(val);
      } else {
        res[newKey] = val;
      }
    });
    return res;
  }

  function unflatten(flatObj){
    const result = {};
    Object.keys(flatObj).forEach(key=>{
      let value = flatObj[key];
      if (typeof value === 'string'){
        const t = value.trim();
        if ((t.startsWith('[') && t.endsWith(']')) || (t.startsWith('{') && t.endsWith('}'))){
          try { value = JSON.parse(t); } catch(e){ /* keep string */ }
        }
      }
      const parts = key.split('.');
      let cur = result;
      for (let i=0;i<parts.length-1;i++){
        const p = parts[i];
        if (typeof cur[p] !== 'object' || cur[p] === null) cur[p] = {};
        cur = cur[p];
      }
      cur[parts[parts.length-1]] = value;
    });
    return result;
  }

  /* ---------------- parse / serialize per format ---------------- */
  function parseToObject(text, fmt){
    if (!text || !text.trim()) throw new Error('입력이 비어 있습니다.');
    if (fmt === 'json') return JSON.parse(text);
    if (fmt === 'yaml') {
      const doc = jsyaml.load(text);
      if (doc === undefined) throw new Error('YAML을 해석할 수 없습니다.');
      return doc;
    }
    if (fmt === 'csv'){
      const parsed = Papa.parse(text.trim(), { header:true, dynamicTyping:true, skipEmptyLines:true });
      if (parsed.errors && parsed.errors.length) throw new Error(parsed.errors[0].message);
      return parsed.data.map(unflatten);
    }
  }

  function serializeFromObject(obj, fmt){
    if (fmt === 'json') return JSON.stringify(obj, null, 2);
    if (fmt === 'yaml') return jsyaml.dump(obj, { noRefs:true, lineWidth:100 });
    if (fmt === 'csv'){
      const arr = Array.isArray(obj) ? obj : [obj];
      const flatRows = arr.map(o => flatten(o, ''));
      const fields = [];
      flatRows.forEach(r => Object.keys(r).forEach(k => { if (fields.indexOf(k) === -1) fields.push(k); }));
      const data = flatRows.map(r => fields.map(f => (r[f] === undefined || r[f] === null) ? '' : r[f]));
      return Papa.unparse({ fields, data });
    }
  }

  /* ---------------- gutters ---------------- */
  function computeDepths(text, fmt){
    const lines = text.split('\n');
    if (fmt === 'json'){
      let depth = 0;
      return lines.map(line=>{
        const leadingClose = /^\s*[}\]]/.test(line) ? 1 : 0;
        const d = Math.max(0, depth - leadingClose);
        const opens = (line.match(/[{\[]/g)||[]).length;
        const closes = (line.match(/[}\]]/g)||[]).length;
        depth = Math.max(0, depth + opens - closes);
        return Math.min(4, d);
      });
    }
    if (fmt === 'yaml'){
      return lines.map(line=>{
        if (!line.trim()) return 0;
        const m = line.match(/^(\s*)/);
        const indent = m ? m[1].replace(/\t/g,'  ').length : 0;
        return Math.min(4, Math.floor(indent/2));
      });
    }
    return lines.map((_,i)=> i); // csv: index-based
  }

  function renderGutter(container, text, fmt){
    const lines = text.length ? text.split('\n') : [''];
    const depths = computeDepths(text, fmt);
    let html = '';
    lines.forEach((_, i)=>{
      let barClass;
      if (fmt === 'csv'){
        barClass = i === 0 ? 'csv head' : (i % 2 === 0 ? 'csv even' : 'csv odd');
      } else {
        barClass = fmt + ' d' + (depths[i] || 0);
      }
      html += '<div class="g-row"><span class="g-num">' + (i+1) + '</span><span class="g-bar ' + barClass + '"></span></div>';
    });
    container.innerHTML = html;
  }

  function syncScroll(textarea, gutter){
    gutter.scrollTop = textarea.scrollTop;
  }
  input.addEventListener('scroll', ()=> syncScroll(input, gutterIn));
  output.addEventListener('scroll', ()=> syncScroll(output, gutterOut));

  /* ---------------- convert flow ---------------- */
  function setStatus(node, text, kind){
    node.textContent = text;
    node.classList.toggle('is-error', kind === 'error');
  }

  function convert(){
    const text = input.value;
    renderGutter(gutterIn, text, sourceFmt);
    setStatus(statusIn, text.trim() ? (text.split('\n').length + '줄 · ' + text.length + '자') : '0줄', 'ok');

    if (!text.trim()){
      output.value = '';
      renderGutter(gutterOut, '', targetFmt);
      setStatus(statusOut, '대기 중', 'ok');
      return;
    }
    try {
      const obj = parseToObject(text, sourceFmt);
      const out = serializeFromObject(obj, targetFmt);
      output.value = out;
      renderGutter(gutterOut, out, targetFmt);
      const rowInfo = Array.isArray(obj) ? (obj.length + '개 항목 · ') : '';
      setStatus(statusOut, rowInfo + out.split('\n').length + '줄 생성됨', 'ok');
    } catch(err){
      setStatus(statusIn, '⚠ ' + err.message, 'error');
      setStatus(statusOut, '원본을 확인하세요', 'error');
    }
  }
  function autoConvert(){ convert(); }

  let debounceTimer;
  input.addEventListener('input', ()=>{
    renderGutter(gutterIn, input.value, sourceFmt);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(convert, 220);
  });

  el('convertBtn').addEventListener('click', convert);

  /* ---------------- buttons ---------------- */
  el('sampleBtn').addEventListener('click', ()=>{
    if (sourceFmt === 'json') input.value = JSON.stringify(SAMPLE, null, 2);
    else if (sourceFmt === 'yaml') input.value = jsyaml.dump(SAMPLE);
    else input.value = serializeFromObject(SAMPLE, 'csv');
    renderGutter(gutterIn, input.value, sourceFmt);
    convert();
  });

  el('clearBtn').addEventListener('click', ()=>{
    input.value = '';
    renderGutter(gutterIn, '', sourceFmt);
    convert();
    input.focus();
  });

  el('copyBtn').addEventListener('click', ()=>{
    if (!output.value) return;
    navigator.clipboard.writeText(output.value).then(()=>{
      const btn = el('copyBtn');
      const old = btn.textContent;
      btn.textContent = '복사됨 ✓';
      setTimeout(()=> btn.textContent = old, 1200);
    });
  });

  el('downloadBtn').addEventListener('click', ()=>{
    if (!output.value) return;
    const ext = targetFmt === 'yaml' ? 'yaml' : targetFmt;
    const blob = new Blob([output.value], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'converted.' + ext;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });

  /* ---------------- init ---------------- */
  input.value = JSON.stringify(SAMPLE, null, 2);
  renderGutter(gutterIn, input.value, sourceFmt);
  convert();
})();