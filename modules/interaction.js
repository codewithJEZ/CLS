import { state } from '../state.js';
import { zoomToBuilding } from '../map.js';
import { openBuildingModal } from './modal.js';

let _buildSidebarBuildingList = () => {};

export function registerInteractionCallbacks({ buildSidebarBuildingList }) {
  _buildSidebarBuildingList = buildSidebarBuildingList;
}

export function recordInteraction(id) {
  state.visitCounts[id] = (state.visitCounts[id] || 0) * 0.9 + 1;
  state.visitCounts[id] *= 0.98;
  localStorage.setItem('visitCounts', JSON.stringify(state.visitCounts));
  _buildSidebarBuildingList();
}

const TAP_THRESHOLD = 8;
let _touchStartX = 0;
let _touchStartY = 0;
let _touchMoved  = false;

window.addEventListener('touchstart', e => {
  if (e.touches.length === 1) {
    _touchStartX = e.touches[0].clientX;
    _touchStartY = e.touches[0].clientY;
    _touchMoved  = false;
  }
}, { passive: true });

window.addEventListener('touchmove', e => {
  if (!_touchMoved && e.touches.length === 1) {
    const dx = e.touches[0].clientX - _touchStartX;
    const dy = e.touches[0].clientY - _touchStartY;
    if (Math.hypot(dx, dy) > TAP_THRESHOLD) _touchMoved = true;
  }
}, { passive: true });

let _lastClickId   = null;
let _lastClickTime = 0;
const CLICK_COOLDOWN = 420;

export function handleBuildingClick(id) {
  if (state.wasDragging) return;
  if (_touchMoved && state.wasDragging) return;

  const now = Date.now();
  if (id === _lastClickId && now - _lastClickTime < CLICK_COOLDOWN) return;
  _lastClickId   = id;
  _lastClickTime = now;

  const b = state.BUILDINGS.find(x => x.id === id);
  if (!b) return;

  state.currentBuildingId = id;
  recordInteraction(id);
  zoomToBuilding(id);
  setTimeout(() => openBuildingModal(b), 420);
}
