---
# DVTD-qmc5
title: 'run persistence slice 2: per-answer polls_responses rows + constraint split'
status: todo
type: feature
created_at: 2026-07-17T12:41:23Z
updated_at: 2026-07-17T12:41:23Z
---

Write session answers as real polls_responses rows inside the dispatch transaction (mode column discriminator). Migration (one tx): add mode varchar(16) NOT NULL DEFAULT calendar (metadata-only); create partial unique indexes polls_responses_calendar_daily_uniq (poll_id,user_id,answer_date WHERE mode=calendar) and polls_responses_session_run_poll_uniq (run_id,poll_id WHERE mode=session); only then drop the old daily unique constraint (verify deployed name first). Session rows: answer_date = seed date, score_breakdown/coverage_delta stay null, reuse polls_response_options. Enables what-others-chose (DVTD-xrpx). Verify on dev DB that a duplicate calendar response still rejects. See ADR-005 addendum 2026-07-17 + DVTD-ay5e summary.
