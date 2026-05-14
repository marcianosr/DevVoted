CREATE TABLE "user_awards" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"category_code" varchar(50) NOT NULL,
	"metric" varchar(50) NOT NULL,
	"first_earned_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_awards_user_id_category_code_metric_unique" UNIQUE("user_id","category_code","metric")
);
--> statement-breakpoint
ALTER TABLE "user_awards" ADD CONSTRAINT "user_awards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_awards" ADD CONSTRAINT "user_awards_category_code_polls_categories_code_fk" FOREIGN KEY ("category_code") REFERENCES "public"."polls_categories"("code") ON DELETE no action ON UPDATE no action;