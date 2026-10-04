---
# DVTD-1zzz
title: Delete gateBaseMultiplier from the old run loop (ADR-073)
status: completed
type: task
priority: normal
created_at: 2026-09-12T12:58:47Z
updated_at: 2026-09-13T09:26:32Z
---

Two coverage engines are live and they disagree about what a correct answer is
worth. `coverageRatio.model.ts` pays a flat 5% (8% for a multiple);
`rules.model.ts`'s `gateBaseMultiplier(gatesCleared) = gatesCleared + 1` still
multiplies the old loop's earn by the gate number.

ADR-073 decision 1 settled it: the gain does not scale, and the HEALTHY line is
the only difficulty dial. Until this comes out, a number quoted to a player
depends on which screen they are standing on.

## Call sites

- `src/modules/run/run/domain/rules.model.ts:93` (the definition)
- `src/modules/run/run/domain/answer.model.ts:274`
- `src/modules/run/build/domain/build.model.ts:154, 165` (one of them capped by
  `GATE_REWARD_MULTIPLIER_CAP`, which exists only because the multiplier does)
- `src/modules/run/run/presentation/PollView.component.tsx:300, 349`

`COVERAGE_DEMANDS` goes with it: a flat gain against a point table priced for a
scaling one is not a balance, and `HEALTHY_LADDER` replaces it.

## Todo

- [ ] Remove the multiplier and `GATE_REWARD_MULTIPLIER_CAP` with it
- [ ] Point the old loop at `coverageRatio.model.ts`, or delete the loop
- [ ] The reveal chip's `base + streak + configs = total` equation has to still add up

## Scope corrected 2026-09-13

The call-site list above is stale: `PollView.component.tsx` is 206 lines and has
no `gateBaseMultiplier`. Live sites are `rules.model.ts:93` (def),
`answer.model.ts:274`, `build.model.ts:154, 165`, `rules.model.spec.ts:46, 158`.

Widened to land the whole ratio model in the live loop, because deleting the
multiplier alone leaves the run on `COVERAGE_DEMANDS` and the player still sees
20 points a answer at gate 0. Plan:
`~/.claude-work/plans/read-up-on-the-linear-flame.md`.

Deviation from the todo below: `GATE_REWARD_MULTIPLIER_CAP` stays. ADR-073 kills
gate scaling on the coverage GAIN; the KB REWARD scaling with depth is DVTD-1hmv
and still wanted. The multiplier is renamed `gateRewardMultiplier` with one
caller, `gateClearPayout`.

## Todo (revised)

- [x] Rebase `HEALTHY_LADDER`, `OK_DROP` 0.10, `SHAKY_DROP` 0.20 (DVTD-gv0v:635)
- [x] `coverageDeltaFor` takes a multiplier, not a config list
- [x] Live loop earns `5%`/`8%` x the effect-algebra multiplier, in percent units
- [x] Loss switches `wrongLossShareFor` -> `lossShareAt`
- [x] Streak leaves coverage, `gateClearPayout` picks it up
- [x] `gateLadderFor` replaces `gateDemandFor`; delete `COVERAGE_DEMANDS`
- [x] Delete `gateBand.viewmodel.ts`; bar takes the gate's own thresholds
- [x] Fix `bandOutcomesFor`'s stale ADR-071 OK copy
- [x] Verify: npm test, npm run lint, npm run build

## Summary of Changes

The ladder from DVTD-gv0v:527-541 is applied, and the live run now reads it.

**The ladder.** `HEALTHY_LADDER` rebased to `.05 .10 .15 .20 .25 .30 .40 .50 .60
.70 .80 .90 .95`, `OK_DROP` 0.10, `SHAKY_DROP` 0.20. Reproduces the table cell
for cell: SHAKY empty at gates 0-1, DANGER empty at gates 0-3.

**One engine.** `COVERAGE_DEMANDS`, `gateBaseMultiplier`, `pollDifficultyMultiplier`
and `wrongLossShareFor` are gone. A correct answer pays `5%` (`8%` multiple) times
the build's effect-algebra multiplier, at every gate. The miss costs
`LOSS_LADDER[gate]` of that, which is zero through gate 2. `coverageDeltaFor` now
takes a multiplier rather than a config list, so the sim and the live loop share
one formula while the live loop keeps `effectOf(config).coverage(context)` (Cache,
Overclock's opener, throttle, minification).

**The bar.** `gateBand.viewmodel.ts` is deleted. `gateLadderFor` returns the
gate's own floor/ok/healthy in percent and feeds `CoverageBar` directly, so
ADR-070 decision 1 is real: the track is the ladder and the zones shift per gate.
The bare-build clamp survives as `closedBarFor` in `gateOutcome.viewmodel.ts`,
now against the gate's real rungs.

**The streak** left coverage (ADR-073) and pays in KB: `gateClearPayout` takes it.
`gateBaseMultiplier` survives as `gateRewardMultiplier` with one caller, because
ADR-073 kills gate scaling on the GAIN, not on the KB reward (DVTD-1hmv).

**One defect found.** `latestAnswerScore` derived `isCorrect` from `base >= 0`.
With a free early miss that reads a wrong answer as correct; it now reads the
outcome.

**Cycle broken.** `CoverageBreakdown`/`CoverageConfigBonus`/`CoverageFactors`
moved from `build.model.ts` to `coverageRatio.model.ts`, which removes the
`runPoll.model -> build.model` edge. `AnswerType` stayed in `runPoll.model` per
CONTEXT.md.

Verified: 4132 tests pass, lint and depcruise clean, `npm run build` clean.
Pinned in `answer.model.spec.ts`: one answer at gate 0 is exactly 5%, and gate 0
asks exactly 5%.

**Left open, flagged:** the streak now multiplies the whole gate payout, so a
perfect window pays 1.5x and a 10-streak 2x, permanently. That is the model of
record (`gatePayoutKb` does the same) but it inflates the KB economy. ADR-076
already names loose payouts as the first thing to look at.
