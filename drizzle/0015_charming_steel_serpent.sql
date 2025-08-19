CREATE TYPE "public"."season_status" AS ENUM('upcoming', 'active', 'finished', 'archived');--> statement-breakpoint
CREATE TABLE "seasons" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" text,
	"status" "season_status" DEFAULT 'upcoming' NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "runs" ADD COLUMN "season_id" integer;--> statement-breakpoint
ALTER TABLE "runs" ADD CONSTRAINT "runs_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE set null ON UPDATE no action;