-- The legacy archive top-up (ADR-112). Balances carry at face value across the
-- 2.0 cutover, and the accounts that played the calendar game are credited once
-- on top of what they already hold: 256 KB for having played, 1 MB instead for
-- a climb the cutover ended.
--
-- Two things in here are load-bearing:
--   - The cohort is read from `user_titles`, NOT re-derived from `runs`.
--     ADR-111's migration ends by closing every active calendar run, so
--     `mode = 'calendar' AND status = 'active'` matches nobody once it has run.
--     Re-deriving tier 2 that way reports success and pays no one.
--   - The credit and its marker are ONE statement. Written apart, a failure
--     between them either pays twice on the next apply or never pays at all.
--
-- `bool_or` is what makes tier 2 supersede rather than stack: tier 2 is a subset
-- of tier 1, so those accounts hold both rows and must collapse to one 1 MB
-- payment, not 1.25 MB.
--
-- Guarded so it is safe before the Drizzle schema exists, and safe to re-apply.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_titles'
  ) THEN
    RAISE NOTICE 'user_titles not yet initialised — skipping grant_legacy_archive_bonus migration';
    RETURN;
  END IF;

  ALTER TABLE "users"
    ADD COLUMN IF NOT EXISTS "legacy_bonus_bytes" bigint;

  WITH cohort AS (
    SELECT ut."user_id",
           CASE WHEN bool_or(ut."title_id" = 'title-legacy-active')
                THEN 1024 * 1024
                ELSE 256 * 1024
           END AS bytes
    FROM "user_titles" ut
    WHERE ut."title_id" IN ('title-legacy-tester', 'title-legacy-active')
    GROUP BY ut."user_id"
  )
  UPDATE "users" u
  SET "archived_storage" = u."archived_storage" + c."bytes",
      "legacy_bonus_bytes" = c."bytes"
  FROM cohort c
  WHERE u."id" = c."user_id"
    AND u."legacy_bonus_bytes" IS NULL;
END $$;
