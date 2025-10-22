ALTER TABLE "run_category_coverage" ADD COLUMN "final_polls_answered" integer;--> statement-breakpoint
ALTER TABLE "runs" ADD COLUMN "completion_reason" varchar(50);