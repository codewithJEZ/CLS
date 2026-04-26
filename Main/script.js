/* =============================================================
   CAMPUS FACILITIES LOCATOR — script.js  v2.0
============================================================= */

// ── DATA ─────────────────────────────────────────────────────
let BUILDINGS = [];
let QA_DATA = {};
let visitCounts = JSON.parse(localStorage.getItem("visitCounts") || "{}");

function recordInteraction(id) {
  // add visit
  visitCounts[id] = (visitCounts[id] || 0) * 0.9 + 1;

  // 🔥 decay (para hindi forever top)
  visitCounts[id] *= 0.98;

  // save
  localStorage.setItem("visitCounts", JSON.stringify(visitCounts));

  // 🔥 auto update UI
  buildSidebarBuildingList();
}

async function loadBuildings() {
  try {
    const [bRes, fRes, aRes] = await Promise.all([
      fetch('http://localhost:3000/buildings'),
      fetch('http://localhost:3000/facilities'),
      fetch('http://localhost:3000/assistance'),
    ]);
    const bJson = await bRes.json();
    if (!bJson.success) { BUILDINGS = []; QA_DATA = {}; return; }
    const fJson = await fRes.json();
    const allFacilities = fJson.success ? fJson.data : [];
    const aJson = await aRes.json();
    const allQA = aJson.success ? aJson.data : [];

    BUILDINGS = bJson.data.map(b => ({
      id: String(b.id),
      name: b.name,
      svgId: b.name.trim().toUpperCase(),
      desc: b.description || '',
      recommended: Number(b.is_featured) === 1,
      facilities: allFacilities
        .filter(f => f.building_id == b.id)
        .map(f => ({
          name: f.name,
          type: f.type || '',
          floor: f.floor || '',
          description: f.description || '',
          desc: `${f.type}${f.floor ? ' · ' + f.floor : ''}${f.description ? ' — ' + f.description : ''}`,
          icon: facilityIcon(f.type)
        }))
    }));

    QA_DATA = {};
    allQA.forEach(qa => {
      const key = String(qa.building_id);
      if (!QA_DATA[key]) QA_DATA[key] = [];
      QA_DATA[key].push({ question: qa.question, answer: qa.answer });
    });
  } catch (err) {
    console.error('loadBuildings error:', err);
    BUILDINGS = []; QA_DATA = {};
  }
}

function facilityIcon(type) {
  if (!type) return 'bi-grid';
  const t = type.toLowerCase();
  if (t.includes('lab')) return 'bi-flask';
  if (t.includes('office')) return 'bi-briefcase';
  if (t.includes('classroom') || t.includes('room')) return 'bi-easel';
  if (t.includes('library')) return 'bi-book';
  if (t.includes('gym') || t.includes('sport')) return 'bi-trophy';
  if (t.includes('clinic') || t.includes('health')) return 'bi-heart-pulse';
  if (t.includes('canteen') || t.includes('caf')) return 'bi-cup-hot';
  if (t.includes('chapel') || t.includes('church')) return 'bi-buildings';
  if (t.includes('computer')) return 'bi-pc-display';
  if (t.includes('toilet') || t.includes('cr')) return 'bi-door-open';
  return 'bi-grid';
}

/**
 * getSidebarBuildingList(filter)
 * Admin-featured always first, then visited (>=3 times) buildings.
 * Within groups, sorted by local visit score desc.
 */
/** loadInteractionScores — alias for visitCounts (localStorage) */
function loadInteractionScores() {
  return visitCounts;
}

/** updateResetVisibility — shows/hides the Reset button based on state */
function updateResetVisibility() {
  if (!clearAnswerBtn) return;
  const hasContent = (answerArea && answerArea.style.display !== 'none') ||
                     (questionsSection && questionsSection.style.display !== 'none');
  clearAnswerBtn.style.display = hasContent ? '' : 'none';
}

function getSidebarBuildingList(filter) {
  const q = (filter || '').toLowerCase().trim();
  const scores = loadInteractionScores();
  const featured = BUILDINGS.filter(b => b.recommended);
  const nonFeatured = BUILDINGS.filter(b => !b.recommended);
  const promoted = nonFeatured.filter(b => (scores[b.id] || 0) >= 3);
  const sortByScore = (a, b) => (scores[b.id] || 0) - (scores[a.id] || 0);
  const merged = [...featured.sort(sortByScore), ...promoted.sort(sortByScore)];
  if (!q) return merged;
  return merged.filter(b =>
    b.name.toLowerCase().includes(q) ||
    (b.facilities || []).some(f => f.name.toLowerCase().includes(q))
  );
}

