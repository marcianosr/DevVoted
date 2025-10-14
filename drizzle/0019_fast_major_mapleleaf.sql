ALTER TABLE "leaderboard" ADD COLUMN "category_coverage" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "leaderboard" ADD COLUMN "total_coverage" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "run_category_xp" ADD COLUMN "current_coverage" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "run_category_xp" ADD COLUMN "final_coverage" integer;--> statement-breakpoint
ALTER TABLE "leaderboard" DROP COLUMN "category_xp";--> statement-breakpoint
ALTER TABLE "leaderboard" DROP COLUMN "total_xp";--> statement-breakpoint
ALTER TABLE "run_category_xp" DROP COLUMN "current_xp";--> statement-breakpoint
ALTER TABLE "run_category_xp" DROP COLUMN "final_xp";