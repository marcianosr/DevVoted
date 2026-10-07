-- polls.updated_at means "content edited" (DVTD-i16m).
--   Marking a poll reviewed used to bump updated_at through Drizzle's $onUpdate,
--   so every reviewed poll would read as "changed since review".
--   A review stamped within a second of the update was that write, not an edit:
--   pull updated_at back to the review.
-- Wrapped in a guard so this is safe to run before the Drizzle schema exists.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'polls' AND column_name = 'reviewed_at'
  ) THEN
    RAISE NOTICE 'polls.reviewed_at not yet present — skipping polls_updated_at_ignores_review migration';
    RETURN;
  END IF;

  UPDATE "polls"
  SET "updated_at" = "reviewed_at"
  WHERE "reviewed_at" IS NOT NULL
    AND "updated_at" >= "reviewed_at"
    AND "updated_at" - "reviewed_at" < interval '1 second';
END
$$;
