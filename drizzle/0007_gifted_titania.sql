CREATE TABLE "polls_user_performance" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"category_code" varchar(50) NOT NULL,
	"best_xp" integer DEFAULT 0 NOT NULL,
	"best_streak" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "polls_user_performance_user_id_category_code_unique" UNIQUE("user_id","category_code")
);
--> statement-breakpoint
ALTER TABLE "polls_user_performance" ADD CONSTRAINT "polls_user_performance_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "polls_user_performance" ADD CONSTRAINT "polls_user_performance_category_code_polls_categories_code_fk" FOREIGN KEY ("category_code") REFERENCES "public"."polls_categories"("code") ON DELETE no action ON UPDATE no action;