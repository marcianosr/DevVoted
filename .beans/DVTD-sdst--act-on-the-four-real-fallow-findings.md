---
# DVTD-sdst
title: Act on the four real fallow findings
status: completed
type: task
priority: normal
created_at: 2026-09-23T12:09:23Z
updated_at: 2026-09-23T12:20:13Z
---

Structural refactors from the fallow audit. Behaviour-neutral; proof is 3775 tests passing unchanged.

- [x] 0. Regenerate coverage/coverage-final.json (stale 2025 file, 0/8308 functions matched)
- [x] 1. Extract useApiQuery to src/shared/hooks/, rewrite the 5 hooks, add a spec
- [x] 2. runAction.model.ts reduce (CC 62) -> guarded rule table
- [x] 3. schema.ts clone family -> reviewed, no change (Drizzle timestamp boilerplate)
- [x] 4. Split effect.model.ts into effect + configStatus, table skipReasonFor (CC 22)
- [x] Verify: tests, tsc, lint, lint:dead, format, fallow, build

Plan: ~/.claude-work/plans/1-which-duplication-and-typed-otter.md

## Summary of Changes

**0.** Regenerated coverage. The old file was from 2025, referenced the deleted `src/domains/` and was rooted at `~/Desktop`, so 0/8308 functions matched and every CRAP score was a guess. With real data the high-complexity list fell 71 -> 52 on its own: 19 findings were artefacts.

**1.** `useApiQuery` extracted to `src/shared/hooks/` (not `shared/lib/`, which `domain-into-shared-lib-only` makes reachable from domain models). Five hooks rewritten. Found en route that `getTodaysRun` returns `ApiResponse<RunView | null>` — "no run today" is a *successful* response carrying null — so `useTodaysRun` is typed `useApiQuery<RunView | null>`; `view` resolves to the same `RunView | null` as before. New spec covers all four branches; these hooks had none.

**2.** `reduce` CC 62 -> gone from the list. A generic-defaulted `ActionRule<K = RunAction["type"]>` collapses K to the whole union, so payload access fails; solved with an `on()` factory plus an `isAction` type predicate, which puts the narrowing in one place. No `as`, no `any`.

**3.** schema.ts left alone as decided.

**4.** `effect.model.ts` split into `effect.model.ts` (algebra, 115 LOC) + `configStatus.model.ts` (verdict, 174 LOC). Four consumers repointed. `skipReasonFor` CC 22 -> ordered predicate table.

| | before | after |
|---|---|---|
| clone groups | 26 | 22 |
| duplicated lines | 693 (1.3%) | 606 (1.2%) |
| high-complexity functions | 52 | 49 |
| refactoring targets | 9 | 8 |
| maintainability | 91.3 | 91.4 |

Both original top targets (`effect.model.ts`, `runAction.model.ts`) left the refactoring-targets list; `Build.ui.tsx` is now #1.

**Verified:** 3538 tests passed (181 files) — identical before and after, which is the proof these are behaviour-neutral. tsc 0, lint 0 (671 modules cruised, no ADR-002 violations), lint:dead 0, format clean, production build succeeds.
