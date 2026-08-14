-- polls_responses mode split (slice 2, ADR-005/DVTD-qmc5): session runs write
-- per-answer rows into the same table, discriminated by `mode`.
--
-- Order matters — the old daily-unique constraint is dropped only AFTER the
-- calendar partial index exists, so the invariant "one calendar answer per
-- poll/user/day" is never unguarded:
--   1. add `mode` with DEFAULT 'calendar' — metadata-only on PG11+, no rewrite;
--      every existing row is (and stays) a calendar row.
--   2. partial unique indexes: calendar keeps the exact current invariant,
--      session gets one answer per (run, poll).
--   3. drop the old table-wide constraint (deployed name verified:
--      drizzle default `polls_responses_poll_id_user_id_answer_date_unique`).
-- Wrapped in a guard so this is safe to run before the Drizzle schema exists.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'polls_responses'
  ) THEN
    RAISE NOTICE 'Base schema not yet initialised — skipping polls_responses_mode migration';
    RETURN;
  END IF;

  ALTER TABLE "polls_responses"
    ADD COLUMN IF NOT EXISTS "mode" varchar(16) NOT NULL DEFAULT 'calendar';

  CREATE UNIQUE INDEX IF NOT EXISTS "polls_responses_calendar_daily_uniq"
    ON "polls_responses" ("poll_id", "user_id", "answer_date")
    WHERE "mode" = 'calendar';

  CREATE UNIQUE INDEX IF NOT EXISTS "polls_responses_session_run_poll_uniq"
    ON "polls_responses" ("run_id", "poll_id")
    WHERE "mode" = 'session';

  ALTER TABLE "polls_responses"
    DROP CONSTRAINT IF EXISTS "polls_responses_poll_id_user_id_answer_date_unique";
END $$;
