CREATE TYPE "public"."gate_stake" AS ENUM('very_easy', 'easy', 'medium', 'hard', 'very_hard');--> statement-breakpoint
CREATE TABLE "gate_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"stake" "gate_stake" DEFAULT 'easy' NOT NULL,
	"polls_per_gate" integer DEFAULT 5 NOT NULL,
	"modifier_config" json,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "gate_types_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "run_gate_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"run_id" integer NOT NULL,
	"gate_number" integer NOT NULL,
	"gate_type_code" varchar(50) NOT NULL,
	"passed" boolean,
	"started_at" timestamp with time zone DEFAULT now(),
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "runs" ADD COLUMN "awaiting_gate_selection" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "run_gate_history" ADD CONSTRAINT "run_gate_history_run_id_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "run_gate_history" ADD CONSTRAINT "run_gate_history_gate_type_code_gate_types_code_fk" FOREIGN KEY ("gate_type_code") REFERENCES "public"."gate_types"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "runs" DROP COLUMN "challenge_mode_id";