// jptrip.syproject.co.kr — 공통 스크립트
(function () {
  "use strict";

  /* ---------- 다크모드 ---------- */
  var THEME_KEY = "jptrip_theme";
  var themeBtn = document.getElementById("themeToggle");
  function applyTheme(t) {
    document.body.classList.toggle("light", t === "light");
    if (themeBtn) themeBtn.textContent = t === "light" ? "☀️" : "🌙";
  }
  var savedTheme = null;
  try { savedTheme = localStorage.getItem(THEME_KEY); } catch (e) {}
  applyTheme(savedTheme || "dark");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = document.body.classList.contains("light") ? "dark" : "light";
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
    });
  }

  /* ---------- 즐겨찾기 ---------- */
  var FAV_KEY = "jptrip_favorites";
  var storageOK = (function () {
    try {
      localStorage.setItem("__jptrip_test__", "1");
      localStorage.removeItem("__jptrip_test__");
      return true;
    } catch (e) {
      return false;
    }
  })();
  var memoryFavs = [];
  if (!storageOK) {
    console.warn("jptrip: localStorage를 사용할 수 없어 즐겨찾기가 이 페이지를 벗어나면 초기화됩니다. (file://로 열었다면 실제 서버/도메인에 올려서 테스트해 주세요)");
  }
  function getFavs() {
    if (!storageOK) return memoryFavs;
    try { return JSON.parse(localStorage.getItem(FAV_KEY) || "[]"); } catch (e) { return []; }
  }
  function setFavs(list) {
    if (!storageOK) { memoryFavs = list; return; }
    try { localStorage.setItem(FAV_KEY, JSON.stringify(list)); } catch (e) {}
  }
  function isFav(uid) { return getFavs().indexOf(uid) !== -1; }
  function toggleFav(uid) {
    var favs = getFavs();
    var i = favs.indexOf(uid);
    if (i === -1) favs.push(uid); else favs.splice(i, 1);
    setFavs(favs);
    return i === -1;
  }

  function initFavButtons() {
    var btns = document.querySelectorAll(".fav-btn");
    btns.forEach(function (btn) {
      var uid = btn.getAttribute("data-uid");
      if (isFav(uid)) { btn.classList.add("active"); btn.textContent = "★"; }
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var active = toggleFav(uid);
        btn.classList.toggle("active", active);
        btn.textContent = active ? "★" : "☆";
        if (window.__renderFavSection) window.__renderFavSection();
      });
    });
  }

  /* ---------- 크게 보기 (직원에게 보여주기) ---------- */
  var overlay = document.getElementById("zoomOverlay");
  var zoomClose = document.getElementById("zoomClose");
  var zoomNote = document.getElementById("zoomNote");
  function openZoom(card) {
    if (!overlay) return;
    document.getElementById("zoomKr").textContent = card.getAttribute("data-kr");
    document.getElementById("zoomJp").textContent = card.getAttribute("data-jp");
    document.getElementById("zoomHira").textContent = card.getAttribute("data-hira");
    document.getElementById("zoomPron").textContent = card.getAttribute("data-pron");
    if (zoomNote) {
      var raw = card.getAttribute("data-note");
      if (raw) {
        try {
          var note = JSON.parse(raw.replace(/&#39;/g, "'"));
          zoomNote.innerHTML = '<div class="zoom-note-title">' + note.title + '</div>' +
            note.items.map(function (it) {
              return '<span class="zoom-note-item"><b>' + it.label + '</b> ' + it.jp + '(' + it.hira + ') <span class="zoom-note-pron">' + it.pron + '</span></span>';
            }).join("");
          zoomNote.hidden = false;
        } catch (e) { zoomNote.hidden = true; zoomNote.innerHTML = ""; }
      } else {
        zoomNote.hidden = true;
        zoomNote.innerHTML = "";
      }
    }
    overlay.hidden = false;
  }
  if (zoomClose) zoomClose.addEventListener("click", function () { overlay.hidden = true; });
  if (overlay) overlay.addEventListener("click", function (e) { if (e.target === overlay) overlay.hidden = true; });

  function initZoomButtons() {
    document.querySelectorAll(".zoom-btn").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        openZoom(btn.closest(".phrase-card"));
      });
    });
    document.querySelectorAll(".phrase-card").forEach(function (card) {
      card.addEventListener("click", function () { openZoom(card); });
    });
  }

  /* ---------- 페이지 내 검색 (카테고리 페이지) ---------- */
  var pageSearch = document.getElementById("pageSearch");
  if (pageSearch) {
    pageSearch.addEventListener("input", function () {
      var q = pageSearch.value.trim().toLowerCase();
      var cards = document.querySelectorAll(".phrase-card");
      var visibleCount = 0;
      cards.forEach(function (card) {
        var hay = (card.getAttribute("data-kr") + card.getAttribute("data-jp") + card.getAttribute("data-hira") + card.getAttribute("data-pron")).toLowerCase();
        var match = q === "" || hay.indexOf(q) !== -1;
        card.classList.toggle("hidden-by-search", !match);
        if (match) visibleCount++;
      });
      document.querySelectorAll(".sub-section").forEach(function (sec) {
        var anyVisible = sec.querySelectorAll(".phrase-card:not(.hidden-by-search)").length > 0;
        sec.style.display = anyVisible ? "" : "none";
      });
      var noResult = document.getElementById("noResult");
      if (noResult) noResult.hidden = visibleCount !== 0;
    });
  }

  /* ---------- 전체 검색 (메인 페이지) ---------- */
  var globalSearch = document.getElementById("globalSearch");
  var searchResults = document.getElementById("searchResults");

  function buildIndex() {
    if (typeof CATEGORIES === "undefined") return [];
    var list = [];
    CATEGORIES.forEach(function (cat) {
      cat.subcategories.forEach(function (sc) {
        sc.sentences.forEach(function (s, i) {
          list.push({
            uid: cat.id + "-" + sc.id + "-" + i,
            catId: cat.id,
            catName: cat.name,
            kr: s.kr, jp: s.jp, hira: s.hira, pron: s.pron
          });
        });
      });
    });
    return list;
  }
  var SEARCH_INDEX = buildIndex();

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  if (globalSearch && searchResults) {
    globalSearch.addEventListener("input", function () {
      var q = globalSearch.value.trim().toLowerCase();
      if (q === "") { searchResults.hidden = true; searchResults.innerHTML = ""; return; }
      var hits = SEARCH_INDEX.filter(function (item) {
        return (item.kr + item.jp + item.hira + item.pron).toLowerCase().indexOf(q) !== -1;
      }).slice(0, 30);
      searchResults.hidden = false;
      if (hits.length === 0) {
        searchResults.innerHTML = '<p class="search-empty">검색 결과가 없어요. 다른 단어로 찾아보세요.</p>';
        return;
      }
      searchResults.innerHTML = hits.map(function (h) {
        return '<a class="result-hit" href="' + h.catId + '.html#' + h.uid.split("-").slice(1, -1).join("-") + '">' +
          '<div class="result-cat">' + escapeHtml(h.catName) + '</div>' +
          '<div class="result-kr">' + escapeHtml(h.kr) + '</div>' +
          '<div class="result-jp">' + escapeHtml(h.jp) + ' <span style="font-weight:400;font-size:13px;">(' + escapeHtml(h.hira) + ')</span></div>' +
          '<div class="result-pron">' + escapeHtml(h.pron) + '</div>' +
          '</a>';
      }).join("");
    });
  }

  /* ---------- 즐겨찾기 섹션 (메인 페이지) ---------- */
  var favToggle = document.getElementById("favToggle");
  var favSection = document.getElementById("favSection");
  var favList = document.getElementById("favList");
  var favEmpty = document.getElementById("favEmpty");

  function renderFavSection() {
    if (!favList) return;
    var favs = getFavs();
    var items = SEARCH_INDEX.filter(function (item) { return favs.indexOf(item.uid) !== -1; });
    if (items.length === 0) {
      favList.innerHTML = "";
      if (favEmpty) favEmpty.hidden = false;
      return;
    }
    if (favEmpty) favEmpty.hidden = true;
    favList.innerHTML = items.map(function (s) {
      return '<li class="phrase-card" data-uid="' + s.uid + '" data-kr="' + escapeHtml(s.kr) + '" data-jp="' + escapeHtml(s.jp) + '" data-hira="' + escapeHtml(s.hira) + '" data-pron="' + escapeHtml(s.pron) + '">' +
        '<div class="phrase-kr">' + escapeHtml(s.kr) + '</div>' +
        '<div class="phrase-jp">' + escapeHtml(s.jp) + '</div>' +
        '<div class="phrase-hira">' + escapeHtml(s.hira) + '</div>' +
        '<div class="phrase-pron"><span class="pron-tag">발음</span>' + escapeHtml(s.pron) + '</div>' +
        '<div class="card-actions">' +
        '<button class="icon-btn fav-btn active" data-uid="' + s.uid + '" aria-label="즐겨찾기 해제">★</button>' +
        '<button class="icon-btn zoom-btn" aria-label="크게 보기">⤢</button>' +
        '</div></li>';
    }).join("");
    initFavButtons();
    initZoomButtons();
  }
  window.__renderFavSection = renderFavSection;

  if (favToggle && favSection) {
    favToggle.addEventListener("click", function () {
      var show = favSection.hidden;
      favSection.hidden = !show;
      if (show) { renderFavSection(); favSection.scrollIntoView({ behavior: "smooth", block: "start" }); }
    });
  }

  /* ---------- init ---------- */
  initFavButtons();
  initZoomButtons();
})();
