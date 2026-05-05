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

let _initialized = false;

document.addEventListener('DOMContentLoaded', async () => {
  if (_initialized) return;
  _initialized = true;

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
  if (mapHint) {
    setTimeout(() => mapHint.classList.add('visible'), 1200);
    setTimeout(() => mapHint.classList.remove('visible'), 4500);
  }

  let _modalBusy = false;

  const modalAssistantBtn = document.getElementById('modalAssistantBtn');
  if (modalAssistantBtn) {
    modalAssistantBtn.addEventListener('click', () => {
      if (_modalBusy) return;
      _modalBusy = true;
      setTimeout(() => { _modalBusy = false; }, 350);
      buildingModal.hide();
      if (state.currentBuildingId) setAssistantBuilding(state.currentBuildingId);
      assistantModal.show();
    });
  }

  const openAssistantBtn = document.getElementById('openAssistantBtn');
  if (openAssistantBtn) {
    openAssistantBtn.addEventListener('click', () => {
      if (_modalBusy) return;
      _modalBusy = true;
      setTimeout(() => { _modalBusy = false; }, 350);
      assistantModal.show();
    });
  }

  updateResetVisibility();
});
