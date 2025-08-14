ALTER TABLE "runs" ADD COLUMN "rerolls" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "runs" ADD COLUMN "total_rerolls" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "runs" DROP COLUMN "reroll_count";--> statement-breakpoint
ALTER TABLE "runs" DROP COLUMN "kb_spent_on_rerolls";