-- An approved poll tells its author, once (DVTD-dgee).
--   - polls.author_announced_at: stamped when the author dismisses the
--     "your poll is live" dialog. A paid, unannounced poll raises it.
--   - Polls already paid are stamped now: their payout happened before the
--     dialog existed, so announcing it today would credit nothing new.
-- Wrapped in a guard so this is safe to run before the Drizzle schema exists.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'polls'
  ) THEN
    RAISE NOTICE 'Base schema not yet initialised — skipping polls_author_announced_at migration';
    RETURN;
  END IF;

  ALTER TABLE "polls" ADD COLUMN IF NOT EXISTS "author_announced_at" timestamp with time zone;

  UPDATE "polls"
  SET "author_announced_at" = "author_paid_at"
  WHERE "author_paid_at" IS NOT NULL AND "author_announced_at" IS NULL;
END
$$;
