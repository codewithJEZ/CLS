import { state } from '../state.js';

// ── DOM refs ──────────────────────────────────────────────────
const assistantBuildingSelect = document.getElementById('assistantBuildingSelect');
const questionsList           = document.getElementById('questionsList');
const questionsSection        = document.getElementById('questionsSection');
const answerArea              = document.getElementById('answerArea');
const answerText              = document.getElementById('answerText');
const assistantIdle           = document.getElementById('assistantIdle');
const assistantModalEl        = document.getElementById('assistantModal');

// ── Callback registry (avoids circular import with script.js) ─
let _updateResetVisibility = () => {};
let _escapeHTML            = s => String(s);
let _escapeRegex           = s => s;

export function registerAssistantCallbacks({ updateResetVisibility, escapeHTML, escapeRegex }) {
  _updateResetVisibility = updateResetVisibility;
  _escapeHTML            = escapeHTML;
  _escapeRegex           = escapeRegex;
}

// ── ASSISTANT SEARCH ──────────────────────────────────────────
// Single unified search-bar + dropdown replacing the plain <select>.
// The original <select> stays in DOM (hidden) for value-syncing only.
// Public API: setAssistantBuilding(id), resetAssistant(clearSelect)

/** Build and inject the combo-box UI once on init */
export function injectAssistantSearch() {
  const bodyEl = document.querySelector('.assistant-modal-body');
  if (!bodyEl) return;

  // Hide original select field; keep it in DOM for value-tracking
  const origField = bodyEl.querySelector('.assistant-field');
  if (origField) origField.style.display = 'none';

  const wrap = document.createElement('div');
  wrap.className = 'assistant-field';
  wrap.id = 'assistantSearchField';
  wrap.innerHTML = `
    <label class="assistant-label"><i class="bi bi-building"></i> Select Building</label>
    <div class="assistant-search-wrap">
      <div class="asst-combo-box" id="asstComboBox">
        <i class="bi bi-search asst-combo-icon"></i>
        <input
          type="text"
          id="assistantSearchInput"
          class="assistant-search-input"
          placeholder="Search or select a building…"
          autocomplete="off"
          spellcheck="false"
        />
        <i class="bi bi-chevron-down asst-combo-caret" id="asstComboCaret"></i>
      </div>
      <div class="assistant-search-results" id="assistantSearchResults"></div>
    </div>`;

  bodyEl.insertBefore(wrap, bodyEl.firstChild);

  // Wire events once — no duplicate listeners
  const inp   = document.getElementById('assistantSearchInput');
  const res   = document.getElementById('assistantSearchResults');
  const caret = document.getElementById('asstComboCaret');

  inp.addEventListener('focus', () => {
    renderAssistantResults(inp.value);
  });

  inp.addEventListener('input', () => {
    if (!inp.value.trim()) {
      // User cleared input → reset Q&A but keep dropdown open with full list
      resetAssistant(false);
      assistantBuildingSelect.value = '';
    }
    renderAssistantResults(inp.value);
  });

  // Caret toggles the dropdown without stealing focus
  caret.addEventListener('mousedown', e => {
    e.preventDefault();
    if (res.classList.contains('open')) {
      closeAssistantDropdown();
    } else {
      renderAssistantResults(inp.value);
      inp.focus();
    }
  });

  // Close when clicking anywhere outside the search field
  document.addEventListener('click', e => {
    if (!e.target.closest('#assistantSearchField')) {
      closeAssistantDropdown();
    }
  });
}

