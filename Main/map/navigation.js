import { state } from '../state.js';
import {
  mapInner,
  mapContainer,
  getAllBuildingShapes,
  getUnifiedBBox,
  updateMapStatus,
  applyMapTransform,
} from '../map.js';
import { getRoadWaypoints, ROAD_NODES, ROAD_EDGE_LIST } from './roads.js';

window.findPath = findPath;
window.drawPath = drawRoute;

// ── Callback registry (avoids circular import with script.js) ─
let _escapeHTML          = s => String(s);
let _handleBuildingClick = () => {};

export function registerNavigationCallbacks({ escapeHTML, handleBuildingClick }) {
  _escapeHTML          = escapeHTML;
  _handleBuildingClick = handleBuildingClick;
}

// ═════════════════════════════════════════════════════════════
// PATHFINDING — Dijkstra shortest path on ROAD_NODES graph
// ═════════════════════════════════════════════════════════════

export function findPath(startId, endId) {
  if (startId === endId) return [startId];
  if (!ROAD_NODES[startId] || !ROAD_NODES[endId]) return null;

  const dist    = {};
  const prev    = {};
  const visited = new Set();
  const pq      = [];

  for (const n of Object.keys(ROAD_NODES)) dist[n] = Infinity;
  dist[startId] = 0;
  pq.push([0, startId]);

  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, curr] = pq.shift();

    if (visited.has(curr)) continue;
    visited.add(curr);
    if (curr === endId) break;

    for (const nb of (ROAD_EDGE_LIST[curr] || [])) {
      if (visited.has(nb)) continue;
      const c = ROAD_NODES[curr], n = ROAD_NODES[nb];
      const alt = d + Math.hypot(n.x - c.x, n.y - c.y);
      if (alt < dist[nb]) {
        dist[nb] = alt;
        prev[nb] = curr;
        pq.push([alt, nb]);
      }
    }
  }

  const path = [];
  let node = endId;
  while (node !== undefined) { path.unshift(node); node = prev[node]; }
  return path[0] === startId ? path : null;
}

// ═════════════════════════════════════════════════════════════
// NAVIGATION — Start / Destination / Route Drawing
// ═════════════════════════════════════════════════════════════

/**
 * setStartBuilding(id)
 * Saves the chosen building as the START point.
 * Clears any existing route and enters "pick destination" mode.
 */
export function setStartBuilding(id) {
  state.startBuildingId       = id;
  state.destinationBuildingId = null;
  state.isPickingDestination  = true;

  clearRoute();

  const b = state.BUILDINGS.find(x => x.id === id);
  updateMapStatus(`📍 Start: ${b ? b.name : id} — Now click a destination building`);
  showNavToast(`Start set: ${b ? b.name : id}. Now click your destination on the map.`);

  // Show the nav banner so user knows what to do next
  showNavBanner(b ? b.name : id);
}

/**
 * setDestination(id)
 * Saves the chosen building as the DESTINATION.
 * Automatically draws the route from start → destination.
 */
export function setDestination(id) {
  if (!state.startBuildingId) {
    showNavToast('Please set a starting point first.');
    _handleBuildingClick(id);   // open normal modal instead
    return;
  }
  if (id === state.startBuildingId) {
    showNavToast('Destination must be different from the starting point.');
    return;
  }

  state.destinationBuildingId = id;
  state.isPickingDestination  = false;

  const dest = state.BUILDINGS.find(x => x.id === id);
  hideNavBanner();
  drawRoute(state.startBuildingId, state.destinationBuildingId);
  updateMapStatus(`🗺 Route: ${state.BUILDINGS.find(x=>x.id===state.startBuildingId)?.name} → ${dest?.name}`);
}








/**
 * drawRoute(startId, destId)
 * ════════════════════════════════════════════════════════════
 * Draws a road-following polyline between two buildings using
 * Dijkstra pathfinding on ROAD_NODES/ROAD_GRAPH.
 * Falls back to straight line if building not in BUILDING_ENTRIES.
 * Route drawn on <g id="routeOverlay"> — SVG never modified.
 *
 * Color:
 *   Blue  (#3b82f6) = graph-routed road path  ✓
 *   Gold  (#F6AC02) = straight-line fallback
 * ════════════════════════════════════════════════════════════
 */
