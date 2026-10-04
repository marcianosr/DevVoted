---
# DVTD-8alu
title: A prep-time config holds the gate until it is answered
status: completed
type: feature
priority: normal
created_at: 2026-09-26T08:04:02Z
updated_at: 2026-09-26T08:15:44Z
parent: DVTD-u35m
---

**What:** A config that asks for a decision in prep holds the gate until it gets one, and says so on its own card.

**Why:** Both payouts are floors that cost nothing when missed, so forgetting to pick is a slot paying nothing and the game never mentions it.

## Done when
- [x] A gate will not open while an installed config is still waiting for its decision
- [x] The press is held with a sentence naming what is waiting, never a raw error
- [x] The hold covers the first gate and every gate after it
- [x] Each config's card says the decision is made in prep and that the gate waits for it
- [x] The decision can always be made on the screen that states the hold

## Notes

Two configs ask for a prep-time decision: **Planning Poker** (bet 1..5, floor
semantics) and **SLA** (promise OK / HEALTHY / PERFECT). Both are optional today and
neither description mentions prep.

The case for requiring it: both payouts are floors with no penalty
(`estimatePayoutUnits` returns 0 when `correct < estimated`; `slaUpliftKb` returns 0
when the band is missed). Betting 1 therefore strictly dominates not betting, and
promising OK strictly dominates not promising. "No commitment" is a dominated option,
so forgetting is a pure trap rather than a choice.

Design tension, resolved by a new ADR: ADR-035 D1 says "a config is an effect with a
price. It demands nothing", and ADR-085 justified Planning Poker as "an input the
player chooses to give". The new rule is that a config may demand the input its own
effect reads — never knowledge — satisfiable on the screen that states the hold.

ADR-085's "a committed bet and no bet are different states" survives: the fields stay
optional, and `estimateThisGateUnits === undefined` narrows in meaning to "the config
was not in the build when the window closed".

Plan: `/Users/marciano/.claude-work/plans/if-you-hane-planning-calm-flute.md`

## Summary of Changes

ADR-118 written (117 was taken by a parallel session mid-work). Both prep-time
configs now hold the gate until they are answered.

**Domain.** `estimateOwed` (`estimate.model.ts`) and `bandOwed` (`sla.model.ts`)
each extend the conjunction their control factory already reads, so the hold and
the picker cannot drift. `runAction.model.ts` gains `PREP_EXITS = ["start",
"finish-reward"]` and `prepHold`, checked in `reduce` beside the existing
`SHOP_WRITES`/`isShopLocked` line. `canVendorLock` moved out of `start()` into
`prepHold`, which also closes the leak where `finishReward` had no guard at all
and gives prep the vendor refusal ADR-087 claimed it already had.

**Presentation.** `commitmentRemedy` in `prepScreen.viewmodel.ts` builds one
clause per waiting config off the control's own `configLabel`. `PrepView` derives
both the press and the refusal from one chain: countdown → vendor → calls. No new
`RunView` field — `view.estimate !== null && view.estimatedCorrect === null` is
provably the domain predicate, since `start`/`finish-reward` only fire in prep.

**Copy.** Both roster descriptions now say the pick is made on the prep screen,
that the gate waits for it, and that it cannot cost anything. Wiki §4.3 rows
edited by hand.

**Two things found while building:**

- The wiki's config Effect table is **not** generated. It starts on the line after
  `<!-- END GENERATED:CONFIG_COUNTS -->`, so `docs:check` passes whether or not it
  matches the roster. Nothing in CI catches a stale row.
- `configRun.harness.tsx`'s `runWith` ends in a `start`, which the hold refuses —
  every config story carrying these two would have rendered the wrong screen. It
  now answers the build's prep calls first, with a `PrepCalls` override. That also
  fixed a pre-existing bug in `PaysTheCallItMet`, whose `estimate: 5` was
  dispatched after the gate had already started and was being silently discarded.

**Verified:** 3860 tests pass (201 files), oxlint clean on touched files,
dependency-cruiser clean (733 modules), `docs:check` in sync, `tsc --noEmit` clean
for every file touched.

**Not done:** prep still has a pre-existing case where `pollsExhausted` disables
the press while the countdown is open, leaving a dead button with no sentence.
Untouched deliberately — making the press live there would let a gate open with no
polls. Worth its own bean.
