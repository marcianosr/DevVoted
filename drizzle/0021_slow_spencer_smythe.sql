CREATE TABLE "run_category_coverage" (
	"id" serial PRIMARY KEY NOT NULL,
	"run_id" integer NOT NULL,
	"category_code" varchar(50) NOT NULL,
	"current_coverage" real DEFAULT 0 NOT NULL,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"best_streak" integer DEFAULT 0 NOT NULL,
	"polls_answered" integer DEFAULT 0 NOT NULL,
	"final_coverage" real,
	"final_streak" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "run_category_coverage_run_id_category_code_unique" UNIQUE("run_id","category_code")
);
--> statement-breakpoint
DROP TABLE "run_category_xp" CASCADE;--> statement-breakpoint
ALTER TABLE "run_category_coverage" ADD CONSTRAINT "run_category_coverage_run_id_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "run_category_coverage" ADD CONSTRAINT "run_category_coverage_category_code_polls_categories_code_fk" FOREIGN KEY ("category_code") REFERENCES "public"."polls_categories"("code") ON DELETE no action ON UPDATE no action;