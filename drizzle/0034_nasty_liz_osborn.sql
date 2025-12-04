CREATE TABLE "daily_polls" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" varchar(10) NOT NULL,
	"poll_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "daily_polls_date_unique" UNIQUE("date")
);
--> statement-breakpoint
ALTER TABLE "daily_polls" ADD CONSTRAINT "daily_polls_poll_id_polls_id_fk" FOREIGN KEY ("poll_id") REFERENCES "public"."polls"("id") ON DELETE cascade ON UPDATE no action;