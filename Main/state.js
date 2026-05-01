export const state = {
  // ── Data ──────────────────────────────────────────────────
  BUILDINGS:   [],
  QA_DATA:     {},
  visitCounts: JSON.parse(localStorage.getItem('visitCounts') || '{}'),

  // ── Interaction ────────────────────────────────────────────
  currentBuildingId: null,

  // ── Map transform ──────────────────────────────────────────
  mapScale:  1,
  mapTransX: 0,
  mapTransY: 0,

  // ── Drag ───────────────────────────────────────────────────
  isDragging:    false,
  wasDragging:   false,
  dragStart:     { x: 0, y: 0 },
  lastTouchDist: null,

  // ── Navigation ─────────────────────────────────────────────
  startBuildingId:       null,
  destinationBuildingId: null,
  isPickingDestination:  false,
};
