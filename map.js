/* =============================================================
   CAMPUS FACILITIES LOCATOR — map.js
   SVG map rendering, pan/zoom, building highlights
============================================================= */

import { state } from './state.js';

// ── Callbacks (wired by script.js at module load) ─────────────
let _onBuildingClick      = () => {};
let _recordInteraction    = () => {};
let _setDestination       = () => {};
let _setActiveSidebarItem = () => {};

function registerMapCallbacks({ handleBuildingClick, recordInteraction, setDestination, setActiveSidebarItem }) {
  _onBuildingClick      = handleBuildingClick;
  _recordInteraction    = recordInteraction;
  _setDestination       = setDestination;
  _setActiveSidebarItem = setActiveSidebarItem;
}

// ── DOM REFS ──────────────────────────────────────────────────
const mapInner       = document.getElementById('mapInner');
const mapContainer   = document.getElementById('mapContainer');
const mapStatusLabel = document.getElementById('mapStatusLabel');
const mapPlaceholder = document.getElementById('mapPlaceholder');

// ── CACHED SVG + DIMENSIONS ───────────────────────────────────
let _svg = null;
let _vbW = 0, _vbH = 0;
let _cW  = 0, _cH  = 0;

function getSvg() { return _svg || (_svg = mapInner.querySelector('svg')); }

function updateContainerSize() {
  _cW = mapContainer.clientWidth;
  _cH = mapContainer.clientHeight;
}

// ── MOBILE DETECTION ─────────────────────────────────────────
const isMobile = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;

// ── LOW-END DEVICE DETECTION ──────────────────────────────────
const isLowEnd = (
  /Android/i.test(navigator.userAgent) ||
  (navigator.deviceMemory   != null && navigator.deviceMemory   <= 2) ||
  (navigator.hardwareConcurrency != null && navigator.hardwareConcurrency <= 4)
);
if (isLowEnd) document.body.classList.add('low-end-device');

// ── DRAG THRESHOLD ───────────────────────────────────────────
const DRAG_THRESHOLD = 6;
let touchStartX = 0, touchStartY = 0;

// ── ANIMATION STATE ───────────────────────────────────────────
let velX = 0, velY = 0;
let lastMoveTime  = 0;
let inertiaId     = null;
let zoomAnimId    = null;
let _rafPending   = false;
const zoomTarget  = { scale: 1, transX: 0, transY: 0 };

const MAX_VEL = isMobile ? 28 : 60;

function cancelInertia() {
  if (inertiaId) { cancelAnimationFrame(inertiaId); inertiaId = null; }
  velX = 0; velY = 0;
}

function cancelZoomAnim() {
  if (zoomAnimId) { cancelAnimationFrame(zoomAnimId); zoomAnimId = null; }
}

function setWillChange(active) {
  const svg = getSvg();
  if (svg) svg.style.willChange = active ? 'transform' : 'auto';
}

function scheduleApplyTransform() {
  if (_rafPending) return;
  _rafPending = true;
  requestAnimationFrame(() => {
    _rafPending = false;
    applyMapTransform();
  });
}

function startInertia() {
  if (isMobile && Math.abs(velX) < 1.5 && Math.abs(velY) < 1.5) {
    setWillChange(false);
    return;
  }
  const FRICTION = isMobile ? 0.82 : 0.88;
  const MIN_VEL  = 0.4;
  function step() {
    velX *= FRICTION;
    velY *= FRICTION;
    const prevX = state.mapTransX;
    const prevY = state.mapTransY;
    state.mapTransX += velX;
    state.mapTransY += velY;
    applyMapTransform();
    const stuck = Math.abs(state.mapTransX - prevX) < 0.1 &&
                  Math.abs(state.mapTransY - prevY) < 0.1;
    if ((Math.abs(velX) < MIN_VEL && Math.abs(velY) < MIN_VEL) || stuck) {
      inertiaId = null;
      setWillChange(false);
      return;
    }
    inertiaId = requestAnimationFrame(step);
  }
  if (Math.abs(velX) >= MIN_VEL || Math.abs(velY) >= MIN_VEL) {
    inertiaId = requestAnimationFrame(step);
  } else {
    setWillChange(false);
  }
}

