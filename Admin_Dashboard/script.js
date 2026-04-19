/**
 * ============================================================
 *  Campus Locator System — Admin Dashboard
 *  Admin_Dashboard/script.js
 *
 *  STATUS: Connected to backend at http://localhost:3000
 * ============================================================
 */

const API_BASE = 'http://localhost:3000';

// Tracks the ID being edited. null = ADD mode, number = EDIT mode.
let editingBuildingId  = null;
let editingFacilityId  = null;
let editingAssistanceId = null;


/* ════════════════════════════════════════════════════════════
   PAGE NAVIGATION
   ════════════════════════════════════════════════════════════ */

const pageTitles = {
  dashboard:  'Dashboard',
  buildings:  'Buildings',
  facilities: 'Facilities',
  assistance: 'Assistance'
};

function switchPage(page) {
  document.querySelectorAll('.page-content').forEach(el => el.classList.add('d-none'));

  const target = document.getElementById('page' + capitalize(page));
  if (target) {
    target.classList.remove('d-none');
    target.style.animation = 'none';
    void target.offsetWidth;
    target.style.animation = '';
  }

  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === page);
  });

  document.getElementById('pageTitle').textContent = pageTitles[page] || page;

  if (window.innerWidth <= 768) closeSidebar();
}


/* ════════════════════════════════════════════════════════════
   SIDEBAR CONTROLS
   ════════════════════════════════════════════════════════════ */

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');

  if (window.innerWidth <= 768) {
    const isOpen = sidebar.classList.contains('open');
    sidebar.classList.toggle('open', !isOpen);
    overlay.classList.toggle('open', !isOpen);
  } else {
    collapseSidebar();
  }
}

function collapseSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
  document.getElementById('mainWrapper').classList.toggle('collapsed');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('open');
}


/* ════════════════════════════════════════════════════════════
   MODAL CONTROLS
   ════════════════════════════════════════════════════════════ */

function openModal(id) {
  document.getElementById(id).classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

// Close on background click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
  }
});


/* ════════════════════════════════════════════════════════════
   OPEN MODALS FOR ADD vs EDIT
   These replace the plain openModal() calls in the table rows.
   ════════════════════════════════════════════════════════════ */

/**
 * openAddBuilding()
 * Resets the form and sets mode to ADD, then opens the modal.
 */
function openAddBuilding() {
  editingBuildingId = null;
  document.getElementById('formBuilding').reset();
  document.getElementById('buildingFeatured').checked = false;
  // Update modal title to show "Add"
  document.querySelector('#buildingModal .modal-title').innerHTML =
    '<i class="bi bi-building-fill me-2"></i>Add Building';
  openModal('buildingModal');
}

/**
 * openEditBuilding(id, name, code, description, isFeatured)
 * Pre-fills the building form with existing data and sets mode to EDIT.
 */
function openEditBuilding(id, name, code, description, isFeatured) {
  editingBuildingId = id;
  document.getElementById('buildingName').value        = name;
  document.getElementById('buildingCode').value        = code;
  document.getElementById('buildingDescription').value = description !== '—' ? description : '';
  document.getElementById('buildingFeatured').checked  = isFeatured === 1 || isFeatured === true;
  // Update modal title to show "Edit"
  document.querySelector('#buildingModal .modal-title').innerHTML =
    '<i class="bi bi-building-fill me-2"></i>Edit Building';
  openModal('buildingModal');
}

/**
 * openAddFacility()
 * Resets the form and sets mode to ADD.
 */
function openAddFacility() {
  editingFacilityId = null;
  document.getElementById('formFacility').reset();
  document.querySelector('#facilityModal .modal-title').innerHTML =
    '<i class="bi bi-door-open-fill me-2"></i>Add Facility';
  openModal('facilityModal');
}

/**
 * openEditFacility(id, buildingId, name, type, description, floor)
 * Pre-fills the facility form with existing data and sets mode to EDIT.
 */
