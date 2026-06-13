---
# DVTD-n4rx
title: Inject archived storage at run start
status: draft
type: feature
priority: normal
created_at: 2026-06-13T08:51:00Z
updated_at: 2026-06-13T08:51:00Z
parent: DVTD-lwvx
---

Before starting a new run, the player can choose to inject some of their accumulated **archived storage** as starting capital — giving them more storage headroom from turn 1 without having to earn it through gate rewards.

## Why this matters

- Right now, archive only converts into cosmetics (borders). It has no mechanical use, making it feel inert for players who already own all borders.
- Letting players spend archive to front-load a run creates a meaningful meta-progression spend decision: save up for cosmetics, or buy yourself a better start?
- It rewards players who finish runs cleanly (large archive surplus) with a tangible in-run advantage — a classic roguelike loop: do well → bank resources → start stronger next time.

## Sketch of the flow

1. On the **new run screen**, a slider or step-selector lets the player choose how much archive to inject (e.g. 0 KB, 64 KB, 256 KB, 1 MB, custom).
2. The chosen amount is **deducted from `archived_storage`** and added to the run's `storage_limit` as starting storage.
3. The run begins with that extra storage already available — no gate needed to earn it.
4. If the player cancels run start after selecting an amount, no archive is spent.

## Design questions

- **Cap**: Is there a maximum inject amount per run? Without a cap, a player with 100 MB of archive trivialises early gates.
- **Granularity**: Fixed tiers (64 KB / 256 KB / 1 MB) vs. freeform slider?
- **UI placement**: Does this sit on the existing run-start screen, or does it open a separate "loadout" step?
- **Conversion rate**: 1:1 bytes from archive to storage, or a penalty rate (e.g. only 80% converts) to discourage hoarding purely for mechanical advantage?
- **Visibility**: Should the injected amount show up in the StorageBreakdown during the run so the player can see it separately from gate-earned storage?
- **Interaction with DVTD-annw**: If pre-selected configs also live on the run-start screen, this feature and that one need to share the same "loadout" surface — worth designing together.

## Related

- [[DVTD-enj5]] — the archive system this feature draws from; archive must exist and be credited correctly before injection makes sense.
- [[DVTD-annw]] — both features add pre-run decisions to the run-start screen; should be designed together to avoid a cluttered loadout step.
- [[DVTD-lwvx]] — parent epic for meta-progression.
