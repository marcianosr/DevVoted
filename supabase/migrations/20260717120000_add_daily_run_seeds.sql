-- Daily shared run seed (ADR-009): one seed per day produces one poll sequence,
-- identical for every player. The resolved sequence is persisted so mid-day
-- poll-pool changes can never fork the shared climb.
-- Purely additive — no existing table is touched.
-- Wrapped in a guard so this is safe to run before the Drizzle schema exists.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'polls'
  ) THEN
    RAISE NOTICE 'Base schema not yet initialised — skipping add_daily_run_seeds migration';
    RETURN;
  END IF;

  CREATE TABLE IF NOT EXISTS "daily_run_seeds" (
    "id" serial PRIMARY KEY,
    "date" varchar(10) NOT NULL UNIQUE,
    "seed" varchar(64) NOT NULL,
    "created_at" timestamp with time zone DEFAULT now()
  );

  -- ON DELETE RESTRICT is deliberate: deleting a poll that is part of a live
  -- shared seed must fail loudly instead of silently shifting the sequence.
  CREATE TABLE IF NOT EXISTS "daily_run_polls" (
    "id" serial PRIMARY KEY,
    "date" varchar(10) NOT NULL,
    "position" integer NOT NULL,
    "poll_id" integer NOT NULL REFERENCES "polls"("id") ON DELETE RESTRICT,
    CONSTRAINT "daily_run_polls_date_position_unique" UNIQUE ("date", "position"),
    CONSTRAINT "daily_run_polls_date_poll_id_unique" UNIQUE ("date", "poll_id")
  );
END $$;
