-- Add missing columns to sync with Drizzle schema
ALTER TABLE "polls" ADD COLUMN IF NOT EXISTS "explanation" text;
ALTER TABLE "runs" ADD COLUMN IF NOT EXISTS "shop_skipped_date" varchar(10);
ALTER TABLE "runs" ADD COLUMN IF NOT EXISTS "shop_interacted_date" varchar(10);
