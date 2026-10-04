-- Player-fired audits (ADR-099). A row is one rival's attack aimed at a run's
-- next gate: queued until the target clears the gate before it, locked into
-- that gate's audit slots up to the gate's capacity, then survived / failed /
-- lapsed. Bound to the target's run, so a fresh climb starts clean.
-- Wrapped in a guard so this is safe to run before the Drizzle schema exists,
-- and safe to re-apply.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'runs'
  ) THEN
    RAISE NOTICE 'Base schema not yet initialised — skipping add_audit_incidents migration';
    RETURN;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_incident_status') THEN
    CREATE TYPE audit_incident_status AS ENUM ('queued', 'locked', 'survived', 'failed', 'lapsed');
  END IF;

  CREATE TABLE IF NOT EXISTS "audit_incidents" (
    "id" serial PRIMARY KEY,
    "sent_by_user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "target_user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "target_run_id" integer NOT NULL REFERENCES "runs"("id") ON DELETE CASCADE,
    "target_gate" integer NOT NULL,
    "audit_id" varchar(32) NOT NULL,
    "status" audit_incident_status NOT NULL DEFAULT 'queued',
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "locked_at" timestamp with time zone
  );

  CREATE INDEX IF NOT EXISTS "audit_incidents_target_queue_idx"
    ON "audit_incidents" ("target_run_id", "target_gate", "status");
  CREATE INDEX IF NOT EXISTS "audit_incidents_created_idx"
    ON "audit_incidents" ("created_at");
END $$;
