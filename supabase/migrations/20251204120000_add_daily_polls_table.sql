-- Create daily_polls table for O(1) daily poll lookups
-- This replaces the expensive manageDailyPollTransition that fetched all polls
-- Wrapped in a guard so this is safe to run before the Drizzle schema exists.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'polls'
  ) THEN
    RAISE NOTICE 'Base schema not yet initialised — skipping add_daily_polls_table migration';
    RETURN;
  END IF;

  CREATE TABLE IF NOT EXISTS "daily_polls" (
    "id" serial PRIMARY KEY,
    "date" varchar(10) NOT NULL UNIQUE,
    "poll_id" integer NOT NULL REFERENCES "polls"("id") ON DELETE CASCADE,
    "created_at" timestamp with time zone DEFAULT now()
  );

  CREATE UNIQUE INDEX IF NOT EXISTS "idx_daily_polls_date" ON "daily_polls"("date");

  -- Migrate current open poll to daily_polls (if any exists)
  INSERT INTO "daily_polls" ("date", "poll_id")
  SELECT
    to_char(CURRENT_DATE, 'YYYY-MM-DD'),
    "id"
  FROM "polls"
  WHERE "status" = 'open'
  LIMIT 1
  ON CONFLICT ("date") DO NOTHING;
END $$;
