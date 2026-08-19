let species = 'dog';
let size = 'small';

function setSpecies(sp) {
  species = sp;
  document.body.setAttribute('data-sp', sp);
  document.querySelectorAll('.toggle button').forEach(b => {
    b.classList.toggle('active', b.dataset.sp === sp);
  });
  document.getElementById('sizeField').classList.toggle('hidden', sp === 'cat');
  document.getElementById('resultIcon').textContent = sp === 'dog' ? '🐶' : '🐱';
  hideResult();
}

function setSize(s) {
  size = s;
  document.querySelectorAll('.segmented button').forEach(b => {
    b.classList.toggle('active', b.dataset.size === s);
  });
}

function hideResult() {
  document.getElementById('resultWrap').classList.remove('show');
  document.getElementById('resultDesc').style.display = 'none';
}

function calculate() {
  const years = parseFloat(document.getElementById('years').value) || 0;
  const months = parseFloat(document.getElementById('months').value) || 0;
  const age = years + months / 12;

  if (age <= 0) {
    alert('나이를 입력해주세요!');
    return;
  }

  let humanAge;
  if (species === 'cat') {
    humanAge = catAge(age);
  } else {
    humanAge = dogAge(age, size);
  }

  const rounded = Math.round(humanAge);
  document.getElementById('resultNumber').textContent = rounded + '세';
  document.getElementById('resultSub').textContent =
    `${years}년 ${months}개월 · ${species === 'dog' ? sizeLabel(size) : '고양이'}`;

  const desc = document.getElementById('resultDesc');
  desc.style.display = 'block';
  desc.innerHTML = buildDesc(rounded);

  document.getElementById('resultWrap').classList.add('show');
}

function catAge(age) {
  if (age <= 1) return age * 15;
  if (age <= 2) return 15 + (age - 1) * 9;
  return 24 + (age - 2) * 4;
}

function dogAge(age, size) {
  const rate = { small: 4, medium: 5, large: 6 }[size];
  if (age <= 1) return age * 15;
  if (age <= 2) return 15 + (age - 1) * 9;
  return 24 + (age - 2) * rate;
}

function sizeLabel(s) {
  return { small: '소형견', medium: '중형견', large: '대형견' }[s];
}

function buildDesc(humanAge) {
  let stage, tip;
  if (humanAge < 15) {
    stage = '아기'; tip = '한창 배우고 자라나는 시기예요. 기초 훈련과 사회화에 좋은 때예요.';
  } else if (humanAge < 30) {
    stage = '청년'; tip = '에너지가 넘치는 시기! 활발한 산책과 놀이가 잘 맞아요.';
  } else if (humanAge < 50) {
    stage = '중년'; tip = '정기 건강검진을 챙길 때예요. 체중 관리에도 신경 써주세요.';
  } else {
    stage = '시니어'; tip = '관절과 장기 건강을 더 세심하게 살펴줄 시기예요.';
  }
  return `사람 나이로 <b>${humanAge}세</b>, <b>${stage}기</b>에 해당해요.<br>${tip}`;
}
