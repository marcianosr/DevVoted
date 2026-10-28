-- A guest has an account row (DVTD-ojkl, ADR-178).
--   - users.email: nullable, since an anonymous Supabase session has no email.
--     The unique constraint stays; Postgres lets many rows hold NULL.
--   - users.is_guest: true for an anonymous session until it links an identity.
-- Wrapped in a guard so this is safe to run before the Drizzle schema exists.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users'
  ) THEN
    RAISE NOTICE 'Base schema not yet initialised — skipping users_guest migration';
    RETURN;
  END IF;

  ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_guest" boolean DEFAULT false NOT NULL;
END
$$;
