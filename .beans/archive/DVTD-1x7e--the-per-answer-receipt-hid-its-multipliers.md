---
# DVTD-1x7e
title: The per-answer receipt hid its multipliers
status: completed
type: bug
priority: normal
created_at: 2026-08-18T15:47:14Z
updated_at: 2026-08-18T15:49:06Z
parent: DVTD-kulw
---

Marciano, first poll of the first gate: "How can I already have 1.4?" — the HUD read 1.4% coverage while the receipt had promised "+1% coverage" per correct answer.

The 1.4 was right: one correct JavaScript answer at gate 0 = share 1 × gate ×1 × difficulty ×1 × **.js Focus ×1.25** × **streak ×1.1** = 1.375, rounded to 1.4. Neither multiplier was on the receipt.

- `matchingConfigMultiplier` was computed by `perAnswerPreviewFor`, passed into three stories, and **rendered nowhere** — a regression from the receipt rework; the ADR-034 changelog claims it shows "×1.25 on a matching poll".
- The streak step was never surfaced at all, and it applies to *every* correct answer including the first (`nextStreak(0, "correct") = 1`, `streakMultiplier(1) = 1.1`), so `coveragePerCorrect` on its own is a number the player can never actually observe.

Fix: `PerAnswerPreview.streakStepMultiplier` carries the step as data, and the receipt's "Correct answer" row states both multipliers under the base.

## Summary of Changes

`PerAnswerPreview` gained `streakStepMultiplier` (fed by `streakMultiplier(1)`, so the copy cannot drift from the constant), and a new `CoverageMultipliers` block in `GateStakeReceipt` renders "×1.25 on a matching poll · ×1.1 per streak step" under the base — the Focus half only when a Focus config is installed, the streak half always, since it always applies.

Specs: two PrepScreen cases (with and without a Focus config) and a domain case asserting the step is the real constant. Fixtures updated in the factory and three screen specs.

**Verification.** 1599 tests / 121 files green, lint + tsc + build clean. Wiki §4.4 and a `Fixed` CHANGELOG entry. Uncommitted.

## Left open for Marciano

The first correct answer of a run already scores a "streak" of one (`nextStreak(0, "correct") = 1` → ×1.1), so the un-multiplied base is unreachable by construction. Disclosing it is the honest fix; making the streak start paying at *two* consecutive correct answers would be the other one, and that is a scoring change rather than a copy change — his call.