// ── STATE ─────────────────────────────────────────────────────
let currentBuildingId = null;
let mapScale = 1, mapTransX = 0, mapTransY = 0;
let isDragging = false, wasDragging = false;
let dragStart = { x: 0, y: 0 }, lastTouchDist = null;

// ── DOM REFS ──────────────────────────────────────────────────
const mapInner = document.getElementById('mapInner');
const mapContainer = document.getElementById('mapContainer');
const mapPlaceholder = document.getElementById('mapPlaceholder');
const mapHint = document.getElementById('mapHint');
const mapStatusLabel = document.getElementById('mapStatusLabel');
const facilityList = document.getElementById('facilityList');
const facilityFilter = document.getElementById('facilityFilter');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const searchClearBtn = document.getElementById('searchClearBtn');
const sidebar = document.getElementById('sidebar');
const sidebarCollapseBtn = document.getElementById('sidebarCollapseBtn');
const sidebarTab = document.getElementById('sidebarTab');
const assistantBuildingSelect = document.getElementById('assistantBuildingSelect');
const questionsList = document.getElementById('questionsList');
const questionsSection = document.getElementById('questionsSection');
const answerArea = document.getElementById('answerArea');
const answerText = document.getElementById('answerText');
const assistantIdle = document.getElementById('assistantIdle');
const clearAnswerBtn = document.getElementById('clearAnswerBtn');
const buildingModalEl = document.getElementById('buildingModal');
const assistantModalEl = document.getElementById('assistantModal');
const facilityDetailModalEl = document.getElementById('facilityDetailModal');
const buildingModal = new bootstrap.Modal(buildingModalEl);
const assistantModal = new bootstrap.Modal(assistantModalEl);
const facilityDetailModal = new bootstrap.Modal(facilityDetailModalEl, { backdrop: false });

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await loadBuildings();
  buildSidebarBuildingList();
  populateAssistantSelect();
  injectAssistantSearch();
  handleSVGLoad();
  initMapControls();
  initSearch();
  initSidebar();
  initAssistant();

  setTimeout(() => mapHint.classList.add('visible'), 1200);
  setTimeout(() => mapHint.classList.remove('visible'), 4500);

  document.getElementById('modalAssistantBtn').addEventListener('click', () => {
    buildingModal.hide();
    if (currentBuildingId) setAssistantBuilding(currentBuildingId);
    assistantModal.show();
  });
  document.getElementById('openAssistantBtn').addEventListener('click', () => assistantModal.show());
  updateResetVisibility();
});

// ── SVG MAP LOAD ──────────────────────────────────────────────
function handleSVGLoad() {
  fetch('assets/map.svg')
    .then(r => { if (!r.ok) throw new Error(); return r.text(); })
    .then(svgText => {
      if (mapPlaceholder) mapPlaceholder.remove();
      mapInner.innerHTML = svgText;
      const svg = mapInner.querySelector('svg');
      if (!svg) return;

      // TASK 1: Remove fixed w/h attrs; let viewBox + CSS drive sizing
      svg.removeAttribute('width');
      svg.removeAttribute('height');
      svg.style.display = 'block';
      svg.style.transformOrigin = '0 0';
      svg.style.touchAction = 'none';
      svg.style.userSelect = 'none';
      svg.style.webkitUserSelect = 'none';
      if (!svg.getAttribute('preserveAspectRatio'))
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

      autoFitMap(svg);
      attachBuildingClickEvents(svg);
      updateMapStatus('Map loaded — drag to pan, scroll/pinch to zoom.');
    })
    .catch(() => updateMapStatus('Waiting for map.svg…'));
}

/**
 * autoFitMap(svg)
 * Scales + centers SVG to fill the container without distortion.
 */
function autoFitMap(svg) {
  const vb = svg.viewBox.baseVal;
  if (!vb || vb.width === 0 || vb.height === 0) return;
  const cW = mapContainer.clientWidth;
  const cH = mapContainer.clientHeight;
  const scale = Math.min(cW / vb.width, cH / vb.height);
  mapScale = scale;
  mapTransX = (cW - vb.width * scale) / 2;
  mapTransY = (cH - vb.height * scale) / 2;
  applyMapTransform();
}

