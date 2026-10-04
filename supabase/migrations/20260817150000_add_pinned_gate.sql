-- The git tag (ADR-036): a shop-bought cross-run checkpoint. Planting it
-- writes the gate number here; starting the next run consumes it (burn on
-- use), so NULL means no tag is planted.
ALTER TABLE users
	ADD COLUMN IF NOT EXISTS pinned_gate integer;
