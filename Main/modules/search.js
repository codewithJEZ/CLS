import { state } from '../state.js';
import { recordInteraction } from './interaction.js';
import { zoomToBuilding } from '../map.js';

// ── DOM refs ──────────────────────────────────────────────────
const searchInput    = document.getElementById('searchInput');
const searchResults  = document.getElementById('searchResults');
const searchClearBtn = document.getElementById('searchClearBtn');

// ── Callback registry (avoids circular import with script.js) ─
let _escapeHTML  = s => String(s);
let _escapeRegex = s => s;

export function registerSearchCallbacks({ escapeHTML, escapeRegex }) {
  _escapeHTML  = escapeHTML;
  _escapeRegex = escapeRegex;
}

// ── SEARCH (TASK 2) ───────────────────────────────────────────
export function initSearch() {
  searchInput.addEventListener('input', handleSearch);
  searchInput.addEventListener('focus', () => { if (searchInput.value.trim()) showSearchResults(searchInput.value); });
  document.addEventListener('click', e => { if (!e.target.closest('.search-box')) searchResults.classList.remove('open'); });
  searchClearBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchResults.classList.remove('open');
    searchClearBtn.classList.remove('visible');
    searchInput.focus();
  });
  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Escape') { searchResults.classList.remove('open'); searchInput.blur(); return; }
    const items = [...searchResults.querySelectorAll('.search-result-item')];
    if (!items.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const cur = searchResults.querySelector('.keyboard-focused');
      let idx = items.indexOf(cur);
      if (cur) cur.classList.remove('keyboard-focused');
      idx = e.key === 'ArrowDown' ? (idx + 1) % items.length : (idx - 1 + items.length) % items.length;
      items[idx].classList.add('keyboard-focused');
      items[idx].scrollIntoView({ block: 'nearest' });
    }
    if (e.key === 'Enter') { const f = searchResults.querySelector('.keyboard-focused'); if (f) f.click(); }
  });
}

export function handleSearch(e) {
  const q = e.target.value.trim();
  searchClearBtn.classList.toggle('visible', q.length > 0);
  q ? showSearchResults(q) : searchResults.classList.remove('open');
}

export function showSearchResults(query) {
  const lq = query.toLowerCase();
  const matches = [];
  state.BUILDINGS.forEach(b => {
    if (b.name.toLowerCase().includes(lq))
      matches.push({ name: b.name, sub: `${(b.facilities || []).length} facilities`, id: b.id, icon: 'bi-building' });
    (b.facilities || []).forEach(f => {
      if (f.name.toLowerCase().includes(lq) || (f.desc || '').toLowerCase().includes(lq))
        matches.push({ name: f.name, sub: b.name, id: b.id, icon: f.icon || 'bi-grid' });
    });
  });

  searchResults.innerHTML = '';
  if (!state.BUILDINGS.length) {
    searchResults.innerHTML = `<div class="search-no-results"><i class="bi bi-plug"></i> Backend not connected.</div>`;
  } else if (!matches.length) {
    searchResults.innerHTML = `<div class="search-no-results"><i class="bi bi-search"></i> No results for "<strong>${_escapeHTML(query)}</strong>"</div>`;
  } else {
    matches.slice(0, 8).forEach(m => {
      const item = document.createElement('div');
      item.className = 'search-result-item';
      item.innerHTML = `<i class="bi ${m.icon} search-result-icon"></i><span class="search-result-name">${highlightMatch(m.name, query)}</span><span class="search-result-building">${_escapeHTML(m.sub)}</span>`;
      item.addEventListener('click', () => {
        searchResults.classList.remove('open');
        searchInput.value = '';
        searchClearBtn.classList.remove('visible');
        recordInteraction(m.id);
        zoomToBuilding(m.id);
      });
      searchResults.appendChild(item);
    });
  }
  searchResults.classList.add('open');
}

export function highlightMatch(text, query) {
  const re = new RegExp(`(${_escapeRegex(query)})`, 'gi');
  return _escapeHTML(text).replace(re, '<mark style="background:var(--yellow);padding:0 2px;border-radius:2px;">$1</mark>');
}