export function drawRoute(startId, destId) {
  const svg = mapInner.querySelector('svg');
  if (!svg) return;

  clearRoute();

  const startB = state.BUILDINGS.find(x => x.id === startId);
  const destB  = state.BUILDINGS.find(x => x.id === destId);
  if (!startB || !destB) return;

  const startCenter = getBuildingCenter(svg, startB.svgId);
  const destCenter  = getBuildingCenter(svg, destB.svgId);
  if (!startCenter || !destCenter) {
    showNavToast('Could not find building shapes in SVG.');
    return;
  }

  // Try graph routing first
  const roadWaypoints = getRoadWaypoints(startB.svgId, destB.svgId);
  const usedGraph = !!roadWaypoints;

  // Full point array: building center → exit → road → exit → building center
  const allPoints = usedGraph
    ? [startCenter, ...roadWaypoints, destCenter]
    : [startCenter, destCenter];

  const pointsStr = allPoints.map(p => `${p.x},${p.y}`).join(' ');

  // ── Build SVG overlay ────────────────────────────────────
  const NS = 'http://www.w3.org/2000/svg';
  const overlay = document.createElementNS(NS, 'g');
  overlay.id = 'routeOverlay';

  // Shadow (behind main line)
  const shadow = document.createElementNS(NS, 'polyline');
  shadow.setAttribute('points', pointsStr);
  shadow.setAttribute('stroke', 'rgba(0,0,0,0.22)');
  shadow.setAttribute('stroke-width', '11');
  shadow.setAttribute('stroke-linejoin', 'round');
  shadow.setAttribute('stroke-linecap', 'round');
  shadow.setAttribute('fill', 'none');

  // Animated dashed route line
  const line = document.createElementNS(NS, 'polyline');
  line.setAttribute('points', pointsStr);
  line.setAttribute('stroke', usedGraph ? '#3b82f6' : '#F6AC02');
  line.setAttribute('stroke-width', '5');
  line.setAttribute('stroke-linejoin', 'round');
  line.setAttribute('stroke-linecap', 'round');
  line.setAttribute('stroke-dasharray', '14 8');
  line.setAttribute('fill', 'none');
  line.setAttribute('class', 'route-line-animated');

  // Road node dots on each bend (only for graph-routed paths)
  if (usedGraph && roadWaypoints.length > 2) {
    // Skip the first (exitA) and last (exitB) dots — too close to markers
    roadWaypoints.slice(1, -1).forEach(pt => {
      const dot = document.createElementNS(NS, 'circle');
      dot.setAttribute('cx', pt.x); dot.setAttribute('cy', pt.y);
      dot.setAttribute('r', '4');
      dot.setAttribute('fill', '#93c5fd');
      dot.setAttribute('stroke', '#fff');
      dot.setAttribute('stroke-width', '1.5');
      overlay.appendChild(dot);
    });
  }

  // Start marker — green S
  const startDot = document.createElementNS(NS, 'circle');
  startDot.setAttribute('cx', startCenter.x); startDot.setAttribute('cy', startCenter.y);
  startDot.setAttribute('r', '13'); startDot.setAttribute('fill', '#22c55e');
  startDot.setAttribute('stroke', '#fff'); startDot.setAttribute('stroke-width', '3');

  const startLbl = document.createElementNS(NS, 'text');
  startLbl.setAttribute('x', startCenter.x); startLbl.setAttribute('y', startCenter.y + 5);
  startLbl.setAttribute('text-anchor', 'middle'); startLbl.setAttribute('font-size', '13');
  startLbl.setAttribute('font-weight', 'bold'); startLbl.setAttribute('fill', '#fff');
  startLbl.textContent = 'S';

  // Dest marker — red D
  const destDot = document.createElementNS(NS, 'circle');
  destDot.setAttribute('cx', destCenter.x); destDot.setAttribute('cy', destCenter.y);
  destDot.setAttribute('r', '13'); destDot.setAttribute('fill', '#ef4444');
  destDot.setAttribute('stroke', '#fff'); destDot.setAttribute('stroke-width', '3');

  const destLbl = document.createElementNS(NS, 'text');
  destLbl.setAttribute('x', destCenter.x); destLbl.setAttribute('y', destCenter.y + 5);
  destLbl.setAttribute('text-anchor', 'middle'); destLbl.setAttribute('font-size', '13');
  destLbl.setAttribute('font-weight', 'bold'); destLbl.setAttribute('fill', '#fff');
  destLbl.textContent = 'D';

  overlay.appendChild(shadow);
  overlay.appendChild(line);
  overlay.appendChild(startDot); overlay.appendChild(startLbl);
  overlay.appendChild(destDot);  overlay.appendChild(destLbl);
  svg.appendChild(overlay);

  injectRouteStyles();
  fitRouteInView(svg, allPoints);

  if (usedGraph) {
    showNavToast(`Route: ${startB.name} → ${destB.name}`);
  } else {
    showNavToast(`⚠ Building not in road map — showing straight line`);
  }

  showClearRouteBtn();
}

