/* ================= 공통 유틸 ================= */
const won = n => Math.round(n).toLocaleString('ko-KR') + '원';
const round10 = n => Math.round(n/10)*10;

/* 숫자를 억/만/원 단위의 읽기 쉬운 한글 표기로 변환. 예: 40000000 -> "4,000만원" */
function formatKoreanUnit(n){
  n = Math.round(Number(n)||0);
  if(n===0) return '0원';
  const sign = n<0 ? '-' : '';
  n = Math.abs(n);
  const eok = Math.floor(n/100000000);
  const man = Math.floor((n%100000000)/10000);
  const rest = n%10000;
  const parts = [];
  if(eok>0) parts.push(eok.toLocaleString('ko-KR')+'억');
  if(man>0) parts.push(man.toLocaleString('ko-KR')+'만');
  if(rest>0 || parts.length===0) parts.push(rest.toLocaleString('ko-KR'));
  return sign + parts.join(' ') + '원';
}

/* 금액 입력 필드 옆 실시간 단위 힌트(예: "4,000만원") 바인딩 */
function bindUnitHint(input, hint){
  const update = ()=>{
    const val = parseFloat(input.value);
    hint.textContent = (input.value==='' || isNaN(val)) ? '' : formatKoreanUnit(val);
  };
  input.addEventListener('input', update);
  update();
}
document.querySelectorAll('.amount-field').forEach(wrap=>{
  const input = wrap.querySelector('input[type=number]');
  const hint = wrap.querySelector('.unit-hint');
  if(input && hint) bindUnitHint(input, hint);
});

