// ============ 데이터 ============
const QUESTION_BANK = 
[
  { q: "세계에서 가장 긴 강은?", choices: ["나일강", "아마존강", "양쯔강", "미시시피강"], a: 0, cat: "지리", exp: "나일강은 아프리카를 가로질러 흐르며 길이 약 6,650km로 세계에서 가장 긴 강으로 꼽혀요." },
  { q: "조선을 건국한 왕은?", choices: ["세종대왕", "태조 이성계", "정조", "광해군"], a: 1, cat: "역사", exp: "이성계는 1392년 고려를 무너뜨리고 조선을 세워 태조가 되었어요." },
  { q: "인체에서 가장 큰 장기는?", choices: ["간", "폐", "피부", "심장"], a: 2, cat: "과학", exp: "피부는 성인 기준 약 1.5~2㎡ 면적을 덮고 있는 인체 최대의 장기예요." },
  { q: "'모나리자'를 그린 화가는?", choices: ["미켈란젤로", "라파엘로", "레오나르도 다빈치", "고흐"], a: 2, cat: "예술", exp: "레오나르도 다빈치가 16세기 초에 그린 초상화로, 현재 루브르 박물관에 소장되어 있어요." },
  { q: "올림픽이 처음 개최된 나라는?", choices: ["이탈리아", "그리스", "프랑스", "영국"], a: 1, cat: "스포츠", exp: "고대 올림픽은 기원전 776년 그리스 올림피아에서 시작되었어요." },
  { q: "지구에서 가장 가까운 행성은?", choices: ["금성", "화성", "목성", "수성"], a: 0, cat: "과학", exp: "평균 거리로 따지면 금성이 지구에 가장 가까운 행성이에요." },
  { q: "훈민정음을 창제한 왕은?", choices: ["태종", "세종대왕", "성종", "숙종"], a: 1, cat: "역사", exp: "세종대왕이 1443년 훈민정음을 창제하고 1446년 반포했어요." },
  { q: "피자의 발상지는?", choices: ["프랑스", "스페인", "이탈리아", "그리스"], a: 2, cat: "문화", exp: "오늘날의 피자는 이탈리아 나폴리에서 유래한 것으로 알려져 있어요." },
  { q: "물의 화학식은?", choices: ["CO2", "H2O", "O2", "NaCl"], a: 1, cat: "과학", exp: "물 분자는 수소 원자 2개와 산소 원자 1개로 이루어져 H2O로 표기해요." },
  { q: "세계에서 인구가 가장 많은 나라는?", choices: ["미국", "인도", "중국", "인도네시아"], a: 1, cat: "지리", exp: "2023년 이후 인도가 중국을 넘어 세계에서 인구가 가장 많은 나라가 되었어요." },
  { q: "월드컵은 몇 년마다 열리는가?", choices: ["2년", "3년", "4년", "5년"], a: 2, cat: "스포츠", exp: "FIFA 월드컵은 1930년 첫 대회 이후 4년 주기로 열리고 있어요." },
  { q: "빛의 속도로 가장 가까운 값은?", choices: ["초속 3만km", "초속 30만km", "초속 300만km", "초속 3km"], a: 1, cat: "과학", exp: "진공 속 빛의 속도는 초속 약 29만 9,792km로, 약 30만km로 흔히 표현해요." },
  { q: "'해리 포터' 시리즈의 작가는?", choices: ["J.K. 롤링", "스티븐 킹", "톨킨", "수잔 콜린스"], a: 0, cat: "문화", exp: "영국 작가 J.K. 롤링이 1997년부터 해리 포터 시리즈를 출간했어요." },
  { q: "임진왜란이 일어난 세기는?", choices: ["15세기", "16세기", "17세기", "18세기"], a: 1, cat: "역사", exp: "임진왜란은 1592년에 시작되어 16세기 말에 일어난 전쟁이에요." },
  { q: "다이아몬드는 어떤 원소로 이루어져 있는가?", choices: ["산소", "탄소", "규소", "질소"], a: 1, cat: "과학", exp: "다이아몬드는 탄소 원자가 강하게 결합한 결정 구조를 가지고 있어요." },
  { q: "세계에서 가장 넓은 대륙은?", choices: ["아프리카", "북아메리카", "아시아", "유럽"], a: 2, cat: "지리", exp: "아시아는 면적 약 4,400만㎢로 지구상에서 가장 넓은 대륙이에요." },
  { q: "피아노 건반은 총 몇 개인가?", choices: ["76개", "88개", "92개", "100개"], a: 1, cat: "문화", exp: "표준 피아노는 흰건반 52개, 검은건반 36개로 총 88개 건반을 가져요." },
  { q: "태양계에서 가장 큰 행성은?", choices: ["토성", "천왕성", "목성", "지구"], a: 2, cat: "과학", exp: "목성은 지구 지름의 약 11배에 달하는 태양계 최대의 행성이에요." },
  { q: "축구 한 팀의 경기 인원 수는?", choices: ["9명", "10명", "11명", "12명"], a: 2, cat: "스포츠", exp: "축구는 골키퍼를 포함해 한 팀당 11명이 경기를 뛰어요." },
  { q: "'대장금'의 주인공 이름은?", choices: ["장금이", "인현왕후", "선덕여왕", "덕만공주"], a: 0, cat: "문화", exp: "드라마 '대장금'은 조선시대 궁녀 '장금이'의 이야기를 다뤄요." },
  { q: "무지개의 색깔은 총 몇 가지인가?", choices: ["5가지", "6가지", "7가지", "8가지"], a: 2, cat: "상식", exp: "일반적으로 무지개는 빨주노초파남보 7가지 색으로 구분해요." },
  { q: "세계 최초의 인공위성 이름은?", choices: ["아폴로 11호", "스푸트니크 1호", "보이저 1호", "허블"], a: 1, cat: "과학", exp: "1957년 소련이 발사한 스푸트니크 1호가 세계 최초의 인공위성이에요." },
  { q: "석굴암이 있는 도시는?", choices: ["서울", "부산", "경주", "전주"], a: 2, cat: "역사", exp: "석굴암은 통일신라시대 경주 토함산에 세워진 대표적 불교 유산이에요." },
  { q: "커피의 원산지로 알려진 대륙은?", choices: ["남아메리카", "아프리카", "아시아", "유럽"], a: 1, cat: "문화", exp: "커피나무는 아프리카 에티오피아 고원에서 처음 발견된 것으로 알려져 있어요." },
  { q: "인간의 정상 체온은 대략 몇 도인가?", choices: ["35.5도", "36.5도", "37.5도", "38.5도"], a: 1, cat: "과학", exp: "사람의 평균 정상 체온은 약 36.5도 전후로 알려져 있어요." },
  { q: "세계에서 가장 높은 산은?", choices: ["K2", "에베레스트", "킬리만자로", "몽블랑"], a: 1, cat: "지리", exp: "에베레스트는 해발 8,849m로 지구에서 가장 높은 산이에요." },
  { q: "동계올림픽 종목이 아닌 것은?", choices: ["스키", "컬링", "수영", "봅슬레이"], a: 2, cat: "스포츠", exp: "수영은 하계올림픽 종목이고, 스키·컬링·봅슬레이는 동계올림픽 종목이에요." },
  { q: "한글날은 몇 월 며칠인가?", choices: ["10월 3일", "10월 9일", "9월 9일", "11월 9일"], a: 1, cat: "상식", exp: "한글날은 훈민정음 반포를 기념해 매년 10월 9일로 지정되어 있어요." },
  { q: "태양계에서 태양과 가장 가까운 행성은?", choices: ["금성", "지구", "수성", "화성"], a: 2, cat: "과학", exp: "수성은 태양에서 평균 약 5,790만km 떨어진, 태양계에서 가장 안쪽 행성이에요." },
  { q: "세계지도에서 가장 작은 나라는?", choices: ["모나코", "산마리노", "바티칸시국", "리히텐슈타인"], a: 2, cat: "지리", exp: "바티칸시국은 면적 약 0.44㎢로 세계에서 가장 작은 독립국이에요." },
  { q: "고려를 건국한 인물은?", choices: ["왕건", "궁예", "견훤", "김부식"], a: 0, cat: "역사", exp: "왕건은 918년 고려를 세우고 후삼국을 통일했어요." },
  { q: "인간의 뼈는 총 몇 개인가?", choices: ["약 106개", "약 156개", "약 206개", "약 256개"], a: 2, cat: "과학", exp: "성인의 몸에는 약 206개의 뼈가 있어요." },
  { q: "'별이 빛나는 밤'을 그린 화가는?", choices: ["고흐", "모네", "피카소", "달리"], a: 0, cat: "예술", exp: "빈센트 반 고흐가 1889년 생레미의 정신병원에서 그린 작품이에요." },
  { q: "농구 한 팀의 경기 인원 수는?", choices: ["4명", "5명", "6명", "7명"], a: 1, cat: "스포츠", exp: "농구는 코트 위에 한 팀당 5명씩 경기를 뛰어요." },
  { q: "김치의 주재료로 쓰이지 않는 것은?", choices: ["배추", "고춧가루", "마늘", "카레가루"], a: 3, cat: "문화", exp: "전통 김치는 배추, 고춧가루, 마늘, 젓갈 등으로 담그며 카레가루는 쓰지 않아요." },
  { q: "1년은 총 몇 주로 이루어지는가?", choices: ["50주", "52주", "54주", "48주"], a: 1, cat: "상식", exp: "1년 365일은 약 52주와 하루로 구성돼요." },
  { q: "세계에서 가장 깊은 바다는?", choices: ["마리아나 해구", "필리핀 해구", "쿠릴 해구", "자바 해구"], a: 0, cat: "지리", exp: "태평양의 마리아나 해구는 깊이 약 11,000m로 지구에서 가장 깊은 곳이에요." },
  { q: "6.25 전쟁이 발발한 연도는?", choices: ["1948년", "1950년", "1953년", "1945년"], a: 1, cat: "역사", exp: "6.25 전쟁은 1950년 6월 25일 북한의 남침으로 시작되었어요." },
  { q: "DNA의 이중나선 구조를 밝힌 과학자는?", choices: ["아인슈타인", "왓슨과 크릭", "다윈", "뉴턴"], a: 1, cat: "과학", exp: "제임스 왓슨과 프랜시스 크릭이 1953년 DNA의 이중나선 구조를 발표했어요." },
  { q: "베토벤의 대표작이 아닌 것은?", choices: ["운명 교향곡", "월광 소나타", "사계", "합창 교향곡"], a: 2, cat: "예술", exp: "'사계'는 비발디의 대표작이며, 나머지는 모두 베토벤의 작품이에요." },
  { q: "야구 한 이닝은 몇 아웃으로 끝나는가?", choices: ["2아웃", "3아웃", "4아웃", "5아웃"], a: 1, cat: "스포츠", exp: "야구는 각 팀이 3아웃을 당하면 이닝의 공수가 교대돼요." },
  { q: "설날에 먹는 대표 음식은?", choices: ["송편", "떡국", "팥죽", "삼계탕"], a: 1, cat: "문화", exp: "떡국은 한 해의 시작인 설날에 먹는 대표적인 절식이에요." },
  { q: "지구의 자전 주기는 약 몇 시간인가?", choices: ["12시간", "24시간", "36시간", "48시간"], a: 1, cat: "상식", exp: "지구는 약 24시간마다 한 바퀴씩 자전해요." },
  { q: "아프리카 대륙에서 가장 인구가 많은 나라는?", choices: ["이집트", "나이지리아", "남아프리카공화국", "케냐"], a: 1, cat: "지리", exp: "나이지리아는 아프리카에서 인구가 가장 많은 나라예요." },
  { q: "이순신 장군이 활약한 전쟁은?", choices: ["병자호란", "임진왜란", "정묘호란", "갑오전쟁"], a: 1, cat: "역사", exp: "이순신 장군은 임진왜란 당시 한산도 대첩 등에서 큰 활약을 했어요." },
  { q: "인간의 심장은 몇 개의 방으로 이루어져 있는가?", choices: ["2개", "3개", "4개", "5개"], a: 2, cat: "과학", exp: "심장은 좌심방, 우심방, 좌심실, 우심실 총 4개의 방으로 구성돼요." },
  { q: "'절규'를 그린 화가는?", choices: ["뭉크", "클림트", "샤갈", "마티스"], a: 0, cat: "예술", exp: "노르웨이 화가 에드바르 뭉크가 1893년에 그린 표현주의 대표작이에요." },
  { q: "테니스 경기에서 '러브(love)'는 몇 점을 의미하는가?", choices: ["0점", "15점", "30점", "40점"], a: 0, cat: "스포츠", exp: "테니스에서 '러브'는 점수가 없는 0점 상태를 가리키는 용어예요." },
  { q: "판소리에 속하지 않는 작품은?", choices: ["춘향가", "심청가", "흥보가", "아리랑"], a: 3, cat: "문화", exp: "아리랑은 민요이며, 나머지는 판소리 다섯마당에 속하는 작품이에요." },
  { q: "세계에서 가장 큰 섬은?", choices: ["마다가스카르", "그린란드", "보르네오", "뉴기니"], a: 1, cat: "지리", exp: "그린란드는 면적 약 216만㎢로 오스트레일리아를 제외하면 세계에서 가장 큰 섬이에요." },
  { q: "프랑스 혁명이 시작된 연도는?", choices: ["1776년", "1789년", "1804년", "1815년"], a: 1, cat: "역사", exp: "프랑스 혁명은 1789년 바스티유 감옥 습격을 계기로 시작되었어요." },
  { q: "식물이 광합성을 할 때 흡수하는 기체는?", choices: ["산소", "이산화탄소", "질소", "수소"], a: 1, cat: "과학", exp: "식물은 이산화탄소와 물, 빛을 이용해 광합성을 통해 포도당과 산소를 만들어요." },
  { q: "모차르트의 국적은?", choices: ["독일", "오스트리아", "이탈리아", "스위스"], a: 1, cat: "예술", exp: "볼프강 아마데우스 모차르트는 오스트리아 잘츠부르크 출신 작곡가예요." },
  { q: "배구 한 세트는 몇 점을 먼저 내면 승리하는가? (기본 세트)", choices: ["15점", "21점", "25점", "30점"], a: 2, cat: "스포츠", exp: "배구는 보통 25점을 먼저 내고 2점 차 이상이어야 세트 승리를 해요." },
  { q: "추석에 먹는 대표 음식은?", choices: ["송편", "떡국", "팥죽", "화전"], a: 0, cat: "문화", exp: "송편은 추석에 빚어 먹는 대표적인 명절 떡이에요." },
  { q: "지구 표면에서 바다가 차지하는 비율은 약 몇 퍼센트인가?", choices: ["약 50%", "약 60%", "약 70%", "약 80%"], a: 2, cat: "상식", exp: "지구 표면의 약 70%는 바다로 덮여 있어요." },

  { q: "세계에서 가장 긴 만리장성이 있는 나라는?", choices: ["일본", "중국", "몽골", "베트남"], a: 1, cat: "지리", exp: "만리장성은 중국 북방 이민족의 침입을 막기 위해 축조된 성벽이에요." },
  { q: "사하라 사막이 위치한 대륙은?", choices: ["아시아", "아프리카", "호주", "남아메리카"], a: 1, cat: "지리", exp: "사하라 사막은 아프리카 북부에 위치한 세계 최대 규모의 사막이에요." },
  { q: "세계에서 가장 긴 해안선을 가진 나라는?", choices: ["캐나다", "러시아", "인도네시아", "호주"], a: 0, cat: "지리", exp: "캐나다는 섬과 만이 많아 세계에서 가장 긴 해안선을 가지고 있어요." },
  { q: "적도가 지나가지 않는 나라는?", choices: ["케냐", "인도네시아", "브라질", "한국"], a: 3, cat: "지리", exp: "한국은 북위 33~43도에 위치해 적도와 거리가 멀어요." },
  { q: "세계에서 가장 큰 사막은?", choices: ["사하라 사막", "고비 사막", "남극 사막", "아라비아 사막"], a: 2, cat: "지리", exp: "강수량 기준 사막으로 분류하면 남극이 세계에서 가장 큰 사막이에요." },

  { q: "동학농민운동이 일어난 연도는?", choices: ["1884년", "1894년", "1904년", "1910년"], a: 1, cat: "역사", exp: "동학농민운동은 1894년 전봉준을 중심으로 일어난 농민 봉기예요." },
  { q: "삼국시대에 속하지 않는 나라는?", choices: ["고구려", "백제", "신라", "발해"], a: 3, cat: "역사", exp: "발해는 남북국시대에 속하며, 삼국은 고구려·백제·신라예요." },
  { q: "미국 독립선언서가 채택된 연도는?", choices: ["1776년", "1789년", "1801년", "1812년"], a: 0, cat: "역사", exp: "미국은 1776년 7월 4일 독립선언서를 채택했어요." },
  { q: "고구려의 전성기를 이끈 왕은?", choices: ["광개토대왕", "근초고왕", "진흥왕", "문무왕"], a: 0, cat: "역사", exp: "광개토대왕은 고구려의 영토를 크게 확장하며 전성기를 이끌었어요." },
  { q: "제2차 세계대전이 끝난 연도는?", choices: ["1943년", "1945년", "1947년", "1950년"], a: 1, cat: "역사", exp: "제2차 세계대전은 1945년 일본의 항복으로 종전되었어요." },
  { q: "갑오개혁이 일어난 시기는?", choices: ["조선 초기", "조선 후기(19세기 말)", "고려시대", "일제강점기"], a: 1, cat: "역사", exp: "갑오개혁은 1894년 조선 후기에 추진된 근대적 개혁이에요." },

  { q: "인간의 유전 정보를 담고 있는 물질은?", choices: ["단백질", "DNA", "지방", "탄수화물"], a: 1, cat: "과학", exp: "DNA는 유전 정보를 담고 있는 핵산 물질이에요." },
  { q: "원소기호 'O'가 나타내는 원소는?", choices: ["금", "산소", "철", "오스뮴"], a: 1, cat: "과학", exp: "O는 산소(Oxygen)를 나타내는 원소기호예요." },
  { q: "지진의 강도를 나타내는 단위는?", choices: ["데시벨", "리히터 규모", "칼로리", "헤르츠"], a: 1, cat: "과학", exp: "지진의 규모는 흔히 리히터 규모로 측정해요." },
  { q: "혈액을 온몸으로 순환시키는 기관은?", choices: ["폐", "간", "심장", "신장"], a: 2, cat: "과학", exp: "심장은 펌프처럼 수축·이완하며 혈액을 온몸으로 보내요." },
  { q: "1기압일 때 물의 끓는점은?", choices: ["0도", "50도", "100도", "212도"], a: 2, cat: "과학", exp: "표준 대기압에서 물은 섭씨 100도에서 끓어요." },
  { q: "곤충의 다리는 총 몇 개인가?", choices: ["4개", "6개", "8개", "10개"], a: 1, cat: "과학", exp: "곤충은 몸이 머리·가슴·배로 나뉘고 다리는 총 6개예요." },

  { q: "'게르니카'를 그린 화가는?", choices: ["피카소", "달리", "미로", "고야"], a: 0, cat: "예술", exp: "파블로 피카소가 1937년 스페인 내전의 참상을 그린 작품이에요." },
  { q: "'백조의 호수'를 작곡한 작곡가는?", choices: ["차이콥스키", "쇼팽", "바흐", "슈베르트"], a: 0, cat: "예술", exp: "표트르 차이콥스키가 작곡한 대표적인 러시아 발레 음악이에요." },
  { q: "한국의 대표적인 전통 음악 장르는?", choices: ["오페라", "국악", "재즈", "발레"], a: 1, cat: "예술", exp: "국악은 한국 고유의 전통 음악을 아우르는 명칭이에요." },
  { q: "'다비드상'을 조각한 예술가는?", choices: ["미켈란젤로", "로댕", "다빈치", "베르니니"], a: 0, cat: "예술", exp: "미켈란젤로가 16세기 초 피렌체에서 제작한 대리석 조각상이에요." },
  { q: "인상주의 화풍을 대표하는 화가는?", choices: ["모네", "렘브란트", "베르메르", "카라바조"], a: 0, cat: "예술", exp: "클로드 모네는 빛의 변화를 포착한 인상주의를 대표하는 화가예요." },
  { q: "판소리에서 소리꾼을 돕는 북 치는 사람을 부르는 말은?", choices: ["고수", "재비", "명창", "광대"], a: 0, cat: "예술", exp: "고수는 판소리 공연에서 북장단을 맞추는 사람을 가리켜요." },

  { q: "탁구공의 표준 무게에 가장 가까운 것은?", choices: ["약 2.7g", "약 5g", "약 10g", "약 20g"], a: 0, cat: "스포츠", exp: "국제 규격 탁구공의 무게는 약 2.7g이에요." },
  { q: "골프에서 규정 타수보다 1타 적게 홀인하는 것을 뜻하는 말은?", choices: ["버디", "이글", "보기", "파"], a: 0, cat: "스포츠", exp: "버디는 기준 타수(파)보다 한 타 적게 치는 것을 말해요." },
  { q: "태권도가 정식 종목으로 채택된 올림픽은?", choices: ["1988 서울", "2000 시드니", "1996 애틀랜타", "2004 아테네"], a: 1, cat: "스포츠", exp: "태권도는 2000년 시드니 올림픽부터 정식 종목으로 채택되었어요." },
  { q: "마라톤의 공식 거리는?", choices: ["약 32km", "약 42.195km", "약 50km", "약 21km"], a: 1, cat: "스포츠", exp: "마라톤의 공식 거리는 42.195km예요." },
  { q: "야구에서 투수가 던지는 공간을 부르는 말은?", choices: ["더그아웃", "마운드", "베이스", "홈플레이트"], a: 1, cat: "스포츠", exp: "마운드는 투수가 공을 던지는 볼록한 흙 언덕을 말해요." },
  { q: "손흥민 선수의 주 포지션은?", choices: ["골키퍼", "수비수", "공격수", "심판"], a: 2, cat: "스포츠", exp: "손흥민은 주로 공격수(윙어/스트라이커)로 활약하는 축구선수예요." },

  { q: "비빔밥에 일반적으로 들어가지 않는 재료는?", choices: ["나물", "고추장", "계란", "치즈"], a: 3, cat: "문화", exp: "전통 비빔밥은 나물, 고추장, 계란 등을 넣으며 치즈는 쓰지 않아요." },
  { q: "일본의 전통 의상은?", choices: ["기모노", "한복", "치파오", "아오자이"], a: 0, cat: "문화", exp: "기모노는 일본의 전통 의상이에요." },
  { q: "대한민국의 국보 1호는?", choices: ["숭례문", "경복궁", "석굴암", "첨성대"], a: 0, cat: "문화", exp: "서울 숭례문(남대문)은 대한민국 국보 제1호로 지정되어 있어요." },
  { q: "정월대보름에 먹는 음식이 아닌 것은?", choices: ["오곡밥", "부럼", "귀밝이술", "삼계탕"], a: 3, cat: "문화", exp: "삼계탕은 주로 삼복더위에 먹는 보양식이에요." },
  { q: "인도의 대표적인 전통 의상은?", choices: ["사리", "기모노", "한복", "터번만"], a: 0, cat: "문화", exp: "사리는 인도 여성들이 즐겨 입는 전통 의상이에요." },

  { q: "1년 중 낮이 가장 긴 날을 부르는 말은?", choices: ["동지", "하지", "춘분", "추분"], a: 1, cat: "상식", exp: "하지는 북반구 기준 낮이 가장 긴 날이에요." },

  { q: "'유레카'를 외친 것으로 알려진 고대 과학자는?", choices: ["피타고라스", "아르키메데스", "플라톤", "히포크라테스"], a: 1, cat: "상식", exp: "아르키메데스가 부력의 원리를 깨닫고 '유레카'를 외쳤다는 일화가 전해져요." },
  { q: "'노벨상'의 유래가 된 인물의 직업은?", choices: ["의사", "다이너마이트 발명가", "군인", "화가"], a: 1, cat: "상식", exp: "알프레드 노벨은 다이너마이트를 발명한 화학자이자 사업가였어요." },
  { q: "체스에서 가장 강력한 기물은?", choices: ["나이트", "비숍", "퀸", "룩"], a: 2, cat: "상식", exp: "퀸은 상하좌우와 대각선 모두 움직일 수 있어 체스에서 가장 강력한 기물이에요." },
  { q: "세계 최초의 근대 올림픽이 열린 도시는?", choices: ["파리", "런던", "아테네", "로마"], a: 2, cat: "상식", exp: "1896년 제1회 근대 올림픽은 그리스 아테네에서 열렸어요." },
  { q: "'백만장자'를 뜻하는 영단어 'millionaire'의 어원이 된 숫자 단위는?", choices: ["백", "천", "백만", "억"], a: 2, cat: "상식", exp: "millionaire는 100만(million)을 가진 사람이라는 뜻에서 나온 말이에요." },
  { q: "우리나라 최초의 인공위성 이름은?", choices: ["나로호", "우리별 1호", "천리안", "아리랑 1호"], a: 1, cat: "상식", exp: "우리별 1호는 1992년 발사된 대한민국 최초의 인공위성이에요." },
  { q: "세계 3대 영화제에 속하지 않는 것은?", choices: ["칸 영화제", "베니스 영화제", "베를린 영화제", "선댄스 영화제"], a: 3, cat: "상식", exp: "세계 3대 영화제는 칸, 베니스, 베를린 영화제를 가리켜요." },
  { q: "'88 서울올림픽'이 열린 연도는?", choices: ["1984년", "1988년", "1992년", "1996년"], a: 1, cat: "상식", exp: "서울올림픽은 1988년에 개최되었어요." },
  { q: "세계에서 가장 오래된 금속 화폐를 사용한 문명은?", choices: ["이집트", "리디아", "로마", "중국"], a: 1, cat: "상식", exp: "기원전 7세기경 소아시아의 리디아 왕국이 최초의 금속 주화를 만든 것으로 알려져 있어요." },
];

