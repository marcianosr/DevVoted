-- Accounts carried no timestamps at all: no signup date to read, and no way to
-- tell a dormant account from a daily one.
--
-- created_at backfills from auth.users, which has held the real signup instant
-- all along — the app's own table simply never mirrored it. Accounts with no
-- auth row (seeded ones) fall back to the earliest trace they left, a run or an
-- answer, so no existing row is silently re-dated to the day this shipped.
-- last_seen_at backfills from auth.users.last_sign_in_at for the same reason,
-- then from the latest trace: /admin's reminder mailer has no other way to tell
-- a lapsed player from an active one.
-- Wrapped in a guard so this is safe to run before the Drizzle schema exists,
-- and safe to re-apply.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users'
  ) THEN
    RAISE NOTICE 'Base schema not yet initialised — skipping add_user_timestamps migration';
    RETURN;
  END IF;

  -- Nullable first, so the backfill decides the value rather than the default.
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone;
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_seen_at" timestamp with time zone;

  UPDATE "users" u
  SET "created_at" = COALESCE(
    (SELECT a."created_at" FROM auth."users" a WHERE a."id" = u."id"),
    LEAST(
      COALESCE((SELECT min(r."created_at") FROM "runs" r WHERE r."user_id" = u."id"), now()),
      COALESCE((SELECT min(p."created_at") FROM "polls_responses" p WHERE p."user_id" = u."id"), now())
    )
  )
  WHERE u."created_at" IS NULL;

  UPDATE "users" u
  SET "last_seen_at" = GREATEST(
    COALESCE((SELECT a."last_sign_in_at" FROM auth."users" a WHERE a."id" = u."id"), u."created_at"),
    COALESCE((SELECT max(r."updated_at") FROM "runs" r WHERE r."user_id" = u."id"), u."created_at"),
    COALESCE((SELECT max(p."created_at") FROM "polls_responses" p WHERE p."user_id" = u."id"), u."created_at")
  )
  WHERE u."last_seen_at" IS NULL;

  ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT now();
  ALTER TABLE "users" ALTER COLUMN "created_at" SET NOT NULL;

  CREATE INDEX IF NOT EXISTS "users_created_at_idx" ON "users" ("created_at");
END $$;
