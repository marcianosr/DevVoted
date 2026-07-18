-- Same-day restart (DVTD-li9i, amends ADR-011): abandoning a run may be
-- followed by a fresh run the same day, so the one-run-started-per-day
-- invariant is dropped. One-answer-per-poll-per-day stays true a different
-- way: new runs start from today's seed minus polls the player already
-- answered today (enforced in startRunHandler + polls_responses_session_run_poll_uniq).
-- Wrapped in a guard so this is safe to run before the Drizzle schema exists.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'runs'
  ) THEN
    RAISE NOTICE 'Base schema not yet initialised — skipping allow_same_day_restart migration';
    RETURN;
  END IF;

  DROP INDEX IF EXISTS "runs_user_seed_date_uniq";
END $$;
