// =========================================================
// 나이 계산기 로직 (만나이 / 한국나이(세는나이) / 띠 / 별자리)
// =========================================================

const ZODIAC_ANIMALS = [
  { name: '쥐띠', emoji: '🐭' },
  { name: '소띠', emoji: '🐮' },
  { name: '호랑이띠', emoji: '🐯' },
  { name: '토끼띠', emoji: '🐰' },
  { name: '용띠', emoji: '🐲' },
  { name: '뱀띠', emoji: '🐍' },
  { name: '말띠', emoji: '🐴' },
  { name: '양띠', emoji: '🐐' },
  { name: '원숭이띠', emoji: '🐒' },
  { name: '닭띠', emoji: '🐔' },
  { name: '개띠', emoji: '🐶' },
  { name: '돼지띠', emoji: '🐷' },
];
// 기준: 2020년 = 쥐띠 (양력 연도 기준의 단순 계산)
const ZODIAC_REFERENCE_YEAR = 2020;

const STAR_SIGNS = [
  { name: '염소자리', emoji: '♑', from: [12, 22], to: [1, 19] },
  { name: '물병자리', emoji: '♒', from: [1, 20], to: [2, 18] },
  { name: '물고기자리', emoji: '♓', from: [2, 19], to: [3, 20] },
  { name: '양자리', emoji: '♈', from: [3, 21], to: [4, 19] },
  { name: '황소자리', emoji: '♉', from: [4, 20], to: [5, 20] },
  { name: '쌍둥이자리', emoji: '♊', from: [5, 21], to: [6, 21] },
  { name: '게자리', emoji: '♋', from: [6, 22], to: [7, 22] },
  { name: '사자자리', emoji: '♌', from: [7, 23], to: [8, 22] },
  { name: '처녀자리', emoji: '♍', from: [8, 23], to: [9, 22] },
  { name: '천칭자리', emoji: '♎', from: [9, 23], to: [10, 23] },
  { name: '전갈자리', emoji: '♏', from: [10, 24], to: [11, 22] },
  { name: '사수자리', emoji: '♐', from: [11, 23], to: [12, 21] },
];

// ---------------------------------------------------------
// 년/월/일 분리 입력 유틸 (년/월/일 모두 키보드로 직접 입력 가능한 number input)
// ---------------------------------------------------------
// 월/일 칸에 두 자리 넘는 값을 못 넣도록 입력 중 즉시 보정
document.querySelectorAll('.date-part-m input, .date-part-d input').forEach((input) => {
  const max = parseInt(input.max, 10);
  input.addEventListener('input', () => {
    if (input.value.length > 2) input.value = input.value.slice(0, 2);
    if (parseInt(input.value, 10) > max) input.value = String(max);
  });
});

// prefix 예: 'single', 'a', 'b' -> #birth-single-y 등에서 값을 읽어 Date 생성
// 값이 비었거나 실제 존재하지 않는 날짜(예: 2월 30일)면 null 반환
function getDateFromFields(prefix) {
  const yEl = document.getElementById(`birth-${prefix}-y`);
  const mEl = document.getElementById(`birth-${prefix}-m`);
  const dEl = document.getElementById(`birth-${prefix}-d`);

  const y = parseInt(yEl.value, 10);
  const m = parseInt(mEl.value, 10);
  const d = parseInt(dEl.value, 10);

  if (!y || !m || !d) return null;
  if (y < 1900 || y > 2100) return null;

  const date = new Date(y, m - 1, d);
  const isValid = date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
  if (!isValid) return null;

  // 미래 날짜는 계산 대상으로 인정하지 않음
  if (date > new Date()) return null;

  return date;
}

function calcManAge(birth, today) {
  let age = today.getFullYear() - birth.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return Math.max(age, 0);
}

function calcKoreanAge(birthYear, todayYear) {
  return Math.max(todayYear - birthYear + 1, 1);
}

function getZodiacAnimal(birthYear) {
  const idx = (((birthYear - ZODIAC_REFERENCE_YEAR) % 12) + 12) % 12;
  return ZODIAC_ANIMALS[idx];
}

function getStarSign(month, day) {
  for (const sign of STAR_SIGNS) {
    const [fm, fd] = sign.from;
    const [tm, td] = sign.to;
    if (fm === tm) {
      if (month === fm && day >= fd && day <= td) return sign;
    } else if (fm > tm) {
      // 연말/연초 걸치는 경우 (염소자리)
      if ((month === fm && day >= fd) || (month === tm && day <= td)) return sign;
    } else {
      if ((month === fm && day >= fd) || (month === tm && day <= td) || (month > fm && month < tm)) {
        return sign;
      }
    }
  }
  return STAR_SIGNS[0];
}

