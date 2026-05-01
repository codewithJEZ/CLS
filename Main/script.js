/* =============================================================
   CAMPUS FACILITIES LOCATOR — script.js  v2.0
============================================================= */

import { state } from './state.js';
import { recordInteraction, registerInteractionCallbacks, handleBuildingClick } from './modules/interaction.js';
import { loadBuildings, facilityIcon } from './modules/data.js';
import { buildSidebarBuildingList, getSidebarBuildingList, getSmartRecommended, initSidebar, registerSidebarCallbacks, setActiveSidebarItem } from './modules/sidebar.js';
import { initSearch, handleSearch, showSearchResults, highlightMatch, registerSearchCallbacks } from './modules/search.js';
import { injectAssistantSearch, setAssistantBuilding, loadQuestionsForBuilding, resetAssistant, initAssistant, registerAssistantCallbacks, populateAssistantSelect } from './modules/assistant.js';
import { openBuildingModal, showFacilityModal, registerModalCallbacks } from './modules/modal.js';
import { setStartBuilding, setDestination, drawRoute, clearRoute, resetNavigation, registerNavigationCallbacks } from './map/navigation.js';
import {
  registerMapCallbacks,
  zoomToBuilding,
  getAllBuildingShapes,
  getUnifiedBBox,
  updateMapStatus,
  applyMapTransform,
  mapInner,
  mapContainer,
} from './map.js';
import { escapeHTML, escapeRegex, triggerRipple } from './utils/dom.js';

/** updateResetVisibility — shows/hides the Reset button based on state */
function updateResetVisibility() {
  if (!clearAnswerBtn) return;
  const hasContent = (answerArea && answerArea.style.display !== 'none') ||
                     (questionsSection && questionsSection.style.display !== 'none');
  clearAnswerBtn.style.display = hasContent ? '' : 'none';
}

// ── STATE ─────────────────────────────────────────────────────
// (all mutable state lives in state.js)

// ── DOM REFS ──────────────────────────────────────────────────
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

// ── INIT ── (moved to main.js)





// ── MAP CALLBACK WIRING ───────────────────────────────────────
registerMapCallbacks({
  handleBuildingClick,
  recordInteraction,
  setDestination,
  setActiveSidebarItem,
});
registerInteractionCallbacks({ buildSidebarBuildingList });
registerSidebarCallbacks({ escapeHTML, triggerRipple, openBuildingModal });
registerSearchCallbacks({ escapeHTML, escapeRegex });
registerAssistantCallbacks({ updateResetVisibility, escapeHTML, escapeRegex });
registerModalCallbacks({ escapeHTML, setStartBuilding, buildingModal, facilityDetailModal });
registerNavigationCallbacks({ escapeHTML, handleBuildingClick });

// ── EXPORTS ───────────────────────────────────────────────────
export {
  loadBuildings,
  buildSidebarBuildingList,
  populateAssistantSelect,
  injectAssistantSearch,
  initSearch,
  initSidebar,
  initAssistant,
  setAssistantBuilding,
  updateResetVisibility,
  buildingModal,
  assistantModal,
};