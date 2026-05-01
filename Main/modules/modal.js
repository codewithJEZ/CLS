import { state } from '../state.js';

// ── Callback registry (avoids circular import with script.js) ─
let _escapeHTML          = s => String(s);
let _setStartBuilding    = () => {};
let _buildingModal       = { show: () => {}, hide: () => {} };
let _facilityDetailModal = { show: () => {} };

export function registerModalCallbacks({ escapeHTML, setStartBuilding, buildingModal, facilityDetailModal }) {
  _escapeHTML          = escapeHTML;
  _setStartBuilding    = setStartBuilding;
  _buildingModal       = buildingModal;
  _facilityDetailModal = facilityDetailModal;
}

// ── BUILDING MODAL ────────────────────────────────────────────
export function openBuildingModal(building) {
  document.getElementById('buildingModalLabel').textContent = building.name;
  document.getElementById('modalBuildingDesc').textContent = building.desc || '';
  document.getElementById('modalBuildingId').textContent = 'ID: ' + building.id;
  const grid = document.getElementById('modalFacilitiesGrid');
  const facs = building.facilities || [];
  grid.innerHTML = '';
  if (!facs.length) {
    grid.innerHTML = `<div class="no-facilities"><i class="bi bi-inbox"></i><p>No facilities listed.</p></div>`;
  } else {
    facs.forEach((f, i) => {
      const card = document.createElement('div');
      card.className = 'facility-card facility-card-clickable';
      card.style.animationDelay = i * 55 + 'ms';
      card.title = 'Click to view details';
      card.innerHTML = `
        <i class="bi ${f.icon || 'bi-grid'} facility-card-icon"></i>
        <div class="facility-card-name">${_escapeHTML(f.name)}</div>
        <div class="facility-card-desc">${_escapeHTML(f.type)}${f.floor ? ' · ' + _escapeHTML(f.floor) : ''}</div>
        <div class="facility-card-more"><i class="bi bi-arrow-right-circle"></i> Details</div>`;
      card.addEventListener('click', () => showFacilityModal(f));
      grid.appendChild(card);
    });
  }

  // ── Inject "Set as Starting Point" button into modal footer ──
  const footer = document.querySelector('.building-modal-footer');
  // Remove any previous nav button first
  const old = footer.querySelector('.btn-set-start');
  if (old) old.remove();

  const setStartBtn = document.createElement('button');
  setStartBtn.type      = 'button';
  setStartBtn.className = 'btn btn-sm btn-set-start';
  setStartBtn.innerHTML = '<i class="bi bi-geo-fill"></i> Set as Start';

  // If this building is already the start point, show that visually
  if (state.startBuildingId === building.id) {
    setStartBtn.classList.add('active-start');
    setStartBtn.innerHTML = '<i class="bi bi-geo-fill"></i> Starting Point ✓';
  }

  setStartBtn.addEventListener('click', () => {
    _setStartBuilding(building.id);
    _buildingModal.hide();
  });

  // Insert before the "Need Assistance" button
  const assistBtn = footer.querySelector('#modalAssistantBtn');
  footer.insertBefore(setStartBtn, assistBtn);

  _buildingModal.show();
}

// ── FACILITY DETAIL MODAL ─────────────────────────────────────
export function showFacilityModal(f) {
  document.getElementById('facilityModalName').textContent = f.name;
  document.getElementById('facilityModalType').textContent = f.type || '—';
  document.getElementById('facilityModalFloor').textContent = f.floor || '—';
  document.getElementById('facilityModalDesc').textContent = f.description || 'No additional details.';
  document.getElementById('facilityModalIcon').className = `bi ${f.icon || 'bi-grid'} facility-modal-big-icon`;
  _facilityDetailModal.show();
}
