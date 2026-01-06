-- Add victory_achieved_at column to runs table for post-victory mode
ALTER TABLE "runs" ADD COLUMN "victory_achieved_at" timestamp with time zone;