/** Filter state.BUILDINGS and paint the dropdown list */
function renderAssistantResults(query) {
  const res = document.getElementById('assistantSearchResults');
  const inp = document.getElementById('assistantSearchInput');
  const caret = document.getElementById('asstComboCaret');
  if (!res || !inp) return;

  const lq = query.toLowerCase().trim();
  const currentId = assistantBuildingSelect.value;

  const filtered = lq
    ? state.BUILDINGS.filter(b => b.name.toLowerCase().includes(lq))
    : state.BUILDINGS;

  res.innerHTML = '';

  if (!filtered.length) {
    res.innerHTML = `<div class="asst-no-results"><i class="bi bi-search"></i> No buildings found.</div>`;
  } else {
    filtered.slice(0, 10).forEach(b => {
      const item = document.createElement('div');
      item.className = 'asst-search-item' + (b.id === currentId ? ' selected' : '');

      // Highlight matched portion
      const display = lq
        ? _escapeHTML(b.name).replace(
            new RegExp(`(${_escapeRegex(lq)})`, 'gi'),
            '<mark class="asst-match">$1</mark>'
          )
        : _escapeHTML(b.name);

      item.innerHTML = `<i class="bi bi-building"></i><span>${display}</span>`;

      // mousedown prevents input blur before click fires
      item.addEventListener('mousedown', e => e.preventDefault());
      item.addEventListener('click', () => {
        inp.value = b.name;
        closeAssistantDropdown();
        setAssistantBuilding(b.id);
      });

      res.appendChild(item);
    });
  }

  res.classList.add('open');
  if (caret) caret.classList.add('open');
}

/** Close the assistant dropdown */
function closeAssistantDropdown() {
  const res   = document.getElementById('assistantSearchResults');
  const caret = document.getElementById('asstComboCaret');
  if (res)   res.classList.remove('open');
  if (caret) caret.classList.remove('open');
}

/**
 * setAssistantBuilding(id)
 * Central entry-point — syncs hidden <select>, visible input, then loads Q&A.
 * Called from: "Need Assistance" btn, FAB, sidebar, search results.
 */
export function setAssistantBuilding(id) {
  const b = state.BUILDINGS.find(x => x.id === String(id));
  if (!b) return;

  // Clear previous Q&A before loading new building
  resetAssistant(false);

  assistantBuildingSelect.value = b.id;

  const inp = document.getElementById('assistantSearchInput');
  if (inp) inp.value = b.name;

  loadQuestionsForBuilding(b.id);
}

export function initAssistant() {
  // Hidden <select> change = fallback sync (e.g. external code sets it directly)
  assistantBuildingSelect.addEventListener('change', e => {
    if (e.target.value) {
      setAssistantBuilding(e.target.value);
    } else {
      resetAssistant(false);
    }
  });

  // Full reset when modal closes
  assistantModalEl.addEventListener('hidden.bs.modal', () => {
    resetAssistant(true);
  });
}

export function loadQuestionsForBuilding(id) {
  questionsList.innerHTML = '';
  answerArea.style.display = 'none';
  answerText.textContent = '';
  assistantIdle.style.display = 'none';
  const qs = state.QA_DATA[id] || [];
  if (!qs.length) {
    questionsList.innerHTML = `<li class="qa-empty">No questions available yet.</li>`;
  } else {
    qs.forEach(qa => {
      const li = document.createElement('li');
      li.className = 'question-item';
      li.innerHTML = `<i class="bi bi-chat-right-dots"></i>${_escapeHTML(qa.question)}`;
      li.addEventListener('click', () => {
        questionsList.querySelectorAll('.question-item').forEach(q => q.classList.remove('selected'));
        li.classList.add('selected');
        answerArea.style.display = 'none';
        answerText.textContent = '';
        requestAnimationFrame(() => {
          answerText.textContent = qa.answer;
          answerArea.style.display = 'block';
          answerArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
      });
      questionsList.appendChild(li);
    });
  }
  questionsSection.style.display = 'block';
  _updateResetVisibility();
}

export function resetAssistant(clearSelect = false) {
  questionsList.innerHTML = '';
  answerText.textContent = '';
  answerArea.style.display = 'none';
  questionsSection.style.display = 'none';
  assistantIdle.style.display = 'block';

  if (clearSelect) {
    assistantBuildingSelect.value = '';
    // Also clear the visible combo-box input and close its dropdown
    const inp = document.getElementById('assistantSearchInput');
    if (inp) inp.value = '';
    closeAssistantDropdown();
  }
  _updateResetVisibility();
}

export function populateAssistantSelect() {
  while (assistantBuildingSelect.options.length > 1) assistantBuildingSelect.remove(1);
  state.BUILDINGS.forEach(b => assistantBuildingSelect.appendChild(new Option(b.name, b.id)));
}