const GRADES = [
  { min: 90, title: "상식왕", desc: "모르는 게 없으시네요!" },
  { min: 70, title: "척척박사", desc: "탄탄한 상식을 갖추셨어요." },
  { min: 40, title: "성장 중", desc: "조금만 더 채워봐요." },
  { min: 0, title: "새싹", desc: "다시 도전하면 늘어요!" },
];

const CATEGORY_COLORS = {
  지리: "#4FA9E0",
  역사: "#D8544A",
  과학: "#3FA66B",
  예술: "#B678D8",
  스포츠: "#E38A3C",
  문화: "#E0C64F",
  상식: "#5FC7C0",
};
const DEFAULT_CAT_COLOR = "#E3B23C";

const ROUND_SIZE = 10;
const CIRCLED = ["①", "②", "③", "④"];

// ============ 상태 ============
let round = [];
let idx = 0;
let score = 0;
let picked = null;
let revealed = false;

// ============ DOM 참조 ============
const screens = {
  start: document.getElementById("screen-start"),
  playing: document.getElementById("screen-playing"),
  end: document.getElementById("screen-end"),
};

const el = {
  roundSizeLabel: document.getElementById("round-size-label"),
  btnStart: document.getElementById("btn-start"),
  catBadge: document.getElementById("cat-badge"),
  qCounter: document.getElementById("q-counter"),
  progressFill: document.getElementById("progress-fill"),
  questionText: document.getElementById("question-text"),
  choices: document.getElementById("choices"),
  explanationBox: document.getElementById("explanation-box"),
  explanationVerdict: document.getElementById("explanation-verdict"),
  explanationText: document.getElementById("explanation-text"),
  btnNext: document.getElementById("btn-next"),
  scoreValue: document.getElementById("score-value"),
  scoreTotal: document.getElementById("score-total"),
  gradeTitle: document.getElementById("grade-title"),
  gradeDesc: document.getElementById("grade-desc"),
  gradeRows: document.getElementById("grade-rows"),
  btnRestart: document.getElementById("btn-restart"),
};

