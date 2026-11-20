// Renders the tracker: the header progress, the checklist cards, the guide
// panel and the roadmap. Everything is built with DOM calls (never string
// HTML), so trophy text from the data file can never become markup.
// Spoiler rule: with spoilers hidden, an unearned story trophy shows neither
// its name nor its description, in the list or in the guide panel.

import { GRADE_LABELS, GRADE_ORDER, KIND_LABELS } from './data.js';
import { buildRoadmap, stageProgress } from './roadmap.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function isSpoilerHidden(trophy, ui, store) {
  return ui.spoilers && trophy.kind === 'story' && !store.isEarned(trophy.id);
}

function displayName(trophy, ui, store) {
  return isSpoilerHidden(trophy, ui, store) ? 'Hidden story trophy' : trophy.name;
}

function displayDescription(trophy, ui, store) {
  return isSpoilerHidden(trophy, ui, store)
    ? 'A story trophy. Earn it to reveal its name and description.'
    : trophy.description;
}

function gradeBadge(trophy) {
  return el('span', `badge badge-${trophy.grade}`, GRADE_LABELS[trophy.grade]);
}

export function renderHeader(trophies, store, els) {
  const earned = store.earnedCount();
  const percent = Math.round((earned / trophies.length) * 100);
  els.earnedCount.textContent = `${earned} of ${trophies.length} earned`;
  els.earnedPercent.textContent = `${percent}%`;
  els.progressFill.style.width = `${percent}%`;
  els.gradeCounts.replaceChildren(
    ...GRADE_ORDER.map((grade) => {
      const li = el('li');
      const total = trophies.filter((t) => t.grade === grade).length;
      li.append(`${GRADE_LABELS[grade]} `, el('b', null, `${store.earnedInGrade(grade)}/${total}`));
      return li;
    }),
  );
}

function renderStepper(trophy, store) {
  const wrap = el('div', 'stepper');
  const minus = el('button', null, '−');
  minus.type = 'button';
  minus.setAttribute('aria-label', `One fewer for ${trophy.name}`);
  minus.addEventListener('click', () => store.setCount(trophy.id, store.countOf(trophy.id) - 1));
  const label = el('b', null, `${store.countOf(trophy.id)} / ${trophy.count}`);
  const plus = el('button', null, '+');
  plus.type = 'button';
  plus.setAttribute('aria-label', `One more for ${trophy.name}`);
  plus.addEventListener('click', () => store.setCount(trophy.id, store.countOf(trophy.id) + 1));
  wrap.append(minus, label, plus);
  return wrap;
}

export function renderList(trophies, store, ui, els, onSelect) {
  const visible = trophies.filter((t) => ui.filter.match(t, store)).filter((t) => {
    if (!ui.query) return true;
    const haystack = `${t.name} ${t.description} ${t.guide}`.toLowerCase();
    return haystack.includes(ui.query);
  });

  els.resultCount.textContent = `Showing ${visible.length} of ${trophies.length} trophies`;
  els.emptyNote.hidden = visible.length > 0;
  if (visible.length === 0) {
    els.emptyNote.textContent =
      ui.filter.id === 'online'
        ? 'The official PlayStation 5 list has no online trophies — nothing here needs an online mode.'
        : 'No trophies match this filter and search.';
  }

  els.list.replaceChildren(
    ...visible.map((trophy) => {
      const card = el('li', 'trophy-card');
      if (store.isEarned(trophy.id)) card.classList.add('is-earned');
      if (ui.selectedId === trophy.id) card.classList.add('is-selected');
      if (isSpoilerHidden(trophy, ui, store)) card.classList.add('spoiled');

      const check = document.createElement('input');
      check.type = 'checkbox';
      check.className = 'trophy-check';
      check.checked = store.isEarned(trophy.id);
      check.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
      check.addEventListener('change', () => store.setEarned(trophy.id, check.checked));

      const body = el('div');
      const name = el('h3', 'trophy-name', displayName(trophy, ui, store));
      name.append(gradeBadge(trophy), el('span', 'tag', KIND_LABELS[trophy.kind]));
      if (trophy.missable) name.append(el('span', 'tag tag-missable', 'Missable'));
      body.append(name, el('p', 'trophy-desc', displayDescription(trophy, ui, store)));

      const side = el('div', 'card-side');
      const guideBtn = el('button', 'guide-btn', 'Guide');
      guideBtn.type = 'button';
      guideBtn.addEventListener('click', () => onSelect(trophy.id));
      side.append(guideBtn);
      if (trophy.count) side.append(renderStepper(trophy, store));

      card.append(check, body, side);
      return card;
    }),
  );
}

