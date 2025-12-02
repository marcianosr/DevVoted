ALTER TABLE "polls" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "polls" ALTER COLUMN "status" SET DEFAULT 'draft'::text;--> statement-breakpoint
DROP TYPE "public"."status";--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('draft', 'open', 'closed', 'archived');--> statement-breakpoint
ALTER TABLE "polls" ALTER COLUMN "status" SET DEFAULT 'draft'::"public"."status";--> statement-breakpoint
ALTER TABLE "polls" ALTER COLUMN "status" SET DATA TYPE "public"."status" USING "status"::"public"."status";