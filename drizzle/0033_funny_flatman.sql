ALTER TABLE "polls" ADD COLUMN "explanation" text;--> statement-breakpoint
ALTER TABLE "runs" ADD COLUMN "shop_skipped_date" varchar(10);--> statement-breakpoint
ALTER TABLE "runs" ADD COLUMN "shop_interacted_date" varchar(10);