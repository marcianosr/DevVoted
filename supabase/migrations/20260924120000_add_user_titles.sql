-- Earned titles (ADR-109).
--   - user_titles: a row is a title the account has earned, permanently. The
--     predicate that granted it is never asked again, so a record that stops
--     being true costs nobody their title.
--   - users.equipped_title_id: which owned title is worn. NULL (wearing none)
--     is the normal state.
-- The partial unique index is what makes a race title a race: only one account
-- may ever hold a title marked exclusive, decided by whoever inserts first
-- rather than by an "am I first?" read.
-- Wrapped in a guard so this is safe to run before the Drizzle schema exists.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users'
  ) THEN
    RAISE NOTICE 'Base schema not yet initialised — skipping add_user_titles migration';
    RETURN;
  END IF;

  CREATE TABLE IF NOT EXISTS "user_titles" (
    "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "title_id" varchar(64) NOT NULL,
    "exclusive" boolean NOT NULL DEFAULT false,
    "earned_at" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT "user_titles_pkey" PRIMARY KEY ("user_id", "title_id")
  );

  CREATE UNIQUE INDEX IF NOT EXISTS "user_titles_exclusive_title"
    ON "user_titles" ("title_id") WHERE "exclusive";

  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "equipped_title_id" text;
END $$;
