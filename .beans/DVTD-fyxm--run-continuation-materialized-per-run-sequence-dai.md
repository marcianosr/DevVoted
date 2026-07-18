---
# DVTD-fyxm
title: 'run continuation: materialized per-run sequence + daily segment rollover (ADR-011)'
status: todo
type: feature
created_at: 2026-07-18T07:24:00Z
updated_at: 2026-07-18T07:24:00Z
---

Implement ADR-011: runs persist across days, each day appends today's shared sequence.

- [ ] Materialized per-run poll sequence (new table, e.g. run_polls: run_id, position, poll_id, segment_date) + guarded SQL migration; becomes the hydration source in fetchRunPollsWith (replaces daily_run_polls-by-seed_date lookup)
- [ ] Segment rollover on getTodaysRun/startRun: if last segment_date < today → drop unplayed tail (positions >= currentIndex), append today's sequence minus polls already answered in this run
- [ ] Same-day resume unchanged (no rollover when segment_date = today)
- [ ] Session polls_responses.answer_date = day of answer (dispatch passes today, not run.seed_date)
- [ ] runs.seed_date redocumented as start date (keep (user_id, seed_date) unique = one new run per day)
- [ ] Reducer stays pure/day-unaware — rollover mutates the sequence outside the engine
- [ ] Tests: rollover truncation, dedup vs answered polls, gate window filling across days (the bracket example), redaction tripwire stays green
