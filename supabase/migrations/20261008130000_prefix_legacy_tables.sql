DO $$
DECLARE
  legacy_table text;
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'runs'
  ) THEN
    RAISE NOTICE 'Base schema not yet initialised — skipping prefix_legacy_tables migration';
    RETURN;
  END IF;

  FOREACH legacy_table IN ARRAY ARRAY[
    'daily_polls',
    'leaderboard',
    'seasons',
    'run_category_coverage',
    'run_shop_offerings'
  ] LOOP
    IF EXISTS (
      SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = legacy_table
    ) AND NOT EXISTS (
      SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'legacy_' || legacy_table
    ) THEN
      EXECUTE format('ALTER TABLE public.%I RENAME TO %I', legacy_table, 'legacy_' || legacy_table);
    END IF;
  END LOOP;
END $$;
