-- Wrapped in a guard so this is safe to run before the Drizzle schema exists.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'runs'
  ) THEN
    RAISE NOTICE 'Base schema not yet initialised — skipping add_deinstall_penalty migration';
    RETURN;
  END IF;

  ALTER TABLE "runs" ADD COLUMN IF NOT EXISTS "deinstall_penalty" integer DEFAULT 0 NOT NULL;
END $$;
