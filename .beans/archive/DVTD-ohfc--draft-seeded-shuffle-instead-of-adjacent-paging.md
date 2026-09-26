---
# DVTD-ohfc
title: 'Draft: seeded shuffle instead of adjacent paging'
status: completed
type: task
priority: high
created_at: 2026-08-06T14:39:20Z
updated_at: 2026-08-06T14:48:06Z
---

`rollDraft` is not a roll. It returns `pool[(seed + offset) % pool.length]`, a window of DRAFT_SIZE *adjacent* roster entries, and `rebuildDraft` advances the seed by exactly DRAFT_SIZE — so rebuild pages forward through CONFIG_LIST in roster order.

Two consequences:
- A player who learns roster order knows exactly what the next rebuild shows, so rebuild is a known quantity rather than a gamble.
- Window width and rebuild stride are the same constant, so any change to offer count silently changes rebuild semantics.

Fix: seeded shuffle (pure, reproducible — run state is snapshotted in `runSnapshot.model.ts`, so Math.random would resurrect a different shop on reload). Paging disappears, so the stride concept disappears with it. Replace the seed arithmetic with a `draftSeed(gatesCleared, rebuildsUsed)` mix so gate 1's first draft can't collide with gate 0's first rebuild.

DRAFT_SIZE stays 3: the roster is 19 configs and `rollDraft` excludes owned, so the unowned pool is roughly `16 - gate`. At gate 11 the player holds ~14 configs and ~5 unowned exist. A wider window is blocked on roster growth.

## Todo
- [x] Tests first: distinct offers, deterministic per seed, not a contiguous roster slice, no seed collision across gate/rebuild
- [x] Seeded shuffle in `draft.model.ts`
- [x] `draftSeed` mix; wire both call sites in `run.model.ts`
- [x] Run lint, typecheck, tests

## Summary of Changes

Tests first: the new contiguity test showed 28 of 30 drafts were adjacent roster slices, confirming rebuild was paging rather than rolling.

`draft.model.ts` now uses mulberry32 plus a partial Fisher-Yates draw, kept seeded so drafts survive snapshot rehydration. Added `draftSeed(gatesCleared, rebuildsUsed)`, mixing by distinct odd multipliers instead of summing; both `run.model.ts` call sites use it, and `DRAFT_SIZE` no longer doubles as the rebuild stride.

`DRAFT_SIZE` stays 3. The ramp to 5-6 offers is deferred until the roster grows past 19: `rollDraft` excludes owned configs so the unowned pool is roughly `16 - gate`, meaning at gate 11 a 6-wide window would be the entire pool and rebuild would do nothing.

13 draft tests, 81 climb tests, lint and typecheck clean.