window.addEventListener('resize', () => {
  const svg = mapInner.querySelector('svg');
  if (svg) autoFitMap(svg);
});

// ── BUILDING CLICK EVENTS (TASK 7: all shapes) ───────────────
function attachBuildingClickEvents(svg) {
  const shapes = svg.querySelectorAll('.building-shape');
  console.log('Found building shapes:', shapes.length);
  shapes.forEach(el => {
    el.style.cursor = 'pointer';
    el.style.pointerEvents = 'bounding-box';
    el.addEventListener('click', e => {
      e.stopPropagation();
      if (wasDragging) return;
      const svgId = el.id.trim().toUpperCase();
      const building = BUILDINGS.find(b => b.svgId === svgId);
      console.log('SVG click:', el.id, '→', building ? building.name : 'NOT FOUND');
      clearHighlights(svg);
      highlightAllShapes(svg, building ? building.svgId : svgId);
      if (!building) { console.warn(`No DB match for SVG id="${el.id}"`); return; }
      recordInteraction(building.id);
      handleBuildingClick(building.id);
    });
  });
}

// ── MAP CONTROLS ──────────────────────────────────────────────
function initMapControls() {
  document.getElementById('zoomInBtn').addEventListener('click', () => zoomAt(0.08));
  document.getElementById('zoomOutBtn').addEventListener('click', () => zoomAt(-0.08));
  document.getElementById('resetViewBtn').addEventListener('click', resetView);

  mapContainer.addEventListener('wheel', e => {
    e.preventDefault();
    const rect = mapContainer.getBoundingClientRect();
    zoomAtPoint(e.deltaY < 0 ? 0.12 : -0.12, e.clientX - rect.left, e.clientY - rect.top);
  }, { passive: false });

  mapContainer.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    isDragging = true; wasDragging = false;
    dragStart = { x: e.clientX - mapTransX, y: e.clientY - mapTransY };
    mapContainer.style.cursor = 'grabbing';
    e.preventDefault();
  });
  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    wasDragging = true;
    mapTransX = e.clientX - dragStart.x;
    mapTransY = e.clientY - dragStart.y;
    applyMapTransform();
  });
  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    mapContainer.style.cursor = 'grab';
    setTimeout(() => { wasDragging = false; }, 50);
  });

  mapContainer.addEventListener('touchstart', e => {
    e.preventDefault();
    if (e.touches.length === 1) {
      isDragging = true; wasDragging = false; lastTouchDist = null;
      dragStart = { x: e.touches[0].clientX - mapTransX, y: e.touches[0].clientY - mapTransY };
    } else if (e.touches.length === 2) {
      isDragging = false; lastTouchDist = touchDist(e.touches);
    }
  }, { passive: false });

  mapContainer.addEventListener('touchmove', e => {
    e.preventDefault();
    if (e.touches.length === 1 && isDragging) {
      wasDragging = true;
      mapTransX = e.touches[0].clientX - dragStart.x;
      mapTransY = e.touches[0].clientY - dragStart.y;
      applyMapTransform();
    } else if (e.touches.length === 2 && lastTouchDist !== null) {
      const nd = touchDist(e.touches);
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const rect = mapContainer.getBoundingClientRect();
      zoomAtPoint((nd / lastTouchDist - 1) * mapScale * 0.6, midX - rect.left, midY - rect.top);
      lastTouchDist = nd;
    }
  }, { passive: false });

  mapContainer.addEventListener('touchend', e => {
    if (e.touches.length === 0) {
      isDragging = false; lastTouchDist = null;
      setTimeout(() => { wasDragging = false; }, 50);
    } else if (e.touches.length === 1) {
      lastTouchDist = null; isDragging = true;
      dragStart = { x: e.touches[0].clientX - mapTransX, y: e.touches[0].clientY - mapTransY };
    }
  }, { passive: false });
}

