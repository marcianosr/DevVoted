-- Create daily_polls table for O(1) daily poll lookups
-- This replaces the expensive manageDailyPollTransition that fetched all polls

CREATE TABLE IF NOT EXISTS "daily_polls" (
    "id" serial PRIMARY KEY,
    "date" varchar(10) NOT NULL UNIQUE,
    "poll_id" integer NOT NULL REFERENCES "polls"("id") ON DELETE CASCADE,
    "created_at" timestamp with time zone DEFAULT now()
);

-- Create unique index on date for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS "idx_daily_polls_date" ON "daily_polls"("date");

-- Migrate current open poll to daily_polls (if any exists)
INSERT INTO "daily_polls" ("date", "poll_id")
SELECT
    to_char(CURRENT_DATE, 'YYYY-MM-DD'),
    "id"
FROM "polls"
WHERE "status" = 'open'
LIMIT 1
ON CONFLICT ("date") DO NOTHING;

-- Remove status column from polls (keep for now, will deprecate)
-- ALTER TABLE "polls" DROP COLUMN IF EXISTS "status";
-- Note: Keeping status column for now to support gradual migration
-- Can be removed in a future migration once all code is updated
