---
# DVTD-hg7v
title: 'Split run.model.ts step 1: extract the poll concept'
status: completed
type: task
priority: normal
created_at: 2026-08-25T13:17:45Z
updated_at: 2026-08-25T13:26:53Z
---

run.model.ts is 1396 lines and is the hotspot of the run engine (22 commits, nearly every gameplay feature lands in it). It does three jobs: pure poll grading, the reducer, and a query surface for runView.viewmodel.

Step 1 extracts the pure grading cluster to `src/modules/run/run/domain/runPoll.model.ts`. Pure move, no logic changes.

Why this cut first: of the 41 files importing run.model, 25 never touch the reducer - they want poll/answer types (AnsweredPoll 20 importers, RunPoll 10, AnswerOutcome 8, AnswerType 5). The grading cluster has zero RunState coupling, so it lifts with no cycle risk.

Location decided against `run/poll/domain/`: ADR-002 section 2 assigns "answer evaluation" to the `polls` context (unmigrated, src/domains/polls/). Keeping it in run/run/domain as runPoll.model.ts means the eventual polls migration is a single-file lift.

## Todo
- [x] Create runPoll.model.ts with the grading cluster + AnsweredPoll
- [x] Strip the moved block from run.model.ts, import what it still uses
- [x] Repoint imports in 35 files (26 fully, 9 split)
- [x] Move the `answerOutcome grades the community board and the engine alike` describe block to runPoll.model.spec.ts
- [x] Update CONTEXT.md (added Run poll / Grading row; Run/Climb row needed no edit)
- [x] npm run lint / npm run build / npm test green

## Summary of Changes

Pure move, no logic changed.

- New `src/modules/run/run/domain/runPoll.model.ts` (158 lines): `RunPoll`, `RunOption`, `AnswerType`, `AnswerOutcome`, `AnsweredPoll`, `answerOutcome`, `coverageShare` (newly exported), `mirrorPoll`, `mirroredAnswerType`, `mirrorGrading`, `nextStreak`. `GradedPoll` and `isCorrect` stay private.
- `run.model.ts` 1396 -> 1251 lines.
- `run.model.spec.ts` 2453 -> 2386; new `runPoll.model.spec.ts` (3 tests). 191 `it(` literals before = 188 + 3 after; 33 describes before and after.
- 35 files had imports rewritten; 26 of them no longer import `run.model` at all.
- `src/database/schema.ts:421` inline `import(...).RunStatus` deliberately untouched.
- CONTEXT.md: added the Run poll / Grading row.

### Location decision

Planned as `run/poll/domain/poll.model.ts`, changed to `run/run/domain/runPoll.model.ts` after finding ADR-002 section 2 assigns "answer evaluation" to the `polls` context (unmigrated, `src/domains/polls/`). Keeping it in the run context makes the eventual polls migration a single-file lift and avoids two `poll.model.ts` files.

### Verification

- `npm run lint`: clean, `lint:arch` reports no dependency violations (746 modules, 2989 dependencies).
- `npm run build`: clean, 0 tsc errors.
- `npm test`: 2322 passed, 6 skipped, 2 todo. 3 failures in `src/ui/modern-theme/screens/RewardScreen.spec.tsx` are pre-existing, reproduced on HEAD in a throwaway worktree; that file imports neither model.

### Correction to the cycle rule, for the follow-up steps

`no-circular-runtime` is stricter than assumed. `#getCycle` (`indexed-module-graph.mjs:192`) filters by visited-set alone and never by dependency type, so `dependencyTypesNot: ["type-only"]` excuses only the edge being evaluated, not the path home. `A --type-only--> B --runtime--> A` still errors on B->A. A type-only back-edge is not an escape hatch for the remaining extractions.
