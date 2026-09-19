---
# DVTD-1gic
title: 'Config: strict: true — a per-poll confidence wager'
status: completed
type: feature
priority: normal
created_at: 2026-09-16T18:10:55Z
updated_at: 2026-09-16T18:26:14Z
---

`strict: true` is the first per-poll wager. Toggle it before answering: an exact
answer pays +0.5 units, anything less costs 0.5 units off the gate window.

Reverses part of ADR-073 ("a wrong answer subtracts nothing"), scoped to this one
config. ADR-089 records the reversal.

## Decisions

- The penalty bites `window.unitsEarned`, the meter the band reads, clamped at 0.
  A penalty that skips the window is a cost you can never lose to.
- A partial costs 0.5. Exact or nothing. Diverges from `nextStreak`, where a
  partial holds.
- The arm resets to off after every answer, like `manualDisabled`.
- 1 slot, matching Planning Poker. Earned on `polls-correct` 50.
- Not upgradable: flat +/-0.5 at every level.

## Why it is mostly reconnection

ADR-073 removed the loss rule but left every mechanism standing:

- `AnswerLedger.coverageLoss` / `AnsweredPoll.coverageLost` / the subtraction in
  `applyAnswer` are live code fed a literal 0.
- The "wrong costs 0.5" badge in the poll header is already rendered by
  `PollView.component.tsx`, starved by `perAnswerPreviewFor`'s hardcoded
  `coveragePerWrong: 0`.
- `Badge`'s `armed` prop (aria-pressed, `press-theme-armed`, passing specs) and
  `ConfigChip`'s `armed={badge.armed}` are built. `badgesFor` never passes it.

The one genuinely new line is subtracting the loss from `window.unitsEarned`.

## Todo

- [x] `Config.wagersAnswer?: number` + roster entry + unlock
- [x] `RunState.strictArmed` + `arm-strict` action + zod mirror
- [x] `strict.model.ts`: stake, arm, settlement
- [x] Settle in `scoreAnswer`; subtract + disarm in `applyAnswer`
- [x] `perAnswerPreviewFor` + `coverageBreakdownForAnswer` carry the stake
- [x] `isOnline` arm so strict is never "skipped"
- [x] `PressAction` "arm-strict", `pressesOf` branch, `badgesFor` passes `armed`
- [x] Loss row in `pollBreakdownFor`
- [x] Prose fan-out: describeConfig, givesOf, headlineFigureOf
- [x] Specs across strict/answer/build/pollScreen
- [x] ADR-089, wiki 2.5, CHANGELOG, Story

## Summary of Changes

ADR-089 written and indexed. The loss term returns to the meter, scoped to one config.

**Domain.** `Config.wagersAnswer?: number` (0.5); roster entry `strict` (1 slot, 32 KB); `CONFIG_UNLOCKS.strict` earned on `polls-correct` 50. New `strict.model.ts`: `strictStakeOf`, `strictSettlementFor`, `canArmStrict`, `armStrict`. `RunState.strictArmed?: boolean`, action `arm-strict` (bare, `answering` only) plus its zod mirror.

**Settling.** `scoreAnswer` calls `strictSettlementFor` on `liveConfigsOf`, so an audit that takes strict offline voids the wager. The bonus is added flat outside `coverageForAnswer`, which returns early on share 0 and knows no outcome. `applyAnswer` subtracts `coverageLoss` from `window.unitsEarned` (the one shared-scoring change) and clears `strictArmed` beside `manualDisabled: []`.

**Receipt.** `wagererFor` joins `linterFor`/`peekerFor`. `coverageBreakdownForAnswer` takes `wagerUnits` so a won wager is its own row and `base` still derives; `perAnswerPreviewFor` takes it as `coveragePerWrong`, lighting the header badge dead since ADR-073. `pollBreakdownFor` adds a `wager lost` row off `coverageLost` and nets the total.

**Press.** `PressAction` gains `arm-strict`; `PollPress.armed?` is optional so a one-shot press states no pressed state. `badgesFor` passes `armed` through to the Badge prop that has always accepted it, and refuses over a staged reveal ("wagered on this answer") because the press would otherwise arm the next poll. RunPoll's press ternary became an exhaustive `PRESS_ACTIONS` map under `satisfies`.

**Deferred:** DVTD-rwy8, Dry Run's projection still ignores the stake.

**Verified:** 4274 passing; the 2 gate floor-rule failures are pre-existing on this branch (confirmed by stashing). `npm run lint` clean, 0 dependency violations. `npm run build` and `tsc --noEmit` clean. 6 new stories render under the config story spec (77 to 83).
