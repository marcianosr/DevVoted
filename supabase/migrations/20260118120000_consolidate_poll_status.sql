-- Consolidate poll status: remove 'open' and 'closed', keep only 'draft', 'published', 'archived'
-- This migration updates existing data and recreates the enum type

-- Step 1: Update existing data - map 'open' and 'closed' to 'published'
-- Both 'open' and 'closed' were temporal states; 'published' means available to users
UPDATE "polls" SET "status" = 'published' WHERE "status" IN ('open', 'closed');

-- Step 2: Create new enum type with only the valid values
CREATE TYPE "public"."status_new" AS ENUM('draft', 'published', 'archived');

-- Step 3: Alter the column to use the new type
ALTER TABLE "polls"
  ALTER COLUMN "status" TYPE "public"."status_new"
  USING "status"::text::"public"."status_new";

-- Step 4: Drop the old type and rename the new one
DROP TYPE "public"."status";
ALTER TYPE "public"."status_new" RENAME TO "status";
