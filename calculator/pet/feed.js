let feedSpecies = 'dog';
let stage = 'growth';

// 활동량/생애주기별 배수 (RER 대비 MER 배수, 수의영양학 참고치를 단순화)
const STAGE_MULTIPLIER = {
  growth: 2.5,
  diet: 1.0,
  low: 1.4,
  normal: 1.6,
  active: 1.8,
  senior: 1.4,
};

const STAGE_LABEL = {
  growth: '성장기',
  diet: '다이어트 중',
  low: '저활동·중성화',
  normal: '보통 활동',
  active: '활동량 많음',
  senior: '노령기',
};

function setSpeciesFeed(sp) {
  feedSpecies = sp;
  document.body.setAttribute('data-sp', sp);
  document.querySelectorAll('.toggle button').forEach(b => {
    b.classList.toggle('active', b.dataset.sp === sp);
  });
  document.getElementById('resultIcon').textContent = sp === 'dog' ? '🐶' : '🐱';
  hideResult();
}

function setStage(s) {
  stage = s;
  document.querySelectorAll('.segmented.grid button').forEach(b => {
    b.classList.toggle('active', b.dataset.stage === s);
  });
}

function hideResult() {
  document.getElementById('resultWrap').classList.remove('show');
  document.getElementById('resultDesc').style.display = 'none';
}

function calculateFeed() {
  const weight = parseFloat(document.getElementById('weight').value);
  const kcalPer100g = parseFloat(document.getElementById('kcal').value) || 350;

  if (!weight || weight <= 0) {
    alert('몸무게를 입력해주세요!');
    return;
  }

  // RER (안정 시 에너지 요구량) = 70 * 체중(kg)^0.75
  const rer = 70 * Math.pow(weight, 0.75);
  // MER (유지 에너지 요구량) = RER * 생애주기 배수
  const mer = rer * STAGE_MULTIPLIER[stage];
  // 하루 급여량(g) = MER / (kcal/100g) * 100
  const gramsPerDay = (mer / kcalPer100g) * 100;
  const gramsPerMeal = gramsPerDay / 2;

  document.getElementById('resultNumber').textContent = Math.round(gramsPerDay) + 'g';
  document.getElementById('resultSub').textContent =
    `${weight}kg · ${STAGE_LABEL[stage]} 기준`;

  const desc = document.getElementById('resultDesc');
  desc.style.display = 'block';
  desc.innerHTML =
    `하루 <b>${Math.round(mer)}kcal</b>가 필요해요.<br>` +
    `2끼로 나누면 한 끼당 약 <b>${Math.round(gramsPerMeal)}g</b>씩 급여하면 돼요.`;

  document.getElementById('resultWrap').classList.add('show');
}