function smoothZoomAtPoint(d, px, py) {
  cancelInertia();
  if (!zoomAnimId) {
    zoomTarget.scale  = state.mapScale;
    zoomTarget.transX = state.mapTransX;
    zoomTarget.transY = state.mapTransY;
  }
  const prev = zoomTarget.scale;
  zoomTarget.scale  = Math.min(Math.max(zoomTarget.scale + d, 0.5), 4);
  const ratio = zoomTarget.scale / prev;
  zoomTarget.transX = px - ratio * (px - zoomTarget.transX);
  zoomTarget.transY = py - ratio * (py - zoomTarget.transY);
  setWillChange(true);
  if (!zoomAnimId) animateZoom();
}

function animateZoom() {
  const LERP = isMobile ? 0.25 : 0.2;
  const prevS = state.mapScale;
  const prevX = state.mapTransX;
  const prevY = state.mapTransY;
  state.mapScale  += (zoomTarget.scale  - state.mapScale)  * LERP;
  state.mapTransX += (zoomTarget.transX - state.mapTransX) * LERP;
  state.mapTransY += (zoomTarget.transY - state.mapTransY) * LERP;
  applyMapTransform();
  const moved = Math.abs(state.mapScale  - prevS) > 0.0004 ||
                Math.abs(state.mapTransX - prevX) > 0.06   ||
                Math.abs(state.mapTransY - prevY) > 0.06;
  if (moved) {
    zoomAnimId = requestAnimationFrame(animateZoom);
  } else {
    state.mapScale  = zoomTarget.scale;
    state.mapTransX = zoomTarget.transX;
    state.mapTransY = zoomTarget.transY;
    applyMapTransform();
    zoomAnimId = null;
    setWillChange(false);
  }
}

// ── SVG MAP LOAD ──────────────────────────────────────────────
function handleSVGLoad() {
  fetch('assets/map.svg')
    .then(r => { if (!r.ok) throw new Error(); return r.text(); })
    .then(svgText => {
      if (mapPlaceholder) mapPlaceholder.remove();
      mapInner.innerHTML = svgText;
      _svg = mapInner.querySelector('svg');
      if (!_svg) return;

      _svg.removeAttribute('width');
      _svg.removeAttribute('height');
      _svg.style.display = 'block';
      _svg.style.transformOrigin = '0 0';
      _svg.style.touchAction = 'pan-x pan-y';
      _svg.style.userSelect = 'none';
      _svg.style.webkitUserSelect = 'none';
      if (!_svg.getAttribute('preserveAspectRatio'))
        _svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

      const vb = _svg.viewBox.baseVal;
      _vbW = vb.width;
      _vbH = vb.height;

      updateContainerSize();
      autoFitMap(_svg);
      attachBuildingClickEvents(_svg);
      updateMapStatus('Map loaded — drag to pan, scroll/pinch to zoom.');
    })
    .catch(() => updateMapStatus('Waiting for map.svg…'));
}

function autoFitMap(svg) {
  const vb = svg.viewBox.baseVal;
  if (!vb || vb.width === 0 || vb.height === 0) return;

  svg.style.width  = vb.width  + 'px';
  svg.style.height = vb.height + 'px';

  updateContainerSize();
  const scale = Math.min(_cW / vb.width, _cH / vb.height);
  state.mapScale  = scale;
  state.mapTransX = (_cW - vb.width  * scale) / 2;
  state.mapTransY = (_cH - vb.height * scale) / 2;
  applyMapTransform();
}

let _resizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(_resizeTimer);
  _resizeTimer = setTimeout(() => {
    const prevCW = _cW, prevCH = _cH;
    updateContainerSize();
    const svg = getSvg();
    if (!svg) return;
    if (Math.abs(_cW - prevCW) > 22 || Math.abs(_cH - prevCH) > 22) {
      autoFitMap(svg);
    } else {
      applyMapTransform();
    }
  }, 100);
});

// ── BUILDING CLICK EVENTS ────────────────────────────────────
function attachBuildingClickEvents(svg) {
  const shapes = svg.querySelectorAll('.building-shape');

  shapes.forEach(el => {
    el.style.cursor = 'pointer';
    el.style.pointerEvents = 'bounding-box';

    function handleTap() {
      cancelInertia();
      cancelZoomAnim();
      if (state.wasDragging) return;

      const svgId = el.id.trim().toUpperCase();
      const building = state.BUILDINGS.find(b => b.svgId === svgId);

      clearHighlights(svg);
      highlightAllShapes(svg, building ? building.svgId : svgId);

      if (!building) return;

      _recordInteraction(building.id);

      if (state.isPickingDestination) {
        _setDestination(building.id);
        return;
      }

      _onBuildingClick(building.id);
    }

    el.addEventListener('touchend', e => {
      e.preventDefault();
      handleTap();
    }, { passive: false });

    el.addEventListener('click', e => {
      e.stopPropagation();
      handleTap();
    });
  });
}

