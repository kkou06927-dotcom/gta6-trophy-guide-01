// Loads the trophy data file and holds the small shared vocabulary of the
// tracker: the grade order, the kind labels and the filter definitions.
// The data file is fetched relatively, exactly like the page itself, so the
// app works from any static server with the network off.

export const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];

export const GRADE_LABELS = {
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
};

export const KIND_LABELS = {
  story: 'Story',
  collectibles: 'Collectibles',
  activities: 'Activities',
  online: 'Online',
  misc: 'Misc',
};

// The filter chips, in the order they are shown. `match` receives a trophy
// and the store, so state filters (earned / remaining) sit beside the kind
// filters. "online" matches nothing in the official PS5 list today, and the
// empty state in the list says so.
export const FILTERS = [
  { id: 'all', label: 'All', match: () => true },
  { id: 'story', label: 'Story', match: (t) => t.kind === 'story' },
  { id: 'missable', label: 'Missable', match: (t) => t.missable === true },
  { id: 'collectibles', label: 'Collectibles', match: (t) => t.kind === 'collectibles' },
  { id: 'activities', label: 'Activities', match: (t) => t.kind === 'activities' },
  { id: 'online', label: 'Online', match: (t) => t.kind === 'online' },
  { id: 'earned', label: 'Earned', match: (t, store) => store.isEarned(t.id) },
  { id: 'remaining', label: 'Remaining', match: (t, store) => !store.isEarned(t.id) },
];

export async function loadTrophyData() {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error(`trophies.json answered ${response.status}`);
  const doc = await response.json();
  const trophies = Array.isArray(doc) ? doc : doc.trophies;
  return { meta: Array.isArray(doc) ? {} : doc, trophies };
}

export function trophiesByGrade(trophies, grade) {
  return trophies.filter((t) => t.grade === grade);
}

export function gradeTotals(trophies) {
  const totals = {};
  for (const grade of GRADE_ORDER) totals[grade] = trophiesByGrade(trophies, grade).length;
  return totals;
}
