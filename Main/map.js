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

// ── ANIMATION STATE ───────────────────────────────────────────
let velX = 0, velY = 0;          // drag velocity (px / frame at 60 fps)
let lastMoveTime  = 0;            // timestamp of last pointer-move sample
let inertiaId     = null;         // rAF handle — inertia coasting loop
let zoomAnimId    = null;         // rAF handle — smooth zoom loop
const zoomTarget  = { scale: 1, transX: 0, transY: 0 }; // zoom destination

function cancelInertia() {
  if (inertiaId) { cancelAnimationFrame(inertiaId); inertiaId = null; }
  velX = 0; velY = 0;
}

function cancelZoomAnim() {
  if (zoomAnimId) { cancelAnimationFrame(zoomAnimId); zoomAnimId = null; }
}

function setWillChange(active) {
  const svg = mapInner.querySelector('svg');
  if (svg) svg.style.willChange = active ? 'transform' : 'auto';
}

// Momentum coasting after a drag release
function startInertia() {
  const FRICTION = 0.88;
  const MIN_VEL  = 0.4;
  function step() {
    velX *= FRICTION;
    velY *= FRICTION;
    const prevX = state.mapTransX;
    const prevY = state.mapTransY;
    state.mapTransX += velX;
    state.mapTransY += velY;
    applyMapTransform();
    // Stop when slow enough OR when clamping absorbed movement (hit a wall)
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

// Smooth zoom: accumulate the destination across wheel ticks, lerp toward it each frame.
// Each wheel event shifts zoomTarget further; the animation chases it — this is what
// makes fast scroll feel fluid instead of stepping.
function smoothZoomAtPoint(d, px, py) {
  cancelInertia();
  if (!zoomAnimId) {            // seed targets from live state
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
  const LERP = 0.2;
  const prevS = state.mapScale;
  const prevX = state.mapTransX;
  const prevY = state.mapTransY;
  state.mapScale  += (zoomTarget.scale  - state.mapScale)  * LERP;
  state.mapTransX += (zoomTarget.transX - state.mapTransX) * LERP;
  state.mapTransY += (zoomTarget.transY - state.mapTransY) * LERP;
  applyMapTransform();   // clamps state.mapTransX/Y in-place
  // Convergence check: stop when state barely moves (either close to target,
  // or pinned to a clamp wall — both register as "done")
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

  // Set SVG to render at exactly viewBox pixel dimensions (1px per viewBox unit).
  // Without this, an absolutely-positioned SVG with no width/height attributes
  // renders at browser-default size (e.g. 300×150), making the scale math wrong.
  svg.style.width  = vb.width  + 'px';
  svg.style.height = vb.height + 'px';

  const cW = mapContainer.clientWidth;
  const cH = mapContainer.clientHeight;
  const scale = Math.min(cW / vb.width, cH / vb.height);
  state.mapScale  = scale;
  state.mapTransX = (cW - vb.width  * scale) / 2;
  state.mapTransY = (cH - vb.height * scale) / 2;
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
      if (state.wasDragging) return;
      const svgId = el.id.trim().toUpperCase();
      const building = state.BUILDINGS.find(b => b.svgId === svgId);
      console.log('SVG click:', el.id, '→', building ? building.name : 'NOT FOUND');
      clearHighlights(svg);
      highlightAllShapes(svg, building ? building.svgId : svgId);
      if (!building) { console.warn(`No DB match for SVG id="${el.id}"`); return; }
      _recordInteraction(building.id);

      // ── If user is picking a destination, intercept normal flow ──
      if (state.isPickingDestination) {
        _setDestination(building.id);
        return;   // skip normal modal
      }

      _onBuildingClick(building.id);
    });
  });
}