function openEditFacility(id, buildingId, name, type, description, floor) {
  editingFacilityId = id;
  document.getElementById('facilityBuilding').value    = buildingId;
  document.getElementById('facilityName').value        = name;
  document.getElementById('facilityType').value        = type;
  document.getElementById('facilityDescription').value = description !== '—' ? description : '';
  document.getElementById('facilityFloor').value       = floor;
  document.querySelector('#facilityModal .modal-title').innerHTML =
    '<i class="bi bi-door-open-fill me-2"></i>Edit Facility';
  openModal('facilityModal');
}

/**
 * openAddAssistance()
 * Resets the form and sets mode to ADD.
 */
function openAddAssistance() {
  editingAssistanceId = null;
  document.getElementById('formAssistance').reset();
  document.querySelector('#qaModal .modal-title').innerHTML =
    '<i class="bi bi-patch-question-fill me-2"></i>Add Q&amp;A';
  openModal('qaModal');
}

/**
 * openEditAssistance(id, buildingId, question, answer)
 * Pre-fills the Q&A form with existing data and sets mode to EDIT.
 */
function openEditAssistance(id, buildingId, question, answer) {
  editingAssistanceId = id;
  document.getElementById('qaBuilding').value  = buildingId;
  document.getElementById('qaQuestion').value  = question;
  document.getElementById('qaAnswer').value    = answer;
  document.querySelector('#qaModal .modal-title').innerHTML =
    '<i class="bi bi-patch-question-fill me-2"></i>Edit Q&amp;A';
  openModal('qaModal');
}


/* ════════════════════════════════════════════════════════════
   DATA LOADERS
   ════════════════════════════════════════════════════════════ */

