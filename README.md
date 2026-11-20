![Competition](https://make.fun/badge/gta6-trophy-guide-01.svg)
![Rank](https://make.fun/badge/gta6-trophy-guide-01/kkou06927-dotcom/gta6-trophy-guide-01/rank.svg)
![Reward](https://make.fun/badge/gta6-trophy-guide-01/kkou06927-dotcom/gta6-trophy-guide-01/reward.svg)

# Leonida Ledger — GTA VI Trophy Guide & Tracker

An entry in make.fun's [**Make GTA 6 Trophy Guide**](https://make.fun/bounty/gta6-trophy-guide-01) bounty ($250 in USDC).

Leonida Ledger is an offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI. It is a plain static web app — no build step, no accounts, no network: serve the `app/` folder with any static file server and open it in a browser.

## What it does

- **The full official list** — every trophy with its official name, description and grade (1 platinum, 2 gold, 6 silver, 46 bronze), each classified by kind (story, collectibles, activities, online, misc) and flagged when it is missable.
- **A guide for every trophy** — written for this entry: what to do, where and how, and when it can be missed. Each guide cites its sources beside it; nothing is copied from another guide.
- **Tracker** — tick trophies off, step the counters on counted trophies (250 stunts, 42 shooting-range golds, 100 WAiNK locations…), and watch the header progress: earned count, percent, and per-grade counts.
- **Search and filters** — All, Story, Missable, Collectibles, Activities, Online, Earned and Remaining, plus free-text search.
- **Spoiler setting** — hides the names and descriptions of story trophies until you earn them.
- **Roadmap view** — the road to the platinum built from the data: the story in order with the missables called out, then collectible sweeps, activities, cleanup, and the platinum.
- **Your progress, portable** — saved in the browser's localStorage, with Export (JSON download), Import and Reset.

## Run it

```sh
node serve.ts
```

then open http://localhost:8080. `serve.ts` serves `app/` on port 8080 (`--port <n>` for another). Any other static server with `app/` at its root works the same, and the app runs with the network off.

## Data and sources

`app/data/trophies.json` holds the trophies. Names, descriptions and grades are the official PlayStation list, as listed by Exophase and PSNProfiles before the bounty opened. The per-trophy guides are original text written for this entry, drawing on the official descriptions and the published guides they cite (the PlayStation trophy list via Exophase, the PSNProfiles GTA VI trophy guide, and the PowerPyx GTA VI trophy guide and roadmap) — each trophy's sources are shown in its guide panel in the app.

The look is original: no Rockstar Games logos, artwork or screenshots.

## Handing it in

`node main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library (`MAKEFUN_OUTPUT_DIR` stands in for `/output` outside the grader). `vendor/makefun-frontend.ts` is the kit's file, unchanged.