function touchDist(t) { return Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY); }
function zoomAt(d) { const r = mapContainer.getBoundingClientRect(); zoomAtPoint(d, r.width / 2, r.height / 2); }
function zoomAtPoint(d, px, py) {
  const prev = mapScale;
  mapScale += (Math.min(Math.max(mapScale + d, 0.6), 3.5) - mapScale) * 0.3;
  const ratio = mapScale / prev;
  mapTransX = px - ratio * (px - mapTransX);
  mapTransY = py - ratio * (py - mapTransY);
  applyMapTransform();
}
function applyMapTransform() {
  const svg = mapInner.querySelector('svg');
  if (svg) svg.style.transform = `translate(${mapTransX}px,${mapTransY}px) scale(${mapScale})`;
}
function resetView() {
  const svg = mapInner.querySelector('svg');
  if (!svg) return;
  svg.style.transition = 'transform 0.38s cubic-bezier(0.4,0,0.2,1)';
  autoFitMap(svg);
  setTimeout(() => { svg.style.transition = ''; }, 400);
}

// ── ZOOM TO BUILDING (TASK 2: smooth + centered + all shapes) ─
function zoomToBuilding(id) {
  const svg = mapInner.querySelector('svg');
  if (!svg) return;

  const building = BUILDINGS.find(b => b.id === id);
  if (!building) return;

  const shapes = getAllBuildingShapes(svg, building.svgId);
  if (!shapes.length) return;

  // 🔥 unified bbox (multi-shape)
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  shapes.forEach(el => {
    const b = el.getBBox();
    minX = Math.min(minX, b.x);
    minY = Math.min(minY, b.y);
    maxX = Math.max(maxX, b.x + b.width);
    maxY = Math.max(maxY, b.y + b.height);
  });

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  const TARGET_SCALE = 2.2; // 🔥 tweak mo lang to

  const vpW = mapContainer.clientWidth;
  const vpH = mapContainer.clientHeight;

  mapScale = TARGET_SCALE;
  mapTransX = vpW / 2 - centerX * TARGET_SCALE;
  mapTransY = vpH / 2 - centerY * TARGET_SCALE;

  svg.style.transition = 'transform 0.4s ease';
  applyMapTransform();

  setTimeout(() => { svg.style.transition = ''; }, 400);

  clearHighlights(svg);
  shapes.forEach(s => s.classList.add('highlighted'));

  setActiveSidebarItem(id);
  currentBuildingId = id;
  updateMapStatus('Showing: ' + building.name);
}

function getAllBuildingShapes(svg, svgId) {
  const out = [];
  svg.querySelectorAll('.building-shape').forEach(el => {
    const id = el.id.trim().toUpperCase();
    if (id === svgId || id.startsWith(svgId + '-') ||
      (el.dataset.building && el.dataset.building.toUpperCase() === svgId))
      out.push(el);
  });
  return out;
}

function getUnifiedBBox(els) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  els.forEach(el => {
    try {
      const b = el.getBBox();
      if (!b.width && !b.height) return;
      minX = Math.min(minX, b.x); minY = Math.min(minY, b.y);
      maxX = Math.max(maxX, b.x + b.width); maxY = Math.max(maxY, b.y + b.height);
    } catch { }
  });
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function clearHighlights(svg) {
  svg.querySelectorAll('.building-shape.highlighted').forEach(el => el.classList.remove('highlighted'));
}
function highlightAllShapes(svg, svgId) {
  getAllBuildingShapes(svg, svgId).forEach(el => el.classList.add('highlighted'));
}

// ── BUILDING CLICK ────────────────────────────────────────────
function handleBuildingClick(id) {
  const b = BUILDINGS.find(x => x.id === id);
  if (!b) return;
  currentBuildingId = id;
  recordInteraction(id);
  zoomToBuilding(id);
  setTimeout(() => openBuildingModal(b), 420);
  // track visit
  visitCounts[id] = (visitCounts[id] || 0) + 1;
  localStorage.setItem("visitCounts", JSON.stringify(visitCounts));
}

function highlightBuilding(id) {
  const svg = mapInner.querySelector('svg');
  if (!svg) return;
  const b = BUILDINGS.find(x => x.id === id);
  if (!b) return;
  clearHighlights(svg);
  highlightAllShapes(svg, b.svgId);
}

