---
# DVTD-e083
title: Build space is one module
status: completed
type: task
priority: normal
created_at: 2026-10-01T18:29:56Z
updated_at: 2026-10-01T18:43:19Z
parent: DVTD-y3vn
---

**What:** Room, cap and upkeep for the build are answered by one build space module, and the shop's draft press and the shop screen refuse an offer by the same rule.

**Why:** During a shop held to the space its balance covered, the screen refused an offer the draft action still accepted, because the two checked different caps.

## Done when

- [x] One module answers the space you hold, the cap, the upkeep owed, what settling against a balance leaves, and whether a config fits
- [x] A draft past the covered space is refused by the action as well as the screen
- [ ] Leaving the shop over the covered space is refused by the action as well as the screen (moved to DVTD-ufem)
- [x] The scattered single-purpose helpers are gone and their tests read the new module

## Notes

Scattered today: the ladder helpers in rules.model, the build space helpers in build.model, spaceCapOf / roomToCapOf / overflowWeightOf in run.model, the private settleUpkeep in answer.model, offerRefusal and two billLedger callers in the view models.

## Summary of Changes

- New `build/domain/buildSpace.model.ts`: `buildSpaceOf`, `fitsBuildSpace`, `settleUpkeep`, `rungFitting` (ADR-167). Ladder data stays in rules.model.
- Deleted from rules.model: the rung index, space, upkeep, fitting and affordable helpers. From build.model: `billableSlotsOf`, `spaceForBuild`, `upkeepForBuild`, `rungAfterBuild`, `freeSlots`, `emptySlotCreditOf`, `upkeepAfterCreditOf`, `MAX_BUILD_WEIGHT`, `hasRoomFor`, `overflowSlots`, `isOverCapacity`. From run.model: `spaceCapOf`, `overflowWeightOf`, `roomToCapOf`. answer.model's private `settleUpkeep` moved into the module.
- The draft action and the new-run install now refuse by `fitsBuildSpace`, the same rule as the shop's offer refusal, so the covered-space cap binds the draft.
- Both bill ledgers read the rented space the same way; prep's `ledgerFor` wrapper is inlined.
- The ladder rounds up only; the round-down legacy reading is gone.
- The exit lock is not enforced in the engine: doing so stalls the ADR-161 balance simulation, so it moved to DVTD-ufem.
- Specs for deleted helpers moved to buildSpace.model.spec.ts; ADR-167, CONTEXT.md and the wiki updated.
