DO $$
DECLARE
  retired text[] := ARRAY[
    'title-vanilla-js',
    'title-tree-shaken',
    'title-breaking-change',
    'title-peer-dependency',
    'title-works-on-my-machine',
    'title-ship-it',
    'title-bikeshedder',
    'title-stack-overflow'
  ];
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_titles'
  ) THEN
    RAISE NOTICE 'user_titles not yet initialised — skipping replace_special_titles migration';
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
END $$;
