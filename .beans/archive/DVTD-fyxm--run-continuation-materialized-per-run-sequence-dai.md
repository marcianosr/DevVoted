---
# DVTD-fyxm
title: 'run continuation: materialized per-run sequence + daily segment rollover (ADR-011)'
status: completed
type: feature
priority: normal
created_at: 2026-07-18T07:24:00Z
updated_at: 2026-07-18T07:41:19Z
---

Implement ADR-011: runs persist across days, each day appends today's shared sequence.

- [x] run_polls table + guarded migration 20260718120000 (incl. backfill of existing session runs); fetchRunPollsForRun is the hydration source
- [x] Segment rollover: ensureTodaysSegment (read paths) + ensureTodaysSegmentWith inside the dispatch FOR UPDATE tx
- [x] Same-day resume unchanged (rollover no-ops when newest segment_date >= today)
- [x] answer_date = day of answer (dispatch takes today)
- [x] runs.seed_date redocumented as start date (unique kept = one new run per day)
- [x] Reducer untouched — rollover mutates run_polls outside the engine
- [x] Tests: rollover truncation+dedup+append, handlers continue/resume flows, redaction tripwire green (765 passing)

## Summary of Changes

- `run_polls` materialized per-run sequence (unique (run_id, position); no (run_id, poll_id) unique — missed/linted polls may return via later seeds). Migration backfills existing session runs from their seed-date sequence; verified on local DB (1/1 runs, 50 rows, 0 mismatches).
- Rollover: newest segment stale → delete positions >= currentIndex, append today's seed minus answered polls. Runs inside the dispatch FOR UPDATE tx and standalone (ensureTodaysSegment) on read paths.
- Handlers: findActiveSessionRun drives everything — getTodaysRun/startRun continue the persistent run (roguelite resume); finished-today run still surfaces its won/dead view; dispatch errors with No active run.
- lint+arch, build+tsc, 765 tests green.
