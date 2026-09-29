---
# DVTD-545v
title: Loot storage from a run that has ended
status: completed
type: feature
priority: normal
tags:
    - gameplay
    - juice
    - meta-progress
created_at: 2026-07-19T09:09:13Z
updated_at: 2026-09-28T12:18:55Z
parent: DVTD-z2r2
---

**What:** Let a player take storage off another player's finished run.

**Why:** Turns someone else's failure into something you can find.

## Done when
- [x] Only finished runs can be looted, from a pool fixed at a day boundary
- [x] Nothing a player already banked can be taken
- [x] Who you can loot does not vary from player to player within a shared day
- [x] A spec covers the pool and the transfer

## Notes

When another player's run ends, their abandoned items/loot should be storable by other players who encounter them. This creates emergent gameplay where players can benefit from others' progress and failures.


## Kept 2026-09-04

Reviewed against DVTD-in1b (will unbanked storage to a category pool) and kept
deliberately: they are different mechanics. in1b is a donation of ashes that
costs nothing and pays everyone. This is taking storage off a specific player,
which is the fun part and also the part that needs guard rails.

Constraints any shape has to satisfy:

- Nothing in a live run may read live social data. The pool of lootable runs has
  to be **completed** runs, fixed at a boundary, the same rule that makes ghosts
  legal.
- The loser must not be able to lose what they already banked. `archived_storage`
  is the permanent balance; the lootable amount can only be the run's unbanked
  remainder, or the loot has to be minted rather than transferred.
- The seed is shared daily, so who you can loot cannot be a per-player roll
  without breaking the shared climb.

## Summary of Changes

Shipped as ADR-135. A run that died today carries whatever storage the archive
credit left behind, and a climber still on the mountain can take it.

**The rule.** `unbankedKb(held, gatesCleared, won)` in `rules.model.ts`, the
arithmetic complement of `bankedKb` — the same pair the run-over debrief now uses
to print `archived this run` and `run balance, lost`. One function, two surfaces,
so the corpse and the debrief cannot quote different figures. The "never lose what
you banked" rail is met by construction: `users.archived_storage` is not read or
written anywhere on the loot path.

**The claim.** `lootFallenRunService` validates outside the transaction, then
claims inside it through `dispatchRunActionService`'s `settle` hook, exactly as
`fireAuditService` files an incident. The claim is a guarded update
(`WHERE looted_by_user_id IS NULL … RETURNING id`); zero rows throws, and the
throw rolls back the storage credit with it. There is no ordering that credits a
looter without marking the corpse, or the reverse.

**The anti-cheat.** `loot` is a `RunAction` but is deliberately absent from
`runActionSchema`, the zod union `dispatchRunAction` validates — a client that
could post `{ type: "loot", kb: 999999 }` could mint storage. `run.validation.ts`
already carried a compile-time assertion that the schema covers every action;
that assertion now excludes a named `ServerMintedAction` set, so a new action
still cannot be forgotten and the carve-out has to be written down to be taken.
Caught by that guard failing to compile, not by review.

**The surface.** A row on the fallen climber's card on the climb map, picked by
the same `lootRefusalOf` the server validates with: `Loot 138 KB` when it is
takeable, the bare figure when it is not yours to take, `looted by Misty · 138 KB`
once it is spent.

**Seed.** Seeded climbers had no storage at all, so every card read 0 KB and no
corpse was worth anything. They now carry storage, and Lt. Surge's run is seeded
already looted so the spent state is visible without pressing anything.

### Files

- `run/run/domain/rules.model.ts` — `bankedKb`, `unbankedKb`
- `run/run/domain/runAction.model.ts` — the `loot` action and its rule
- `run/run/application/run.validation.ts` — `ServerMintedAction`, `WireRunAction`
- `run/community/domain/loot.model.ts` — `lootRefusalOf`
- `run/community/application/loot.service.ts` — validate, dispatch, claim
- `run/community/infrastructure/loot.repository.ts` — the guarded claim
- `run/community/infrastructure/climbers.repository.ts` — `fetchFallenRun`, loot columns
- `run/community/application/climbLadder.viewmodel.ts` — `lootOf` and the copy
- `ui/kanto-theme/ClimberCard.ui.tsx` — the loot row
- `database/seed/{cast,runs}.ts` — storage on climbers, one spent corpse

### Deferred

`DVTD-kgch` (a dead run's configs as draftable loot) and `DVTD-in1b` (willing your
own remainder to a category pool) are untouched. in1b spends the same quantity a
different way and the two will eventually have to agree on who gets it.
