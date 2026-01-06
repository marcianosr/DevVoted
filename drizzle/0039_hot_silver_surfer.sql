CREATE TABLE "user_category_progression" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"category_code" varchar(50) NOT NULL,
	"best_level" integer DEFAULT 1 NOT NULL,
	"best_effective_coverage" real DEFAULT 0 NOT NULL,
	"achieved_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "user_category_progression_user_id_category_code_unique" UNIQUE("user_id","category_code")
);
--> statement-breakpoint
ALTER TABLE "polls_responses" ADD COLUMN "run_id" integer;--> statement-breakpoint
ALTER TABLE "polls_responses" ADD COLUMN "answer_date" varchar(10) NOT NULL;--> statement-breakpoint
ALTER TABLE "user_category_progression" ADD CONSTRAINT "user_category_progression_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_category_progression" ADD CONSTRAINT "user_category_progression_category_code_polls_categories_code_fk" FOREIGN KEY ("category_code") REFERENCES "public"."polls_categories"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "polls_responses" ADD CONSTRAINT "polls_responses_run_id_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "polls_responses" ADD CONSTRAINT "polls_responses_poll_id_user_id_answer_date_unique" UNIQUE("poll_id","user_id","answer_date");