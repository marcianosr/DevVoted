-- Legacy grants (ADR-111). The calendar game and the rebuild share `runs`,
-- discriminated by `mode`, so "played the old game" is a row in that table.
-- Two tiers: anyone who ever started a calendar run, and the narrower set whose
-- calendar run was still open when the rebuild landed. Tier 2 is a subset, so
-- those accounts hold both rows and wear the rarer one.
--
-- Three orderings in here are load-bearing:
--   - `announced_at` and its backfill ride this file rather than their own.
--     Shipped apart, there is a window where every already-earned title reads
--     as unannounced and the notice fires for all of them.
--   - The backfill runs BEFORE the grants. Reversed, it stamps the brand-new
--     grants as already seen and nobody is ever told.
--   - The close runs LAST. The tier-2 predicate reads status = 'active', so a
--     migration that archived first would grant it to nobody.
--
-- `exclusive` is false on both: the partial unique index on user_titles treats
-- an exclusive title as a race that exactly one account in the database may
-- ever win, which would silently hand the reward to whoever inserted first.
--
-- Guarded so it is safe before the Drizzle schema exists, and safe to re-apply.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_titles'
  ) THEN
    RAISE NOTICE 'user_titles not yet initialised — skipping grant_legacy_titles migration';
    RETURN;
  END IF;

  ALTER TABLE "user_titles"
    ADD COLUMN IF NOT EXISTS "announced_at" timestamp with time zone;

  -- Excluding the two legacy ids is what makes a re-run a no-op instead of a
  -- silent swallow of a grant the player has not opened yet.
  UPDATE "user_titles"
  SET "announced_at" = "earned_at"
  WHERE "announced_at" IS NULL
    AND "title_id" NOT IN ('title-legacy-tester', 'title-legacy-active');

  INSERT INTO "user_titles" ("user_id", "title_id", "exclusive")
  SELECT DISTINCT r."user_id", 'title-legacy-tester', false
  FROM "runs" r
  WHERE r."mode" = 'calendar'
  ON CONFLICT DO NOTHING;

  INSERT INTO "user_titles" ("user_id", "title_id", "exclusive")
  SELECT DISTINCT r."user_id", 'title-legacy-active', false
  FROM "runs" r
  WHERE r."mode" = 'calendar' AND r."status" = 'active'
  ON CONFLICT DO NOTHING;

  -- Wear the rarer one, but only for an account wearing nothing and only while
  -- the grant is still unopened, so a re-run cannot put back a title the player
  -- deliberately took off.
  UPDATE "users" u
  SET "equipped_title_id" = (
    SELECT ut."title_id"
    FROM "user_titles" ut
    WHERE ut."user_id" = u."id"
      AND ut."title_id" IN ('title-legacy-active', 'title-legacy-tester')
      AND ut."announced_at" IS NULL
    ORDER BY (ut."title_id" = 'title-legacy-active') DESC
    LIMIT 1
  )
  WHERE u."equipped_title_id" IS NULL
    AND EXISTS (
      SELECT 1 FROM "user_titles" ut
      WHERE ut."user_id" = u."id"
        AND ut."title_id" IN ('title-legacy-active', 'title-legacy-tester')
        AND ut."announced_at" IS NULL
    );

  UPDATE "runs"
  SET "status" = 'finished',
      "finished_at" = COALESCE("finished_at", now()),
      "completion_reason" = COALESCE("completion_reason", 'archived')
  WHERE "mode" = 'calendar' AND "status" = 'active';
END $$;
