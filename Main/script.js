/* =============================================================
   CAMPUS FACILITIES LOCATOR — script.js
   Backend-ready. BUILDINGS array populated via loadBuildings().
   Map zoom/drag applied to the SVG itself — container stays fixed.
============================================================= */

// ─────────────────────────────────────────────────────────────
// DATA — filled by backend
// ─────────────────────────────────────────────────────────────
let BUILDINGS = [];  // [{ id, name, desc, facilities[], recommended }]
let QA_DATA   = {};  // { [buildingId]: [{ question, answer }] }

/**
 * TODO: Replace stub with real API fetch when backend is ready.
 *
 * async function loadBuildings() {
 *   const res = await fetch("/api/buildings");
 *   BUILDINGS  = await res.json();
 *   const qa   = await fetch("/api/qa");
 *   QA_DATA    = await qa.json();
 * }
 */
async function loadBuildings() {
  // ── STUB: no data until backend connects ──
  BUILDINGS = [];
  QA_DATA   = {};
}

// ─────────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────────
let currentBuildingId = null;

// Map transform — applied directly to the <svg> element
let mapScale  = 1;
let mapTransX = 0;
let mapTransY = 0;
let isDragging    = false;
let wasDragging   = false; // distinguishes click from drag-release
let dragStart     = { x: 0, y: 0 };
let lastTouchDist = null;

// ─────────────────────────────────────────────────────────────
// DOM
// ─────────────────────────────────────────────────────────────
const mapInner            = document.getElementById("mapInner");
const mapContainer        = document.getElementById("mapContainer");
const mapPlaceholder      = document.getElementById("mapPlaceholder");
const mapHint             = document.getElementById("mapHint");
const mapStatusLabel      = document.getElementById("mapStatusLabel");
const facilityList        = document.getElementById("facilityList");
const facilityFilter      = document.getElementById("facilityFilter");
const searchInput         = document.getElementById("searchInput");
const searchResults       = document.getElementById("searchResults");
const searchClearBtn      = document.getElementById("searchClearBtn");
const sidebar             = document.getElementById("sidebar");
const sidebarCollapseBtn  = document.getElementById("sidebarCollapseBtn");
const sidebarTab          = document.getElementById("sidebarTab");
const assistantBuildingSelect = document.getElementById("assistantBuildingSelect");
const questionsList       = document.getElementById("questionsList");
const questionsSection    = document.getElementById("questionsSection");
const answerArea          = document.getElementById("answerArea");
const answerText          = document.getElementById("answerText");
const assistantIdle       = document.getElementById("assistantIdle");
const clearAnswerBtn      = document.getElementById("clearAnswerBtn");

const buildingModalEl = document.getElementById("buildingModal");
const assistantModalEl= document.getElementById("assistantModal");
const buildingModal   = new bootstrap.Modal(buildingModalEl);
const assistantModal  = new bootstrap.Modal(assistantModalEl);

// ─────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  await loadBuildings();

  buildSidebarBuildingList();
  populateAssistantSelect();
  handleSVGLoad();
  initMapControls();
  initSearch();
  initSidebar();
  initAssistant();

  setTimeout(() => mapHint.classList.add("visible"),    1200);
  setTimeout(() => mapHint.classList.remove("visible"), 4500);

  document.getElementById("modalAssistantBtn").addEventListener("click", () => {
    buildingModal.hide();
    if (currentBuildingId) {
      assistantBuildingSelect.value = currentBuildingId;
      loadQuestionsForBuilding(currentBuildingId);
    }
    assistantModal.show();
  });

  document.getElementById("openAssistantBtn").addEventListener("click", () => assistantModal.show());
});

