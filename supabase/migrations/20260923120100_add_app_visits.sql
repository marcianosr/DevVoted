-- First-party visit counting. One row is one visitor's day on one screen: the
-- matched route id pattern, never a URL, and a visitor hash keyed to the date
-- so nothing links a person across days. No cookie, no device storage, no third
-- party — which is why the app shows no consent banner.
-- Wrapped in a guard so this is safe to run before the Drizzle schema exists,
-- and safe to re-apply.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users'
  ) THEN
    RAISE NOTICE 'Base schema not yet initialised — skipping add_app_visits migration';
    RETURN;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'visit_device') THEN
    CREATE TYPE visit_device AS ENUM ('desktop', 'mobile', 'tablet', 'bot');
  END IF;

  CREATE TABLE IF NOT EXISTS "app_visits" (
    "id" serial PRIMARY KEY,
    "visit_date" date NOT NULL,
    "visitor_hash" varchar(32) NOT NULL,
    "route_id" varchar(64) NOT NULL,
    "user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
    "hits" integer NOT NULL DEFAULT 1,
    "device" visit_device NOT NULL DEFAULT 'desktop',
    "country" varchar(2),
    "referrer_host" varchar(255),
    "first_seen_at" timestamp with time zone NOT NULL DEFAULT now(),
    "last_seen_at" timestamp with time zone NOT NULL DEFAULT now()
  );

  CREATE UNIQUE INDEX IF NOT EXISTS "app_visits_day_visitor_route_uniq"
    ON "app_visits" ("visit_date", "visitor_hash", "route_id");
  CREATE INDEX IF NOT EXISTS "app_visits_day_route_idx"
    ON "app_visits" ("visit_date", "route_id");
  CREATE INDEX IF NOT EXISTS "app_visits_user_day_idx"
    ON "app_visits" ("user_id", "visit_date") WHERE "user_id" IS NOT NULL;
END $$;
