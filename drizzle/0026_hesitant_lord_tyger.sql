ALTER TABLE "polls_history" ALTER COLUMN "first_seen_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "polls_history" ALTER COLUMN "first_seen_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "polls_history" ALTER COLUMN "last_seen_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "polls_history" ALTER COLUMN "last_seen_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "polls_history" ALTER COLUMN "last_answered_at" SET DATA TYPE timestamp with time zone;