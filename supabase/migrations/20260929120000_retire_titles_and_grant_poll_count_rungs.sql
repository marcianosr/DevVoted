-- Retires twenty-five titles and turns the poll-count rank ladder into titles.
--   - Retired ids leave users.equipped_title_ids BEFORE their user_titles rows
--     are deleted. The array has no foreign key, and an id worn but not owned
--     blocks every later equip and unequip for that account.
--   - Accounts already past a rung are granted it from the polls-answered
--     counter, announced, so fourteen rungs never arrive as one wall of notices.
--   - ON CONFLICT DO NOTHING keeps a re-run from touching a rung already held.
-- Guarded so it is safe before the Drizzle schema exists, and safe to re-apply.

DO $$
DECLARE
  retired text[] := ARRAY[
    'title-node-modules',
    'title-serverless',
    'title-negative-test',
    'title-fire-sale',
    'title-backup-strategy',
    'title-off-by-one',
    'title-chaos-monkey',
    'title-nuke-it-from-orbit',
    'title-technical-debt',
    'title-feature-flag',
    'title-heisenbug',
    'title-no-estimates',
    'title-warm-path',
    'title-99-9',
    'title-green-build',
    'title-six-nines',
    'title-touch-grass',
    'title-force-push',
    'title-semver-major',
    'title-all-green',
    'title-zero-warnings',
    'title-completer',
    'title-summit',
    'title-flawless',
    'title-first-ascent'
  ];
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_titles'
  ) THEN
    RAISE NOTICE 'user_titles not yet initialised — skipping retire_titles_and_grant_poll_count_rungs migration';
    RETURN;
  END IF;

  UPDATE "users"
    SET "equipped_title_ids" = ARRAY(
      SELECT worn FROM unnest("equipped_title_ids") WITH ORDINALITY AS t(worn, position)
      WHERE worn <> ALL (retired)
      ORDER BY position
    )
    WHERE "equipped_title_ids" && retired;

  DELETE FROM "user_titles" WHERE "title_id" = ANY (retired);

  INSERT INTO "user_titles" ("user_id", "title_id", "exclusive", "earned_at", "announced_at")
  SELECT progress."user_id", rung.title_id, false, now(), now()
  FROM "user_objective_progress" progress
  JOIN (VALUES
    ('title-rank-poll-newbie', 1),
    ('title-rank-poll-acquaintance', 36),
    ('title-rank-no-stopping-me-now', 71),
    ('title-rank-long-polling', 106),
    ('title-rank-poll-a-holic', 141),
    ('title-rank-poll-collector', 176),
    ('title-rank-poll-nerdo', 231),
    ('title-rank-permanently-plugged-in', 301),
    ('title-rank-truly-poll-addicted', 356),
    ('title-rank-polls-are-a-nerds-best-friend', 411),
    ('title-rank-poll-elitist', 476),
    ('title-rank-pollxtreme', 576),
    ('title-rank-polls-treasure-trove', 666),
    ('title-rank-polls-galore', 786)
  ) AS rung(title_id, target) ON progress."count" >= rung.target
  WHERE progress."metric" = 'polls-answered'
  ON CONFLICT ("user_id", "title_id") DO NOTHING;
END $$;
