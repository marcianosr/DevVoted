---
# DVTD-rfhb
title: Remove the .reduce() config and its streakStepGrowth axis
status: completed
type: task
priority: normal
created_at: 2026-09-24T10:16:11Z
updated_at: 2026-09-24T10:24:30Z
---

`.reduce()` does not make sense as a config: it replaces the flat streak step with a growing one, which reads as a second, hidden coverage ladder on an axis the player cannot see. Pull it out end to end so no dead axis is left behind.

## Todo
- [x] Roster entry + unlock entry
- [x] `streakStepGrowth` axis in config.model.ts (field, streakStepOf, isUpgradable, describeConfig, headlineFigureOf, givesOf)
- [x] configStatus countsThisAnswer clause
- [x] build.model streakStepperFor / streakGrowthOf
- [x] rules.model streakUnitBonus growth param + MAX_STREAK_UNIT_STEPS
- [x] seed cast.ts RISK_POOL
- [x] Reduce.stories.tsx + configStories.spec.tsx
- [x] Specs
- [x] ADR-090 + README row, wiki, CHANGELOG
- [x] lint, typecheck, tests

## Summary of Changes

Removed end to end, axis and all:

- `configRoster` entry and its `configUnlock` entry (earned-unlock count 36 -> 35)
- `Config.streakStepGrowth`, `streakStepOf`, `STREAK_STEP_LEVEL_BONUS`, and the branches it owned in `isUpgradable`, `describeConfig`, `headlineFigureOf`, `givesOf`
- `countsThisAnswer` in `configStatus.model.ts` now reads only `autoUpgradeAfterCorrect`
- `streakStepperFor` / `streakGrowthOf` in `build.model.ts`
- `streakUnitBonus` lost its `growth` param and `MAX_STREAK_UNIT_STEPS` went with it; the step is flat again (ADR-083)
- `cast.ts` RISK_POOL, `Reduce.stories.tsx`, its `configStories.spec.tsx` registration
- ADR-090 deleted plus its README index row; wiki streak paragraph, roster row and glossary row; the unreleased CHANGELOG bullet

Boy-scout on the wiki paragraph being edited: it still cited `streakCapStepsFor` and `streakCapSteps`, both deleted in DVTD-z1z2. Replaced with `BASE_STREAK_STEPS`.

Verified: lint + arch + docs:check clean, 33 files / 1084 tests green across config, build/domain, run/domain and the config stories. The tree carries unrelated in-flight breakage from concurrent work (`coverageBandOf` unresolved in `pollScreen.viewmodel.ts`); proved this change innocent by applying it alone to a HEAD worktree, where the specs that fail in the dirty tree all pass.
