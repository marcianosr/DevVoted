ALTER TABLE "polls_response_options" ADD COLUMN "id" serial PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "polls_responses" ADD COLUMN "id" serial PRIMARY KEY NOT NULL;