function setActiveSidebarItem(id) {
  facilityList.querySelectorAll('.facility-list-item')
    .forEach(item => item.classList.toggle('active', item.dataset.buildingId === id));
  const active = facilityList.querySelector(`[data-building-id="${id}"]`);
  if (active) active.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ── BUILDING MODAL ────────────────────────────────────────────
function openBuildingModal(building) {
  document.getElementById('buildingModalLabel').textContent = building.name;
  document.getElementById('modalBuildingDesc').textContent = building.desc || '';
  document.getElementById('modalBuildingId').textContent = 'ID: ' + building.id;
  const grid = document.getElementById('modalFacilitiesGrid');
  const facs = building.facilities || [];
  grid.innerHTML = '';
  if (!facs.length) {
    grid.innerHTML = `<div class="no-facilities"><i class="bi bi-inbox"></i><p>No facilities listed.</p></div>`;
  } else {
    facs.forEach((f, i) => {
      const card = document.createElement('div');
      card.className = 'facility-card facility-card-clickable';
      card.style.animationDelay = i * 55 + 'ms';
      card.title = 'Click to view details';
      card.innerHTML = `
        <i class="bi ${f.icon || 'bi-grid'} facility-card-icon"></i>
        <div class="facility-card-name">${escapeHTML(f.name)}</div>
        <div class="facility-card-desc">${escapeHTML(f.type)}${f.floor ? ' · ' + escapeHTML(f.floor) : ''}</div>
        <div class="facility-card-more"><i class="bi bi-arrow-right-circle"></i> Details</div>`;
      card.addEventListener('click', () => showFacilityModal(f));
      grid.appendChild(card);
    });
  }
  buildingModal.show();
}

// ── FACILITY DETAIL MODAL ─────────────────────────────────────
function showFacilityModal(f) {
  document.getElementById('facilityModalName').textContent = f.name;
  document.getElementById('facilityModalType').textContent = f.type || '—';
  document.getElementById('facilityModalFloor').textContent = f.floor || '—';
  document.getElementById('facilityModalDesc').textContent = f.description || 'No additional details.';
  document.getElementById('facilityModalIcon').className = `bi ${f.icon || 'bi-grid'} facility-modal-big-icon`;
  facilityDetailModal.show();
}

function getSmartRecommended() {
  const ADMIN_LIMIT = 3;   // pwede mo gawing 4 or 5
  const USER_LIMIT  = 4;   // pwede mo gawing 4 or 5

  // ⭐ Admin recommended (priority)
  const admin = BUILDINGS
    .filter(b => b.recommended)
    .slice(0, ADMIN_LIMIT);

  // 🔥 User-based (visits >= 2)
  const dynamic = BUILDINGS
    .filter(b => (visitCounts[b.id] || 0) >= 2)
    .sort((a, b) => (visitCounts[b.id] || 0) - (visitCounts[a.id] || 0))
    .slice(0, USER_LIMIT);

  // 🧠 merge without duplicates (admin first priority)
  const map = new Map();

  admin.forEach(b => map.set(b.id, b));
  dynamic.forEach(b => {
    if (!map.has(b.id)) {
      map.set(b.id, b);
    }
  });

  return Array.from(map.values());
}

// ── SIDEBAR (TASK 3 & 4) ──────────────────────────────────────
function buildSidebarBuildingList(filter) {
  facilityList.innerHTML = '';

  const scores = visitCounts;

  // 👉 SMART LIST LOGIC
  let list;
  if (!filter) {
    list = getSmartRecommended(); // smart recommended
  } else {
    list = getSidebarBuildingList(filter); // normal search
  }

  // ❌ no backend
  if (!BUILDINGS.length) {
    facilityList.innerHTML = `
      <li class="sidebar-empty-state">
        <i class="bi bi-plug"></i>
        <span>Backend not connected.</span>
      </li>`;
    return;
  }

  // ⭐ no recommended
  if (!list.length && !filter) {
    facilityList.innerHTML = `
      <li class="sidebar-empty-state">
        <i class="bi bi-star"></i>
        <span>No recommended buildings yet.</span>
        <small>Ask admin to set featured buildings.</small>
      </li>`;
    return;
  }

  // 🔍 no search result
  if (!list.length) {
    facilityList.innerHTML = `
      <li class="sidebar-empty-state">
        <i class="bi bi-search"></i>
        <span>No buildings found.</span>
      </li>`;
    return;
  }

  // 🔁 render list
  list.forEach((b, i) => {
    const count  = (b.facilities || []).length;
    const visits = scores[b.id] || 0;

    const li = document.createElement('li');
    li.className = 'facility-list-item building-list-item';
    li.dataset.buildingId = b.id;
    li.style.animationDelay = i * 35 + 'ms';

    // 🎯 badge logic
    const isAdminRecommended = b.recommended;
    const isUserRecommended  = visits >= 2;

    const badge = isAdminRecommended
      ? `<div class="recommended-badge">
           <i class="bi bi-stars"></i> Recommended
         </div>`
      : isUserRecommended
      ? `<div class="recommended-badge" style="color:var(--gray-text)">
           <i class="bi bi-fire"></i> Trending
         </div>`
      : '';

    li.innerHTML = `
      <div class="facility-item-icon">
        <i class="bi bi-building"></i>
      </div>
      <div class="facility-item-info">
        <div class="facility-item-name">${escapeHTML(b.name)}</div>
        ${badge}
        <div class="building-item-count">
          <i class="bi bi-grid-3x3-gap"></i>
          ${count} ${count === 1 ? 'facility' : 'facilities'}
        </div>
      </div>
      <div class="building-item-arrow">
        <i class="bi bi-chevron-right"></i>
      </div>
    `;

    // 🖱 click behavior
    li.addEventListener('click', () => {
      triggerRipple(li);

      facilityList.querySelectorAll('.facility-list-item')
        .forEach(x => x.classList.remove('active'));

      li.classList.add('active');

      // 🔥 record visit
      recordInteraction(b.id);

      // 🎯 zoom + modal
      zoomToBuilding(b.id);
      setTimeout(() => openBuildingModal(b), 420);
    });

    facilityList.appendChild(li);
  });
}

function initSidebar() {
  sidebarCollapseBtn.addEventListener('click', () => { sidebar.classList.add('collapsed'); sidebarTab.classList.add('visible'); });
  sidebarTab.addEventListener('click', () => { sidebar.classList.remove('collapsed'); sidebarTab.classList.remove('visible'); });
  facilityFilter.addEventListener('input', e => buildSidebarBuildingList(e.target.value));
}

// ── SEARCH (TASK 2) ───────────────────────────────────────────
function initSearch() {
  searchInput.addEventListener('input', handleSearch);
  searchInput.addEventListener('focus', () => { if (searchInput.value.trim()) showSearchResults(searchInput.value); });
  document.addEventListener('click', e => { if (!e.target.closest('.search-box')) searchResults.classList.remove('open'); });
  searchClearBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchResults.classList.remove('open');
    searchClearBtn.classList.remove('visible');
    searchInput.focus();
  });
  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Escape') { searchResults.classList.remove('open'); searchInput.blur(); return; }
    const items = [...searchResults.querySelectorAll('.search-result-item')];
    if (!items.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const cur = searchResults.querySelector('.keyboard-focused');
      let idx = items.indexOf(cur);
      if (cur) cur.classList.remove('keyboard-focused');
      idx = e.key === 'ArrowDown' ? (idx + 1) % items.length : (idx - 1 + items.length) % items.length;
      items[idx].classList.add('keyboard-focused');
      items[idx].scrollIntoView({ block: 'nearest' });
    }
    if (e.key === 'Enter') { const f = searchResults.querySelector('.keyboard-focused'); if (f) f.click(); }
  });
}

