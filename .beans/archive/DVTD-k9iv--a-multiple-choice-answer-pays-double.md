---
# DVTD-k9iv
title: A multiple-choice answer pays double
status: completed
type: feature
priority: normal
created_at: 2026-09-14T09:36:48Z
updated_at: 2026-09-14T09:51:28Z
---

A select-all poll asks more of the player than a pick-one: you must name the whole key,
and every wrong pick cancels a right one. Today it pays exactly the same. HEAD
(`f15ccf17`) deleted `SINGLE_GAIN` / `MULTIPLE_GAIN` / `baseGainFor(answerType)` for a
flat `BASE_UNIT = 1`, so the poll type changes nothing except whether a partial rung is
reachable. A spec pins it: answer.model.spec.ts:677 "multiple pays exactly what a single
pays".

This adds the first multiple-choice bonus, at double, extended down the ADR-079 ladder.

| Caught | Credit |
| --- | --- |
| nothing, or wrong picks cancel the right ones | 0 (FAIL) |
| 1/4 of the key | 0.5 |
| 1/2 | 1 |
| 3/4 | 1.5 |
| the exact set | 2 |

A single-answer poll is unchanged: 1 correct, 0 wrong.

## Credit is a term beside the share, not a bigger share

`coverageShare` does two jobs: it returns the ADR-079 rung, that rung is persisted as
`coverageFactors.correct`, and the `PART` badge reads it through `RUNG_FIGURE`. Doubling
the share in place would render a quarter-caught multiple as `PART` half. So the share
stays as ADR-079 defined it and the doubling is its own term:

    earned = BASE_UNIT * share * credit(answerType) * buildMultiplier + streakUnitBonus

The ADR-079 ladder, ceiling rule, cancellation rule and every test in
runPoll.model.spec.ts survive untouched. That is the check the seam is right.

## Rulings taken (Marciano, 2026-09-14)

1. The `PART` badge keeps the caught fraction (`PART 3/4`), not the credit earned.
2. Coverage only. Storage, streak, `window.correct` and the gate payout stay binary on
   the exact-set rule (ADR-079 D4 holds).
3. The 300 Multiple Choices audit pays the double credit: mirrored polls are graded and
   credited as the select-alls they become. Knowingly accepted windfall.
4. Previews and projections become poll-aware via an optional `answerType`, defaulting
   to single so build-planning surfaces keep the single baseline.

## Flagged for playtest

Run coverage is `banked units / (5 * (gate + 1))`, a denominator that assumes one unit
per poll. Gate difficulty now depends on the poll mix dealt. `bankableUnits` +
`surplusPayoutKb` already convert the overflow to KB at the ceiling, which softens the
top end but not the swing. Ship and watch rather than pre-moving `HEALTHY_LADDER`.

## Todo

- [x] `creditFor` / `MULTIPLE_CREDIT` in coverageRatio.model.ts (not runPoll: see below)
- [x] `answerType` on `AnswerContext`
- [x] `gradedPollFor` extracted, scoreAnswer + runView.viewmodel use it
- [x] Credit applied in coverageForAnswer / coverageBreakdownForAnswer / perAnswerPreviewFor
- [x] `gainPerCorrectFor` takes answerType, poll screen passes the live type
- [x] Specs: invert the "pays the same" pin, add the five-row table, multi-heavy sim case
- [x] ADR-081 + wiki 2.5 + adr/README + CHANGELOG
- [x] lint, build, test all green

## Summary of Changes

`creditFor(answerType)` returns 2 for a multiple and 1 for a single, and multiplies
the answer beside the build: `BASE_UNIT * share * credit * build + streak step`.
ADR-079 `coverageShare` is untouched and still returns the rung, which is what the
`PART` badge reads. `runPoll.model.spec.ts` and the three verdict-badge specs passed
without edit, which was the check that the seam was in the right place.

### Landed differently to the plan

**The credit lives in `coverageRatio.model.ts`, not `runPoll.model.ts`.** The plan put
it next to `AnswerType`, but `gainPerCorrectFor` also needs it, and `runPoll.model.ts`
already imports `coverageRatio.model.ts` for types. A value import back would have been
a runtime cycle. `.dependency-cruiser.cjs` `no-circular-runtime` exempts `type-only`
edges, so defining `creditFor` beside `BASE_UNIT` and importing only `type AnswerType`
keeps the whole cycle type-only and adds no runtime edge. `depcruise` reports no
violations across 982 modules. This is also where the deleted `baseGainFor(answerType)`
used to live.

**`scoreAnswer` lost its `poll` parameter.** It now reads `grade.graded`, so the
parameter was dead.

### Files

- `build/domain/coverageRatio.model.ts` — `SINGLE_CREDIT`, `MULTIPLE_CREDIT`,
  `creditFor`; `gainPerCorrectFor` takes `answerType = "single"`
- `config/domain/effect.model.ts` — `answerType` on `AnswerContext` (required)
- `build/domain/build.model.ts` — credit in `coverageForAnswer`,
  `coverageBreakdownForAnswer` (as `base`) and `perAnswerPreviewFor`
- `run/domain/answer.model.ts` — `gradedPollFor` exported; `answerContextFor` carries
  `answerType`; `scoreAnswer` contexts off the graded poll
- `run/application/runView.viewmodel.ts` — the poll screen preview and config statuses
  both read the graded poll, so `gateProjectionFor` follows
- ADR-081, wiki 2.5 + glossary, adr/README, CHANGELOG

### The balance finding

The sim is now poll-mix aware and the swing is larger than expected. A bare build at
70% accuracy summits **0.5%** of all-single runs and **50%** once a quarter of the
window asks for a set. Saturates by half the window because `bankableUnits` caps and
`surplusPayoutKb` converts the rest to KB. Two tests pin it. `HEALTHY_LADDER` was
deliberately not moved: see ADR-081 Consequences.

### Verification

`npm run build` clean (vite + tsc, 0 errors). `npm run lint` clean, `depcruise` no
violations. `npx vitest run`: **4301 passed**, 4 failed. All 4 failures were confirmed
pre-existing by running them in a detached worktree at HEAD `f15ccf17`: two
`PollScreen.spec.tsx` layout assertions expecting a `nav`, and two `gate.model.spec.ts`
floor-rule tests asserting a rule whose implementation is still a `TODO(marciano)` in
`gateClosingFor`.

### Follow-ups not done here

- `auditScoreShare` can still rewrite a share off its quarter, which would make the
  badge lie (flagged by ADR-079 and DVTD-2ooc, untouched).
- `rules.model.spec.ts` has no direct tests for `SHARE_STEP` / `partialShareFor` /
  `roundToQuarter`; the ladder is only covered transitively.
- `docs/wiki.md` glossary `HEALTHY_LADDER` row still lists the pre-rebase percentages
  and wiki 2.5 still documents the `LOSS_LADDER` bleed. Both belong to DVTD-vhuh's
  pending ADR, so they were left alone rather than half-corrected.
