---
# DVTD-2ooc
title: 'Audit: what partial multiple-choice answers do to configs'
status: todo
type: task
priority: high
created_at: 2026-08-24T15:42:38Z
updated_at: 2026-08-24T15:42:38Z
parent: DVTD-kulw
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

- [ ] Confirm the trace above against the specs, then decide asymmetry: intended or not
- [ ] Fix or justify the zero-share partial so outcome and scoring agree
- [ ] If partials start paying storage, re-check the faucet cap and the per-answer preview
- [ ] Write the rule into the ADR that owns grading, and into the config copy if it changes
