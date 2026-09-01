---
# DVTD-pv5q
title: Shop sometimes stocks a newer version of a config
status: todo
type: feature
priority: normal
created_at: 2026-09-01T14:15:54Z
updated_at: 2026-09-01T14:15:54Z
parent: DVTD-d0fw
---

## Problem

`rollDraft` (src/modules/run/shop/domain/draft.model.ts:95) shuffles `CONFIG_LIST`, which holds base definitions only, so every shelf offer is v1 forever. The only route to a higher version is drafting v1 and paying `upgradeStorageCost` per step, and for the eleven Focus configs that also means waiting on career coverage (ADR-039). Result: the shelf reads the same at gate 9 as at gate 1, and a deep run's shop stops being interesting once the roster is familiar.

Fiction is already there: a shop that stocks packages should sometimes stock a newer release. No new vocabulary, the version badge exists (DVTD-a3pv).

## Design

**Eligible**: only configs `isUpgradable` says can climb (11 Focus, Unit Tests, Moore's Law, Telemetry, the auto-upgrade config). Never above `maxLevelOf`, so Telemetry tops out at v2.

**Staged by depth**: nothing versioned before gate 4 (after Lock at 2 and Extend at 3, so each shop gains one new thing at a time). Ceiling climbs: v2 from gate 4, v3 from gate 7, v4 from gate 10.

**Sometimes**: at most one versioned offer per shelf, rolled off the existing `draftSeed`, so it is deterministic per shop and a Rebuild can re-roll it away or toward. Start at 1 in 3 shelves.

**Priced**: `draftCost` currently ignores `level`, so a v2 offer would be free power. Price becomes base draft cost plus every upgrade step skipped, at a premium for skipping the coverage:

    price = draftCost(base) + 1.5 x sum(upgradeStorageCost(l) for l = 1..level-1)

A 1-slot Focus v2: 32 + 1.5 x 64 = 128 KB, against 96 KB and 5% coverage earned the long way. `sellRefundIn` then follows for free (half of what you paid), and buy-then-sell stays a loss.

**Permission**: this is the part that needs a call, because it amends ADR-039's "neither substitutes for the other". A shelf v2 lets KB buy a Focus level that coverage never earned. My pick: allow it, and let the 1.5x be the whole reason it is allowed (you are buying upstream's mileage, not your own). Alternative: roll a versioned Focus offer only when the run already meets that level's coverage, which keeps ADR-039 whole but reduces the feature to saving two taps.

## Todos

- [ ] Decide the permission question above, write it up as the next free ADR (051) amending ADR-039
- [ ] `draftCost` accounts for `level` (premium sum), so shop, refusal copy and reducer charge all quote one price
- [ ] `rollDraft` can hand back a leveled config: eligibility, depth ceiling, one-per-shelf, seeded
- [ ] Locking a versioned offer keeps its version through the rebuild
- [ ] `shopOffersFullRoster` (WTFPL) path decides explicitly: whole catalog at v1
- [ ] Shelf row shows the version badge and the leveled effect text, not the v1 text (regression guard for DVTD-a6yf)
- [ ] Tests: no versioned offer before gate 4, never a non-upgradable config, never above maxLevel, same seed reproduces the same version, price = base + premium sum
- [ ] Wiki: 5.2 Draft row and 4.4 Upgrades
- [ ] CHANGELOG (player-visible)

## Open questions

- Does a versioned offer read as a reward or as a tax? At 128 KB it competes with two v1 drafts, so it should feel like a choice, not an obvious buy. Watch it in a live run.
- Copy should say v2, which lands better once DVTD-tt4y (versions, not levels) is in.
