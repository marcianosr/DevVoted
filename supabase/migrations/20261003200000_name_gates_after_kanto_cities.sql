-- Every gate and its swatch is named after its Kanto city (DVTD-ef7i), so the
-- stored swatch ids move from badge names to city names.
--   - users.owned_swatch_ids: each old id is swapped for its city id in place,
--     keeping the array's order.
--   - users.equipped_swatch_id: the worn swatch follows the same mapping.
-- Pallet, Lavender, Seafoam and Champion keep their ids.
-- Wrapped in a guard so this is safe to run before the Drizzle schema exists.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users'
  ) THEN
    RAISE NOTICE 'Base schema not yet initialised — skipping name_gates_after_kanto_cities migration';
    RETURN;
  END IF;

  CREATE TEMP TABLE swatch_renames (old_id text PRIMARY KEY, new_id text NOT NULL) ON COMMIT DROP;
  INSERT INTO swatch_renames (old_id, new_id) VALUES
    ('swatch-boulder', 'swatch-pewter'),
    ('swatch-cascade', 'swatch-cerulean'),
    ('swatch-thunder', 'swatch-vermilion'),
    ('swatch-rainbow', 'swatch-celadon'),
    ('swatch-soul', 'swatch-fuchsia'),
    ('swatch-marsh', 'swatch-saffron'),
    ('swatch-volcano', 'swatch-cinnabar'),
    ('swatch-earth', 'swatch-viridian'),
    ('swatch-elite', 'swatch-indigo-elite');

  UPDATE "users" u
  SET "owned_swatch_ids" = ARRAY(
    SELECT COALESCE(r.new_id, owned.id)
    FROM unnest(u."owned_swatch_ids") WITH ORDINALITY AS owned(id, position)
    LEFT JOIN swatch_renames r ON r.old_id = owned.id
    ORDER BY owned.position
  )
  WHERE u."owned_swatch_ids" && ARRAY(SELECT old_id FROM swatch_renames);

  UPDATE "users" u
  SET "equipped_swatch_id" = r.new_id
  FROM swatch_renames r
  WHERE u."equipped_swatch_id" = r.old_id;
END $$;
