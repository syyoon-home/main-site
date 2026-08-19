/*
  SY Project — 공용 PWA 설치 유도 스크립트
  - beforeinstallprompt 이벤트를 가로채서 브라우저 기본 미니 배너 대신
    자체 디자인의 설치 유도 배너를 보여줍니다.
  - 각 도구 페이지에 이 스크립트 한 줄만 추가하면 동작합니다:
    <script src="/pwa/install-prompt.js" defer></script>
  - 배너를 닫으면(localStorage) 이후 방문에서는 다시 뜨지 않습니다.
*/
(function () {
  var STORAGE_KEY = "sy-pwa-dismissed";
  var deferredPrompt = null;

  function alreadyDismissed() {
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  function markDismissed() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch (e) {}
  }

  function isStandalone() {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    );
  }

  function showBanner() {
    if (isStandalone()) return; // 이미 앱으로 설치되어 실행 중이면 표시 안 함
    if (alreadyDismissed()) return;
    if (document.getElementById("sy-pwa-banner")) return;

    var el = document.createElement("div");
    el.id = "sy-pwa-banner";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", "앱 설치 안내");
    el.innerHTML =
      '<style>' +
      '#sy-pwa-banner{position:fixed;left:16px;right:16px;bottom:16px;max-width:420px;' +
      'margin:0 auto;background:#16212e;color:#f2f4f7;border-radius:12px;' +
      'padding:14px 14px 14px 16px;display:flex;align-items:center;gap:12px;' +
      'box-shadow:0 12px 32px rgba(0,0,0,.35);z-index:2147483000;' +
      'font-family:-apple-system,BlinkMacSystemFont,"Pretendard Variable",Pretendard,sans-serif;' +
      'animation:sy-pwa-in .32s ease;}' +
      '@keyframes sy-pwa-in{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}' +
      '#sy-pwa-banner .sy-pwa-icon{font-size:22px;flex-shrink:0;}' +
      '#sy-pwa-banner p{margin:0;font-size:13px;line-height:1.45;flex:1;}' +
      '#sy-pwa-banner .sy-pwa-actions{display:flex;flex-direction:column;gap:6px;flex-shrink:0;}' +
      '#sy-pwa-banner button{border:none;border-radius:7px;padding:7px 13px;' +
      'font-size:12.5px;font-weight:600;cursor:pointer;font-family:inherit;white-space:nowrap;}' +
      '#sy-pwa-install{background:#e8a33d;color:#16212e;}' +
      '#sy-pwa-install:hover{background:#f0b25a;}' +
      '#sy-pwa-dismiss{background:transparent;color:#8b98ac;padding:5px 8px;}' +
      '#sy-pwa-dismiss:hover{color:#c7cfda;}' +
      '@media (max-width:420px){#sy-pwa-banner{flex-wrap:wrap;} #sy-pwa-banner .sy-pwa-actions{flex-direction:row;width:100%;justify-content:flex-end;}}' +
      "</style>" +
      '<span class="sy-pwa-icon">📲</span>' +
      "<p>홈 화면에 추가하면 앱처럼 더 빠르게 열 수 있어요</p>" +
      '<div class="sy-pwa-actions">' +
      '<button id="sy-pwa-install">설치하기</button>' +
      '<button id="sy-pwa-dismiss">나중에</button>' +
      "</div>";

    document.body.appendChild(el);

    el.querySelector("#sy-pwa-install").addEventListener("click", async function () {
      el.remove();
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      try {
        await deferredPrompt.userChoice;
      } catch (e) {}
      deferredPrompt = null;
    });

    el.querySelector("#sy-pwa-dismiss").addEventListener("click", function () {
      markDismissed();
      el.remove();
    });
  }

  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferredPrompt = e;
    // 페이지 로드 직후 바로 뜨면 방해가 되므로 약간의 지연 후 표시
    setTimeout(showBanner, 1800);
  });

  window.addEventListener("appinstalled", function () {
    deferredPrompt = null;
    markDismissed();
    var el = document.getElementById("sy-pwa-banner");
    if (el) el.remove();
  });
})();
