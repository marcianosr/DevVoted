-- Objective ledger and grant provenance (ADR-051 + ADR-064).
--   - user_config_unlocks: a row is a permanent config grant; via_metric names
--     the objective path that completed (NULL = granted at signup, the free
--     starter set); first_installed_at NULL marks the unplayed queue.
--   - user_objective_progress: lifetime counters behind the objectives, one
--     row per touched metric, written in the run-action transaction.
-- Seeds the free eight for existing accounts with via_metric NULL. No
-- historical backfill of earned objectives (pre-release, ADR-051).
-- Wrapped in a guard so this is safe to run before the Drizzle schema exists.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users'
  ) THEN
    RAISE NOTICE 'Base schema not yet initialised — skipping add_config_unlocks migration';
    RETURN;
  END IF;

  CREATE TABLE IF NOT EXISTS "user_config_unlocks" (
    "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "config_id" varchar(64) NOT NULL,
    "via_metric" varchar(64),
    "unlocked_at" timestamp with time zone NOT NULL DEFAULT now(),
    "first_installed_at" timestamp with time zone,
    PRIMARY KEY ("user_id", "config_id")
  );

  CREATE TABLE IF NOT EXISTS "user_objective_progress" (
    "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "metric" varchar(64) NOT NULL,
    "count" integer NOT NULL DEFAULT 0,
    "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY ("user_id", "metric")
  );

  INSERT INTO "user_config_unlocks" ("user_id", "config_id", "via_metric")
  SELECT u.id, f.config_id, NULL
  FROM "users" u
  CROSS JOIN (VALUES
    ('js'), ('ts'), ('css'), ('eslint'),
    ('unit-tests'), ('code-coverage'), ('indexed-db'), ('cold-start')
  ) AS f(config_id)
  ON CONFLICT DO NOTHING;
END $$;