// ─────────────────────────────────────────────────────────────
// SVG MAP LOAD
// ─────────────────────────────────────────────────────────────
function handleSVGLoad() {
  fetch("assets/map.svg")
    .then(r => { if (!r.ok) throw new Error(); return r.text(); })
    .then(svgText => {
      if (mapPlaceholder) mapPlaceholder.remove();
      mapInner.innerHTML = svgText;

      const svg = mapInner.querySelector("svg");
      if (!svg) return;

      // SVG fills wrapper; transform is applied to it directly
      svg.style.width           = "100%";
      svg.style.height          = "100%";
      svg.style.display         = "block";
      svg.style.transformOrigin = "0 0";
      svg.style.touchAction     = "none";
      svg.style.userSelect      = "none";
      svg.style.webkitUserSelect= "none";

      attachBuildingClickEvents(svg);
      updateMapStatus("Map loaded — drag to pan, scroll/pinch to zoom.");
    })
    .catch(() => updateMapStatus("Waiting for map.svg…"));
}

function attachBuildingClickEvents(svg) {
  if (!BUILDINGS.length) return;

  BUILDINGS.forEach(b => {
    const el = svg.getElementById(b.id);
    if (!el) return;

    el.classList.add("building-shape");
    el.style.cursor = "pointer";

    el.addEventListener("click", () => {
      if (wasDragging) return; // ignore drag-end clicks
      handleBuildingClick(b.id);
    });

    el.addEventListener("mouseenter", () => updateMapStatus(`📍 ${b.name}`));
    el.addEventListener("mouseleave", () => updateMapStatus("Map loaded — drag to pan, scroll/pinch to zoom."));
  });
}

// ─────────────────────────────────────────────────────────────
// MAP CONTROLS — zoom & pan applied to the SVG, not the container
// ─────────────────────────────────────────────────────────────
function initMapControls() {
  document.getElementById("zoomInBtn").addEventListener("click",    () => zoomAt(0.18));
  document.getElementById("zoomOutBtn").addEventListener("click",   () => zoomAt(-0.18));
  document.getElementById("resetViewBtn").addEventListener("click", resetView);

  // Scroll wheel zoom (toward cursor)
  mapContainer.addEventListener("wheel", e => {
    e.preventDefault();
    e.stopPropagation();
    const rect  = mapContainer.getBoundingClientRect();
    const delta = e.deltaY < 0 ? 0.12 : -0.12;
    zoomAtPoint(delta, e.clientX - rect.left, e.clientY - rect.top);
  }, { passive: false });

  // Mouse drag
  mapContainer.addEventListener("mousedown", e => {
    if (e.button !== 0) return;
    isDragging  = true;
    wasDragging = false;
    dragStart   = { x: e.clientX - mapTransX, y: e.clientY - mapTransY };
    mapContainer.style.cursor = "grabbing";
    e.preventDefault();
  });

  window.addEventListener("mousemove", e => {
    if (!isDragging) return;
    wasDragging = true;
    mapTransX   = e.clientX - dragStart.x;
    mapTransY   = e.clientY - dragStart.y;
    applyMapTransform();
  });

  window.addEventListener("mouseup", () => {
    if (!isDragging) return;
    isDragging = false;
    mapContainer.style.cursor = "grab";
    // Reset wasDragging after a tiny delay so click events fire correctly
    setTimeout(() => { wasDragging = false; }, 50);
  });

  // Touch — single finger pan, two-finger pinch zoom
  mapContainer.addEventListener("touchstart", e => {
    e.preventDefault();
    if (e.touches.length === 1) {
      isDragging    = true;
      wasDragging   = false;
      lastTouchDist = null;
      dragStart = { x: e.touches[0].clientX - mapTransX, y: e.touches[0].clientY - mapTransY };
    } else if (e.touches.length === 2) {
      isDragging    = false;
      lastTouchDist = touchDist(e.touches);
    }
  }, { passive: false });

  mapContainer.addEventListener("touchmove", e => {
    e.preventDefault();
    if (e.touches.length === 1 && isDragging) {
      wasDragging = true;
      mapTransX   = e.touches[0].clientX - dragStart.x;
      mapTransY   = e.touches[0].clientY - dragStart.y;
      applyMapTransform();
    } else if (e.touches.length === 2 && lastTouchDist !== null) {
      const newDist = touchDist(e.touches);
      const ratio   = newDist / lastTouchDist;
      const midX    = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY    = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const rect    = mapContainer.getBoundingClientRect();
      zoomAtPoint((ratio - 1) * mapScale * 0.6, midX - rect.left, midY - rect.top);
      lastTouchDist = newDist;
    }
  }, { passive: false });

  mapContainer.addEventListener("touchend", e => {
    if (e.touches.length === 0) {
      isDragging    = false;
      lastTouchDist = null;
      setTimeout(() => { wasDragging = false; }, 50);
    } else if (e.touches.length === 1) {
      lastTouchDist = null;
      isDragging    = true;
      dragStart = { x: e.touches[0].clientX - mapTransX, y: e.touches[0].clientY - mapTransY };
    }
  }, { passive: false });
}

