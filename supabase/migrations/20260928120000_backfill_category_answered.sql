-- Seeds the `category-answered:<code>` counters from the answers already on
-- record, so the entry titles that read them do not start every existing
-- account at zero after hundreds of answered polls.
--
-- Three things in here are load-bearing:
--   - `mode = 'session'` matches the emitter. Only the run engine ever writes
--     these metrics, so counting calendar-era answers would credit accounts for
--     a game that never fed this counter.
--   - There is deliberately NO `mirrored` filter. The emitter reads the run
--     snapshot, which carries mirrored answers like any other, so excluding
--     them here would leave every affected account permanently short by the
--     number of polls it answered under an audit. ADR-100 excludes mirrored
--     rows from *records*, which is a different question with a different
--     answer.
--   - `ON CONFLICT DO NOTHING`, never a SET. A live counter is always at least
--     as high as this query, because it has been incrementing since the metric
--     shipped; overwriting one would walk it backwards.
--
-- The category lives on the poll, not the response, so the join is required.
--
-- Guarded so it is safe before the Drizzle schema exists, and safe to re-apply.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'user_objective_progress'
  ) THEN
    RAISE NOTICE 'user_objective_progress not yet initialised — skipping backfill_category_answered migration';
    RETURN;
  END IF;

  INSERT INTO "user_objective_progress" ("user_id", "metric", "count", "updated_at")
  SELECT r."user_id",
         'category-answered:' || p."category_code",
         COUNT(*),
         now()
  FROM "polls_responses" r
  JOIN "polls" p ON p."id" = r."poll_id"
  WHERE r."mode" = 'session'
    AND r."user_id" IS NOT NULL
  GROUP BY r."user_id", p."category_code"
  ON CONFLICT ("user_id", "metric") DO NOTHING;
END $$;
