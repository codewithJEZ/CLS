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

// ── BUILDING MODAL ─
export function openBuildingModal(building) {

  const btn360 = document.getElementById('view360Btn');
  const videoModal = document.getElementById('video360Modal');
  const video = document.getElementById('video360Player');
  const source = document.getElementById('video360Src');
  const close360 = document.getElementById('close360');

if (btn360 && videoModal && video && source && close360) {

  let isDragging = false;
  let startX = 0;
  let startY = 0;

  let scale = 1;
  let tilt = 0;

  const SPEED = 0.02; // mas responsive

  // OPEN
  btn360.onclick = () => {
    const videoPath = `./assets/360/${building.id}.mp4`;

    source.src = videoPath;
    video.load();

    videoModal.style.display = 'flex';
    video.pause();

    video.onloadedmetadata = () => {
      video.currentTime = 0.1;
    };
  };

  // START DRAG
  const startDrag = (x, y) => {
    isDragging = true;
    startX = x;
    startY = y;
  };

  // MOVE (INFINITE BOTH DIRECTIONS)
  const moveDrag = (x, y) => {
    if (!isDragging) return;

    const dx = x - startX;
    const dy = y - startY;

    const duration = video.duration || 0;

    if (duration > 0) {
      let newTime = video.currentTime + dx * SPEED;

      // 🔥 PERFECT LOOP (both left & right)
      newTime = ((newTime % duration) + duration) % duration;

      video.currentTime = newTime;
    }

    startX = x;

    // tilt (up/down)
    tilt += dy * 0.05;
    tilt = Math.max(-15, Math.min(15, tilt));

    video.style.transform = `scale(${scale}) rotateX(${tilt}deg)`;
  };

  const endDrag = () => {
    isDragging = false;
  };

  // ===== DESKTOP =====
  video.addEventListener('mousedown', (e) => startDrag(e.clientX, e.clientY));
  window.addEventListener('mousemove', (e) => moveDrag(e.clientX, e.clientY));
  window.addEventListener('mouseup', endDrag);

  // ===== MOBILE FIX (IMPORTANT) =====
  video.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    startDrag(t.clientX, t.clientY);
  }, { passive: false });

  video.addEventListener('touchmove', (e) => {
    e.preventDefault(); // 🔥 prevents scroll issue
    const t = e.touches[0];
    moveDrag(t.clientX, t.clientY);
  }, { passive: false });

  video.addEventListener('touchend', endDrag);

  // ===== ZOOM =====
  video.addEventListener('wheel', (e) => {
    e.preventDefault();

    scale += e.deltaY < 0 ? 0.1 : -0.1;
    scale = Math.max(1, Math.min(2, scale));

    video.style.transform = `scale(${scale}) rotateX(${tilt}deg)`;
  });

  // ===== CLOSE =====
  const closeAll = () => {
    videoModal.style.display = 'none';
    video.pause();
    video.currentTime = 0;

    scale = 1;
    tilt = 0;
    video.style.transform = 'scale(1) rotateX(0deg)';
  };

  close360.onclick = closeAll;

  videoModal.onclick = (e) => {
    if (e.target === videoModal) closeAll();
  };

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll();
  });
}

  // ===== TEXT =====
  document.getElementById('buildingModalLabel').textContent = building.name;
  document.getElementById('modalBuildingDesc').textContent = building.desc || '';
  document.getElementById('modalBuildingId').textContent = 'ID: ' + building.id;

  // ===== IMAGE =====
  const img = document.getElementById('modalBuildingImg');
  if (img) {
    const path = `assets/buildings/${building.id}.jpg`;
    img.src = path;
    img.style.display = 'block';
    img.onerror = () => img.style.display = 'none';
  }

  // ===== IMAGE VIEW =====
  const viewer = document.getElementById('imgViewer');
  const viewerImg = document.getElementById('viewerImg');
  const closeViewer = document.getElementById('closeViewer');

  if (img && viewer && viewerImg && closeViewer) {
    img.onclick = () => {
      viewer.style.display = 'flex';
      viewerImg.src = img.src;
    };

    closeViewer.onclick = () => viewer.style.display = 'none';

    viewer.onclick = (e) => {
      if (e.target === viewer) viewer.style.display = 'none';
    };

    document.onkeydown = (e) => {
      if (e.key === 'Escape') viewer.style.display = 'none';
    };
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