el.roundSizeLabel.textContent = ROUND_SIZE;

// ============ 유틸 ============
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function showScreen(name) {
  Object.entries(screens).forEach(([key, node]) => {
    node.hidden = key !== name;
  });
}

// ============ 게임 로직 ============
function startGame() {
  round = shuffle(QUESTION_BANK)
    .slice(0, ROUND_SIZE)
    .map((item) => {
      const order = shuffle(item.choices.map((c, i) => i));
      return {
        ...item,
        choices: order.map((i) => item.choices[i]),
        a: order.indexOf(item.a),
      };
    });
  idx = 0;
  score = 0;
  picked = null;
  revealed = false;
  showScreen("playing");
  renderQuestion();
}

function renderQuestion() {
  const current = round[idx];

  // badge
  const color = CATEGORY_COLORS[current.cat] ?? DEFAULT_CAT_COLOR;
  el.catBadge.textContent = current.cat;
  el.catBadge.style.background = `${color}22`;
  el.catBadge.style.color = color;
  el.catBadge.style.borderColor = `${color}66`;

  el.qCounter.textContent = `Q ${idx + 1} / ${round.length}`;
  el.progressFill.style.width = `${(idx / round.length) * 100}%`;

  el.questionText.textContent = current.q;

  // choices
  el.choices.innerHTML = "";
  current.choices.forEach((choiceText, i) => {
    const btn = document.createElement("button");
    btn.className = "choice";
    btn.disabled = false;
    btn.innerHTML = `<span class="num">${CIRCLED[i]}</span><span>${choiceText}</span>`;
    btn.addEventListener("click", () => choose(i));
    el.choices.appendChild(btn);
  });

  el.explanationBox.hidden = true;
  el.btnNext.hidden = true;
}

