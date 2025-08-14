ALTER TABLE "runs" ADD COLUMN "reroll_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "runs" ADD COLUMN "kb_spent_on_rerolls" integer DEFAULT 0 NOT NULL;