function handleSearch(e) {
  const q = e.target.value.trim();
  searchClearBtn.classList.toggle('visible', q.length > 0);
  q ? showSearchResults(q) : searchResults.classList.remove('open');
}

function showSearchResults(query) {
  const lq = query.toLowerCase();
  const matches = [];
  BUILDINGS.forEach(b => {
    if (b.name.toLowerCase().includes(lq))
      matches.push({ name: b.name, sub: `${(b.facilities || []).length} facilities`, id: b.id, icon: 'bi-building' });
    (b.facilities || []).forEach(f => {
      if (f.name.toLowerCase().includes(lq) || (f.desc || '').toLowerCase().includes(lq))
        matches.push({ name: f.name, sub: b.name, id: b.id, icon: f.icon || 'bi-grid' });
    });
  });

  searchResults.innerHTML = '';
  if (!BUILDINGS.length) {
    searchResults.innerHTML = `<div class="search-no-results"><i class="bi bi-plug"></i> Backend not connected.</div>`;
  } else if (!matches.length) {
    searchResults.innerHTML = `<div class="search-no-results"><i class="bi bi-search"></i> No results for "<strong>${escapeHTML(query)}</strong>"</div>`;
  } else {
    matches.slice(0, 8).forEach(m => {
      const item = document.createElement('div');
      item.className = 'search-result-item';
      item.innerHTML = `<i class="bi ${m.icon} search-result-icon"></i><span class="search-result-name">${highlightMatch(m.name, query)}</span><span class="search-result-building">${escapeHTML(m.sub)}</span>`;
      item.addEventListener('click', () => {
        searchResults.classList.remove('open');
        searchInput.value = '';
        searchClearBtn.classList.remove('visible');
        recordInteraction(m.id);
        zoomToBuilding(m.id);
      });
      searchResults.appendChild(item);
    });
  }
  searchResults.classList.add('open');
}

