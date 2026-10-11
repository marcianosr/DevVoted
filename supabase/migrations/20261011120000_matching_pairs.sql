-- A matching pairs poll holds four pairs of two tiles (DVTD-dcfz).
--   - answer_type gains 'pairs'.
--   - polls_options.group_index: which pair a tile belongs to; null on single
--     and multiple polls. Within a pair, the lower option id is the left tile.
-- Wrapped in a guard so this is safe to run before the Drizzle schema exists.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'polls_options'
  ) THEN
    RAISE NOTICE 'Base schema not yet initialised — skipping matching_pairs migration';
    RETURN;
  END IF;

  ALTER TYPE "answer_type" ADD VALUE IF NOT EXISTS 'pairs';

  ALTER TABLE "polls_options" ADD COLUMN IF NOT EXISTS "group_index" smallint;
END
$$;
