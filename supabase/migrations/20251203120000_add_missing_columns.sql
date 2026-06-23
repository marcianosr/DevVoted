-- Add missing columns to sync with Drizzle schema
-- Wrapped in a guard so this is safe to run before the Drizzle schema exists.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'polls'
  ) THEN
    RAISE NOTICE 'Base schema not yet initialised — skipping add_missing_columns migration';
    RETURN;
  END IF;

  ALTER TABLE "polls" ADD COLUMN IF NOT EXISTS "explanation" text;
  ALTER TABLE "runs" ADD COLUMN IF NOT EXISTS "shop_skipped_date" varchar(10);
  ALTER TABLE "runs" ADD COLUMN IF NOT EXISTS "shop_interacted_date" varchar(10);
END $$;
