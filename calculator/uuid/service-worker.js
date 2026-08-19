/*
  UUID / 랜덤 문자열 생성기 — Service Worker
  - Network First 전략: 최신 콘텐츠를 우선 시도하고, 실패(오프라인)하면 캐시로 대체합니다.
  - 광고 스크립트(Google AdSense 등)는 절대 가로채거나 캐싱하지 않고 네트워크로 그대로 통과시킵니다.
*/
const CACHE_NAME = "sy-uuid-v1";
const PRECACHE_URLS = ["./", "./index.html", "./style.css", "./script.js"];

// 캐싱/가로채기에서 제외할 광고·분석 관련 호스트
const EXCLUDED_HOSTS = [
  "googlesyndication.com",
  "doubleclick.net",
  "googleadservices.com",
  "google-analytics.com",
  "googletagmanager.com",
  "adtrafficquality.google",
  "adservice.google.com"
];

function isExcluded(url) {
  return EXCLUDED_HOSTS.some((host) => url.hostname.includes(host));
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 광고 스크립트/분석 스크립트: 캐시 로직을 아예 타지 않고 브라우저 기본 동작(네트워크 직행)에 맡김
  if (isExcluded(url)) {
    return;
  }

  if (req.method !== "GET") return;

  // Network First: 네트워크 우선 시도 → 성공하면 캐시 갱신 → 실패하면 캐시에서 응답
  event.respondWith(
    fetch(req)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        return response;
      })
      .catch(() => caches.match(req).then((cached) => cached || caches.match("./index.html")))
  );
});
