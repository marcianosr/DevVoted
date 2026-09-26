---
# DVTD-baxt
title: 'Config: .reduce() replaces the streak''s unit step with a growing one'
status: completed
type: feature
priority: normal
created_at: 2026-09-16T18:22:22Z
updated_at: 2026-09-16T18:32:29Z
parent: DVTD-72d9
---

The first config to touch the streak. Today every correct answer after the first
pays a flat +0.1 units (STREAK_UNIT_STEP). While .reduce() is installed the step
GROWS: the bonus is growth x streakBefore, so a clean window pays 0.25, 0.50,
0.75, 1.00 instead of four flat tenths.

| correct #     | 1  | 2     | 3     | 4     | 5     | clean window |
| default       | +0 | +0.1  | +0.1  | +0.1  | +0.1  | 0.40 |
| .reduce() L1  | +0 | +0.25 | +0.50 | +0.75 | +1.00 | 2.50 |
| .reduce() L5  | +0 | +0.45 | +0.90 | +1.35 | +1.80 | 4.50 |

The name is the mechanic: Array.prototype.reduce folds each step into a bigger
accumulator, which is exactly the curve.

ADR-090 records the reversal. Today's flatness is deliberate and the code comment
on streakUnitBonus argues for it.

## Decisions

- Coverage meter ONLY. streakMultiplier (1 + 0.1 x streak on the gate's KB
  payout, capped x2) is untouched. One term changes, not two.
- The step stays OUTSIDE the multipliers. rules.model.ts already argues why and
  that argument survives: a x6 build turning +1.00 into +6.00 would stop
  rewarding accuracy. .reduce() makes the step grow, not amplify.
- Capped at SLICE_WINDOW - 1 (4 steps). The 5-poll window is the natural ceiling,
  but the streak does NOT reset on a failed gate (only on a clear, answer.model
  closeWindow), so a retry could walk in carrying 4 and open at +2.00.
- Upgradable, no coverage gate. The gate in shopAction.upgrade is focusCategory
  only, so .reduce() upgrades on KB alone at the standard 32 x (level + 1).
  Max level 5. Level bump is +0.05 on the growth: 0.25 at L1, 0.45 at L5.
- 2 slots / 64 KB. It pays 2.5 units a clean window and zero the moment you miss
  - magnitude bought with fragility, priced under Intellisense (4).
- A partial holds the streak, a miss resets it. Inherited from nextStreak, not
  re-specified here.

## Why this axis

Nothing on the 39-config roster touches the streak. streakCapSteps is typed and
consumed by streakCapStepsFor with zero roster users, so the streak is an axis
the engine already reaches for and no config has ever bought.

It is also the only roster config that rewards ORDER within a window: four
correct answers pay 2.5 in a row and 0 if a miss splits them. Every other
coverage config pays the same whatever sequence the window arrives in.

## Reuse, do not rebuild

CoverageBreakdown.streakBonus is already a first-class field with a receipt row
rendered by pollBreakdownFor. .reduce() changes the number in it: no new receipt
row, no new type member. coverageBreakdownForAnswer reverse-derives base from
earned - bonusTotal - streakBonus, so both call sites must read the same growth
or the receipt stops summing.

## Todo

- [x] streakUnitBonus(streakBefore, growth?) in rules.model.ts + doc comment
- [x] Config.streakStepGrowth axis + streakStepOf + isUpgradable clause
- [x] reduce roster entry (2 slots, gives/costs prose)
- [x] streakStepGrowthOf in build.model.ts, passed from both coverage call sites
- [x] effect.model: isOnline clause (no skipReasonFor branch needed, see below)
- [x] CONFIG_UNLOCKS entry: perfect-windows 6 + polls-answered 250 fallback
- [x] configChip.viewmodel: headlineFigureOf (figureLabel already read "coverage")
- [x] Specs: growth curve, 4-step clamp, level bump, breakdown still sums
- [x] Roster-wide specs: unlock count 31 -> 32 (configStories pins no count)
- [x] Story page in src/ui/kanto-theme/configs
- [x] ADR-090, wiki 2.5 + 4.3 + constants table, CHANGELOG

## Summary of Changes

Shipped end to end. ADR-090 records the decision.

Engine:
- rules.model.ts: streakUnitBonus(streakBefore, growth?) + MAX_STREAK_UNIT_STEPS
  (= SLICE_WINDOW - 1). Without a growth it returns today's flat step, so the
  default is untouched.
- config.model.ts: streakStepGrowth axis, streakStepOf (level bump +0.05,
  routed through minifiedUnits), isUpgradable clause, and the streak branch
  leading describeConfig / givesOf / headlineFigureOf.
- build.model.ts: streakStepperFor + streakGrowthOf, passed from BOTH
  coverageForAnswer and coverageBreakdownForAnswer so the receipt still sums.
- configRoster: reduce (2 slots, streakStepGrowth 0.25).
- configUnlock: perfect-windows 6, fallback polls-answered 250.

Two deviations from the plan, both simplifications:

1. NO new SkipReason. The plan called for a skipReasonFor branch, but .reduce()
   is doing something on every answer (the streak either grows or dies), exactly
   like Dependabot. Adding streakStepGrowth to countsThisAnswer makes it always
   online, which avoids a new SkipReason kind AND avoids threading `streak` into
   PollStatusContext, which it does not currently carry.
2. figureLabel needed no change: it already renders kind "coverage" as
   "+n units", so the chip reads "+0.25 units" for free.

Docs: ADR-090 + README index row, wiki 2.5 streak paragraph, 4.3 roster row,
constants table row, CHANGELOG. Boyscout: the wiki said "Thirty-eight configs"
and had no row for `strict: true` (roster was already 39). Added the strict row
and corrected the count to forty.

## Verification

- npx vitest run: 4290 passed, 2 failed, 6 skipped, 2 todo (230 files).
  The 2 failures are PRE-EXISTING in gate.model.spec.ts ("the floor rule"),
  confirmed by stashing every file in this change and re-running: same 2 fail.
  Untouched by this work.
- npm run lint: clean. depcruise 916 modules, 0 violations - config/domain ->
  run/domain for MAX_STREAK_UNIT_STEPS is legal and rules.model.ts is a leaf
  (zero imports), so no cycle.
- npm run build: no type errors.
- Story suite: 88 passed, 5 new .reduce() pages render through the real engine.

## Follow-ups not taken

- streakCapSteps stays dead. It lifts the KB payout ceiling, a different meter;
  ADR-090 says why folding the two was rejected.
- Sandbox (DVTD-ay94) and renovate (DVTD-sjh2) are designed but not built.
