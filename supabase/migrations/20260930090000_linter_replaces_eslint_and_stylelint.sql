DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_config_unlocks'
  ) THEN
    RAISE NOTICE 'user_config_unlocks not yet initialised — skipping linter_replaces_eslint_and_stylelint migration';
    RETURN;
  END IF;

  INSERT INTO "user_config_unlocks" ("user_id", "config_id", "via_metric", "first_installed_at")
  SELECT u.id, 'linter', NULL, old.first_installed_at
  FROM "users" u
  LEFT JOIN "user_config_unlocks" old
    ON old.user_id = u.id AND old.config_id = 'eslint'
  ON CONFLICT DO NOTHING;

  DELETE FROM "user_config_unlocks" WHERE "config_id" IN ('eslint', 'stylelint');
END $$;