function touchDist(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.hypot(dx, dy);
}

function zoomAt(delta) {
  const rect = mapContainer.getBoundingClientRect();
  zoomAtPoint(delta, rect.width / 2, rect.height / 2);
}

function zoomAtPoint(delta, px, py) {
  const prev  = mapScale;
  mapScale    = Math.min(Math.max(mapScale + delta, 0.35), 6);
  const ratio = mapScale / prev;
  mapTransX   = px - ratio * (px - mapTransX);
  mapTransY   = py - ratio * (py - mapTransY);
  applyMapTransform();
}

function applyMapTransform() {
  const svg = mapInner.querySelector("svg");
  if (!svg) return;
  svg.style.transform = `translate(${mapTransX}px, ${mapTransY}px) scale(${mapScale})`;
}

function resetView() {
  mapScale = 1; mapTransX = 0; mapTransY = 0;
  const svg = mapInner.querySelector("svg");
  if (!svg) return;
  svg.style.transition = "transform 0.32s ease";
  applyMapTransform();
  setTimeout(() => { svg.style.transition = ""; }, 340);
}

// ─────────────────────────────────────────────────────────────
// BUILDING CLICK
// ─────────────────────────────────────────────────────────────
function handleBuildingClick(id) {
  const b = BUILDINGS.find(x => x.id === id);
  if (!b) return;
  currentBuildingId = id;
  highlightBuilding(id);
  setActiveSidebarItem(id);
  openBuildingModal(b);
}

function highlightBuilding(id) {
  const svg = mapInner.querySelector("svg");
  if (!svg) return;
  svg.querySelectorAll(".building-shape.highlighted").forEach(el => el.classList.remove("highlighted"));
  const el = svg.getElementById(id);
  if (el) el.classList.add("highlighted");
}

