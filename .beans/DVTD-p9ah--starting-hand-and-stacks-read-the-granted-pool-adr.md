---
# DVTD-p9ah
title: Guarantee the config you just earned a seat in the next hand
status: todo
type: feature
priority: normal
created_at: 2026-09-03T07:10:05Z
updated_at: 2026-09-24T18:26:12Z
parent: DVTD-z2r2
blocked_by:
    - DVTD-clgs
---

**What:** Guarantee the config you most recently earned a seat in the next hand you are dealt.

**Why:** A freshly unlocked config is one card among thirty, so earning it barely changes the run that follows.

## Done when
- [ ] The newest earned config you have never installed is dealt into the hand
- [ ] Installing it retires the guarantee, so the next one takes the seat
- [ ] A seated config the opening slots cannot hold does not break the deal
- [ ] The prototype run stays fully unlocked

## Notes

Narrowed 2026-09-24. Two of this bean's three halves are already closed, so only
the seat is left:

- The hand deals from the account's granted pool as of DVTD-amtz —
  `startRunService` reads `fetchUnlockedConfigIds` and `poolFor` falls back to the
  free set for an empty ledger, so a run can never fail to start.
- Starter stacks were deleted by DVTD-ez37 (deal 5, pick 3). There is no stack
  left to dim, and `stackAvailable` will never be written.

Why the seat matters, from ADR-062: the shop shelf is never filtered, so an
unlocked config's only benefit is possibly appearing in the hand — 62% at a pool
of 8, 17% at 29, roughly three months of waiting. Without the seat, ADR-051's
twenty-one objectives pay out in a currency that devalues as you earn it.

## Todos

- the unplayed queue is already recorded and needs no migration: rows in
  `user_config_unlocks` with `first_installed_at` null and `via_metric` not null.
  The stamp is already written on first install (`run.repository.ts:185`);
  nothing reads it yet
- `startingHand` gains the seat (a fourth argument, or seeded before the draw);
  the focus band counts it and the pairability repair never evicts it
- `startRunService` fetches the newest unplayed earned id alongside
  `fetchUnlockedConfigIds`
- decide the collision with the slot-budget filter (ADR-062 drops anything larger
  than `BASE_SLOTS`): does the seat outrank the budget, or is a too-heavy config
  skipped and held for a later deal?
- the NEW tag on the seated card is the second announce beat (ADR-064), shipped
  in spirit by DVTD-of79 but with nothing to tag until the seat exists
- proto-run untouched: client-only, no ledger, fully unlocked by construction

## 2026-09-06 note (DVTD-0sjo)

`fetchUnlockedConfigIds` reads the `user_config_unlocks` table (ADR-064), not a
text[] column.
