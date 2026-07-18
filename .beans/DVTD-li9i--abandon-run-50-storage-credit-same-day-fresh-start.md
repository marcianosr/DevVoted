---
# DVTD-li9i
title: 'Abandon run: 50% storage credit + same-day fresh start (filtered seed)'
status: completed
type: feature
priority: normal
created_at: 2026-07-18T20:15:07Z
updated_at: 2026-07-18T20:22:15Z
---

Abandon an active run (completion_reason=abandoned, credit 50% of leftover storage to archived_storage), drop the one-run-per-day unique so a fresh run can start the same day. Anti-exploit: new runs start from today's seed minus polls the user already answered today (any run), keeping one-answer-per-poll-per-day true for community stats. Decisions: Marciano 2026-07-18 (50% credit, same-day restart yes). Plan: ~/.claude-work/plans/have-a-look-in-calm-dove.md

## Summary of Changes

- Migration 20260718140000 drops runs_user_seed_date_uniq (applied + verified on local DB); schema.ts updated.
- abandonSessionRun (queries.ts): FOR UPDATE on run_states, guarded update to finished/abandoned, credits ABANDON_STORAGE_CREDIT_RATE (0.5, rules.model.ts) of leftover storage to archived_storage. abandonRunHandler + abandonRun server fn (auth, no client params).
- startRunHandler: fresh runs start from today's seed minus fetchAnsweredPollIdsForDay (any run) — same-day restart can never re-answer a poll; errors when nothing is left. Uniform: also allows a fresh start after finishing won/dead today (flagged to Marciano).
- getTodaysRunHandler: latest run today surfaces its summary only when won/dead; abandoned → start screen. findSessionRunByDate now orders by id desc.
- RunGame: 'Abandon run' leftAction on the answering screen, two-step arm/confirm, invalidates the run query.
- ADR-011 + ADR-005 amendment markers; CHANGELOG entry.
- 792 tests green (11 new), lint+arch, build clean.