function setActiveSidebarItem(id) {
  facilityList.querySelectorAll(".facility-list-item")
    .forEach(item => item.classList.toggle("active", item.dataset.buildingId === id));
  const active = facilityList.querySelector(`[data-building-id="${id}"]`);
  if (active) active.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// ─────────────────────────────────────────────────────────────
// BUILDING MODAL
// ─────────────────────────────────────────────────────────────
function openBuildingModal(building) {
  document.getElementById("buildingModalLabel").textContent = building.name;
  document.getElementById("modalBuildingDesc").textContent  = building.desc || "";
  document.getElementById("modalBuildingId").textContent    = `ID: ${building.id}`;

  const grid       = document.getElementById("modalFacilitiesGrid");
  const facilities = building.facilities || [];
  grid.innerHTML   = "";

  if (!facilities.length) {
    grid.innerHTML = `
      <div class="no-facilities">
        <i class="bi bi-inbox"></i>
        <p>No facilities listed for this building.</p>
      </div>`;
  } else {
    facilities.forEach((f, i) => {
      const card = document.createElement("div");
      card.className = "facility-card";
      card.style.animationDelay = `${i * 55}ms`;
      card.innerHTML = `
        <i class="bi ${f.icon || "bi-grid"} facility-card-icon"></i>
        <div class="facility-card-name">${f.name}</div>
        <div class="facility-card-desc">${f.desc || ""}</div>
      `;
      grid.appendChild(card);
    });
  }
  buildingModal.show();
}

// ─────────────────────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────────────────────
function buildSidebarBuildingList(filter = "") {
  facilityList.innerHTML = "";
  const q = filter.toLowerCase().trim();

  if (!BUILDINGS.length) {
    facilityList.innerHTML = `
      <li class="sidebar-empty-state">
        <i class="bi bi-plug-fill"></i>
        <span>No buildings yet.</span>
        <small>Waiting for backend data.</small>
      </li>`;
    return;
  }

  const list = BUILDINGS.filter(b => {
    if (!q) return true;
    if (b.name.toLowerCase().includes(q)) return true;
    return (b.facilities || []).some(f => f.name.toLowerCase().includes(q));
  });

  if (!list.length) {
    facilityList.innerHTML = `
      <li class="sidebar-empty-state">
        <i class="bi bi-search"></i>
        <span>No buildings found.</span>
      </li>`;
    return;
  }

  list.forEach((b, i) => {
    const count = (b.facilities || []).length;
    const li    = document.createElement("li");
    li.className          = "facility-list-item building-list-item";
    li.dataset.buildingId = b.id;
    li.style.animationDelay = `${i * 35}ms`;
    li.innerHTML = `
      <div class="facility-item-icon">
        <i class="bi bi-building"></i>
      </div>
      <div class="facility-item-info">
        <div class="facility-item-name">${b.name}</div>
        <div class="recommended-badge">
          <i class="bi bi-stars"></i> Recommended
        </div>
        <div class="building-item-count">
          <i class="bi bi-grid-3x3-gap"></i>
          ${count} ${count === 1 ? "facility" : "facilities"}
        </div>
      </div>
      <div class="building-item-arrow">
        <i class="bi bi-chevron-right"></i>
      </div>
    `;
    li.addEventListener("click", () => {
      triggerRipple(li);
      facilityList.querySelectorAll(".facility-list-item").forEach(x => x.classList.remove("active"));
      li.classList.add("active");
      handleBuildingClick(b.id);
    });
    facilityList.appendChild(li);
  });
}

function initSidebar() {
  sidebarCollapseBtn.addEventListener("click", () => {
    sidebar.classList.add("collapsed");
    sidebarTab.classList.add("visible");
  });
  sidebarTab.addEventListener("click", () => {
    sidebar.classList.remove("collapsed");
    sidebarTab.classList.remove("visible");
  });
  facilityFilter.addEventListener("input", e => buildSidebarBuildingList(e.target.value));
}

// ─────────────────────────────────────────────────────────────
// SEARCH
// ─────────────────────────────────────────────────────────────
function initSearch() {
  searchInput.addEventListener("input", handleSearch);
  searchInput.addEventListener("focus", () => { if (searchInput.value.trim()) showSearchResults(searchInput.value); });
  document.addEventListener("click", e => { if (!e.target.closest(".search-box")) searchResults.classList.remove("open"); });
  searchClearBtn.addEventListener("click", () => {
    searchInput.value = "";
    searchResults.classList.remove("open");
    searchClearBtn.classList.remove("visible");
    searchInput.focus();
  });
  searchInput.addEventListener("keydown", e => {
    if (e.key === "Escape") { searchResults.classList.remove("open"); searchInput.blur(); return; }
    const items = [...searchResults.querySelectorAll(".search-result-item")];
    if (!items.length) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const cur = searchResults.querySelector(".keyboard-focused");
      let idx   = items.indexOf(cur);
      if (cur) cur.classList.remove("keyboard-focused");
      idx = e.key === "ArrowDown" ? (idx + 1) % items.length : (idx - 1 + items.length) % items.length;
      items[idx].classList.add("keyboard-focused");
      items[idx].scrollIntoView({ block: "nearest" });
    }
    if (e.key === "Enter") { const f = searchResults.querySelector(".keyboard-focused"); if (f) f.click(); }
  });
}

function handleSearch(e) {
  const q = e.target.value.trim();
  searchClearBtn.classList.toggle("visible", q.length > 0);
  q ? showSearchResults(q) : searchResults.classList.remove("open");
}

