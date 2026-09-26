-- Run polls (ADR-011): materialized per-run poll sequence for persistent
-- session runs. Hydration moves from "daily_run_polls by runs.seed_date" to
-- this table, so a run can accumulate segments from multiple days.
-- Backfills every existing session run with its seed-date sequence (position
-- and order preserved), so hydration is uninterrupted at the switch.
-- Wrapped in a guard so this is safe to run before the Drizzle schema exists.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'daily_run_polls'
  ) THEN
    RAISE NOTICE 'Base schema not yet initialised — skipping add_run_polls migration';
    RETURN;
  END IF;

  CREATE TABLE IF NOT EXISTS "run_polls" (
    "id" serial PRIMARY KEY,
    "run_id" integer NOT NULL REFERENCES "runs"("id") ON DELETE CASCADE,
    "position" integer NOT NULL,
    "poll_id" integer NOT NULL REFERENCES "polls"("id") ON DELETE RESTRICT,
    "segment_date" varchar(10) NOT NULL,
    CONSTRAINT "run_polls_run_id_position_unique" UNIQUE ("run_id", "position")
  );

  INSERT INTO "run_polls" ("run_id", "position", "poll_id", "segment_date")
  SELECT r."id", d."position", d."poll_id", r."seed_date"
  FROM "runs" r
  JOIN "daily_run_polls" d ON d."date" = r."seed_date"
  WHERE r."mode" = 'session'
    AND NOT EXISTS (SELECT FROM "run_polls" rp WHERE rp."run_id" = r."id");
END $$;