export function clearRoute() {
  const overlay = document.getElementById('routeOverlay');
  if (overlay) overlay.remove();
  hideClearRouteBtn();
}

/**
 * resetNavigation()
 * Full reset — clears route and all nav state.
 */
export function resetNavigation() {
  clearRoute();
  state.startBuildingId       = null;
  state.destinationBuildingId = null;
  state.isPickingDestination  = false;
  hideNavBanner();
  updateMapStatus('Map loaded — drag to pan, scroll/pinch to zoom.');
}

// ─────────────────────────────────────────────────────────────
// NAV HELPERS
// ──────────────���──────────────────────────────────────────────

/**
 * getBuildingCenter(svg, svgId)
 * Returns { x, y } center of a building in SVG coordinate space.
 * Handles buildings with multiple shapes (unified bounding box).
 */
function getBuildingCenter(svg, svgId) {
  const shapes = getAllBuildingShapes(svg, svgId);
  if (!shapes.length) return null;
  const bbox = getUnifiedBBox(shapes);
  if (!isFinite(bbox.x)) return null;
  return {
    x: bbox.x + bbox.width  / 2,
    y: bbox.y + bbox.height / 2
  };
}

/**
 * fitRouteInView(svg, points)
 * Zooms and pans to fit the entire route (all waypoints) in the viewport.
 * Works with any number of points — much better than fitBothBuildings
 * because it accounts for bends in the road, not just start and end.
 *
 * @param {SVGElement} svg
 * @param {Array<{x,y}>} points - all points on the route including start/dest
 */
function fitRouteInView(svg, points) {
  if (!points.length) return;

  const vb     = svg.viewBox.baseVal;
  const availW = mapContainer.clientWidth;
  const availH = mapContainer.clientHeight;

  // Convert 1 SVG unit → screen pixels at scale=1
  const unitPx = Math.min(availW / vb.width, availH / vb.height);

  // Find bounding box of all route points
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  points.forEach(p => {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  });

  const midX   = (minX + maxX) / 2 * unitPx;
  const midY   = (minY + maxY) / 2 * unitPx;
  const spanW  = (maxX - minX) * unitPx;
  const spanH  = (maxY - minY) * unitPx;

  // Scale so the route fits with 20% padding on each side
  const PADDING = 0.65;  // use 65% of viewport for the route
  const scaleW  = (availW * PADDING) / (spanW  || 1);
  const scaleH  = (availH * PADDING) / (spanH || 1);
  const TARGET  = Math.min(Math.max(Math.min(scaleW, scaleH), 0.6), 3.0);

  svg.style.transition = 'transform 0.6s cubic-bezier(0.4,0,0.2,1)';
  state.mapScale  = TARGET;
  state.mapTransX = availW / 2 - midX * TARGET;
  state.mapTransY = availH / 2 - midY * TARGET;
  applyMapTransform();
  setTimeout(() => { svg.style.transition = ''; }, 650);
}

