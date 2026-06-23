-- Wrapped in a guard so this is safe to run before the Drizzle schema exists.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'runs'
  ) THEN
    RAISE NOTICE 'Base schema not yet initialised — skipping add_challenge_mode_id migration';
    RETURN;
  END IF;

  ALTER TABLE "runs" ADD COLUMN IF NOT EXISTS "challenge_mode_id" varchar(50);
END $$;
