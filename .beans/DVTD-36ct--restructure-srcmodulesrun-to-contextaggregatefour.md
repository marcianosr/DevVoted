---
# DVTD-36ct
title: Restructure src/modules/run to context/aggregate/four-layer (ADR-002 rewrite)
status: completed
type: task
priority: high
created_at: 2026-08-12T09:40:17Z
updated_at: 2026-08-12T19:52:58Z
parent: DVTD-82c4
---

Adopt the connect-portal ADR-083 shape in DevVoted: src/modules/<context>/<aggregate>/{domain,application,infrastructure,presentation}. Reverses ADR-002's 'deliberately not tactical DDD' stance. Scope for this bean is the run context only; polls/collection/account follow later.

## Decisions taken (2026-08-12)

Modelled on connect-portal ADR-083. Confirmed by Marciano:
- `community` is an aggregate inside `run`, not its own context.
- `collection` IS its own context, because unlockables are planned (DVTD-2try, DVTD-g8ty).
- `.serverfn.ts` gets its own suffix, separate from `.service.ts`.
- `run/` first; the other contexts follow.

## Docs updated (done)

- [x] ADR-002 rewritten: context/aggregate/four-layer, dependency table, closed suffix allowlist, decision tree, TanStack Start mapping, §8 explaining the reversal
- [x] ADR-010 paths updated to `{aggregate}/presentation/`; notes the stricter no-infrastructure rule
- [x] ADR-007 "Resolved" section restated; ADR-006 line 119 pointer fixed
- [x] ADR README index entry flagged as rewritten
- [x] CONTEXT.md ownership tables rebuilt as Concept/Aggregate/Today
- [x] CLAUDE.md Module Architecture + UI Layer Architecture sections

## The move: run context

Six aggregates, each getting domain/application/infrastructure/presentation:
climb, pipeline, gate, config, shop, community.

- [x] `climb` — run.model, runSnapshot.model, climbMap.model, rules.model → domain; runView.viewmodel, runRoutes.viewmodel, seed.service, run.validation, useRunActions/useTodaysRun/useRunRouteSync → application; applyActionToRun → infrastructure/run.repository.ts; Prep/Answering/GameOver screens + RunHud + StorageGauge → presentation
- [x] `pipeline` — pipeline.model → domain; ConfiguringScreen, PipelineTable, PipelineReportRow → presentation
- [x] `gate` — gate/swatch/gateReward/gateLadder/configRole models → domain; RewardScreen, StripScreen, GateRewardReport, GateStakeReceipt, SwatchChips, RoleList → presentation
- [x] `config` — config/configRoster/effect/stack models → domain; ConfigChip, ConfigActions, StackPicker, StackPreviewList → presentation
- [x] `shop` (was `draft/`) — draft.model → domain; ShopScreen → presentation
- [x] `community` — standouts.model → domain; community.handlers → application/community.service.ts; RunCommunity, Standouts, Voter, ClimbToday, useNextPollsCountdown → presentation
- [x] `poll` visuals (PollCard, PollOptionList, RevealScore, revealTiming) — decide: climb's presentation, or a `poll` aggregate in the run context
- [x] Rename `api/queries.ts` → `*.repository.ts`, `api/handlers.ts` → `*.service.ts`, `api/run.ts` → `*.serverfn.ts`
- [x] Delete `src/modules/session-run/` (orphan todo.md) — done via DVTD-ylsm 2026-08-12

## Shared

- [x] Create `src/shared/`, absorbing `src/lib/`, `src/utils/`, `src/domains/shared/`, `src/config/`. Done 2026-08-12: lib -> shared/lib (plus categories.ts, which domain imports at runtime), utils -> shared/utils, config -> shared/config, queryKeys -> shared root. ~145 files rewritten, 3 deep-relative route imports fixed. New cruiser rule domain-into-shared-lib-only (proved on a deliberate violation); shared-not-into-modules re-pointed at ^src/shared/. ADR-002 §3/§7 + CLAUDE.md paths updated.
- [x] `src/ui/` stays put as the design-system half of shared (folding it in rewrites ~100 imports for no boundary gain)

## Enforcement

- [x] Rewrite `.dependency-cruiser.cjs` to ADR-002 §9, in the SAME commit as the moves. Today's rules key off directory names (`/presentation/`, `/api/`) and will break. This is a shared-config change and must be flagged in the commit message.
- [x] Confirm `lint:arch` fails on a deliberately-wrong file before trusting it

