DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'runs'
  ) THEN
    RAISE NOTICE 'Base schema not yet initialised — skipping drop_dead_tech_debt_and_run_columns migration';
    RETURN;
  END IF;

  DROP TABLE IF EXISTS "active_tech_debts";
  ALTER TABLE "runs" DROP COLUMN IF EXISTS "discounted_config_ids";
  ALTER TABLE "runs" DROP COLUMN IF EXISTS "challenge_mode_id";
END $$;
