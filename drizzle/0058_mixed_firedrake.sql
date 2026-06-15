CREATE TABLE "active_tech_debts" (
	"id" serial PRIMARY KEY NOT NULL,
	"run_id" integer NOT NULL,
	"template_id" varchar(64) NOT NULL,
	"acquired_at" timestamp with time zone DEFAULT now() NOT NULL,
	"progress_state" json NOT NULL
);
--> statement-breakpoint
ALTER TABLE "active_tech_debts" ADD CONSTRAINT "active_tech_debts_run_id_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."runs"("id") ON DELETE cascade ON UPDATE no action;