## Blocked on / conflicts

- `DVTD-td0v` (Split up proto-run and create game routes) is in-progress on the same files. Land or park it first.
- Overlaps `DVTD-7q8l` (retire src/ui legacy island) and `DVTD-ylsm` (delete dead surface). Both get easier after the move; consider folding them in.

## Done 2026-08-12: run context migrated

163 files moved via git mv (history preserved), 507 import specifiers rewritten
across 170 files. Verified: tsc 0 errors, lint:arch 0 violations, tests identical
to baseline (22 failed / 1445 passed, same 7 files, all pre-existing).

- [x] `climb` — run/runSnapshot/rules/seed models, runView+runRoutes viewmodels, run.service/serverfn/validation, run.repository (applyActionToRun), Prep/Answering/GameOver screens + HUD
- [x] `pipeline` — pipeline.model; ConfiguringScreen, PipelineTable, PipelineReportRow, SlotUnlockRow, CoverageByCategory
- [x] `gate` — gate/gateReward/gateLadder/swatch/configRole models; Reward+Strip screens, GateRewardReport, GateStakeReceipt, RoleList, SwatchChips, GateSegmentBar
- [x] `config` — config/configRoster/effect/stack models; ConfigChip, ConfigActions, StackPicker, StackPreviewList
- [x] `shop` (was `draft/`) — draft.model; ShopScreen, RunShop
- [x] `community` — standouts + climbMap models, community.service/serverfn, community+climbers repositories, RunCommunity/Standouts/Voter/ClimbToday
- [x] `poll` — presentation only (PollCard, PollOptionList, RevealScore, PracticeBank, OutcomeTile, revealTiming)
- [x] queries.ts -> *.repository.ts, handlers.ts -> *.service.ts, api/run.ts -> *.serverfn.ts
- [x] `*Handler` symbols renamed to `*Service` (6 symbols, run context only)
- [x] `getRunCommunity` split out of run.serverfn.ts into community/application/community.serverfn.ts
- [x] .dependency-cruiser.cjs rewritten to ADR-002 §3; proved it fails on a deliberate violation before trusting it

### Two findings the new rules surfaced

1. `seed.service.ts` was pure hash + PRNG + shuffle with no collaborators. `infrastructure-stays-below` fired on the repository importing it. Reclassified to `run/domain/seed.model.ts`. Written up as the worked example in ADR-002 §5.
2. `climbMap.model.ts` is read only by the community board, not by climb. Moved to `community/domain/`. CONTEXT.md corrected.

### Deviations recorded (ADR-002 §10, .dependency-cruiser.cjs)

- `proto-run.tsx` / `proto-session-slice.tsx` are dev rigs that drive the engine directly, so they import domain at runtime. Exclusion scoped to those two filenames.
- `src/domains/` + `src/modules/polls/` keep `legacy-*` rules until they migrate.

## Still open

- [x] `collection` migrated 2026-08-12: modules/polls WAS the Dex — moved to modules/collection/dex/{domain,application,infrastructure,presentation}, getPolldexHandler -> getPolldexService, accuracyTone folded into polldexColumns.ui, fixtures -> polldex.factory.ts, LEGACY_FROM narrowed to src/domains. `polls` + `account` live in src/domains legacy -> follow-up DVTD-wj1t (after 7q8l deletes the /old surface)
- [x] Split `run/infrastructure/run.repository.ts` — deferred to its own bean DVTD-eyya; the write path stays one transaction

## Summary of Changes

The ADR-002 restructure is done for everything that lives under src/modules today:

- run context: 163 files to context/aggregate/four-layer (2026-08-12, earlier session)
- src/shared/ created: lib/utils/config/domains-shared absorbed (~145 imports rewritten); new cruiser rule domain-into-shared-lib-only, proved on a deliberate violation
- collection context: modules/polls (the Dex) -> modules/collection/dex, suffixes normalized, bare files folded/renamed
- Docs: ADR-002 shared-boundary section, CONTEXT.md tables (run + collection now real paths), CLAUDE.md paths
- Enforcement: .dependency-cruiser.cjs per ADR-002 §3; legacy rules now scope to src/domains only

Verified at completion: tsc 0 errors, oxlint clean, lint:arch 0 violations (590 modules), vitest 121 files / 1465 passed / 0 failed.

Follow-ups: DVTD-wj1t (polls + account out of src/domains, after DVTD-7q8l), DVTD-eyya (repository read-split).
