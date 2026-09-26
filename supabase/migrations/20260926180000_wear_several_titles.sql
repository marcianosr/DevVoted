-- Several worn titles (amends ADR-109 Decision 1).
--   - users.equipped_title_ids: the titles the account wears, ordered. Index 1
--     is the primary, which is the one the poll byline, the climber card and
--     the attack panel draw. The profile card draws the whole array.
--   - The old single equipped_title_id becomes element 1 of the new array, so
--     nobody loses the title they were wearing.
-- Wrapped in a guard so this is safe to run before the Drizzle schema exists,
-- and so a re-run after the old column is gone is a no-op.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users'
  ) THEN
    RAISE NOTICE 'Base schema not yet initialised — skipping wear_several_titles migration';
    RETURN;
  END IF;

  ALTER TABLE "users"
    ADD COLUMN IF NOT EXISTS "equipped_title_ids" text[] NOT NULL DEFAULT '{}'::text[];

  IF EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'equipped_title_id'
  ) THEN
    UPDATE "users"
      SET "equipped_title_ids" = ARRAY["equipped_title_id"]
      WHERE "equipped_title_id" IS NOT NULL
        AND "equipped_title_ids" = '{}'::text[];

    ALTER TABLE "users" DROP COLUMN "equipped_title_id";
  END IF;
END $$;
