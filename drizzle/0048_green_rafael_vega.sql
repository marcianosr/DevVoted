CREATE TABLE "gate_unlocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"gate_type_code" varchar(50) NOT NULL,
	"run_id" integer,
	"unlocked_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "gate_types" ADD COLUMN "unlock_condition" text;--> statement-breakpoint
ALTER TABLE "gate_types" ADD COLUMN "constraint_text" text;--> statement-breakpoint
ALTER TABLE "gate_types" ADD COLUMN "reward_text" text;--> statement-breakpoint
ALTER TABLE "run_gate_history" ADD COLUMN "gate_state" json;--> statement-breakpoint
ALTER TABLE "gate_unlocks" ADD CONSTRAINT "gate_unlocks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gate_unlocks" ADD CONSTRAINT "gate_unlocks_gate_type_code_gate_types_code_fk" FOREIGN KEY ("gate_type_code") REFERENCES "public"."gate_types"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gate_unlocks" ADD CONSTRAINT "gate_unlocks_run_id_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."runs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_gate_unlock_unique" ON "gate_unlocks" USING btree ("user_id","gate_type_code");