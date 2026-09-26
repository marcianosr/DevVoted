---
# DVTD-qmc5
title: 'run persistence slice 2: per-answer polls_responses rows + constraint split'
status: completed
type: feature
priority: normal
created_at: 2026-07-17T12:41:23Z
updated_at: 2026-07-18T06:50:14Z
---

Write session answers as real polls_responses rows inside the dispatch transaction (mode column discriminator). Migration (one tx): add mode varchar(16) NOT NULL DEFAULT calendar (metadata-only); create partial unique indexes polls_responses_calendar_daily_uniq (poll_id,user_id,answer_date WHERE mode=calendar) and polls_responses_session_run_poll_uniq (run_id,poll_id WHERE mode=session); only then drop the old daily unique constraint (verify deployed name first). Session rows: answer_date = seed date, score_breakdown/coverage_delta stay null, reuse polls_response_options. Enables what-others-chose (DVTD-xrpx). Verify on dev DB that a duplicate calendar response still rejects. See ADR-005 addendum 2026-07-17 + DVTD-ay5e summary.

## Progress

- [x] Verify deployed constraint name (`polls_responses_poll_id_user_id_answer_date_unique`, checked against localhost:54322 — NOTE: .env remote dev URL is commented out, re-verify/apply on remote too)
- [x] Migration `supabase/migrations/20260717120002_polls_responses_mode.sql` (add mode → both partial indexes → drop old constraint, guarded DO block)
- [x] schema.ts: mode column + partial unique indexes (replaces table-wide unique)
- [x] `recordSessionAnswer` wired into `applyActionToRun` dispatch tx (pre-action poll)
- [x] Tests updated + new session-row tests (red pending option-id mapping)
- [x] `toSelectedOptionRecordIds` tolerance strategy — DECIDED (Marciano, 2026-07-18): mirror the engine, filter unknown option ids instead of rejecting the dispatch
- [x] Apply migration to LOCAL DB + verify: dup calendar rejects, dup session (run,poll) rejects, cross-mode same poll/user/date accepted, migration idempotent
- [x] Remote apply not needed — Marciano confirmed 2026-07-18: testing is local-only; migration ships via supabase/migrations at release (migration strategy tracked in DVTD-jskv)
- [x] Full verification: lint(+arch), build(+tsc), 763 tests green

## Summary of Changes

- Migration `20260717120002_polls_responses_mode.sql`: `mode` column (default calendar, metadata-only), partial uniques `polls_responses_calendar_daily_uniq` + `polls_responses_session_run_poll_uniq`, old table-wide constraint dropped last (no invariant gap). Idempotent, verified on local DB incl. dup-rejection both modes and cross-mode acceptance.
- `schema.ts`: mode column + partial unique indexes replace `unique()`.
- `applyActionToRun` writes session answers as real `polls_responses` (+options) rows in the dispatch tx; answered poll taken from PRE-action state. `toSelectedOptionRecordIds` mirrors engine tolerance (filters unknown option ids — Marciano chose Option A over strict rejection).
- Legacy calendar DTO `pollResponses.model.ts` hardcodes `mode: calendar` in fromDTO.
- Tests: session-row write, tamper-id drop, non-answer no-write; full suite 763 green, lint+arch+build clean.
