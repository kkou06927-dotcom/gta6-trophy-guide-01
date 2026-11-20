// Builds the roadmap to the platinum from the trophy data itself: the story
// in list order (with every missable flagged as a callout, wherever it sits),
// then the collectible sweeps with their counts, the activities, the online
// trophies if the list ever grows any, the one-off feats as cleanup, and the
// platinum last. Nothing here is hard-coded per trophy: add a trophy to the
// data with a kind and a count and it takes its place in the stages.

function stage(id, title, note, trophies) {
  return { id, title, note, trophies };
}

export function buildRoadmap(trophies) {
  const byKind = (kind) => trophies.filter((t) => t.kind === kind);
  const story = byKind('story');
  const collectibles = byKind('collectibles');
  const activities = byKind('activities');
  const online = byKind('online');
  const missables = trophies.filter((t) => t.missable === true);
  const platinum = trophies.find((t) => t.grade === 'platinum');
  const completion = trophies.find((t) => t.id === 14);
  const cleanup = byKind('misc').filter((t) => t !== platinum && t !== completion);

  const stages = [
    stage(
      'story',
      'Stage 1 — Play the story',
      'Chapters, missions and stranger strands in order. Story trophies cannot be skipped, but two one-off moments elsewhere in the game can be passed by — they are called out under this stage.',
      story,
    ),
    stage(
      'collectibles',
      'Stage 2 — Sweep the collectibles',
      'Map-wide collections and discoveries. Sweep region by region and let the steppers in the checklist count for you.',
      collectibles,
    ),
    stage(
      'activities',
      'Stage 3 — Work the activities',
      'Races, ranges, challenges and repeatable jobs. Most of these also feed the 100% counter, so they pull double duty.',
      activities,
    ),
  ];

  if (online.length > 0) {
    stages.push(
      stage('online', 'Stage 4 — Go online', 'The list’s online trophies, best done while the servers are busy.', online),
    );
  }

  stages.push(
    stage(
      'cleanup',
      `Stage ${stages.length + 1} — Feats and cleanup`,
      'One-off feats, partner moments and money targets that free roam leaves behind, plus the 100% completion gold.',
      completion ? [...cleanup, completion] : cleanup,
    ),
    stage(
      'platinum',
      `Stage ${stages.length + 2} — The platinum`,
      'When every stage above is ticked off, the platinum is awarded on its own.',
      platinum ? [platinum] : [],
    ),
  );

  return { stages, missables };
}

export function stageProgress(stageTrophies, store) {
  const done = stageTrophies.filter((t) => store.isEarned(t.id)).length;
  return { done, total: stageTrophies.length };
}
