-- An approved poll pays its author 16 KB of archive, once (DVTD-60nr).
--   - polls.author_paid_at: stamped the first time the poll is saved as
--     published. The payout's guard reads it, so republishing pays nothing.
--   - Polls already published are stamped now without a payout: the reward
--     is not retroactive.
-- Wrapped in a guard so this is safe to run before the Drizzle schema exists.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'polls'
  ) THEN
    RAISE NOTICE 'Base schema not yet initialised — skipping polls_author_paid_at migration';
    RETURN;
  END IF;

  ALTER TABLE "polls" ADD COLUMN IF NOT EXISTS "author_paid_at" timestamp with time zone;

  UPDATE "polls"
  SET "author_paid_at" = now()
  WHERE "status" = 'published' AND "author_paid_at" IS NULL;
END
$$;
