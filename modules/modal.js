import { state } from '../state.js';

// ── Callback registry ─
let _escapeHTML = s => String(s);
let _setStartBuilding = () => {};
let _buildingModal = { show: () => {}, hide: () => {} };
let _facilityDetailModal = { show: () => {} };

export function registerModalCallbacks({ escapeHTML, setStartBuilding, buildingModal, facilityDetailModal }) {
  _escapeHTML = escapeHTML;
  _setStartBuilding = setStartBuilding;
  _buildingModal = buildingModal;
  _facilityDetailModal = facilityDetailModal;
}

// ── One-time viewer inits ─────────────────────────────────────
let _360Inited = false;
let _imgViewerInited = false;

function init360Viewer() {
  if (_360Inited) return;
  const videoModal = document.getElementById('video360Modal');
  const video      = document.getElementById('video360Player');
  const source     = document.getElementById('video360Src');
  const close360   = document.getElementById('close360');
  if (!videoModal || !video || !source || !close360) return;
  _360Inited = true;

  let isDragging = false, startX = 0, startY = 0, scale = 1, tilt = 0;
  const SPEED = 0.015;

  const startDrag = (x, y) => { isDragging = true; startX = x; startY = y; };
  const moveDrag  = (x, y) => {
    if (!isDragging) return;
    const dx = x - startX;
    const dy = y - startY;
    const dur = video.duration || 0;
    if (dur > 0) {
      let t = video.currentTime + dx * SPEED;
      video.currentTime = ((t % dur) + dur) % dur;
    }
    startX = x;
    tilt = Math.max(-15, Math.min(15, tilt + dy * 0.05));
    video.style.transform = `scale(${scale}) rotateX(${tilt}deg)`;
  };
  const endDrag = () => { isDragging = false; };

  const closeAll = () => {
    videoModal.style.display = 'none';
    video.pause();
    source.removeAttribute('src');
    video.load();
    scale = 1; tilt = 0;
    video.style.transform = '';
  };

  const onMouseMove = e => moveDrag(e.clientX, e.clientY);
  const onMouseUp   = () => {
    endDrag();
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  };
  video.addEventListener('mousedown', e => {
    startDrag(e.clientX, e.clientY);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  });
  video.addEventListener('touchstart', e => startDrag(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
  video.addEventListener('touchmove',  e => { e.preventDefault(); moveDrag(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
  video.addEventListener('touchend',   endDrag);
  video.addEventListener('wheel', e => {
    e.preventDefault();
    scale = Math.max(1, Math.min(2, scale + (e.deltaY < 0 ? 0.1 : -0.1)));
    video.style.transform = `scale(${scale}) rotateX(${tilt}deg)`;
  }, { passive: false });
  close360.addEventListener('click', closeAll);
  videoModal.addEventListener('click', e => { if (e.target === videoModal) closeAll(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });
}

function initImageViewer() {
  if (_imgViewerInited) return;
  const viewer      = document.getElementById('imgViewer');
  const closeViewer = document.getElementById('closeViewer');
  if (!viewer || !closeViewer) return;
  _imgViewerInited = true;

  closeViewer.addEventListener('click', () => { viewer.style.display = 'none'; });
  viewer.addEventListener('click', e => { if (e.target === viewer) viewer.style.display = 'none'; });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') viewer.style.display = 'none'; });
}

// ── BUILDING MODAL ─
export function openBuildingModal(building) {
  init360Viewer();
  initImageViewer();

  // ── 360 button: update source per building ─
  const btn360 = document.getElementById('view360Btn');
  const source  = document.getElementById('video360Src');
  const video   = document.getElementById('video360Player');
  if (btn360 && source && video) {
    btn360.onclick = () => {
      source.setAttribute('src', `./assets/360/${building.id}.mp4`);
      video.load();
      document.getElementById('video360Modal').style.display = 'flex';
      video.onloadedmetadata = () => { video.currentTime = 0.1; };
    };
  }

  // ===== TEXT =====
  document.getElementById('buildingModalLabel').textContent = building.name;
  document.getElementById('modalBuildingDesc').textContent = building.desc || '';
  document.getElementById('modalBuildingId').textContent = 'ID: ' + building.id;

  // ===== IMAGE =====
  const img       = document.getElementById('modalBuildingImg');
  const viewer    = document.getElementById('imgViewer');
  const viewerImg = document.getElementById('viewerImg');
  if (img) {
    img.src           = `assets/buildings/${building.id}.jpg`;
    img.style.display = 'block';
    img.onerror       = () => { img.style.display = 'none'; };
    if (viewer && viewerImg) {
      img.onclick = () => { viewer.style.display = 'flex'; viewerImg.src = img.src; };
    }
  }

  // ===== FACILITIES =====
  const grid = document.getElementById('modalFacilitiesGrid');
  const facs = building.facilities || [];
  grid.innerHTML = '';

  if (!facs.length) {
    grid.innerHTML = `<div class="no-facilities">No facilities</div>`;
  } else {
    facs.forEach((f) => {
      const card = document.createElement('div');
      card.className = 'facility-card facility-card-clickable';
      card.innerHTML = `<div>${_escapeHTML(f.name)}</div>`;
      card.addEventListener('click', () => showFacilityModal(f));
      grid.appendChild(card);
    });
  }

  // ===== SET START BUTTON =====
  const footer = document.querySelector('.building-modal-footer');
  const old = footer.querySelector('.btn-set-start');
  if (old) old.remove();

  const setStartBtn = document.createElement('button');
  setStartBtn.className = 'btn btn-sm btn-set-start';
  setStartBtn.innerHTML = '<i class="bi bi-geo-fill"></i> Set as Start';

  if (state.startBuildingId === building.id) {
    setStartBtn.classList.add('active-start');
    setStartBtn.innerHTML = '<i class="bi bi-geo-fill"></i> Starting ✓';
  }

  setStartBtn.onclick = () => {
    _setStartBuilding(building.id);
    _buildingModal.hide();
  };

  const assistBtn = footer.querySelector('#modalAssistantBtn');
  if (assistBtn) footer.insertBefore(setStartBtn, assistBtn);

  _buildingModal.show();
}

// ── FACILITY MODAL ─
export function showFacilityModal(f) {
  document.getElementById('facilityModalName').textContent = f.name;
  document.getElementById('facilityModalType').textContent = f.type || '—';
  document.getElementById('facilityModalFloor').textContent = f.floor || '—';
  document.getElementById('facilityModalDesc').textContent = f.description || 'No additional details.';
  document.getElementById('facilityModalIcon').className =
    `bi ${f.icon || 'bi-grid'} facility-modal-big-icon`;

  _facilityDetailModal.show();
}