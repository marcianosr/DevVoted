-- Slot-unlock swatches (gen-1 gym badges) earned across every run. Permanent
-- and account-wide, mirroring owned_border_ids: unlocking slot 4 in any run
-- earns the Boulder Swatch forever, and re-unlocking it later is a no-op.
ALTER TABLE users
	ADD COLUMN IF NOT EXISTS owned_swatch_ids text[] NOT NULL DEFAULT '{}'::text[];
