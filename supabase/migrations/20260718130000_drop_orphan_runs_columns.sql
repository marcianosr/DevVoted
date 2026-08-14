-- Migration hygiene (ADR-012): remove the abandoned scripts/packs experiment
-- columns from runs (absent from schema.ts; they made drizzle-kit push prompt
-- for renames) and retire the dead drizzle migrate journal. Data audit before
-- drop: held_script_ids and pending_pack empty; fired_scripts and
-- pack_storage_used each held one row of experiment leftovers — knowingly
-- discarded.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'runs'
  ) THEN
    RAISE NOTICE 'Base schema not yet initialised — skipping drop_orphan_runs_columns migration';
    RETURN;
  END IF;

  ALTER TABLE "runs" DROP COLUMN IF EXISTS "held_script_ids";
  ALTER TABLE "runs" DROP COLUMN IF EXISTS "fired_scripts";
  ALTER TABLE "runs" DROP COLUMN IF EXISTS "pending_pack";
  ALTER TABLE "runs" DROP COLUMN IF EXISTS "pack_storage_used";

  DROP TABLE IF EXISTS "drizzle"."__drizzle_migrations";
  DROP SCHEMA IF EXISTS "drizzle";
END $$;
