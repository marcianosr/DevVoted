ALTER TABLE "runs" ADD COLUMN "looted_by_user_id" uuid;--> statement-breakpoint
ALTER TABLE "runs" ADD COLUMN "looted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "runs" ADD COLUMN "loot_amount" integer;--> statement-breakpoint
ALTER TABLE "runs" ADD CONSTRAINT "runs_looted_by_user_id_users_id_fk" FOREIGN KEY ("looted_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;