// ── MAP CONTROLS ──────────────────────────────────────────────
function initMapControls() {
  document.getElementById('zoomInBtn').addEventListener('click', () => {
    smoothZoomAtPoint(0.18, _cW / 2, _cH / 2);
  });
  document.getElementById('zoomOutBtn').addEventListener('click', () => {
    smoothZoomAtPoint(-0.18, _cW / 2, _cH / 2);
  });
  document.getElementById('resetViewBtn').addEventListener('click', resetView);

  mapContainer.addEventListener('wheel', e => {
    e.preventDefault();
    const rect = mapContainer.getBoundingClientRect();
    smoothZoomAtPoint(e.deltaY < 0 ? 0.13 : -0.13, e.clientX - rect.left, e.clientY - rect.top);
  }, { passive: false });

  // ── Mouse drag ──
  mapContainer.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    cancelInertia();
    cancelZoomAnim();
    state.isDragging  = true;
    state.wasDragging = false;
    state.dragStart   = { x: e.clientX - state.mapTransX, y: e.clientY - state.mapTransY };
    touchStartX = e.clientX;
    touchStartY = e.clientY;
    velX = 0; velY = 0;
    lastMoveTime = performance.now();
    mapContainer.style.cursor = 'grabbing';
    setWillChange(true);
    e.preventDefault();
  });

  window.addEventListener('mousemove', e => {
    if (!state.isDragging) return;
    const now  = performance.now();
    const dt   = now - lastMoveTime;
    const newX = e.clientX - state.dragStart.x;
    const newY = e.clientY - state.dragStart.y;
    if (dt > 0 && dt < 100) {
      velX = Math.max(-MAX_VEL, Math.min(MAX_VEL, (newX - state.mapTransX) / dt * 16));
      velY = Math.max(-MAX_VEL, Math.min(MAX_VEL, (newY - state.mapTransY) / dt * 16));
    } else if (dt >= 100) {
      velX = 0; velY = 0;
    }
    lastMoveTime = now;
    if (!state.wasDragging && Math.hypot(e.clientX - touchStartX, e.clientY - touchStartY) > DRAG_THRESHOLD) {
      state.wasDragging = true;
    }
    state.mapTransX = newX;
    state.mapTransY = newY;
    scheduleApplyTransform();
  });

  window.addEventListener('mouseup', () => {
    if (!state.isDragging) return;
    state.isDragging = false;
    mapContainer.style.cursor = 'grab';
    setTimeout(() => { state.wasDragging = false; }, 50);
    startInertia();
  });

  // ── Touch ──
  mapContainer.addEventListener('touchstart', e => {
    if (e.touches.length > 1) e.preventDefault();
    cancelInertia();
    if (e.touches.length === 1) {
      state.isDragging    = true;
      state.wasDragging   = false;
      state.lastTouchDist = null;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      state.dragStart = {
        x: e.touches[0].clientX - state.mapTransX,
        y: e.touches[0].clientY - state.mapTransY,
      };
      velX = 0; velY = 0;
      lastMoveTime = performance.now();
      setWillChange(true);
    } else if (e.touches.length === 2) {
      state.isDragging    = false;
      state.wasDragging   = true;
      state.lastTouchDist = touchDist(e.touches);
    }
  }, { passive: false });

  mapContainer.addEventListener('touchmove', e => {
    if (state.isDragging || e.touches.length > 1) e.preventDefault();
    if (e.touches.length === 1 && state.isDragging) {
      const now  = performance.now();
      const dt   = now - lastMoveTime;
      const newX = e.touches[0].clientX - state.dragStart.x;
      const newY = e.touches[0].clientY - state.dragStart.y;
      if (dt > 0 && dt < 100) {
        velX = Math.max(-MAX_VEL, Math.min(MAX_VEL, (newX - state.mapTransX) / dt * 16));
        velY = Math.max(-MAX_VEL, Math.min(MAX_VEL, (newY - state.mapTransY) / dt * 16));
      } else if (dt >= 100) {
        velX = 0; velY = 0;
      }
      lastMoveTime = now;
      if (!state.wasDragging && Math.hypot(e.touches[0].clientX - touchStartX, e.touches[0].clientY - touchStartY) > DRAG_THRESHOLD) {
        state.wasDragging = true;
      }
      state.mapTransX = newX;
      state.mapTransY = newY;
      scheduleApplyTransform();
    } else if (e.touches.length === 2 && state.lastTouchDist !== null) {
      const nd   = touchDist(e.touches);
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const rect = mapContainer.getBoundingClientRect();
      zoomAtPoint((nd / state.lastTouchDist - 1) * state.mapScale * 0.6, midX - rect.left, midY - rect.top);
      state.lastTouchDist = nd;
    }
  }, { passive: false });

  mapContainer.addEventListener('touchend', e => {
    if (e.touches.length === 0) {
      state.isDragging    = false;
      state.lastTouchDist = null;
      setTimeout(() => { state.wasDragging = false; }, 80);
      startInertia();
    } else if (e.touches.length === 1) {
      state.lastTouchDist = null;
      state.isDragging    = true;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      state.dragStart = {
        x: e.touches[0].clientX - state.mapTransX,
        y: e.touches[0].clientY - state.mapTransY,
      };
      velX = 0; velY = 0;
      lastMoveTime = performance.now();
    }
  }, { passive: false });
}

