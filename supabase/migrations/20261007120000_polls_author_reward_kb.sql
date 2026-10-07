-- A poll in a thin category pays a bounty, fixed when it is suggested (DVTD-y0jb).
--   - polls.author_reward_kb: the archived KB its author is paid on first publish.
--     Existing polls default to the flat 16 KB every approved poll paid before.
-- Wrapped in a guard so this is safe to run before the Drizzle schema exists.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'polls'
  ) THEN
    RAISE NOTICE 'Base schema not yet initialised — skipping polls_author_reward_kb migration';
    RETURN;
  END IF;

  ALTER TABLE "polls" ADD COLUMN IF NOT EXISTS "author_reward_kb" integer DEFAULT 16 NOT NULL;
END
$$;
