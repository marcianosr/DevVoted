---
# DVTD-uhub
title: Build the weight upkeep bill and soft capacity (ADR-074)
status: completed
type: feature
priority: high
created_at: 2026-09-12T12:58:47Z
updated_at: 2026-09-14T17:27:17Z
---

ADR-074 is decided and nothing is built. `SLOT_PRICES_KB` and `STORAGE_PLANS` in
`rules.model.ts` still run the shop, the gate and `run.validation.ts`.

## The rules

1. Weight above the first 4 bills KB at every gate close: 4 -> 0, 6 -> 16,
   8 -> 32, 12 -> 64, 16 -> 128. What happens between and above those rungs is
   open, and should be settled by a sim (DVTD-8gns) rather than by hand.
2. Capacity is soft. No slot to buy, no 24-slot ceiling, no over-capacity state.
3. The storage plan sells free weight and a cheaper bill. The seven-rung KB cap
   goes, and nothing clamps a balance any more.
4. A bill the run cannot pay peels configs until it fits. The player chooses
   which, the way ADR-037's peel screen already works. Never fatal: a build
   peeled to nothing bills nothing.

## What comes out

- `SLOT_PRICES_KB`, the x1.25 ladder, `MAX_SLOTS`, the empty-slot cash-back and
  its high-water mark (ADR-046 decisions 1 and 2)
- `STORAGE_PLANS`' cap column, `canAffordPlan`'s cap reasoning, `revealsPlanTier`
  off `peakStorageKb`, and the balance clamp in `addStorage` (ADR-046 decision 3,
  ADR-006 decision 10's faucet invariant)
- `START_SLOT_PREMIUM` and the start-screen slot purchase (ADR-049)
- `isOverCapacity` and the shop's over-capacity exit lock (ADR-044 decision 4)
- `failPeelShareFor`, `peelQuotaSlotsFor`, `isPeelFatal` keep their screen and
  lose their trigger (ADR-037 decisions 1 and 2, superseded by ADR-071)

## Surfaces

`SlotTrack`, `StorageBar`, the kanto slot boxes and slot offers, the shop's slot
rows and the storage plan ladder all describe bought width. They need re-aiming
at weight and its bill, not deleting.

## Todo

- [x] Settle the upkeep curve's shape between and above the given rungs (ADR-074's table applied as-is; DVTD-8gns still owns the real curve)
- [x] Domain: the upkeep bill, the rung picker, the insolvency drop
- [x] Delete the slot ladder and the cap (the over-capacity state SURVIVES, see ADR-082)
- [x] Re-aim the build and shop surfaces at weight
- [x] Retire ADR-046 and ADR-049 to the README's Retired table once the code is out
- [x] ADR-015 marked nothing-live; a grant no longer has a cap to clip against

## Summary of Changes

Built as **ADR-082**, which amends three of ADR-074's four decisions. ADR-074 is
marked built; ADR-046 and ADR-049 are deleted and in the README's Retired table.

**The rule that changed shape.** The bill is read off the rung the player *holds*,
not the weight in use. A bill that only charges for filled room makes the empty half
of a rung free, so stepping back down is never worth doing. That in turn broke
decision 4: a peel cannot settle a bill charged for reserved room. An unpayable bill
now drops the run to the widest rung its balance covers, and the shop door handles the
rest.

**Capacity is hard again.** Decision 2 is reversed: the rung is a cap and the shop
exit stays shut while the build outweighs it. It is a different lock from ADR-046's,
because it can only fire on a rung the player chose, and always has two ways out.

**One source of truth.** `Build.slots` stops counting bought slots and starts naming
the space held, always a rung weight. Rung weights are unique, so the held rung is
recoverable from it and `RunState` gained no field — `slotsBought` is deleted and
nothing replaces it. `occupiedSlots`, `freeSlots`, `hasRoomFor`, `overflowSlots`
and `isOverCapacity` are untouched, and the shop's exit lock already read
`overflowSlots` — only its wording changed.

**Out:** `SLOT_PRICES_KB`, `MAX_SLOTS`, `nextSlotPriceKb`, `slotCashOutKb`,
`STORAGE_PLANS` and every cap helper, `startSlot.model.ts` entirely, the kanto
`SlotOffer` / `WeightOffer` / `PlanChange` components, and the legacy shop's slot
and storage-plan sections.

**In:** `BUILD_SPACE_RUNGS` and its accessors in `rules.model.ts`, `setBuildSpace`
+ `canPickBuildSpace`, `settleUpkeep` in `closeWindow`, `RunView.buildSpace`, and
the kanto `BuildSpace` panel with 13 specs and 8 stories.

**Gate 2.** The picker opens in the shop that stocks Cascade (`gatesCleared >= 2`).

**Old saves.** `RunState` is a JSON blob, so no migration. But a run saved under the
slot ladder carries an arbitrary `build.slots`, so `upkeepForSpace` resolves the
highest rung at or below the space. That lookup is load-bearing, and specced.

**Verification:** 4221 passing, 2 failing — both pre-existing in
`gate.model.spec.ts` ("the floor rule"), untouched by this work. Lint and
`npm run build` clean. Stories typecheck at the documented 30-error baseline.

## Correction 2026-09-14 (caught in playtest)

The shop showed **16 KB a gate** on the Build panel and **32 KB a gate** on the
build space panel, for the same build.

`buildUpkeepOf` was still `upkeepAt(rungs, weightOf(fills))` — the bill read off
the weight in use, which is exactly the rule ADR-082 replaced. It was the one
surface not re-aimed.

The track underneath was wrong in three more ways, all from the same cause: its
upkeep ticks marked where a *weight* crossed a billing threshold, and under ADR-082
weight crosses nothing.

- "1 to 32 KB" — adding weight does not change a rung-priced bill.
- Hover "without it, 16 KB a gate" — removing a config does not either.
- Ticks at 12 and 16 sat beyond a held rung of 8, which is a hard cap.

**Fix.** The bill has one owner. `Build` states room only
("5 configs · 7 of 8 weight · 1 free"); `BuildSpace` states the bill.
`BuildWeight` is now `{ held }` rather than `{ rungs, max }`. `WeightTrack`
draws the build against the space it rents — blocks plus a dashed remainder, no
ticks, no marks, no bill in the caption. `upkeepAt` and `freeWeightOf` are
deleted; `upkeepLabelOf` moved to `BuildSpace` beside the bill it labels.

Specs re-aimed: WeightTrack (18), Build (63), ShopScreen (28). Suite back to 4213
passing with the same 2 pre-existing gate.model failures.
