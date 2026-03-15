ALTER TABLE "runs" ADD COLUMN "gate_path" json DEFAULT '[200]'::json NOT NULL;
ALTER TABLE "runs" DROP COLUMN IF EXISTS "challenge_mode_id";