function highlightMatch(text, query) {
  const re = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return escapeHTML(text).replace(re, '<mark style="background:var(--yellow);padding:0 2px;border-radius:2px;">$1</mark>');
}
function escapeHTML(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

// ── ASSISTANT SEARCH ──────────────────────────────────────────
// Single unified search-bar + dropdown replacing the plain <select>.
// The original <select> stays in DOM (hidden) for value-syncing only.
// Public API: setAssistantBuilding(id), resetAssistant(clearSelect)

/** Build and inject the combo-box UI once on init */
function injectAssistantSearch() {
  const bodyEl = document.querySelector('.assistant-modal-body');
  if (!bodyEl) return;

  // Hide original select field; keep it in DOM for value-tracking
  const origField = bodyEl.querySelector('.assistant-field');
  if (origField) origField.style.display = 'none';

  const wrap = document.createElement('div');
  wrap.className = 'assistant-field';
  wrap.id = 'assistantSearchField';
  wrap.innerHTML = `
    <label class="assistant-label"><i class="bi bi-building"></i> Select Building</label>
    <div class="assistant-search-wrap">
      <div class="asst-combo-box" id="asstComboBox">
        <i class="bi bi-search asst-combo-icon"></i>
        <input
          type="text"
          id="assistantSearchInput"
          class="assistant-search-input"
          placeholder="Search or select a building…"
          autocomplete="off"
          spellcheck="false"
        />
        <i class="bi bi-chevron-down asst-combo-caret" id="asstComboCaret"></i>
      </div>
      <div class="assistant-search-results" id="assistantSearchResults"></div>
    </div>`;

  bodyEl.insertBefore(wrap, bodyEl.firstChild);

  // Wire events once — no duplicate listeners
  const inp   = document.getElementById('assistantSearchInput');
  const res   = document.getElementById('assistantSearchResults');
  const caret = document.getElementById('asstComboCaret');

  inp.addEventListener('focus', () => {
    renderAssistantResults(inp.value);
  });

  inp.addEventListener('input', () => {
    if (!inp.value.trim()) {
      // User cleared input → reset Q&A but keep dropdown open with full list
      resetAssistant(false);
      assistantBuildingSelect.value = '';
    }
    renderAssistantResults(inp.value);
  });

  // Caret toggles the dropdown without stealing focus
  caret.addEventListener('mousedown', e => {
    e.preventDefault();
    if (res.classList.contains('open')) {
      closeAssistantDropdown();
    } else {
      renderAssistantResults(inp.value);
      inp.focus();
    }
  });

  // Close when clicking anywhere outside the search field
  document.addEventListener('click', e => {
    if (!e.target.closest('#assistantSearchField')) {
      closeAssistantDropdown();
    }
  });
}

/** Filter BUILDINGS and paint the dropdown list */
function renderAssistantResults(query) {
  const res = document.getElementById('assistantSearchResults');
  const inp = document.getElementById('assistantSearchInput');
  const caret = document.getElementById('asstComboCaret');
  if (!res || !inp) return;

  const lq = query.toLowerCase().trim();
  const currentId = assistantBuildingSelect.value;

  const filtered = lq
    ? BUILDINGS.filter(b => b.name.toLowerCase().includes(lq))
    : BUILDINGS;

  res.innerHTML = '';

  if (!filtered.length) {
    res.innerHTML = `<div class="asst-no-results"><i class="bi bi-search"></i> No buildings found.</div>`;
  } else {
    filtered.slice(0, 10).forEach(b => {
      const item = document.createElement('div');
      item.className = 'asst-search-item' + (b.id === currentId ? ' selected' : '');

      // Highlight matched portion
      const display = lq
        ? escapeHTML(b.name).replace(
            new RegExp(`(${escapeRegex(lq)})`, 'gi'),
            '<mark class="asst-match">$1</mark>'
          )
        : escapeHTML(b.name);

      item.innerHTML = `<i class="bi bi-building"></i><span>${display}</span>`;

      // mousedown prevents input blur before click fires
      item.addEventListener('mousedown', e => e.preventDefault());
      item.addEventListener('click', () => {
        inp.value = b.name;
        closeAssistantDropdown();
        setAssistantBuilding(b.id);
      });

      res.appendChild(item);
    });
  }

  res.classList.add('open');
  if (caret) caret.classList.add('open');
}

/** Close the assistant dropdown */
function closeAssistantDropdown() {
  const res   = document.getElementById('assistantSearchResults');
  const caret = document.getElementById('asstComboCaret');
  if (res)   res.classList.remove('open');
  if (caret) caret.classList.remove('open');
}

/**
 * setAssistantBuilding(id)
 * Central entry-point — syncs hidden <select>, visible input, then loads Q&A.
 * Called from: "Need Assistance" btn, FAB, sidebar, search results.
 */
function setAssistantBuilding(id) {
  const b = BUILDINGS.find(x => x.id === String(id));
  if (!b) return;

  // Clear previous Q&A before loading new building
  resetAssistant(false);

  assistantBuildingSelect.value = b.id;

  const inp = document.getElementById('assistantSearchInput');
  if (inp) inp.value = b.name;

  loadQuestionsForBuilding(b.id);
}

/** Populate the hidden <select> (used as value store / fallback) */
function populateAssistantSelect() {
  while (assistantBuildingSelect.options.length > 1) assistantBuildingSelect.remove(1);
  BUILDINGS.forEach(b => assistantBuildingSelect.appendChild(new Option(b.name, b.id)));
}

function initAssistant() {
  // Hidden <select> change = fallback sync (e.g. external code sets it directly)
  assistantBuildingSelect.addEventListener('change', e => {
    if (e.target.value) {
      setAssistantBuilding(e.target.value);
    } else {
      resetAssistant(false);
    }
  });

  // Full reset when modal closes
  assistantModalEl.addEventListener('hidden.bs.modal', () => {
    resetAssistant(true);
  });
}

function loadQuestionsForBuilding(id) {
  questionsList.innerHTML = '';
  answerArea.style.display = 'none';
  answerText.textContent = '';
  assistantIdle.style.display = 'none';
  const qs = QA_DATA[id] || [];
  if (!qs.length) {
    questionsList.innerHTML = `<li class="qa-empty">No questions available yet.</li>`;
  } else {
    qs.forEach(qa => {
      const li = document.createElement('li');
      li.className = 'question-item';
      li.innerHTML = `<i class="bi bi-chat-right-dots"></i>${escapeHTML(qa.question)}`;
      li.addEventListener('click', () => {
        questionsList.querySelectorAll('.question-item').forEach(q => q.classList.remove('selected'));
        li.classList.add('selected');
        answerArea.style.display = 'none';
        answerText.textContent = '';
        requestAnimationFrame(() => {
          answerText.textContent = qa.answer;
          answerArea.style.display = 'block';
          answerArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
      });
      questionsList.appendChild(li);
    });
  }
  questionsSection.style.display = 'block';
  updateResetVisibility(); 
}

function resetAssistant(clearSelect = false) {
  questionsList.innerHTML = '';
  answerText.textContent = '';
  answerArea.style.display = 'none';
  questionsSection.style.display = 'none';
  assistantIdle.style.display = 'block';

  if (clearSelect) {
    assistantBuildingSelect.value = '';
    // Also clear the visible combo-box input and close its dropdown
    const inp = document.getElementById('assistantSearchInput');
    if (inp) inp.value = '';
    closeAssistantDropdown();
  }
  updateResetVisibility();
}

// ── RIPPLE ────────────────────────────────────────────────────
function triggerRipple(el) {
  el.querySelectorAll('.ripple').forEach(r => r.remove());
  const r = document.createElement('span');
  r.className = 'ripple';
  el.appendChild(r);
  setTimeout(() => r.remove(), 500);
}

// ── MAP STATUS ────────────────────────────────────────────────
function updateMapStatus(text) {
  mapStatusLabel.innerHTML = `<i class="bi bi-geo-alt-fill"></i> ${text}`;
}