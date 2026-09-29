-- A worn swatch themes the profile page.
--   - users.equipped_swatch_id: the swatch whose gate theme the player's
--     profile page wears, for the owner and every visitor. NULL is pallet, the
--     default, so nothing needs backfilling.
-- Wrapped in a guard so this is safe to run before the Drizzle schema exists.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users'
  ) THEN
    RAISE NOTICE 'Base schema not yet initialised — skipping wear_a_swatch migration';
    RETURN;
  END IF;

  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "equipped_swatch_id" text;
END $$;
