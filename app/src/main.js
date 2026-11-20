// Leonida Ledger — bootstrap and wiring. Loads the data, builds the store,
// renders header / checklist / guide panel / roadmap, and keeps every
// control (search, chips, spoiler toggle, view switch, export / import /
// reset) in step through one small ui state object.
//
// Screenshot runs pass ?shot=<mode>: the app then opens on a seeded demo
// ledger instead of the saved one — cover (a guide open), roadmap, spoiler
// (spoilers hidden) or missable (the Missable filter). It changes nothing
// about normal use; with no parameter the saved progress is used as usual.

import { FILTERS, loadTrophyData } from './data.js';
import { createStore, demoState } from './store.js';
import { renderGuidePanel, renderHeader, renderList, renderRoadmap } from './render.js';

const params = new URLSearchParams(location.search);
const shotMode = params.get('shot');

const els = {
  earnedCount: document.getElementById('earned-count'),
  earnedPercent: document.getElementById('earned-percent'),
  progressFill: document.getElementById('progress-fill'),
  gradeCounts: document.getElementById('grade-counts'),
  search: document.getElementById('search'),
  chips: document.getElementById('chips'),
  spoilerToggle: document.getElementById('spoiler-toggle'),
  checklistView: document.getElementById('checklist-view'),
  roadmapView: document.getElementById('roadmap-view'),
  viewChecklist: document.getElementById('view-checklist'),
  viewRoadmap: document.getElementById('view-roadmap'),
  list: document.getElementById('trophy-list'),
  resultCount: document.getElementById('result-count'),
  emptyNote: document.getElementById('empty-note'),
  guideBody: document.getElementById('guide-body'),
  roadmapStages: document.getElementById('roadmap-stages'),
  exportBtn: document.getElementById('export-btn'),
  importFile: document.getElementById('import-file'),
  resetBtn: document.getElementById('reset-btn'),
};

const { trophies } = await loadTrophyData();
const store = createStore(trophies, shotMode ? demoState() : undefined);
const byId = new Map(trophies.map((t) => [t.id, t]));

const ui = {
  filter: FILTERS[0],
  query: '',
  spoilers: false,
  view: 'checklist',
  selectedId: null,
};

function selectTrophy(id) {
  ui.selectedId = id;
  renderAll();
  document.getElementById('guide-panel').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

function renderAll() {
  renderHeader(trophies, store, els);
  renderList(trophies, store, ui, els, selectTrophy);
  renderRoadmap(trophies, store, els, selectTrophy);
  renderGuidePanel(byId.get(ui.selectedId), store, ui, els);
  els.checklistView.hidden = ui.view !== 'checklist';
  els.roadmapView.hidden = ui.view !== 'roadmap';
  els.viewChecklist.classList.toggle('is-active', ui.view === 'checklist');
  els.viewRoadmap.classList.toggle('is-active', ui.view === 'roadmap');
}

function buildChips() {
  els.chips.replaceChildren(
    ...FILTERS.map((filter) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      chip.dataset.filterId = filter.id;
      const count = trophies.filter((t) => filter.match(t, store)).length;
      chip.append(`${filter.label} `, Object.assign(document.createElement('span'), { className: 'chip-count', textContent: count }));
      chip.addEventListener('click', () => {
        ui.filter = filter;
        for (const other of els.chips.children) other.classList.toggle('is-active', other === chip);
        renderAll();
      });
      if (filter === ui.filter) chip.classList.add('is-active');
      return chip;
    }),
  );
}

els.search.addEventListener('input', () => {
  ui.query = els.search.value.trim().toLowerCase();
  renderAll();
});

els.spoilerToggle.addEventListener('change', () => {
  ui.spoilers = els.spoilerToggle.checked;
  renderAll();
});

els.viewChecklist.addEventListener('click', () => {
  ui.view = 'checklist';
  renderAll();
});

els.viewRoadmap.addEventListener('click', () => {
  ui.view = 'roadmap';
  renderAll();
});

els.exportBtn.addEventListener('click', () => {
  const blob = new Blob([store.exportJson()], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'leonida-ledger-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
});

els.importFile.addEventListener('change', async () => {
  const file = els.importFile.files[0];
  if (!file) return;
  try {
    store.importJson(await file.text());
  } catch {
    alert('That file is not a Leonida Ledger progress export.');
  }
  els.importFile.value = '';
});

els.resetBtn.addEventListener('click', () => {
  if (confirm('Clear all tracked progress in this browser?')) store.reset();
});

store.subscribe(renderAll);
buildChips();

// Demo setups for the maker's screenshots: deterministic views of the real
// app on the seeded ledger.
if (shotMode === 'cover') selectTrophy(37);
if (shotMode === 'roadmap') ui.view = 'roadmap';
if (shotMode === 'spoiler') {
  ui.spoilers = true;
  els.spoilerToggle.checked = true;
}
if (shotMode === 'missable') {
  ui.filter = FILTERS.find((f) => f.id === 'missable');
  for (const chip of els.chips.children) chip.classList.toggle('is-active', chip.dataset.filterId === 'missable');
  selectTrophy(45);
}

renderAll();
document.documentElement.dataset.ready = 'true';
