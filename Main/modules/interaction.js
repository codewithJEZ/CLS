import { state } from '../state.js';
import { zoomToBuilding } from '../map.js';
import { openBuildingModal } from './modal.js';

let _buildSidebarBuildingList = () => {};

export function registerInteractionCallbacks({ buildSidebarBuildingList }) {
  _buildSidebarBuildingList = buildSidebarBuildingList;
}

export function recordInteraction(id) {
  // add visit
  state.visitCounts[id] = (state.visitCounts[id] || 0) * 0.9 + 1;

  // 🔥 decay (para hindi forever top)
  state.visitCounts[id] *= 0.98;

  // save
  localStorage.setItem("visitCounts", JSON.stringify(state.visitCounts));

  // 🔥 auto update UI
  _buildSidebarBuildingList();
}

export function handleBuildingClick(id) {
  const b = state.BUILDINGS.find(x => x.id === id);
  if (!b) return;
  state.currentBuildingId = id;
  recordInteraction(id);
  zoomToBuilding(id);
  setTimeout(() => openBuildingModal(b), 420);
  // track visit
  state.visitCounts[id] = (state.visitCounts[id] || 0) + 1;
  localStorage.setItem("visitCounts", JSON.stringify(state.visitCounts));
}
