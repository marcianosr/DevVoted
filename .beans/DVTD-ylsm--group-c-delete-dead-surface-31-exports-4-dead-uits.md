---
# DVTD-ylsm
title: 'Group C: Delete dead surface (31 exports, 4 dead .ui.tsx, session-run orphan)'
status: in-progress
type: task
priority: low
created_at: 2026-08-12T09:12:53Z
updated_at: 2026-08-12T14:48:12Z
parent: DVTD-82c4
---

39% of the `src/modules/run/` domain layer`s 183 exports have zero or one
caller. 31 have none at all.

## Zero-consumer exports, worst offenders
- `view/runRoutes.viewmodel.ts` — exports 6 symbols, the app uses **one** (`syncTarget`). The other five exist only for the spec.
- `gate/configRole.model.ts` — 4 of 9 exports are spec-only, including `stakesRequirement:111` and `extraGateRequirements:123`, both tested and never called
- `rules.model.ts` — 7 exports with no consumer anywhere (`STORAGE_CAP_KB`, `STREAK_COVERAGE_BONUS`, `OPTION_COVERAGE_STEP`, `MULTIPLE_CHOICE_COVERAGE_BONUS`, `DIFFICULTY_BASELINE_OPTIONS`, `GateStake`, `StoragePlan`)
- `climb/run.model.ts:254` and `:966` — re-exports five symbols from other modules; only `rebuildCost` is ever imported through it
- `view/runView.viewmodel.ts` — 5 dead types/functions
- `pipeline/pipeline.model.ts` — `storageOnClearFor`, `coverageProfileFor` are exported but consumed only inside their own file
- `configs/effect.model.ts` — `Effect.faucetPerCorrect` is a live field on a live type that is **never read** (see the Group A mirrored-rules bean)

Where a spec is the only consumer, that is the signal the export should be
private and tested through its real caller. The interface is the test surface.

## Dead files
- `run/presentation/poll/OutcomeTile.ui.tsx` (73 lines) — zero references
- `run/presentation/poll/PollOptionReview.ui.tsx` (101) — zero references
- `src/ui/TextButton.component.tsx` (37) — no importer, no story, no spec
- `src/ui/LoadingSkeleton.component.tsx` (9) — only its own story and spec
- `src/modules/session-run/` — holds one orphan `presentation/gate/todo.md` and nothing else

Five more `.ui.tsx` (~330 lines) have Storybook as their only consumer:
`poll/PracticeBank`, `poll/RevealScore`, `screens/GameOverScreen`,
`screens/StepHeading`, `run/CoverageByCategory`. Check intent before deleting;
some may be staged for unbuilt features.

## The inverse gap, worth fixing in the same pass
`src/ui/SwatchMark.component.tsx` has **9 live importers** and no spec and no
story, while `src/ui/ContentSection.component.tsx` (a pure pass-through to
`Screen`, 22 lines) has both. 13 `.ui.tsx` files under
`run/presentation/` have neither a story nor a spec, largest being
`gate/GateStakeReceipt.ui.tsx` (268) and `gate/PipelineReportRow.ui.tsx` (275).

Overlaps DVTD-7tof.

## Todo
- [x] Delete the four dead components and the `session-run` orphan folder (also collapsed the Content -> ContentSection -> Screen pass-through chain: 4 routes now use Screen directly)
- [x] Make spec-only exports private, test them through their real caller (rules.model x5, runRoutes x4, runView x5, pipeline.model x2, configRole x3 deleted outright; STORAGE_CAP_KB kept — 3 live consumer files, the finding was stale)
- [x] Drop the `run.model.ts` re-export laundering (runView now imports rebuildCost from draft.model)
- [ ] Check intent on the five story-only files before deleting
- [x] Add a spec for `SwatchMark`; delete `ContentSection`

## Progress note 2026-08-12

All code work done and verified (121 files / 1465 tests green, tsc clean, lint:arch 0 violations, 591 modules — down from 600). Only open item: Marciano has not yet ruled which of the five story-only .ui.tsx files (PracticeBank, RevealScore, GameOverScreen, StepHeading, CoverageByCategory) are staged for unbuilt features.
