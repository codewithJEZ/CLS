import { state } from '../state.js';
import { zoomToBuilding } from '../map.js';
import { recordInteraction } from './interaction.js';

// ── DOM refs ──────────────────────────────────────────────────
const facilityList       = document.getElementById('facilityList');
const facilityFilter     = document.getElementById('facilityFilter');
const sidebar            = document.getElementById('sidebar');
const sidebarCollapseBtn = document.getElementById('sidebarCollapseBtn');
const sidebarTab         = document.getElementById('sidebarTab');

// ── Callback registry (avoids circular import with script.js) ─
let _escapeHTML        = s => String(s);
let _triggerRipple     = () => {};
let _openBuildingModal = () => {};

export function registerSidebarCallbacks({ escapeHTML, triggerRipple, openBuildingModal }) {
  _escapeHTML        = escapeHTML;
  _triggerRipple     = triggerRipple;
  _openBuildingModal = openBuildingModal;
}

// ── Private helper ────────────────────────────────────────────
/** loadInteractionScores — alias for visitCounts (localStorage) */
function loadInteractionScores() {
  return state.visitCounts;
}

// ── Exported functions ────────────────────────────────────────

/**
 * getSidebarBuildingList(filter)
 * Admin-featured always first, then visited (>=3 times) buildings.
 * Within groups, sorted by local visit score desc.
 */
export function getSidebarBuildingList(filter) {
  const q = (filter || '').toLowerCase().trim();
  const scores = loadInteractionScores();
  const featured = state.BUILDINGS.filter(b => b.recommended);
  const nonFeatured = state.BUILDINGS.filter(b => !b.recommended);
  const promoted = nonFeatured.filter(b => (scores[b.id] || 0) >= 3);
  const sortByScore = (a, b) => (scores[b.id] || 0) - (scores[a.id] || 0);
  const merged = [...featured.sort(sortByScore), ...promoted.sort(sortByScore)];
  if (!q) return merged;
  return merged.filter(b =>
    b.name.toLowerCase().includes(q) ||
    (b.facilities || []).some(f => f.name.toLowerCase().includes(q))
  );
}

export function getSmartRecommended() {
  const ADMIN_LIMIT = 3;   // pwede mo gawing 4 or 5
  const USER_LIMIT  = 4;   // pwede mo gawing 4 or 5

  // ⭐ Admin recommended (priority)
  const admin = state.BUILDINGS
    .filter(b => b.recommended)
    .slice(0, ADMIN_LIMIT);

  // 🔥 User-based (visits >= 2)
  const dynamic = state.BUILDINGS
    .filter(b => (state.visitCounts[b.id] || 0) >= 2)
    .sort((a, b) => (state.visitCounts[b.id] || 0) - (state.visitCounts[a.id] || 0))
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
export function buildSidebarBuildingList(filter) {
  facilityList.innerHTML = '';

  const scores = state.visitCounts;

  // 👉 SMART LIST LOGIC
  let list;
  if (!filter) {
    list = getSmartRecommended(); // smart recommended
  } else {
    list = getSidebarBuildingList(filter); // normal search
  }

  // ❌ no backend
  if (!state.BUILDINGS.length) {
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
        <div class="facility-item-name">${_escapeHTML(b.name)}</div>
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
      _triggerRipple(li);

      facilityList.querySelectorAll('.facility-list-item')
        .forEach(x => x.classList.remove('active'));

      li.classList.add('active');

      // 🔥 record visit
      recordInteraction(b.id);

      // 🎯 zoom + modal
      zoomToBuilding(b.id);
      setTimeout(() => _openBuildingModal(b), 420);
    });

    facilityList.appendChild(li);
  });
}

export function initSidebar() {
  sidebarCollapseBtn.addEventListener('click', () => { sidebar.classList.add('collapsed'); sidebarTab.classList.add('visible'); });
  sidebarTab.addEventListener('click', () => { sidebar.classList.remove('collapsed'); sidebarTab.classList.remove('visible'); });
  facilityFilter.addEventListener('input', e => buildSidebarBuildingList(e.target.value));
}

export function setActiveSidebarItem(id) {
  facilityList.querySelectorAll('.facility-list-item')
    .forEach(item => item.classList.toggle('active', item.dataset.buildingId === id));
  const active = facilityList.querySelector(`[data-building-id="${id}"]`);
  if (active) active.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
