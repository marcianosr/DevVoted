-- Migration: Rename XP columns to coverage columns
-- Refactors the scoring system from XP to coverage-based (1% per correct poll)

-- Rename columns in run_category_xp table
ALTER TABLE "run_category_xp" RENAME COLUMN "current_xp" TO "current_coverage";
ALTER TABLE "run_category_xp" RENAME COLUMN "final_xp" TO "final_coverage";

-- Rename columns in leaderboard table
ALTER TABLE "leaderboard" RENAME COLUMN "category_xp" TO "category_coverage";
ALTER TABLE "leaderboard" RENAME COLUMN "total_xp" TO "total_coverage";
