// The progress store: which trophies are earned and how far each counted
// trophy has got, persisted in localStorage, with export / import / reset.
// State shape: { earned: { [id]: true }, counts: { [id]: number } }.
// A counted trophy is earned exactly when its count reaches its target, and
// the two stay in step whichever control the reader uses.

const STORAGE_KEY = 'leonida-ledger-progress-v1';

function emptyState() {
  return { earned: {}, counts: {} };
}

function readSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    return {
      earned: parsed && typeof parsed.earned === 'object' ? parsed.earned : {},
      counts: parsed && typeof parsed.counts === 'object' ? parsed.counts : {},
    };
  } catch {
    return emptyState();
  }
}

export function createStore(trophies, initialState) {
  const byId = new Map(trophies.map((t) => [t.id, t]));
  let state = initialState ?? readSavedState();
  const listeners = new Set();

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage can be unavailable (private mode); the tracker still works
      // for the session, it just cannot keep progress between visits.
    }
  }

  function emit() {
    persist();
    for (const listener of listeners) listener();
  }

  function syncCounted(trophy) {
    if (!trophy.count) return;
    const n = state.counts[trophy.id] ?? 0;
    if (n >= trophy.count) state.earned[trophy.id] = true;
    else delete state.earned[trophy.id];
  }

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    isEarned(id) {
      return state.earned[id] === true;
    },

    countOf(id) {
      return state.counts[id] ?? 0;
    },

    earnedCount() {
      return trophies.filter((t) => state.earned[t.id] === true).length;
    },

    earnedInGrade(grade) {
      return trophies.filter((t) => t.grade === grade && state.earned[t.id] === true).length;
    },

    setEarned(id, earned) {
      const trophy = byId.get(id);
      if (!trophy) return;
      if (earned) state.earned[id] = true;
      else delete state.earned[id];
      if (trophy.count) state.counts[id] = earned ? trophy.count : Math.min(state.counts[id] ?? 0, trophy.count - 1);
      emit();
    },

    setCount(id, value) {
      const trophy = byId.get(id);
      if (!trophy || !trophy.count) return;
      const clamped = Math.max(0, Math.min(trophy.count, Math.floor(value) || 0));
      state.counts[id] = clamped;
      syncCounted(trophy);
      emit();
    },

    exportJson() {
      return JSON.stringify(
        {
          app: 'leonida-ledger',
          version: 1,
          earned: trophies.filter((t) => state.earned[t.id] === true).map((t) => t.id),
          counts: state.counts,
        },
        null,
        2,
      );
    },

    importJson(text) {
      const parsed = JSON.parse(text);
      const next = emptyState();
      const earnedList = Array.isArray(parsed.earned) ? parsed.earned : [];
      for (const id of earnedList) if (byId.has(id)) next.earned[id] = true;
      if (parsed.counts && typeof parsed.counts === 'object') {
        for (const [key, value] of Object.entries(parsed.counts)) {
          const trophy = byId.get(Number(key));
          if (trophy && trophy.count) next.counts[trophy.id] = Math.max(0, Math.min(trophy.count, Math.floor(value) || 0));
        }
      }
      state = next;
      for (const trophy of trophies) syncCounted(trophy);
      emit();
    },

    reset() {
      state = emptyState();
      emit();
    },
  };
}

// The demo state used by the screenshot runs (see main.js, ?shot=): a
// believable early-game ledger, a few story trophies in and two counted
// grinds under way.
export function demoState() {
  return {
    earned: { 2: true, 3: true, 4: true, 8: true, 9: true, 16: true, 21: true, 44: true },
    counts: { 17: 12, 15: 40, 32: 9, 35: 23 },
  };
}
