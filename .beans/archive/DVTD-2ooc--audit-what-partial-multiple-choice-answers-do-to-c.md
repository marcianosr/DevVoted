---
# DVTD-2ooc
title: 'Audit: what partial multiple-choice answers do to configs'
status: completed
type: task
priority: high
created_at: 2026-08-24T15:42:38Z
updated_at: 2026-09-13T18:32:02Z
parent: DVTD-u35m
---

Multi-answer polls can be answered partly right. Audit what that does to a build's
configs, and decide whether the current answer is the intended one.

## What a partial is

`answerOutcome` (`run/domain/run.model.ts`) returns "partial" only on a multi-answer
poll where at least one correct option was caught but not the whole set. Its value is
`coverageShare`: `(correctPicked - wrongPicked) / correctIds.length`, clamped to 0..1.

## What it does today, traced

- **Coverage: it counts, and configs multiply it.** The share runs through the gate
  multiplier and the difficulty multiplier, then through every coverage-affecting config
  via `coverageForAnswer`. Multi polls also carry `MULTIPLE_CHOICE_COVERAGE_BONUS` (+0.5)
  on difficulty, so a good partial on a multi poll can out-score a clean correct on an
  easy single.
- **Storage: it counts for nothing.** `const correct = outcome === "correct"`, so
  `faucetKbPerCorrect` pays 0 and the clear payout, priced off `window.correct` in
  `gateClearPayout`, never sees it. Every KB-per-correct config is dead on a partial.
- **Streak: held, not advanced.** `nextStreak` returns the current value unchanged
  (correct increments, wrong resets to 0).
- **Window tallies skip it.** Neither `window.correct` nor `byCategory[category].correct`
  increments.

## The two things to rule on

1. **The asymmetry.** Partial credit exists in the score currency and is invisible in the
   reward currency. That may be exactly correct under "coverage is score, storage is
   reward", but the consequence is that a player holding storage-per-correct configs gets
   nothing for a 3-of-4 answer, and nothing on screen says so. Either it is the rule and
   the shop copy should say it, or the faucet should pay the share.
2. **The zero-share partial reads as a bug.** When wrong picks match or outnumber right
   ones, `coverageShare` is 0 but the outcome is still "partial". The loss branch keys on
   `auditedShare > 0`, so the answer takes the full `WRONG_COVERAGE_LOSS` while the reveal
   and the review both label it partial. The label and the ledger disagree. Decide which
   is right and make them agree.

## Questions the fix has to answer

- Does a partial pay a fraction of the faucet, or nothing?
- Does `window.correct` stay an integer with partials excluded, or become fractional?
  Fractional ripples into `.length`'s extra-pick payout and every per-correct config, so
  this is the expensive option.
- Should a partial hold the streak, or advance it by less than a full step?
- Do per-correct configs need their rule stated on the card, given multi polls are the
  common case where it bites?

## Todo

- [x] Confirm the trace above against the specs, then decide asymmetry: intended or not
- [x] Fix or justify the zero-share partial so outcome and scoring agree
- [x] If partials start paying storage, re-check the faucet cap and the per-answer preview
- [x] Write the rule into the ADR that owns grading, and into the config copy if it changes

## Summary of Changes

Ruled by Marciano on 2026-09-13, written up as ADR-079.

**1. The asymmetry is intended.** Only coverage reads the multi-answer share.
Storage, the streak step, `window.correct` and the gate clear payout all stay
binary on the exact-set rule, so ADR-006 §11 holds on that half. Coverage is the
score and storage is the reward; a partial has not proven a slot. No faucet
change, so the faucet cap and the per-answer preview were untouched.

**2. The zero-share partial is fixed by making it a miss.** `answerOutcome` now
returns `wrong` when a multiple poll's wrong picks cancel its right ones
(net <= 0). The streak resets, Cache flushes and Dependabot restarts, exactly as
any other miss. `PART` now always means the answer was paid something, so the
badge and the coverage figure can be read together.

**3. The share lands on a fixed quarter ladder.** `coverageShare` rounds the raw
proportion to the nearest quarter and clamps it to 1/4..3/4, so partial credit
reads the same on every poll whatever its key size, and only an exact set pays a
full unit (7 of 8 caught can no longer round into a pass). The rung is on screen:
the `PART` badge carries its figure (`PART ¾`) on the reveal, the gate debrief's
answers panel and the poll review, read from the share already persisted as
`coverageFactors.correct`.

**4. One grader, where there were two.** `coverageShare` and `answerOutcome` each
re-derived the answer key and re-ran the exact-set check, which is how they came
to disagree about a cancelled answer. Both now read one private helper, and
`coverageShare` became generic over the option id so the community board and the
engine grade through the same code.

No config copy changed: no per-correct config's rule moved, because partials
still pay no storage.

### Follow-ups found, not done here

- `auditScoreShare` lets an audit rewrite the share after grading, which would
  land it between rungs and make the badge lie. No audit defines `scoreShare`
  today; the first one that does must re-quantise.
- Nothing simulates a multi-answer-heavy window. The balance sim in
  `coverageRatio.model.spec.ts` models integer correct answers only.
- `docs/wiki.md` §2.5 still documents a wrong-answer coverage bleed
  (`LOSS_LADDER`) and says the streak does not touch coverage. The engine
  hardcodes `coverageLoss: 0` and `streakUnitBonus` adds a flat step to coverage.
  Both are stale and were left alone: correcting them is a design ruling, not a
  doc typo.
