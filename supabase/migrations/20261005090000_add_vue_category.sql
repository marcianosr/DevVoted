-- The Vue category exists in code (CATEGORY_CODES) but was never inserted
-- into polls_categories outside the seed, so saving a poll as Vue broke the
-- polls.category_code foreign key in production.
-- Wrapped in a guard so this is safe to run before the Drizzle schema exists.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'polls_categories'
  ) THEN
    RAISE NOTICE 'Base schema not yet initialised — skipping add_vue_category migration';
    RETURN;
  END IF;

  INSERT INTO "polls_categories" ("code", "name")
  VALUES ('vue', 'Vue')
  ON CONFLICT ("code") DO NOTHING;
END
$$;