function showSearchResults(query) {
  const lq      = query.toLowerCase();
  const matches = [];
  BUILDINGS.forEach(b => {
    if (b.name.toLowerCase().includes(lq))
      matches.push({ name: b.name, sub: `${(b.facilities||[]).length} facilities`, id: b.id, icon: "bi-building" });
    (b.facilities||[]).forEach(f => {
      if (f.name.toLowerCase().includes(lq) || (f.desc||"").toLowerCase().includes(lq))
        matches.push({ name: f.name, sub: b.name, id: b.id, icon: f.icon||"bi-grid" });
    });
  });

  searchResults.innerHTML = "";
  if (!BUILDINGS.length) {
    searchResults.innerHTML = `<div class="search-no-results"><i class="bi bi-plug"></i> Backend not connected.</div>`;
  } else if (!matches.length) {
    searchResults.innerHTML = `<div class="search-no-results"><i class="bi bi-search"></i> No results for "<strong>${escapeHTML(query)}</strong>"</div>`;
  } else {
    matches.slice(0, 8).forEach(m => {
      const item = document.createElement("div");
      item.className = "search-result-item";
      item.innerHTML = `
        <i class="bi ${m.icon} search-result-icon"></i>
        <span class="search-result-name">${highlightMatch(m.name, query)}</span>
        <span class="search-result-building">${escapeHTML(m.sub)}</span>
      `;
      item.addEventListener("click", () => {
        searchResults.classList.remove("open");
        searchInput.value = m.name;
        searchClearBtn.classList.add("visible");
        handleBuildingClick(m.id);
      });
      searchResults.appendChild(item);
    });
  }
  searchResults.classList.add("open");
}

function highlightMatch(text, query) {
  const re = new RegExp(`(${escapeRegex(query)})`, "gi");
  return escapeHTML(text).replace(re, `<mark style="background:var(--yellow);padding:0 2px;border-radius:2px;">$1</mark>`);
}
function escapeHTML(s)  { return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"); }

// ─────────────────────────────────────────────────────────────
// ASSISTANT
// ─────────────────────────────────────────────────────────────
function populateAssistantSelect() {
  while (assistantBuildingSelect.options.length > 1) assistantBuildingSelect.remove(1);
  BUILDINGS.forEach(b => {
    const opt = new Option(b.name, b.id);
    assistantBuildingSelect.appendChild(opt);
  });
}

function initAssistant() {
  assistantBuildingSelect.addEventListener("change", e => e.target.value ? loadQuestionsForBuilding(e.target.value) : resetAssistant(false));
  clearAnswerBtn.addEventListener("click", () => resetAssistant(false));
  assistantModalEl.addEventListener("show.bs.modal", () => { if (!assistantBuildingSelect.value) resetAssistant(true); });
}

function loadQuestionsForBuilding(id) {
  questionsList.innerHTML     = "";
  answerArea.style.display    = "none";
  answerText.textContent      = "";
  assistantIdle.style.display = "none";
  const qs = QA_DATA[id] || [];
  if (!qs.length) {
    questionsList.innerHTML = `<li class="qa-empty">No questions available yet.</li>`;
  } else {
    qs.forEach(qa => {
      const li = document.createElement("li");
      li.className = "question-item";
      li.innerHTML = `<i class="bi bi-chat-right-dots"></i>${qa.question}`;
      li.addEventListener("click", () => {
        questionsList.querySelectorAll(".question-item").forEach(q => q.classList.remove("selected"));
        li.classList.add("selected");
        answerText.textContent   = qa.answer;
        answerArea.style.display = "block";
        answerArea.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
      questionsList.appendChild(li);
    });
  }
  questionsSection.style.display = "block";
}

function resetAssistant(clearSelect = false) {
  questionsList.innerHTML        = "";
  answerText.textContent         = "";
  answerArea.style.display       = "none";
  questionsSection.style.display = "none";
  assistantIdle.style.display    = "block";
  if (clearSelect) assistantBuildingSelect.value = "";
}

// ─────────────────────────────────────────────────────────────
// RIPPLE
// ─────────────────────────────────────────────────────────────
function triggerRipple(el) {
  el.querySelectorAll(".ripple").forEach(r => r.remove());
  const r = document.createElement("span");
  r.className = "ripple";
  el.appendChild(r);
  setTimeout(() => r.remove(), 500);
}

// ─────────────────────────────────────────────────────────────
// MAP STATUS
// ─────────────────────────────────────────────────────────────
function updateMapStatus(text) {
  mapStatusLabel.innerHTML = `<i class="bi bi-geo-alt-fill"></i> ${text}`;
}
