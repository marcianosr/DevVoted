-- ADR-046 (reveal amendment): a storage plan rung opens once a run has filled
-- the cap below it, so the account has to remember the best KB it ever held.
-- In KB, unlike archived_storage next to it, which is in bytes.
ALTER TABLE users
	ADD COLUMN IF NOT EXISTS peak_storage_kb integer NOT NULL DEFAULT 0;
