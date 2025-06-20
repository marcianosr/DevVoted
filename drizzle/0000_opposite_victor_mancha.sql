CREATE TYPE "public"."answer_type" AS ENUM('single', 'multiple');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('draft', 'needs-revision', 'open', 'closed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."run_status" AS ENUM('finished', 'active');--> statement-breakpoint
CREATE TYPE "public"."roles" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "polls_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"code" varchar(256) NOT NULL,
	CONSTRAINT "polls_categories_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "polls_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"poll_id" integer NOT NULL,
	"option" text NOT NULL,
	"is_correct" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "polls_response_options" (
	"response_id" integer NOT NULL,
	"option_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "polls_responses" (
	"response_id" serial PRIMARY KEY NOT NULL,
	"poll_id" integer NOT NULL,
	"user_id" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "polls_user_performance" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"category_code" varchar(50) NOT NULL,
	"cumulative_xp" integer DEFAULT 0 NOT NULL,
	"best_xp" integer DEFAULT 0 NOT NULL,
	"best_streak" integer DEFAULT 0 NOT NULL,
	"best_multiplier" numeric(3, 1) DEFAULT '0.0' NOT NULL,
	"betting_average" numeric(4, 1) DEFAULT '0.0' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "polls_user_performance_user_id_category_code_unique" UNIQUE("user_id","category_code")
);
--> statement-breakpoint
CREATE TABLE "polls" (
	"id" serial PRIMARY KEY NOT NULL,
	"question" text NOT NULL,
	"status" "status" DEFAULT 'draft' NOT NULL,
	"answer_type" "answer_type" DEFAULT 'single' NOT NULL,
	"opening_time" timestamp NOT NULL,
	"closing_time" timestamp NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"category_code" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"display_name" varchar(256) NOT NULL,
	"email" varchar(256) NOT NULL,
	"photo_url" text,
	"roles" "roles" DEFAULT 'user' NOT NULL,
	"total_polls_submitted" integer DEFAULT 0 NOT NULL,
	"active_config" varchar(256),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "polls_options" ADD CONSTRAINT "polls_options_poll_id_polls_id_fk" FOREIGN KEY ("poll_id") REFERENCES "public"."polls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "polls_response_options" ADD CONSTRAINT "polls_response_options_response_id_polls_responses_response_id_fk" FOREIGN KEY ("response_id") REFERENCES "public"."polls_responses"("response_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "polls_response_options" ADD CONSTRAINT "polls_response_options_option_id_polls_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."polls_options"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "polls_responses" ADD CONSTRAINT "polls_responses_poll_id_polls_id_fk" FOREIGN KEY ("poll_id") REFERENCES "public"."polls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "polls_responses" ADD CONSTRAINT "polls_responses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "polls_user_performance" ADD CONSTRAINT "polls_user_performance_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "polls_user_performance" ADD CONSTRAINT "polls_user_performance_category_code_polls_categories_code_fk" FOREIGN KEY ("category_code") REFERENCES "public"."polls_categories"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "polls" ADD CONSTRAINT "polls_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "polls" ADD CONSTRAINT "polls_category_code_polls_categories_code_fk" FOREIGN KEY ("category_code") REFERENCES "public"."polls_categories"("code") ON DELETE no action ON UPDATE no action;