function choose(i) {
  if (revealed) return;
  picked = i;
  revealed = true;
  const current = round[idx];
  if (i === current.a) score += 1;

  // update progress bar to reflect completed question
  el.progressFill.style.width = `${((idx + 1) / round.length) * 100}%`;

  // color the choice buttons
  const buttons = el.choices.querySelectorAll(".choice");
  buttons.forEach((btn, i2) => {
    btn.disabled = true;
    if (i2 === current.a) {
      btn.classList.add("correct");
    } else if (i2 === picked) {
      btn.classList.add("wrong");
    }
  });

  // explanation
  const isCorrect = picked === current.a;
  el.explanationVerdict.textContent = isCorrect ? "정답!" : "오답";
  el.explanationVerdict.className = `verdict ${isCorrect ? "correct" : "wrong"}`;
  el.explanationText.textContent = current.exp;
  el.explanationBox.hidden = false;

  el.btnNext.textContent = idx + 1 >= round.length ? "결과 보기" : "다음 문제";
  el.btnNext.hidden = false;
}

function nextQuestion() {
  if (idx + 1 >= round.length) {
    showEnd();
  } else {
    idx += 1;
    picked = null;
    revealed = false;
    renderQuestion();
  }
}

function showEnd() {
  const percent = round.length ? Math.round((score / round.length) * 100) : 0;
  const grade = GRADES.find((g) => percent >= g.min) ?? GRADES[GRADES.length - 1];

  el.scoreValue.textContent = score;
  el.scoreTotal.textContent = `/${round.length}`;
  el.gradeTitle.textContent = grade.title;
  el.gradeDesc.textContent = grade.desc;

  el.gradeRows.innerHTML = "";
  GRADES.forEach((g, i) => {
    const upper = i === 0 ? 100 : GRADES[i - 1].min - 1;
    const isCurrent = grade.title === g.title;
    const row = document.createElement("div");
    row.className = `grade-row ${isCurrent ? "current" : ""}`;
    row.innerHTML = `<span class="g-name">${g.title}</span><span class="g-range">${g.min}~${upper}점</span>`;
    el.gradeRows.appendChild(row);
  });

  showScreen("end");
}

// ============ 이벤트 바인딩 ============
el.btnStart.addEventListener("click", startGame);
el.btnNext.addEventListener("click", nextQuestion);
el.btnRestart.addEventListener("click", startGame);
