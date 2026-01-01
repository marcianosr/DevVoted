ALTER TABLE "daily_polls" ALTER COLUMN "poll_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "daily_polls" ADD COLUMN "category_weights" json;