export function renderGuidePanel(trophy, store, ui, els) {
  if (!trophy) return;
  const body = els.guideBody;
  body.replaceChildren();

  body.append(el('span', `badge badge-${trophy.grade}`, GRADE_LABELS[trophy.grade]));
  body.append(el('h3', null, displayName(trophy, ui, store)));
  body.append(el('p', 'trophy-desc', displayDescription(trophy, ui, store)));

  if (isSpoilerHidden(trophy, ui, store)) {
    body.append(el('p', 'guide-text', 'Spoilers are hidden for story trophies you have not earned yet. Tick it off in the checklist, or turn the spoiler setting off, to read its guide.'));
    return;
  }

  if (trophy.missable) {
    body.append(el('p', 'missable-warning', '⚠ Missable: this one hangs on a moment that can pass. Read the guide before you play past it.'));
  }
  body.append(el('p', 'guide-text', trophy.guide));

  const sources = el('div', 'sources');
  sources.append(el('h4', null, 'Sources'));
  const list = el('ul');
  for (const source of trophy.sources ?? []) {
    const item = el('li');
    if (source.url) {
      const link = el('a', null, source.name);
      link.href = source.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      item.append(link);
    } else {
      item.append(source.name);
    }
    list.append(item);
  }
  sources.append(list);
  body.append(sources);

  const actions = el('div', 'guide-actions');
  const check = document.createElement('input');
  check.type = 'checkbox';
  check.className = 'trophy-check';
  check.checked = store.isEarned(trophy.id);
  check.addEventListener('change', () => store.setEarned(trophy.id, check.checked));
  const label = el('label', null, 'Mark as earned');
  label.prepend(check);
  actions.append(label);
  if (trophy.count) actions.append(renderStepper(trophy, store));
  body.append(actions);
}

export function renderRoadmap(trophies, store, els, onSelect) {
  const { stages, missables } = buildRoadmap(trophies);
  els.roadmapStages.replaceChildren(
    ...stages.map((stage) => {
      const section = el('article', 'stage');
      const { done, total } = stageProgress(stage.trophies, store);
      section.append(el('h3', null, `${stage.title} — ${done}/${total}`));
      section.append(el('p', 'stage-note', stage.note));
      const list = el('ul');
      for (const trophy of stage.trophies) {
        const item = el('li');
        const name = el('span', store.isEarned(trophy.id) ? 'done' : null, trophy.name);
        item.append(el('span', null, store.isEarned(trophy.id) ? '☑' : '☐'), name);
        const bits = [];
        if (trophy.count) bits.push(`${store.countOf(trophy.id)}/${trophy.count}`);
        if (trophy.missable) bits.push('missable');
        if (bits.length) item.append(el('span', 'mini', bits.join(' · ')));
        list.append(item);
      }
      section.append(list);
      if (stage.id === 'story' && missables.length > 0) {
        const callout = el('div', 'callout');
        const names = missables.map((t) => t.name).join(' · ');
        callout.append(el('b', null, 'Missable watch: '), `${names}. Both hang on moments the story carries you past — open their guides from the checklist before you get there.`);
        section.append(callout);
      }
      return section;
    }),
  );
}
