import {
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
} from './script.js';
import { handleSVGLoad, initMapControls } from './map.js';
import { state } from './state.js';

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

  const mapHint = document.getElementById('mapHint');
  setTimeout(() => mapHint.classList.add('visible'), 1200);
  setTimeout(() => mapHint.classList.remove('visible'), 4500);

  document.getElementById('modalAssistantBtn').addEventListener('click', () => {
    buildingModal.hide();
    if (state.currentBuildingId) setAssistantBuilding(state.currentBuildingId);
    assistantModal.show();
  });
  document.getElementById('openAssistantBtn').addEventListener('click', () => assistantModal.show());
  updateResetVisibility();
});
