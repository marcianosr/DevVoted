CREATE TABLE "daily_exposed_deck" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" varchar(10) NOT NULL,
	"run_id" integer NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "daily_exposed_deck_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "run_shop_offerings" (
	"id" serial PRIMARY KEY NOT NULL,
	"run_id" integer NOT NULL,
	"date" varchar(10) NOT NULL,
	"reroll_number" integer DEFAULT 0 NOT NULL,
	"config_ids" json NOT NULL,
	"is_locked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "run_shop_offerings_run_id_date_reroll_number_unique" UNIQUE("run_id","date","reroll_number")
);
--> statement-breakpoint
ALTER TABLE "daily_exposed_deck" ADD CONSTRAINT "daily_exposed_deck_run_id_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_exposed_deck" ADD CONSTRAINT "daily_exposed_deck_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "run_shop_offerings" ADD CONSTRAINT "run_shop_offerings_run_id_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."runs"("id") ON DELETE cascade ON UPDATE no action;