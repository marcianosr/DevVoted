-- A dependency grid hides three groups of four tiles (DVTD-dcfz).
--   - answer_type gains 'grid'.
--   - polls_options.group_index: which group a grid tile belongs to; null on
--     single and multiple polls.
--   - polls.group_labels: the groups' names, in group_index order; null unless
--     the poll is a grid.
-- Wrapped in a guard so this is safe to run before the Drizzle schema exists.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'polls_options'
  ) THEN
    RAISE NOTICE 'Base schema not yet initialised — skipping dependency_grid migration';
    RETURN;
  END IF;

  ALTER TYPE "answer_type" ADD VALUE IF NOT EXISTS 'grid';

  ALTER TABLE "polls_options" ADD COLUMN IF NOT EXISTS "group_index" smallint;

  ALTER TABLE "polls" ADD COLUMN IF NOT EXISTS "group_labels" text[];
END
$$;