// ── MAP CONTROLS ──────────────────────────────────────────────
function initMapControls() {
  // Zoom buttons: smooth animated zoom toward container center
  document.getElementById('zoomInBtn').addEventListener('click', () => {
    const r = mapContainer.getBoundingClientRect();
    smoothZoomAtPoint(0.18, r.width / 2, r.height / 2);
  });
  document.getElementById('zoomOutBtn').addEventListener('click', () => {
    const r = mapContainer.getBoundingClientRect();
    smoothZoomAtPoint(-0.18, r.width / 2, r.height / 2);
  });
  document.getElementById('resetViewBtn').addEventListener('click', resetView);

  // Wheel: each tick shifts zoomTarget further; animation catches up smoothly
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
    // Track velocity; ignore stale samples (lag spike or user paused)
    if (dt > 0 && dt < 100) {
      velX = (newX - state.mapTransX) / dt * 16;
      velY = (newY - state.mapTransY) / dt * 16;
    } else if (dt >= 100) {
      velX = 0; velY = 0;    // paused → no coasting
    }
    lastMoveTime      = now;
    state.wasDragging = true;
    state.mapTransX   = newX;
    state.mapTransY   = newY;
    applyMapTransform();
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
    e.preventDefault();
    cancelInertia();
    if (e.touches.length === 1) {
      state.isDragging    = true;
      state.wasDragging   = false;
      state.lastTouchDist = null;
      state.dragStart = {
        x: e.touches[0].clientX - state.mapTransX,
        y: e.touches[0].clientY - state.mapTransY,
      };
      velX = 0; velY = 0;
      lastMoveTime = performance.now();
      setWillChange(true);
    } else if (e.touches.length === 2) {
      state.isDragging    = false;
      state.lastTouchDist = touchDist(e.touches);
    }
  }, { passive: false });

  mapContainer.addEventListener('touchmove', e => {
    e.preventDefault();
    if (e.touches.length === 1 && state.isDragging) {
      const now  = performance.now();
      const dt   = now - lastMoveTime;
      const newX = e.touches[0].clientX - state.dragStart.x;
      const newY = e.touches[0].clientY - state.dragStart.y;
      if (dt > 0 && dt < 100) {
        velX = (newX - state.mapTransX) / dt * 16;
        velY = (newY - state.mapTransY) / dt * 16;
      } else if (dt >= 100) {
        velX = 0; velY = 0;
      }
      lastMoveTime      = now;
      state.wasDragging = true;
      state.mapTransX   = newX;
      state.mapTransY   = newY;
      applyMapTransform();
    } else if (e.touches.length === 2 && state.lastTouchDist !== null) {
      const nd   = touchDist(e.touches);
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const rect = mapContainer.getBoundingClientRect();
      // Pinch: direct update — follows fingers without smoothing lag
      zoomAtPoint((nd / state.lastTouchDist - 1) * state.mapScale * 0.6, midX - rect.left, midY - rect.top);
      state.lastTouchDist = nd;
    }
  }, { passive: false });

  mapContainer.addEventListener('touchend', e => {
    if (e.touches.length === 0) {
      state.isDragging    = false;
      state.lastTouchDist = null;
      setTimeout(() => { state.wasDragging = false; }, 50);
      startInertia();
    } else if (e.touches.length === 1) {
      state.lastTouchDist = null;
      state.isDragging    = true;
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

// Direct (non-animated) zoom — pinch gestures only; smoothing would fight the fingers
function zoomAtPoint(d, px, py) {
  const prev = state.mapScale;
  state.mapScale = Math.min(Math.max(state.mapScale + d, 0.5), 4);
  const ratio = state.mapScale / prev;
  state.mapTransX = px - ratio * (px - state.mapTransX);
  state.mapTransY = py - ratio * (py - state.mapTransY);
  applyMapTransform();
}

// Clamp mapTransX/Y so the map always keeps minOverlap pixels visible in the container.
function clampTransform() {
  const svg = mapInner.querySelector('svg');
  if (!svg) return;
  const vb = svg.viewBox.baseVal;
  if (!vb || vb.width === 0) return;

  const cW = mapContainer.clientWidth;
  const cH = mapContainer.clientHeight;
  const svgW = vb.width  * state.mapScale;
  const svgH = vb.height * state.mapScale;
  const minOverlap = 80; // px of map that must remain visible inside the container

  state.mapTransX = Math.max(minOverlap - svgW, Math.min(cW - minOverlap, state.mapTransX));
  state.mapTransY = Math.max(minOverlap - svgH, Math.min(cH - minOverlap, state.mapTransY));
}

function applyMapTransform() {
  clampTransform();
  const svg = mapInner.querySelector('svg');
  if (svg) svg.style.transform = `translate(${state.mapTransX}px,${state.mapTransY}px) scale(${state.mapScale})`;
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

  const building = state.BUILDINGS.find(b => b.id === id);
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

  state.mapScale = TARGET_SCALE;
  state.mapTransX = vpW / 2 - centerX * TARGET_SCALE;
  state.mapTransY = vpH / 2 - centerY * TARGET_SCALE;

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

// ── BUILDING CLICK ────────────────────────────────────────────
function highlightBuilding(id) {
  const svg = mapInner.querySelector('svg');
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
  clearHighlights,
  highlightAllShapes,
  highlightBuilding,
  updateMapStatus,
  applyMapTransform,
  mapInner,
  mapContainer,
};