async function loadBuildings() {
  try {
    const res  = await fetch(`${API_BASE}/buildings`);
    const json = await res.json();

    if (!json.success) { console.error('loadBuildings failed:', json.message); return; }

    const tbody = document.getElementById('buildingsTableBody');
    tbody.innerHTML = '';

    json.data.forEach(b => {
      // is_featured: 1 = featured, 0 = not featured
      const featured   = b.is_featured == 1;
      const featuredBadge = featured
        ? `<span class="badge-featured"><i class="bi bi-star-fill"></i> Recommended</span>`
        : `<span class="badge-not-featured"><i class="bi bi-star"></i> None</span>`;

      const toggleBtn = featured
        ? `<button class="btn-feature remove" onclick="toggleFeatured(${b.id}, 0)">
             <i class="bi bi-star-slash"></i> Remove
           </button>`
        : `<button class="btn-feature" onclick="toggleFeatured(${b.id}, 1)">
             <i class="bi bi-star-fill"></i> Set Featured
           </button>`;

      const tr = document.createElement('tr');
      tr.dataset.id = b.id;
      tr.innerHTML = `
        <td>${b.id}</td>
        <td>${escHtml(b.name)}</td>
        <td>${escHtml(b.code)}</td>
        <td>${escHtml(b.description || '—')}</td>
        <td>${featuredBadge}</td>
        <td class="action-btns">
          <button class="btn-edit"
            onclick="openEditBuilding(${b.id}, '${escJs(b.name)}', '${escJs(b.code)}', '${escJs(b.description || '')}', ${b.is_featured})">
            <i class="bi bi-pencil-fill"></i> Edit
          </button>
          ${toggleBtn}
          <button class="btn-delete" onclick="confirmDelete(this, 'buildings', ${b.id})">
            <i class="bi bi-trash-fill"></i> Delete
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    const countEl = document.getElementById('countBuildings');
    if (countEl) countEl.textContent = json.data.length;

    populateBuildingDropdowns(json.data);

  } catch (err) {
    console.error('❌ loadBuildings error:', err);
    showToast('Could not load buildings. Is the server running?');
  }
}

async function loadFacilities() {
  try {
    const res  = await fetch(`${API_BASE}/facilities`);
    const json = await res.json();

    if (!json.success) { console.error('loadFacilities failed:', json.message); return; }

    const tbody = document.getElementById('facilitiesTableBody');
    tbody.innerHTML = '';

    json.data.forEach(f => {
      const dateStr = f.created_at
        ? new Date(f.created_at).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' })
        : '—';

      const tr = document.createElement('tr');
      tr.dataset.id = f.id;
      tr.innerHTML = `
        <td>${f.id}</td>
        <td>${escHtml(f.name)}</td>
        <td>${escHtml(f.building_name)}</td>
        <td>${escHtml(f.type)}</td>
        <td>${escHtml(f.description || '—')}</td>
        <td>${escHtml(f.floor)}</td>
        <td>${dateStr}</td>
        <td class="action-btns">
          <button class="btn-edit"
            onclick="openEditFacility(${f.id}, ${f.building_id}, '${escJs(f.name)}', '${escJs(f.type)}', '${escJs(f.description || '')}', '${escJs(f.floor)}')">
            <i class="bi bi-pencil-fill"></i> Edit
          </button>
          <button class="btn-delete" onclick="confirmDelete(this, 'facilities', ${f.id})">
            <i class="bi bi-trash-fill"></i> Delete
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    const countEl = document.getElementById('countFacilities');
    if (countEl) countEl.textContent = json.data.length;

  } catch (err) {
    console.error('❌ loadFacilities error:', err);
    showToast('Could not load facilities. Is the server running?');
  }
}

async function loadAssistance() {
  try {
    const res  = await fetch(`${API_BASE}/assistance`);
    const json = await res.json();

    if (!json.success) { console.error('loadAssistance failed:', json.message); return; }

    const tbody = document.getElementById('assistanceTableBody');
    tbody.innerHTML = '';

    json.data.forEach(a => {
      const dateStr = a.created_at
        ? new Date(a.created_at).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' })
        : '—';

      const tr = document.createElement('tr');
      tr.dataset.id = a.id;
      tr.innerHTML = `
        <td>${a.id}</td>
        <td>${escHtml(a.building_name)}</td>
        <td>${escHtml(a.question)}</td>
        <td>${escHtml(a.answer)}</td>
        <td>${dateStr}</td>
        <td class="action-btns">
          <button class="btn-edit"
            onclick="openEditAssistance(${a.id}, ${a.building_id}, '${escJs(a.question)}', '${escJs(a.answer)}')">
            <i class="bi bi-pencil-fill"></i> Edit
          </button>
          <button class="btn-delete" onclick="confirmDelete(this, 'assistance', ${a.id})">
            <i class="bi bi-trash-fill"></i> Delete
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    const countEl = document.getElementById('countAssistance');
    if (countEl) countEl.textContent = json.data.length;

  } catch (err) {
    console.error('❌ loadAssistance error:', err);
    showToast('Could not load Q&A data. Is the server running?');
  }
}

function populateBuildingDropdowns(buildings) {
  const selects = [
    document.getElementById('facilityBuilding'),
    document.getElementById('qaBuilding')
  ];

  selects.forEach(select => {
    if (!select) return;
    const currentVal = select.value;
    select.innerHTML = '<option value="">Select Building</option>';
    buildings.forEach(b => {
      const opt        = document.createElement('option');
      opt.value        = b.id;
      opt.textContent  = b.name;
      select.appendChild(opt);
    });
    select.value = currentVal;
  });
}


/* ════════════════════════════════════════════════════════════
   FORM HANDLING — BUILDINGS
   POST = add new  |  PUT = update existing (based on editingBuildingId)
   ════════════════════════════════════════════════════════════ */

async function handleBuildingForm(e) {
  e.preventDefault();

  const name        = document.getElementById('buildingName').value.trim();
  const code        = document.getElementById('buildingCode').value.trim();
  const description = document.getElementById('buildingDescription').value.trim();
  // Capture featured checkbox: sends 1 (true) or 0 (false) — matches DB tinyint(1)
  const is_featured = document.getElementById('buildingFeatured').checked ? 1 : 0;

  if (!name || !code) {
    showToast('Building name and code are required.');
    return;
  }

  // Decide: are we adding or editing?
  const isEditing = editingBuildingId !== null;
  const url       = isEditing ? `${API_BASE}/buildings/${editingBuildingId}` : `${API_BASE}/buildings`;
  const method    = isEditing ? 'PUT' : 'POST';

  try {
    const res  = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name, code, description, is_featured })
    });
    const json = await res.json();

    if (json.success) {
      closeModal('buildingModal');
      document.getElementById('formBuilding').reset();
      document.getElementById('buildingFeatured').checked = false;
      editingBuildingId = null;
      showToast(isEditing ? 'Building updated successfully.' : 'Building saved successfully.');
      loadBuildings();
    } else {
      showToast(json.message || 'Failed to save building.');
    }
  } catch (err) {
    console.error('❌ Building form error:', err);
    showToast('Could not connect to server.');
  }
}


/* ════════════════════════════════════════════════════════════
   TOGGLE FEATURED — BUILDINGS
   ════════════════════════════════════════════════════════════ */

/**
 * toggleFeatured(id, value)
 * Sends a PATCH request to update is_featured for a building.
 * value: 1 = set as featured,  0 = remove featured
 *
 * TODO: Backend needs PATCH /buildings/:id/featured route.
 * For now, logs to console and updates the UI optimistically.
 *
 * @param {number} id    - Building ID
 * @param {number} value - 1 or 0
 */
async function toggleFeatured(id, value) {
  try {
    const res  = await fetch(`${API_BASE}/buildings/${id}/featured`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ is_featured: value })
    });
    const json = await res.json();

    if (json.success) {
      showToast(value === 1 ? '⭐ Marked as Recommended.' : 'Removed from Recommended.');
      loadBuildings(); // refresh table to show updated badge + button
    } else {
      showToast(json.message || 'Failed to update featured status.');
    }
  } catch (err) {
    console.error('❌ toggleFeatured error:', err);
    showToast('Could not connect to server.');
  }
}


/* ════════════════════════════════════════════════════════════
   FORM HANDLING — FACILITIES
   ════════════════════════════════════════════════════════════ */

async function handleFacilityForm(e) {
  e.preventDefault();

  const building_id = document.getElementById('facilityBuilding').value;
  const name        = document.getElementById('facilityName').value.trim();
  const type        = document.getElementById('facilityType').value.trim();
  const description = document.getElementById('facilityDescription').value.trim();
  const floor       = document.getElementById('facilityFloor').value.trim();

  if (!building_id || !name || !type || !floor) {
    showToast('Building, name, type, and floor are required.');
    return;
  }

  const isEditing = editingFacilityId !== null;
  const url       = isEditing ? `${API_BASE}/facilities/${editingFacilityId}` : `${API_BASE}/facilities`;
  const method    = isEditing ? 'PUT' : 'POST';

  try {
    const res  = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ building_id, name, type, description, floor })
    });
    const json = await res.json();

    if (json.success) {
      closeModal('facilityModal');
      document.getElementById('formFacility').reset();
      editingFacilityId = null;
      showToast(isEditing ? 'Facility updated successfully.' : 'Facility saved successfully.');
      loadFacilities();
    } else {
      showToast(json.message || 'Failed to save facility.');
    }
  } catch (err) {
    console.error('❌ Facility form error:', err);
    showToast('Could not connect to server.');
  }
}


/* ════════════════════════════════════════════════════════════
   FORM HANDLING — ASSISTANCE (Q&A)
   ════════════════════════════════════════════════════════════ */

async function handleAssistanceForm(e) {
  e.preventDefault();

  const building_id = document.getElementById('qaBuilding').value;
  const question    = document.getElementById('qaQuestion').value.trim();
  const answer      = document.getElementById('qaAnswer').value.trim();

  if (!building_id || !question || !answer) {
    showToast('Building, question, and answer are required.');
    return;
  }

  const isEditing = editingAssistanceId !== null;
  const url       = isEditing ? `${API_BASE}/assistance/${editingAssistanceId}` : `${API_BASE}/assistance`;
  const method    = isEditing ? 'PUT' : 'POST';

  try {
    const res  = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ building_id, question, answer })
    });
    const json = await res.json();

    if (json.success) {
      closeModal('qaModal');
      document.getElementById('formAssistance').reset();
      editingAssistanceId = null;
      showToast(isEditing ? 'Q&A updated successfully.' : 'Q&A entry saved successfully.');
      loadAssistance();
    } else {
      showToast(json.message || 'Failed to save Q&A entry.');
    }
  } catch (err) {
    console.error('❌ Assistance form error:', err);
    showToast('Could not connect to server.');
  }
}


/* ════════════════════════════════════════════════════════════
   FORM EVENT LISTENERS + INITIAL DATA LOAD
   ════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const buildingForm   = document.getElementById('formBuilding');
  const facilityForm   = document.getElementById('formFacility');
  const assistanceForm = document.getElementById('formAssistance');

  if (buildingForm)   buildingForm.addEventListener('submit', handleBuildingForm);
  if (facilityForm)   facilityForm.addEventListener('submit', handleFacilityForm);
  if (assistanceForm) assistanceForm.addEventListener('submit', handleAssistanceForm);

  // Also fix the "Add" buttons in the page header to use openAdd functions
  // (so they reset the form and clear edit mode)
  const addBuildingBtn   = document.querySelector('[onclick="openModal(\'buildingModal\')"]');
  const addFacilityBtn   = document.querySelector('[onclick="openModal(\'facilityModal\')"]');
  const addAssistanceBtn = document.querySelector('[onclick="openModal(\'qaModal\')"]');

  if (addBuildingBtn)   addBuildingBtn.setAttribute('onclick', 'openAddBuilding()');
  if (addFacilityBtn)   addFacilityBtn.setAttribute('onclick', 'openAddFacility()');
  if (addAssistanceBtn) addAssistanceBtn.setAttribute('onclick', 'openAddAssistance()');

  loadBuildings();
  loadFacilities();
  loadAssistance();
});


/* ════════════════════════════════════════════════════════════
   TABLE SEARCH / FILTER
   ════════════════════════════════════════════════════════════ */

function filterTable(input, tableId) {
  const query   = input.value.toLowerCase().trim();
  const table   = document.getElementById(tableId);
  const rows    = table.querySelectorAll('tbody tr');
  const pageEl  = input.closest('.page-content');
  const emptyEl = pageEl ? pageEl.querySelector('.empty-state') : null;

  let visibleCount = 0;

  rows.forEach(row => {
    const match = row.textContent.toLowerCase().includes(query);
    row.style.display = match ? '' : 'none';
    if (match) visibleCount++;
  });

  if (emptyEl) {
    emptyEl.classList.toggle('d-none', visibleCount > 0 || query === '');
  }
}


/* ════════════════════════════════════════════════════════════
   DELETE CONFIRMATION
   ════════════════════════════════════════════════════════════ */

function confirmDelete(btn, resource, id) {
  const row        = btn.closest('tr');
  const confirmBtn = document.getElementById('btnConfirmDelete');

  // Clone to remove stacked listeners from previous calls
  const freshBtn = confirmBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(freshBtn, confirmBtn);

  freshBtn.addEventListener('click', async () => {
    try {
      const res  = await fetch(`${API_BASE}/${resource}/${id}`, { method: 'DELETE' });
      const json = await res.json();

      if (json.success) {
        row.style.transition = 'opacity .25s ease';
        row.style.opacity    = '0';
        setTimeout(() => {
          row.remove();
          closeModal('deleteModal');
          showToast('Record deleted.');

          if (resource === 'buildings')  loadBuildings();
          if (resource === 'facilities') loadFacilities();
          if (resource === 'assistance') loadAssistance();
        }, 240);
      } else {
        closeModal('deleteModal');
        showToast(json.message || 'Delete failed.');
      }

    } catch (err) {
      console.error(`❌ DELETE /${resource}/${id} error:`, err);
      closeModal('deleteModal');
      showToast('Could not connect to server.');
    }
  });

  openModal('deleteModal');
}


/* ════════════════════════════════════════════════════════════
   TOAST NOTIFICATION
   ════════════════════════════════════════════════════════════ */

function showToast(message = 'Done') {
  const toast    = document.getElementById('toastMsg');
  const toastTxt = document.getElementById('toastText');

  toastTxt.textContent = message;
  toast.classList.add('show');

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2800);
}


/* ════════════════════════════════════════════════════════════
   UTILITY
   ════════════════════════════════════════════════════════════ */

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Escapes HTML for safe innerHTML insertion (prevents XSS) */
function escHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * escJs(str)
 * Escapes a string to be safely placed inside a JS string
 * inside an onclick="..." attribute (single-quote safe).
 */
function escJs(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}
