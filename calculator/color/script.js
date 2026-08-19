(function(){
  var els = {
    swatch: document.getElementById('swatch'),
    hexInput: document.getElementById('hexInput'),
    rSlider: document.getElementById('rSlider'),
    gSlider: document.getElementById('gSlider'),
    bSlider: document.getElementById('bSlider'),
    hSlider: document.getElementById('hSlider'),
    sSlider: document.getElementById('sSlider'),
    lSlider: document.getElementById('lSlider'),
    rVal: document.getElementById('rVal'),
    gVal: document.getElementById('gVal'),
    bVal: document.getElementById('bVal'),
    hVal: document.getElementById('hVal'),
    sVal: document.getElementById('sVal'),
    lVal: document.getElementById('lVal'),
    fgDot: document.getElementById('fgDot'),
    fgText: document.getElementById('fgText'),
    fgNote: document.getElementById('fgNote'),
    paletteGrid: document.getElementById('paletteGrid'),
    imageTabPanel: document.getElementById('imageTabPanel'),
    dropZone: document.getElementById('dropZone'),
    imageInput: document.getElementById('imageInput'),
    toast: document.getElementById('toast'),
    root: document.documentElement
  };

  var state = { r:46, g:158, b:142, activeMode:'complementary', imagePalette:null };

  /* ---------- conversions ---------- */
  function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }

  function hexToRgb(hex){
    hex = hex.trim().replace('#','');
    if(hex.length === 3){ hex = hex.split('').map(function(c){ return c+c; }).join(''); }
    if(!/^[0-9a-fA-F]{6}$/.test(hex)) return null;
    var num = parseInt(hex,16);
    return { r:(num>>16)&255, g:(num>>8)&255, b:num&255 };
  }

  function rgbToHex(r,g,b){
    return '#' + [r,g,b].map(function(v){
      return clamp(Math.round(v),0,255).toString(16).padStart(2,'0');
    }).join('');
  }

  function rgbToHsl(r,g,b){
    r/=255; g/=255; b/=255;
    var max = Math.max(r,g,b), min = Math.min(r,g,b);
    var h,s,l = (max+min)/2;
    if(max === min){ h = s = 0; }
    else{
      var d = max-min;
      s = l > 0.5 ? d/(2-max-min) : d/(max+min);
      switch(max){
        case r: h = (g-b)/d + (g<b?6:0); break;
        case g: h = (b-r)/d + 2; break;
        default: h = (r-g)/d + 4;
      }
      h /= 6;
    }
    return { h: Math.round(h*360), s: Math.round(s*100), l: Math.round(l*100) };
  }

  function hslToRgb(h,s,l){
    h = ((h%360)+360)%360 / 360; s/=100; l/=100;
    var r,g,b;
    if(s === 0){ r=g=b=l; }
    else{
      var hue2rgb = function(p,q,t){
        if(t<0) t+=1;
        if(t>1) t-=1;
        if(t<1/6) return p+(q-p)*6*t;
        if(t<1/2) return q;
        if(t<2/3) return p+(q-p)*(2/3-t)*6;
        return p;
      };
      var q = l<0.5 ? l*(1+s) : l+s-l*s;
      var p = 2*l-q;
      r = hue2rgb(p,q,h+1/3);
      g = hue2rgb(p,q,h);
      b = hue2rgb(p,q,h-1/3);
    }
    return { r: Math.round(r*255), g: Math.round(g*255), b: Math.round(b*255) };
  }

  function luminance(r,g,b){
    var chan = [r,g,b].map(function(v){
      v/=255;
      return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4);
    });
    return 0.2126*chan[0] + 0.7152*chan[1] + 0.0722*chan[2];
  }

  /* ---------- core update ---------- */
  function setColor(r,g,b, source){
    r = clamp(Math.round(r),0,255); g = clamp(Math.round(g),0,255); b = clamp(Math.round(b),0,255);
    state.r = r; state.g = g; state.b = b;
    var hex = rgbToHex(r,g,b);
    var hsl = rgbToHsl(r,g,b);

    if(source !== 'hex'){ els.hexInput.value = hex; }
    if(source !== 'rgb'){
      els.rSlider.value = r; els.gSlider.value = g; els.bSlider.value = b;
    }
    if(source !== 'hsl'){
      els.hSlider.value = hsl.h; els.sSlider.value = hsl.s; els.lSlider.value = hsl.l;
    }
    els.rVal.textContent = r; els.gVal.textContent = g; els.bVal.textContent = b;
    els.hVal.textContent = hsl.h + '°'; els.sVal.textContent = hsl.s + '%'; els.lVal.textContent = hsl.l + '%';

    els.swatch.style.background = hex;
    els.root.style.setProperty('--accent', hex);

    var lum = luminance(r,g,b);
    var fg = lum > 0.5 ? '#15171B' : '#FFFFFF';
    els.root.style.setProperty('--accent-fg', fg);
    els.fgDot.style.background = fg === '#FFFFFF' ? '#FFFFFF' : '#15171B';
    els.fgText.textContent = fg === '#FFFFFF' ? '텍스트는 밝은색 권장' : '텍스트는 어두운색 권장';
    els.fgNote.style.color = fg;
    els.fgDot.style.background = fg;

    renderPalette();
  }

  /* ---------- field wiring ---------- */
  els.hexInput.addEventListener('input', function(){
    var v = els.hexInput.value;
    if(v[0] !== '#') v = '#' + v.replace('#','');
    var rgb = hexToRgb(v);
    if(rgb){ setColor(rgb.r, rgb.g, rgb.b, 'hex'); }
  });
  els.hexInput.addEventListener('blur', function(){
    els.hexInput.value = rgbToHex(state.r, state.g, state.b);
  });

  [els.rSlider, els.gSlider, els.bSlider].forEach(function(input){
    input.addEventListener('input', function(){
      setColor(+els.rSlider.value, +els.gSlider.value, +els.bSlider.value, 'rgb');
    });
  });

  [els.hSlider, els.sSlider, els.lSlider].forEach(function(input){
    input.addEventListener('input', function(){
      var rgb = hslToRgb(+els.hSlider.value, +els.sSlider.value, +els.lSlider.value);
      setColor(rgb.r, rgb.g, rgb.b, 'hsl');
    });
  });

  document.getElementById('randomBtn').addEventListener('click', function(){
    setColor(Math.random()*255, Math.random()*255, Math.random()*255, null);
  });

  /* ---------- copy ---------- */
  function showToast(msg){
    els.toast.textContent = msg;
    els.toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function(){ els.toast.classList.remove('show'); }, 1400);
  }

  function copyText(text){
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(function(){ showToast('복사됨 · ' + text); });
    } else {
      var ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      try{ document.execCommand('copy'); }catch(e){}
      document.body.removeChild(ta);
      showToast('복사됨 · ' + text);
    }
  }

  document.querySelectorAll('.copy-btn[data-copy-input]').forEach(function(btn){
    btn.addEventListener('click', function(){
      copyText(document.getElementById(btn.getAttribute('data-copy-input')).value);
    });
  });
  document.getElementById('copyRgb').addEventListener('click', function(){
    copyText('rgb(' + state.r + ', ' + state.g + ', ' + state.b + ')');
  });
  document.getElementById('copyHsl').addEventListener('click', function(){
    var hsl = rgbToHsl(state.r, state.g, state.b);
    copyText('hsl(' + hsl.h + ', ' + hsl.s + '%, ' + hsl.l + '%)');
  });

  /* ---------- palette tabs ---------- */
  var tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(function(btn){
    btn.addEventListener('click', function(){
      tabButtons.forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      state.activeMode = btn.getAttribute('data-mode');
      els.imageTabPanel.style.display = state.activeMode === 'image' ? 'block' : 'none';
      renderPalette();
    });
  });

  function makeSwatchEl(hex){
    var btn = document.createElement('button');
    btn.className = 'pal-swatch';
    btn.type = 'button';
    btn.setAttribute('aria-label', hex + ' 복사');
    var fill = document.createElement('div');
    fill.className = 'fill';
    fill.style.background = hex;
    var code = document.createElement('div');
    code.className = 'code';
    code.textContent = hex.toUpperCase();
    btn.appendChild(fill);
    btn.appendChild(code);
    btn.addEventListener('click', function(){ copyText(hex.toUpperCase()); });
    return btn;
  }

  function renderPalette(){
    var hsl = rgbToHsl(state.r, state.g, state.b);
    var grid = els.paletteGrid;
    grid.innerHTML = '';
    var hexList = [];

    if(state.activeMode === 'image'){
      hexList = state.imagePalette || [];
      if(hexList.length === 0){
        var empty = document.createElement('p');
        empty.style.cssText = 'grid-column:1/-1; font-size:13px; color:var(--muted); margin:8px 0;';
        empty.textContent = '아직 업로드된 이미지가 없어요. 위에서 이미지를 올려주세요.';
        grid.appendChild(empty);
        return;
      }
    } else {
      var hues = [];
      if(state.activeMode === 'complementary'){ hues = [hsl.h, (hsl.h+180)%360]; }
      else if(state.activeMode === 'analogous'){ hues = [(hsl.h-30+360)%360, hsl.h, (hsl.h+30)%360]; }
      else if(state.activeMode === 'triadic'){ hues = [hsl.h, (hsl.h+120)%360, (hsl.h+240)%360]; }

      if(state.activeMode === 'shades'){
        [12, 28, 44, hsl.l, 62, 78, 90].forEach(function(l){
          var rgb = hslToRgb(hsl.h, hsl.s, clamp(l,4,96));
          hexList.push(rgbToHex(rgb.r, rgb.g, rgb.b));
        });
      } else {
        hues.forEach(function(h){
          var base = hslToRgb(h, hsl.s, hsl.l);
          hexList.push(rgbToHex(base.r, base.g, base.b));
          var tint = hslToRgb(h, hsl.s, clamp(hsl.l+22,0,95));
          hexList.push(rgbToHex(tint.r, tint.g, tint.b));
        });
      }
    }

    hexList.forEach(function(hex){ grid.appendChild(makeSwatchEl(hex)); });
  }

  /* ---------- image palette extraction ---------- */
  var canvas = document.getElementById('hiddenCanvas');
  var ctx = canvas.getContext('2d');

  function extractPalette(img){
    var maxDim = 100;
    var scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    canvas.width = Math.max(1, Math.round(img.width*scale));
    canvas.height = Math.max(1, Math.round(img.height*scale));
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    var data;
    try{ data = ctx.getImageData(0,0,canvas.width, canvas.height).data; }
    catch(e){ showToast('이미지를 읽을 수 없어요'); return; }

    var buckets = {};
    var step = 32;
    for(var i=0; i<data.length; i+=4){
      var a = data[i+3];
      if(a < 128) continue;
      var r = data[i], g = data[i+1], b = data[i+2];
      var key = [Math.floor(r/step), Math.floor(g/step), Math.floor(b/step)].join(',');
      if(!buckets[key]) buckets[key] = { count:0, r:0, g:0, b:0 };
      buckets[key].count++;
      buckets[key].r += r; buckets[key].g += g; buckets[key].b += b;
    }

    var arr = Object.keys(buckets).map(function(k){ return buckets[k]; });
    arr.sort(function(a,b){ return b.count - a.count; });
    var top = arr.slice(0, 6).map(function(bucket){
      return rgbToHex(bucket.r/bucket.count, bucket.g/bucket.count, bucket.b/bucket.count);
    });

    state.imagePalette = top;
    if(state.activeMode === 'image'){ renderPalette(); }
    showToast('팔레트 ' + top.length + '개 추출됨');
  }

  function handleFile(file){
    if(!file || file.type.indexOf('image/') !== 0) return;
    var reader = new FileReader();
    reader.onload = function(e){
      var img = new Image();
      img.onload = function(){ extractPalette(img); };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  els.imageInput.addEventListener('change', function(){
    handleFile(els.imageInput.files[0]);
  });
  els.dropZone.addEventListener('dragover', function(e){ e.preventDefault(); els.dropZone.classList.add('drag'); });
  els.dropZone.addEventListener('dragleave', function(){ els.dropZone.classList.remove('drag'); });
  els.dropZone.addEventListener('drop', function(e){
    e.preventDefault();
    els.dropZone.classList.remove('drag');
    if(e.dataTransfer.files && e.dataTransfer.files[0]){ handleFile(e.dataTransfer.files[0]); }
  });

  /* ---------- init ---------- */
  setColor(46, 158, 142, null);
})();
