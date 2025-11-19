-- Clear existing polls_history data since it's incompatible with new schema
-- This is safe because run progress resets between runs anyway
TRUNCATE TABLE "polls_history" CASCADE;--> statement-breakpoint

-- Drop old unique constraint
ALTER TABLE "polls_history" DROP CONSTRAINT "polls_history_user_id_poll_id_unique";--> statement-breakpoint

-- Add run_id column (now safe since table is empty)
ALTER TABLE "polls_history" ADD COLUMN "run_id" integer NOT NULL;--> statement-breakpoint

-- Add foreign key constraint
ALTER TABLE "polls_history" ADD CONSTRAINT "polls_history_run_id_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

-- Add new unique constraint for run-scoped tracking
ALTER TABLE "polls_history" ADD CONSTRAINT "polls_history_run_id_poll_id_unique" UNIQUE("run_id","poll_id");