function touchDist(t) { return Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY); }

function zoomAtPoint(d, px, py) {
  const prev = state.mapScale;
  state.mapScale = Math.min(Math.max(state.mapScale + d, 0.5), 4);
  const ratio = state.mapScale / prev;
  state.mapTransX = px - ratio * (px - state.mapTransX);
  state.mapTransY = py - ratio * (py - state.mapTransY);
  scheduleApplyTransform();
}

function clampTransform() {
  if (!_vbW) return;

  const svgW = _vbW * state.mapScale;
  const svgH = _vbH * state.mapScale;
  const minOverlap = 80;

  const minX = minOverlap - svgW;
  const maxX = _cW - minOverlap;
  const minY = minOverlap - svgH;
  const maxY = _cH - minOverlap;

  state.mapTransX = minX > maxX ? (_cW - svgW) / 2 : Math.max(minX, Math.min(maxX, state.mapTransX));
  state.mapTransY = minY > maxY ? (_cH - svgH) / 2 : Math.max(minY, Math.min(maxY, state.mapTransY));
}

function applyMapTransform() {
  clampTransform();
  const svg = getSvg();
  if (svg) svg.style.transform = `translate3d(${state.mapTransX}px,${state.mapTransY}px,0) scale(${state.mapScale})`;
}

function resetView() {
  const svg = getSvg();
  if (!svg) return;
  svg.style.transition = 'transform 0.38s cubic-bezier(0.4,0,0.2,1)';
  autoFitMap(svg);
  setTimeout(() => { svg.style.transition = ''; }, 400);
}

// ── ZOOM TO BUILDING ──────────────────────────────────────────
function zoomToBuilding(id) {
  const svg = getSvg();
  if (!svg) return;

  const building = state.BUILDINGS.find(b => b.id === id);
  if (!building) return;

  const shapes = getAllBuildingShapes(svg, building.svgId);
  if (!shapes.length) return;

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

  const TARGET_SCALE = 2.2;

  state.mapScale  = TARGET_SCALE;
  state.mapTransX = _cW / 2 - centerX * TARGET_SCALE;
  state.mapTransY = _cH / 2 - centerY * TARGET_SCALE;

  svg.style.transition = 'transform 0.4s ease';
  applyMapTransform();

  setTimeout(() => { svg.style.transition = ''; }, 400);

  clearHighlights(svg);
  shapes.forEach(s => s.classList.add('highlighted'));

  _setActiveSidebarItem(id);
  state.currentBuildingId = id;
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

// ── BUILDING HIGHLIGHT ────────────────────────────────────────
function highlightBuilding(id) {
  const svg = getSvg();
  if (!svg) return;
  const b = state.BUILDINGS.find(x => x.id === id);
  if (!b) return;
  clearHighlights(svg);
  highlightAllShapes(svg, b.svgId);
}

// ── MAP STATUS ────────────────────────────────────────────────
function updateMapStatus(text) {
  mapStatusLabel.innerHTML = `<i class="bi bi-geo-alt-fill"></i> ${text}`;
}

// ── EXPORTS ───────────────────────────────────────────────────
export {
  registerMapCallbacks,
  handleSVGLoad,
  initMapControls,
  zoomToBuilding,
  getAllBuildingShapes,
  getUnifiedBBox,
  updateMapStatus,
  applyMapTransform,
  mapInner,
  mapContainer,
};
