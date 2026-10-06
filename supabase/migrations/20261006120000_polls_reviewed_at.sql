-- An admin walking the poll list marks each poll reviewed (DVTD poll review loop).
--   - polls.reviewed_at: stamped by "Save & next" or "Mark reviewed".
--     Nullable: every existing poll starts unreviewed.
-- Wrapped in a guard so this is safe to run before the Drizzle schema exists.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'polls'
  ) THEN
    RAISE NOTICE 'Base schema not yet initialised — skipping polls_reviewed_at migration';
    RETURN;
  END IF;

  ALTER TABLE "polls" ADD COLUMN IF NOT EXISTS "reviewed_at" timestamp with time zone;
END
$$;
