---
# DVTD-psi6
title: Schema + domain scaffold for Tech Debt
status: in-progress
type: task
priority: normal
created_at: 2026-06-14T07:37:01Z
updated_at: 2026-06-14T11:57:20Z
parent: DVTD-fapc
---

Set up the foundation for the Tech Debt mechanic. Per ADR-002 domain architecture pattern.

## Todos

- [ ] Create domains/techDebt/ with api/, models/, services/, validation/, components/, hooks/
- [x] Define TechDebt + TechDebtTemplate types in models/
- [ ] Add schema tables: active TDs per run (run_id, td_template_id, acquired_at, progress_state), clear-condition progress tracking
- [ ] Generate + push migration
- [x] Add MVP TD templates to data/techDebtTemplates.ts (6 items: Legacy Module, Lost Docs, Flaky Suite, Scope Creep, Stale Cache, Obfuscated Imports)
- [x] Define ClearCondition discriminated union (coverage gain, awards earned, first-answer streak, pipeline completion, single-category coverage, reroll spend)



## Storage decision

**B. One table + code-defined templates.** Templates live in `data/techDebtTemplates.ts` (easy iteration, no migrations to add a TD). Only `active_tech_debts` exists in DB: run_id, template_id, acquired_at, progress_state (JSON for clear-condition tracking).
