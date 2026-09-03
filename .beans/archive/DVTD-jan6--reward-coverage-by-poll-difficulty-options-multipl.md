---
# DVTD-jan6
title: Reward coverage by poll difficulty (options + multiple-choice)
status: completed
type: feature
priority: normal
created_at: 2026-07-24T12:16:30Z
updated_at: 2026-07-24T12:23:08Z
---

Add a difficulty multiplier to coverage earned per answer in the active run engine (src/modules/run/). More options and multiple-choice polls award more coverage. Moderate curve (step 0.1, MC +0.5), gains-only, folded into base (no reveal UI change).

## Todos
- [x] Add constants + pollDifficultyMultiplier to rules.model.ts
- [x] Inject difficultyMultiplier into answer() reducer scoredShare in climb/run.model.ts
- [x] Add unit tests in rules.model.spec.ts
- [x] Update multiple-choice coverage assertions + add integration assertion in run.model.spec.ts
- [x] npm test (targeted+full), lint, typecheck — all green (2 unrelated pre-existing UI-spec failures)
- [x] Property covered by integration test running the production reducer (multiple > single)

## Summary of Changes

- `rules.model.ts`: added `OPTION_COVERAGE_STEP` (0.1), `MULTIPLE_CHOICE_COVERAGE_BONUS` (0.5), `DIFFICULTY_BASELINE_OPTIONS` (3), and pure `pollDifficultyMultiplier(optionCount, isMultiple)` = `1 + step*max(0, options-3) + (isMultiple ? 0.5 : 0)`. Clamped >= 1 (bonus, never penalty).
- `climb/run.model.ts`: `answer()` reducer now folds `difficultyMultiplier` into `scoredShare` alongside the existing `gateMultiplier`. Gains-only — `coverageLoss` untouched.
- Tests: new `pollDifficultyMultiplier` unit block; updated 3 multiple-choice coverage assertions (0.6->0.9, 0.5->0.8 x2, note 0.75 rounds to 0.8 via roundToOneDecimal); added integration assertion that a multiple-choice poll out-earns a single answered fully correct.
- Verification: targeted + full suite pass for run module; oxlint + dependency-cruiser clean (no cycle); `tsc --noEmit` 0 errors. Two failing specs (RunHud, RewardScreen) are from unrelated parallel working-tree UI edits (loadout removal, gate wording), not this change.
