-- Service unlocks (ADR-116): a row is a permanent grant of a shop service
-- (Rebuild, Extend, the git tag …), earned once per account off the objective
-- ledger user_objective_progress already keeps. via_metric names the
-- objective that completed. A starter service has no row.
-- No historical backfill (ADR-051): the ledger starts here.
-- Wrapped in a guard so this is safe to run before the Drizzle schema exists.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users'
  ) THEN
    RAISE NOTICE 'Base schema not yet initialised — skipping add_service_unlocks migration';
    RETURN;
  END IF;

  CREATE TABLE IF NOT EXISTS "user_service_unlocks" (
    "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "service_id" varchar(64) NOT NULL,
    "via_metric" varchar(64),
    "unlocked_at" timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY ("user_id", "service_id")
  );
END $$;
