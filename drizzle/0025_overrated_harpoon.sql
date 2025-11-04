CREATE TABLE "polls_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"poll_id" integer NOT NULL,
	"user_id" uuid NOT NULL,
	"times_seen" integer DEFAULT 1 NOT NULL,
	"times_answered" integer DEFAULT 0 NOT NULL,
	"first_seen_at" timestamp DEFAULT now() NOT NULL,
	"last_seen_at" timestamp DEFAULT now() NOT NULL,
	"last_answered_at" timestamp,
	CONSTRAINT "polls_history_user_id_poll_id_unique" UNIQUE("user_id","poll_id")
);
--> statement-breakpoint
ALTER TABLE "polls_history" ADD CONSTRAINT "polls_history_poll_id_polls_id_fk" FOREIGN KEY ("poll_id") REFERENCES "public"."polls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "polls_history" ADD CONSTRAINT "polls_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;