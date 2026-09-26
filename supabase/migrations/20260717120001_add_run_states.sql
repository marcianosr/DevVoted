-- Run states (new game flow, ADR-005/009): 1:1 satellite of `runs` holding the
-- engine state of session runs, plus runs.seed_date to key a run to its daily
-- shared seed. Additive only:
--   - seed_date is nullable with no default — stays NULL for every existing
--     (calendar) run, nothing is rewritten.
--   - the partial unique index only constrains mode='session' rows, of which
--     none exist yet.
-- Wrapped in a guard so this is safe to run before the Drizzle schema exists.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'runs'
  ) THEN
    RAISE NOTICE 'Base schema not yet initialised — skipping add_run_states migration';
    RETURN;
  END IF;

  CREATE TABLE IF NOT EXISTS "run_states" (
    "id" serial PRIMARY KEY,
    "run_id" integer NOT NULL UNIQUE REFERENCES "runs"("id") ON DELETE CASCADE,
    "state" json NOT NULL,
    "engine_status" varchar(16) NOT NULL,
    "gates_cleared" integer NOT NULL DEFAULT 0,
    "coverage" real NOT NULL DEFAULT 0,
    "polls_answered" integer NOT NULL DEFAULT 0,
    "engine_version" integer NOT NULL DEFAULT 1,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now()
  );

  ALTER TABLE "runs" ADD COLUMN IF NOT EXISTS "seed_date" varchar(10);

  -- One session run per player per daily seed (ADR-009), race-proof at the DB.
  CREATE UNIQUE INDEX IF NOT EXISTS "runs_user_seed_date_uniq"
    ON "runs" ("user_id", "seed_date")
    WHERE "mode" = 'session';
END $$;
