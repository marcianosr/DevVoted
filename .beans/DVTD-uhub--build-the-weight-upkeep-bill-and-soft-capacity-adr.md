---
# DVTD-uhub
title: Build the weight upkeep bill and soft capacity (ADR-074)
status: todo
type: feature
priority: high
created_at: 2026-09-12T12:58:47Z
updated_at: 2026-09-12T12:58:47Z
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

- [ ] Settle the upkeep curve's shape between and above the given rungs
- [ ] Domain: the upkeep bill, the plan's free weight and discount, the insolvency peel
- [ ] Delete the slot ladder, the cap and the over-capacity state
- [ ] Re-aim the build and shop surfaces at weight
- [ ] Retire ADR-046 and ADR-049 to the README's Retired table once the code is out
- [ ] ADR-015 retires with them, unless a grant still needs a clipping rule
