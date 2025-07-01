ALTER TABLE "polls" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "polls" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "polls_options" ADD COLUMN "correct" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "polls_options" DROP COLUMN "is_correct";