-- Every answer explains itself (DVTD-jupt, ADR-195).
--   - polls_options.explanation: why this option is right or wrong, written by the
--     poll's author and shown under the option on the gate review and the poll page.
--     Nullable: an option without a reason draws nothing.
-- Wrapped in a guard so this is safe to run before the Drizzle schema exists.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'polls_options'
  ) THEN
    RAISE NOTICE 'Base schema not yet initialised — skipping polls_options_explanation migration';
    RETURN;
  END IF;

  ALTER TABLE "polls_options" ADD COLUMN IF NOT EXISTS "explanation" text;
END
$$;