/* ================= 팝업(모달) ================= */
function openModal(id){
  const modal = document.getElementById(id);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(id){
  const modal = document.getElementById(id);
  modal.classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e=>{
  if(e.key==='Escape'){
    document.querySelectorAll('.modal-overlay.open').forEach(m=>closeModal(m.id));
  }
});

/* ================= 2026 4대보험 요율 ================= */
const RATE = {
  pension: 0.0475,          // 국민연금 근로자부담
  pensionMin: 400000,       // 기준소득월액 하한
  pensionMax: 6370000,      // 기준소득월액 상한
  health: 0.03595,          // 건강보험 근로자부담
  ltc: 0.1314,              // 장기요양보험(건강보험료 대비)
  employment: 0.009,        // 고용보험 근로자부담
};
const MIN_WAGE_2026 = 10320;
const MIN_WAGE_MONTHLY_2026 = 2156880;

/* ================= 근로소득세 근사 계산 =================
   국세청 근로소득 간이세액표를 산출하는 방식(연간 환산 후 종합소득세 기본세율 적용)을
   근사한 것으로, 실제 간이세액표와 소액 차이가 날 수 있습니다. */
function earnedIncomeDeduction(annual){
  if(annual<=5000000) return annual*0.7;
  if(annual<=15000000) return 3500000 + (annual-5000000)*0.4;
  if(annual<=45000000) return 7500000 + (annual-15000000)*0.15;
  if(annual<=100000000) return 12000000 + (annual-45000000)*0.05;
  return 14750000 + (annual-100000000)*0.02;
}
function progressiveTax(base){
  const brackets = [
    [14000000,0.06,0],
    [50000000,0.15,1260000],
    [88000000,0.24,5760000],
    [150000000,0.35,15440000],
    [300000000,0.38,19940000],
    [500000000,0.40,25940000],
    [1000000000,0.42,35940000],
    [Infinity,0.45,65940000],
  ];
  for(const [limit,rate,deduct] of brackets){
    if(base<=limit) return Math.max(0, base*rate - deduct);
  }
  return 0;
}
function earnedIncomeTaxCredit(calcTax, annualWage){
  let credit = calcTax<=1300000 ? calcTax*0.55 : 715000 + (calcTax-1300000)*0.30;
  let limit;
  if(annualWage<=33000000) limit=740000;
  else if(annualWage<=70000000) limit=Math.max(660000, 740000-(annualWage-33000000)*0.008);
  else if(annualWage<=120000000) limit=Math.max(500000, 660000-(annualWage-70000000)*0.000005*100000);
  else limit=Math.max(200000, 500000-(annualWage-120000000)*0.000005*100000);
  return Math.min(credit, limit);
}
function estimateMonthlyIncomeTax(monthlyTaxableWage, familyCount, childCount, annualSocialInsurance){
  const annualWage = monthlyTaxableWage*12;
  const deduction = earnedIncomeDeduction(annualWage);
  const earnedIncomeAmount = Math.max(0, annualWage - deduction);
  const personalDeduction = Math.max(1,familyCount)*1500000;
  const base = Math.max(0, earnedIncomeAmount - personalDeduction - annualSocialInsurance - 130000);
  let calcTax = progressiveTax(base);
  let credit = earnedIncomeTaxCredit(calcTax, annualWage);
  let determined = Math.max(0, calcTax - credit);
  // 자녀세액공제 근사(2자녀 기준 통상 55만원 수준)
  if(childCount>0){
    let childCredit = childCount===1?250000: childCount===2?550000: 550000+(childCount-2)*400000;
    determined = Math.max(0, determined - childCredit);
  }
  const monthly = round10(determined/12);
  return monthly;
}

/* ================= STEP 1: 연봉 실수령액 ================= */
let lastSalaryResult = null;

function computeSalaryBreakdown(annualSalary, nonTax, familyCount, childCount){
  const monthlyGross = annualSalary/12;
  const taxableMonthly = Math.max(0, monthlyGross - nonTax);

  const pensionBase = Math.min(RATE.pensionMax, Math.max(RATE.pensionMin, taxableMonthly));
  const pension = round10(pensionBase*RATE.pension);
  const health = round10(taxableMonthly*RATE.health);
  const ltc = round10(health*RATE.ltc);
  const employment = round10(taxableMonthly*RATE.employment);

  const annualSocialInsurance = (pension+health+ltc+employment)*12;
  const incomeTax = estimateMonthlyIncomeTax(taxableMonthly, familyCount, childCount, annualSocialInsurance);
  const localTax = round10(incomeTax*0.1);

  const totalDeduction = pension+health+ltc+employment+incomeTax+localTax;
  const net = monthlyGross - totalDeduction;

  return { monthlyGross, taxableMonthly, pension, health, ltc, employment, incomeTax, localTax, totalDeduction, net };
}

function calcSalary(){
  const annual = parseFloat(document.getElementById('s-annual').value)||0;
  const nonTax = parseFloat(document.getElementById('s-nontax').value)||0;
  const family = parseInt(document.getElementById('s-family').value)||1;
  const children = parseInt(document.getElementById('s-children').value)||0;
  const raise = parseFloat(document.getElementById('s-raise').value)||0;
  const weekHours = parseFloat(document.getElementById('s-hours').value)||40;

  const r = computeSalaryBreakdown(annual, nonTax, family, children);
  lastSalaryResult = r;

  let warnHtml = '';
  const impliedHourly = (r.monthlyGross) / ((weekHours+ (weekHours>=15? weekHours/40*8:0)) * 4.345);
  if(annual>0 && weekHours>0){
    const monthlyMinForHours = MIN_WAGE_MONTHLY_2026 * (weekHours/40);
    if(r.monthlyGross < monthlyMinForHours){
      warnHtml = `<div class="warn">⚠ 입력한 세전 월급(${won(r.monthlyGross)})이 2026년 최저임금 기준 예상 월급(${won(monthlyMinForHours)}, 시급 ${MIN_WAGE_2026.toLocaleString()}원 기준)보다 낮을 수 있어요. 소정근로시간을 다시 확인해보세요.</div>`;
    }
  }

  let raiseHtml = '';
  if(raise>0){
    const r2 = computeSalaryBreakdown(annual*(1+raise/100), nonTax, family, children);
    const diff = r2.net - r.net;
    raiseHtml = `<div class="ok-note">인상률 ${raise}% 적용 시 월 실수령액은 <b>${won(r2.net)}</b> (현재 대비 월 +${won(diff)}, 연 +${won(diff*12)})으로 예상됩니다.</div>`;
  }

  const grossBarPct = 100;
  const netPct = Math.max(4, Math.round((r.net/r.monthlyGross)*100));
  const deductPct = 100-netPct;

  document.getElementById('s-warn').innerHTML = warnHtml + raiseHtml;
  document.getElementById('s-result').innerHTML = `
  <div class="receipt" id="s-receipt">
    <div class="receipt-inner">
      <div class="stamp">실수령률<br>${netPct}%</div>
      <div class="receipt-head">
        <div class="tag">Salary Statement</div>
        <h3>월 급여 명세 (예상)</h3>
      </div>
      <div class="rline"><span class="l">세전 월급여</span><span class="v">${won(r.monthlyGross)}</span></div>
      <div class="rline"><span class="l">비과세액</span><span class="v">${won(nonTax)}</span></div>
      <div class="rline deduct"><span class="l">국민연금 (4.75%)</span><span class="v">-${won(r.pension)}</span></div>
      <div class="rline deduct"><span class="l">건강보험 (3.595%)</span><span class="v">-${won(r.health)}</span></div>
      <div class="rline deduct"><span class="l">장기요양보험</span><span class="v">-${won(r.ltc)}</span></div>
      <div class="rline deduct"><span class="l">고용보험 (0.9%)</span><span class="v">-${won(r.employment)}</span></div>
      <div class="rline deduct"><span class="l">근로소득세 (근사)</span><span class="v">-${won(r.incomeTax)}</span></div>
      <div class="rline deduct"><span class="l">지방소득세</span><span class="v">-${won(r.localTax)}</span></div>
      <div class="rline total"><span class="l">월 실수령액</span><span class="v">${won(r.net)}</span></div>
      <div class="rline" style="border-bottom:none;"><span class="l">연 실수령액 (추정)</span><span class="v">${won(r.net*12)}</span></div>

      <div class="bar-compare">
        <div class="bar-row">
          <div class="bar-label"><span>실수령</span><span>${netPct}%</span></div>
          <div class="bar-track"><div class="bar-fill" style="width:${netPct}%; background:var(--mint-deep);"></div></div>
        </div>
        <div class="bar-row">
          <div class="bar-label"><span>공제 (세금+보험)</span><span>${deductPct}%</span></div>
          <div class="bar-track"><div class="bar-fill" style="width:${deductPct}%; background:var(--rust);"></div></div>
        </div>
      </div>

      <div class="receipt-actions no-capture">
        <button class="ghost" onclick="saveAsImage('s-receipt')">이미지로 저장</button>
        <button class="ghost" onclick="applySalaryToQuit()">이 금액으로 퇴사일 계산하기 →</button>
      </div>
    </div>
    <div class="receipt-cut"></div>
  </div>`;
}

/* ================= STEP 2: 주휴수당 ================= */
function calcHoliday(){
  const wage = parseFloat(document.getElementById('h-wage').value)||0;
  const hours = parseFloat(document.getElementById('h-hours').value)||0;
  const full = document.getElementById('h-full').checked;
  const next = document.getElementById('h-next').checked;

  const meetsHours = hours>=15;
  const eligible = meetsHours && full && next;

  const cappedHours = Math.min(hours,40);
  const pay = eligible ? round10((cappedHours/40)*8*wage) : 0;

  let reasons = [];
  if(!meetsHours) reasons.push('1주 소정근로시간이 15시간 미만입니다.');
  if(!full) reasons.push('해당 주 소정근로일을 개근하지 않았습니다.');
  if(!next) reasons.push('다음 주 근로 예정이 확인되지 않았습니다 (마지막 근무주 등).');

  document.getElementById('h-result').innerHTML = `
  <div class="receipt" id="h-receipt">
    <div class="receipt-inner">
      <div class="stamp" style="border-color:${eligible?'var(--mint-deep)':'var(--seal)'}; color:${eligible?'var(--mint-deep)':'var(--seal)'};">
        ${eligible?'지급 대상<br>O':'지급 대상<br>X'}
      </div>
      <div class="receipt-head">
        <div class="tag">Weekly Paid Holiday</div>
        <h3>주휴수당 판정 결과</h3>
      </div>
      <div class="rline"><span class="l">시급</span><span class="v">${won(wage)}</span></div>
      <div class="rline"><span class="l">1주 소정근로시간</span><span class="v">${hours}시간</span></div>
      <div class="rline"><span class="l">15시간 이상</span><span class="v">${meetsHours?'충족':'미충족'}</span></div>
      <div class="rline"><span class="l">개근 여부</span><span class="v">${full?'충족':'미충족'}</span></div>
      <div class="rline"><span class="l">다음 주 근로 예정</span><span class="v">${next?'충족':'미충족'}</span></div>
      <div class="rline total"><span class="l">주휴수당</span><span class="v">${won(pay)}</span></div>
      ${reasons.length? `<div class="warn no-capture" style="margin-top:16px;">${reasons.join(' ')}</div>`: `<div class="ok-note no-capture" style="margin-top:16px;">3가지 조건을 모두 충족해 주휴수당 지급 대상입니다.</div>`}
      <div class="receipt-actions no-capture">
        <button class="ghost" onclick="saveAsImage('h-receipt')">이미지로 저장</button>
      </div>
    </div>
    <div class="receipt-cut"></div>
  </div>`;
}

/* ================= STEP 3: 목표액 → 퇴사 가능일 ================= */
document.getElementById('q-start').valueAsDate = new Date();

function applySalaryToQuit(){
  if(!lastSalaryResult){
    alert('먼저 연봉 실수령액을 계산해주세요.');
    return;
  }
  const netInput = document.getElementById('q-net');
  netInput.value = Math.round(lastSalaryResult.net);
  netInput.dispatchEvent(new Event('input'));
  document.getElementById('q-cycle').value = 'month';
  closeModal('modal-salary');
  netInput.scrollIntoView({behavior:'smooth', block:'center'});
  netInput.classList.add('flash-fill');
  setTimeout(()=>netInput.classList.remove('flash-fill'), 1200);
}

function toggleAdv(fieldsId, show){
  document.getElementById(fieldsId).style.display = show ? '' : 'none';
}

let bonusRowCount = 0;
function addBonusRow(){
  if(bonusRowCount>=6) return;
  bonusRowCount++;
  const row = document.createElement('div');
  row.className = 'bonus-row';
  row.innerHTML = `
    <input type="date" class="bonus-date">
    <div class="amount-field bonus-amount-wrap">
      <input type="number" class="bonus-amount" placeholder="금액 (원)" min="0" step="10000">
      <span class="unit-hint"></span>
    </div>
    <button type="button" title="삭제" onclick="this.parentElement.remove()">×</button>`;
  document.getElementById('q-bonus-rows').appendChild(row);
  bindUnitHint(row.querySelector('.bonus-amount'), row.querySelector('.unit-hint'));
}
addBonusRow(); // 기본 1행 노출 (상여금 옵션 체크 시에만 사용됨)

function readBonusList(){
  return Array.from(document.querySelectorAll('#q-bonus-rows .bonus-row')).map(row=>{
    const dateStr = row.querySelector('.bonus-date').value;
    const amount = parseFloat(row.querySelector('.bonus-amount').value)||0;
    return dateStr && amount>0 ? { date:new Date(dateStr), amount } : null;
  }).filter(Boolean).sort((a,b)=>a.date-b.date);
}

function addPeriod(date, cycle){
  const d = new Date(date);
  if(cycle==='month') d.setMonth(d.getMonth()+1);
  else d.setDate(d.getDate()+7);
  return d;
}

/* 회차별로 실수령액(+옵션 반영)을 누적해 목표 달성 시점을 찾는 시뮬레이션.
   고급 옵션을 켜지 않으면 매 회차 동일 금액이 쌓이는 단순 계산과 결과가 같습니다. */
function simulateQuitDate({target, current, cycle, net, start, raiseEnabled, raiseDate, raisePct, bonusEnabled, bonuses, rateEnabled, savingsRate}){
  const rate = rateEnabled ? Math.max(0, Math.min(100, savingsRate))/100 : 1;
  const maxPeriods = cycle==='month' ? 600 : 2600; // 최대 약 50년 안전장치

  let cumulative = current;
  let date = new Date(start);
  let periodCount = 0;
  let raiseApplied = false;
  let currentNet = net;
  let bonusIdx = 0;
  const timeline = [];

  if(cumulative >= target){
    return { reached:true, quitDate:new Date(start), periodCount:0, totalSaved:cumulative, timeline, overCap:false };
  }

  while(cumulative < target && periodCount < maxPeriods){
    const prevDate = new Date(date);
    date = addPeriod(date, cycle);
    periodCount++;

    if(raiseEnabled && !raiseApplied && raiseDate && date >= raiseDate){
      currentNet = net * (1 + raisePct/100);
      raiseApplied = true;
    }

    let periodGain = currentNet * rate;

    if(bonusEnabled){
      while(bonusIdx < bonuses.length && bonuses[bonusIdx].date > prevDate && bonuses[bonusIdx].date <= date){
        periodGain += bonuses[bonusIdx].amount * rate;
        bonusIdx++;
      }
    }

    cumulative += periodGain;
    timeline.push({ date:new Date(date), gain:periodGain, cumulative });
  }

  return {
    reached: cumulative>=target,
    quitDate: date,
    periodCount,
    totalSaved: cumulative,
    timeline,
    overCap: cumulative<target
  };
}

function calcQuit(){
  const target = parseFloat(document.getElementById('q-target').value)||0;
  const current = parseFloat(document.getElementById('q-current').value)||0;
  const cycle = document.getElementById('q-cycle').value;
  let net = parseFloat(document.getElementById('q-net').value)||0;
  const startStr = document.getElementById('q-start').value;

  if(net<=0 && lastSalaryResult){ net = cycle==='month' ? lastSalaryResult.net : lastSalaryResult.net*3/13; }
  if(net<=0){
    document.getElementById('q-result').innerHTML = `<div class="warn">회차당 실수령액을 입력하거나, 연봉 실수령액 계산기를 먼저 이용해주세요.</div>`;
    return;
  }

  const raiseEnabled = document.getElementById('q-adv-raise').checked;
  const raiseDateStr = document.getElementById('q-raise-date').value;
  const raiseDate = raiseDateStr ? new Date(raiseDateStr) : null;
  const raisePct = parseFloat(document.getElementById('q-raise-pct').value)||0;
  if(raiseEnabled && !raiseDate){
    document.getElementById('q-result').innerHTML = `<div class="warn">연봉 인상 시점 반영을 체크했다면 인상 적용일을 입력해주세요.</div>`;
    return;
  }

  const bonusEnabled = document.getElementById('q-adv-bonus').checked;
  const bonuses = bonusEnabled ? readBonusList() : [];
  if(bonusEnabled && bonuses.length===0){
    document.getElementById('q-result').innerHTML = `<div class="warn">상여금 일정 반영을 체크했다면 최소 1건의 날짜·금액을 입력해주세요.</div>`;
    return;
  }

  const rateEnabled = document.getElementById('q-adv-rate').checked;
  const savingsRate = parseFloat(document.getElementById('q-savings-rate').value)||100;

  const start = startStr? new Date(startStr) : new Date();

  const sim = simulateQuitDate({ target, current, cycle, net, start, raiseEnabled, raiseDate, raisePct, bonusEnabled, bonuses, rateEnabled, savingsRate });

  if(sim.overCap){
    document.getElementById('q-result').innerHTML = `<div class="warn">현재 입력값 기준으로는 약 50년 안에 목표 금액을 달성하기 어려울 것으로 계산돼요. 목표 금액, 실수령액, 저축률을 다시 확인해보세요.</div>`;
    return;
  }

  const remaining = Math.max(0, target-current);
  const dday = Math.ceil((sim.quitDate-new Date())/(1000*60*60*24));
  const fmt = d => `${d.getFullYear()}년 ${d.getMonth()+1}월 ${d.getDate()}일`;

  const optionLines = [];
  optionLines.push(`<div class="rline"><span class="l">회차당 기본 실수령액 (${cycle==='month'?'월급':'주급'})</span><span class="v">${won(net)}</span></div>`);
  if(raiseEnabled) optionLines.push(`<div class="rline"><span class="l">인상 반영</span><span class="v">${fmt(raiseDate)} 이후 +${raisePct}%</span></div>`);
  if(bonusEnabled) optionLines.push(`<div class="rline"><span class="l">상여금 반영</span><span class="v">총 ${bonuses.length}건, ${won(bonuses.reduce((s,b)=>s+b.amount,0))}</span></div>`);
  if(rateEnabled) optionLines.push(`<div class="rline"><span class="l">저축률 적용</span><span class="v">${savingsRate}%</span></div>`);

  const assumptionNote = (raiseEnabled||bonusEnabled||rateEnabled)
    ? '선택한 고급 옵션이 반영된 계산 결과입니다. 그 외 세율·요율 변동은 반영되지 않습니다.'
    : '고급 옵션을 켜지 않아 매 회차 동일한 실수령액이 쌓인다고 가정한 단순 계산 결과입니다.';

  document.getElementById('q-result').innerHTML = `
  <div class="receipt" id="q-receipt">
    <div class="receipt-inner">
      <div class="stamp">D${dday>=0?'-':'+'}${Math.abs(dday)}</div>
      <div class="receipt-head">
        <div class="tag">Target Achievement Plan</div>
        <h3>퇴사 가능일 예상 결과</h3>
      </div>
      <div class="rline"><span class="l">목표 금액</span><span class="v">${won(target)}</span></div>
      <div class="rline"><span class="l">현재 저축액</span><span class="v">${won(current)}</span></div>
      <div class="rline"><span class="l">남은 금액</span><span class="v">${won(remaining)}</span></div>
      ${optionLines.join('')}
      <div class="rline"><span class="l">필요 급여 횟수</span><span class="v">${sim.periodCount}회</span></div>
      <div class="rline"><span class="l">최종 예상 저축액</span><span class="v">${won(sim.totalSaved)}</span></div>
      <div class="rline total"><span class="l">예상 퇴사 가능일</span><span class="v">${fmt(sim.quitDate)}</span></div>
      <div class="ok-note no-capture" style="margin-top:16px;">${assumptionNote}</div>
      <div class="receipt-actions no-capture">
        <button class="ghost" onclick="saveAsImage('q-receipt')">이미지로 저장</button>
        <button class="ghost" onclick="downloadIcs('${sim.quitDate.toISOString()}')">캘린더에 추가 (.ics)</button>
      </div>
    </div>
    <div class="receipt-cut"></div>
  </div>`;
}

function downloadIcs(isoDate){
  const d = new Date(isoDate);
  const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), day=String(d.getDate()).padStart(2,'0');
  const dateStr = `${y}${m}${day}`;
  const ics = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:${Date.now()}@salary-toolkit
DTSTAMP:${dateStr}T090000Z
DTSTART;VALUE=DATE:${dateStr}
SUMMARY:목표 저축액 달성 예상일 (퇴사 가능일)
DESCRIPTION:연봉 실수령액 계산기로 산출한 목표 저축액 달성 예상일입니다.
END:VEVENT
END:VCALENDAR`;
  const blob = new Blob([ics], {type:'text/calendar'});
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'quit-date.ics';
  link.click();
}

function saveAsImage(id){
  if(typeof html2canvas === 'undefined'){
    alert('이미지 저장 기능을 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
    return;
  }
  html2canvas(document.getElementById(id), {
    backgroundColor:null,
    scale:2,
    ignoreElements: el => el.classList && el.classList.contains('no-capture')
  }).then(canvas=>{
    const link = document.createElement('a');
    link.download = id+'.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
}

/* ================= FAQ ================= */
const FAQS = [
  ['연봉 실수령액은 어떻게 계산되나요?', '세전 연봉을 12로 나눈 월급여에서 국민연금(4.75%), 건강보험(3.595%), 장기요양보험(건강보험료의 13.14%), 고용보험(0.9%)과 근로소득세, 지방소득세를 공제해 계산합니다. 식대 등 비과세 항목과 부양가족 수에 따라 결과가 달라집니다.'],
  ['주휴수당은 아르바이트도 받을 수 있나요?', '네. 근로 형태와 관계없이 1주 소정근로시간 15시간 이상, 소정근로일 개근, 다음 주 근로 예정이라는 세 조건을 충족하면 아르바이트, 계약직 등 모든 근로자가 받을 수 있습니다.'],
  ['목표 저축액 계산에 세율 변동이나 인상률이 반영되나요?', '이 계산기는 계산을 단순화하기 위해 매 급여 회차마다 동일한 실수령액이 쌓인다고 가정합니다. 연봉 인상률 시뮬레이션은 연봉 실수령액 계산기에서 별도로 확인할 수 있지만, 퇴사 가능일 계산에는 자동 반영되지 않습니다.'],
  ['간이세액표 기준 소득세와 실제 원천징수액이 다른 이유는 무엇인가요?', '이 계산기는 국세청 근로소득 간이세액표를 만드는 계산식을 근사한 것으로, 회사마다 적용하는 세부 공제 항목(80%/100%/120% 선택 등)에 따라 실제 원천징수액과 차이가 있을 수 있습니다. 정확한 금액은 국세청 홈택스에서 확인하세요.'],
  ['2026년 최저임금은 얼마인가요?', '2026년 최저시급은 10,320원이며, 주 40시간 근무 기준 월 환산액(주휴수당 포함)은 2,156,880원입니다.'],
];
const faqList = document.getElementById('faq-list');
FAQS.forEach(([q,a])=>{
  const div = document.createElement('div');
  div.className = 'faq-item';
  div.innerHTML = `<button class="faq-q">${q}</button><div class="faq-a">${a}</div>`;
  div.querySelector('.faq-q').addEventListener('click', ()=>div.classList.toggle('open'));
  faqList.appendChild(div);
});
