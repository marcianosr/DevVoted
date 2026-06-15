---
# DVTD-psi6
title: Schema + domain scaffold for Tech Debt
status: completed
type: task
priority: normal
created_at: 2026-06-14T07:37:01Z
updated_at: 2026-06-14T15:25:15Z
parent: DVTD-fapc
---

Set up the foundation for the Tech Debt mechanic. Per ADR-002 domain architecture pattern.

## Todos

- [x] Create domains/techDebt/ scaffold — models/, data/, services/ created (api/, validation/, components/, hooks/ deferred until needed per YAGNI)
- [x] Define TechDebt + TechDebtTemplate types in models/
- [x] Add schema tables: active TDs per run (run_id, td_template_id, acquired_at, progress_state), clear-condition progress tracking
- [x] Generate + push migration (0058_mixed_firedrake.sql)
- [x] Add MVP TD templates to data/techDebtTemplates.ts (6 items: Legacy Module, Lost Docs, Flaky Suite, Scope Creep, Stale Cache, Obfuscated Imports)
- [x] Define ClearCondition discriminated union (coverage gain, awards earned, first-answer streak, pipeline completion, single-category coverage, reroll spend)



## Storage decision

**B. One table + code-defined templates.** Templates live in `data/techDebtTemplates.ts` (easy iteration, no migrations to add a TD). Only `active_tech_debts` exists in DB: run_id, template_id, acquired_at, progress_state (JSON for clear-condition tracking).

## Summary of Changes

**Files created:**
- `src/domains/techDebt/models/techDebt.model.ts` — DebuffEffect, ClearCondition, ClearProgress, TechDebtTemplate, ActiveTechDebt, TechDebtTemplateId
- `src/domains/techDebt/data/techDebtTemplates.ts` — 6 MVP templates + getTechDebtTemplate(id) lookup
- `src/domains/techDebt/data/techDebtTemplates.spec.ts` — 5 tests (pool size, id uniqueness, lookup, unknown-id guard)
- `src/domains/techDebt/services/clearProgress.service.ts` — createInitialClearProgress(template) derives zeroed progress shape per variant
- `src/domains/techDebt/services/clearProgress.service.spec.ts` — 6 tests (one per ClearCondition variant)

**Schema:**
- `active_tech_debts` table added to `src/database/schema.ts`: id, run_id (FK → runs, cascade), template_id (string ref to code template), acquired_at, progress_state (json)
- Migration `drizzle/0058_mixed_firedrake.sql` generated and pushed

**Decisions implemented:**
- Templates live in code (not DB) — option B from the design conversation. Adding a TD = code change, no migration.
- DebuffEffect and ClearCondition use discriminated unions for exhaustive matching.
- ClearProgress mirrors ClearCondition discriminants, keeping progress shapes co-located with their condition.
- Stale Cache's configUpgradesBlocked debuff ships but is a no-op until config upgrades exist (deferred bean DVTD-7oa7) — documented inline.

**Test results:** 11/11 passing.

**Out of scope (next bean):** debuff applicators, progress event subscribers, soft-cap enforcement, item acquisition wiring — all part of DVTD-1cbu (end-to-end Flaky Suite).