function computeProfile(birth, today) {
  const man = calcManAge(birth, today);
  const korean = calcKoreanAge(birth.getFullYear(), today.getFullYear());
  const animal = getZodiacAnimal(birth.getFullYear());
  const star = getStarSign(birth.getMonth() + 1, birth.getDate());
  return { man, korean, animal, star };
}

function fmtAnimal(a) { return `${a.emoji} ${a.name}`; }
function fmtStar(s) { return `${s.emoji} ${s.name}`; }

// ---------------------------------------------------------
// 탭 전환
// ---------------------------------------------------------
const tabButtons = document.querySelectorAll('.tab');
const panels = {
  'tab-btn-single': document.getElementById('panel-single'),
  'tab-btn-diff': document.getElementById('panel-diff'),
};

tabButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    tabButtons.forEach((b) => {
      b.classList.remove('is-active');
      b.setAttribute('aria-selected', 'false');
    });
    Object.values(panels).forEach((p) => { p.hidden = true; p.classList.remove('is-active'); });

    btn.classList.add('is-active');
    btn.setAttribute('aria-selected', 'true');
    const panel = panels[btn.id];
    panel.hidden = false;
    panel.classList.add('is-active');
  });
});

// ---------------------------------------------------------
// 탭 1: 단일 나이 계산
// ---------------------------------------------------------
const formSingle = document.getElementById('form-single');
const resultSingle = document.getElementById('result-single');

formSingle.addEventListener('submit', (e) => {
  e.preventDefault();
  const errorEl = document.getElementById('error-single');
  const birth = getDateFromFields('single');

  if (!birth) {
    errorEl.hidden = false;
    resultSingle.hidden = true;
    return;
  }
  errorEl.hidden = true;

  const today = new Date();
  const profile = computeProfile(birth, today);

  document.getElementById('stamp-num-single').textContent = profile.man;
  document.getElementById('out-man-single').textContent = `${profile.man}세`;
  document.getElementById('out-korean-single').textContent = `${profile.korean}세`;
  document.getElementById('out-zodiac-animal-single').textContent = fmtAnimal(profile.animal);
  document.getElementById('out-zodiac-star-single').textContent = fmtStar(profile.star);

  resultSingle.hidden = false;
  restartStampAnimation(document.getElementById('stamp-single'));
});

// ---------------------------------------------------------
// 탭 2: 나이차이 계산
// ---------------------------------------------------------
const formDiff = document.getElementById('form-diff');
const resultDiff = document.getElementById('result-diff');

formDiff.addEventListener('submit', (e) => {
  e.preventDefault();
  const errorA = document.getElementById('error-a');
  const errorB = document.getElementById('error-b');
  const birthA = getDateFromFields('a');
  const birthB = getDateFromFields('b');

  errorA.hidden = !!birthA;
  errorB.hidden = !!birthB;
  if (!birthA || !birthB) {
    resultDiff.hidden = true;
    return;
  }

  const today = new Date();
  const profileA = computeProfile(birthA, today);
  const profileB = computeProfile(birthB, today);

  document.getElementById('a-man').textContent = `${profileA.man}세`;
  document.getElementById('a-korean').textContent = `${profileA.korean}세`;
  document.getElementById('a-animal').textContent = fmtAnimal(profileA.animal);
  document.getElementById('a-star').textContent = fmtStar(profileA.star);

  document.getElementById('b-man').textContent = `${profileB.man}세`;
  document.getElementById('b-korean').textContent = `${profileB.korean}세`;
  document.getElementById('b-animal').textContent = fmtAnimal(profileB.animal);
  document.getElementById('b-star').textContent = fmtStar(profileB.star);

  const manDiff = Math.abs(profileA.man - profileB.man);
  const yearDiff = Math.abs(birthA.getFullYear() - birthB.getFullYear());

  document.getElementById('stamp-num-diff').textContent = manDiff;

  const footnote = document.getElementById('diff-footnote');
  if (manDiff === yearDiff) {
    footnote.textContent = `만 나이 기준과 출생연도 기준 모두 ${yearDiff}살 차이예요.`;
  } else {
    footnote.textContent = `만 나이 기준으로는 ${manDiff}살 차이, 출생연도(한국 나이) 기준으로는 ${yearDiff}살 차이예요.`;
  }

  resultDiff.hidden = false;
  restartStampAnimation(document.getElementById('stamp-diff'));
});

function restartStampAnimation(el) {
  el.style.animation = 'none';
  // reflow를 강제로 발생시켜 애니메이션을 재시작
  void el.offsetWidth;
  el.style.animation = '';
}