/**
 * injectRouteStyles()
 * Injects the CSS animation for the dashed route line once per page.
 */
function injectRouteStyles() {
  if (document.getElementById('routeStyles')) return;   // already injected
  const style = document.createElement('style');
  style.id = 'routeStyles';
  style.textContent = `
    @keyframes routeDash {
      to { stroke-dashoffset: -52; }
    }
    .route-line-animated {
      animation: routeDash 1.1s linear infinite;
    }
  `;
  document.head.appendChild(style);
}

// ── NAV TOAST ─────────────────────────────────────────────────
/** Shows a short toast message specifically for navigation events */
function showNavToast(msg) {
  let toast = document.getElementById('navToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'navToast';
    toast.style.cssText = `
      position:fixed; bottom:80px; left:50%; transform:translateX(-50%);
      background:#1f2937; color:#fff; padding:10px 20px; border-radius:50px;
      font-size:.83rem; font-weight:600; z-index:9999; white-space:nowrap;
      box-shadow:0 4px 16px rgba(0,0,0,.3); opacity:0;
      transition:opacity .25s ease; pointer-events:none;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { toast.style.opacity = '0'; }, 3000);
}

// ── NAV BANNER ────────────────────────────────────────────────
/** Top banner shown while waiting for destination selection */
function showNavBanner(startName) {
  let banner = document.getElementById('navBanner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'navBanner';
    banner.style.cssText = `
      position:fixed; top:64px; left:50%; transform:translateX(-50%);
      background:linear-gradient(135deg,#7B1D1E,#a83232);
      color:#fff; padding:9px 20px 9px 16px; border-radius:50px;
      font-size:.82rem; font-weight:600; z-index:9998; display:flex;
      align-items:center; gap:10px; box-shadow:0 4px 18px rgba(0,0,0,.25);
      animation: bannerIn .3s ease;
    `;
    const style = document.createElement('style');
    style.textContent = `@keyframes bannerIn { from{opacity:0;top:50px} to{opacity:1;top:64px} }`;
    document.head.appendChild(style);

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = '✕ Cancel';
    cancelBtn.style.cssText = `
      background:rgba(255,255,255,.18); border:none; color:#fff;
      padding:3px 10px; border-radius:20px; font-size:.75rem;
      cursor:pointer; margin-left:6px; font-weight:600;
    `;
    cancelBtn.addEventListener('click', resetNavigation);
    banner.innerHTML = `<i class="bi bi-geo-fill" style="color:#4ade80"></i>
      <span>Start: <strong>${_escapeHTML(startName)}</strong> — click destination on map</span>`;
    banner.appendChild(cancelBtn);
    document.body.appendChild(banner);
  } else {
    banner.querySelector('span').innerHTML =
      `Start: <strong>${_escapeHTML(startName)}</strong> — click destination on map`;
    banner.style.display = 'flex';
  }
}

function hideNavBanner() {
  const banner = document.getElementById('navBanner');
  if (banner) banner.style.display = 'none';
}

// ── CLEAR ROUTE BUTTON in map toolbar ─────────────────────────
function showClearRouteBtn() {
  if (document.getElementById('clearRouteBtn')) return;
  const ctrl = document.querySelector('.map-toolbar-controls');
  if (!ctrl) return;
  const btn = document.createElement('button');
  btn.id        = 'clearRouteBtn';
  btn.className = 'map-ctrl-btn';
  btn.title     = 'Clear Route';
  btn.style.cssText = 'color:#ef4444; border-color:#ef4444;';
  btn.innerHTML = '<i class="bi bi-x-circle-fill"></i>';
  btn.addEventListener('click', resetNavigation);
  ctrl.appendChild(btn);
}

function hideClearRouteBtn() {
  const btn = document.getElementById('clearRouteBtn');
  if (btn) btn.remove();
}
