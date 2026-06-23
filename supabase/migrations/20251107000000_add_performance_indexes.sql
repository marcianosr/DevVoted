-- Migration: Add Performance Indexes
-- Description: Adds critical and high-priority indexes to improve query performance
-- Date: 2025-11-07
--
-- Wrapped in a DO block so this is safe to run before the Drizzle schema
-- is initialised (e.g. on a fresh local Supabase start). Indexes are
-- created only when the base tables already exist.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'polls'
  ) THEN
    RAISE NOTICE 'Base schema not yet initialised — skipping performance indexes migration';
    RETURN;
  END IF;

  -- ============================================================================
  -- PHASE 1: CRITICAL PRIORITY INDEXES
  -- ============================================================================

  CREATE INDEX IF NOT EXISTS idx_polls_responses_poll_user_created
    ON polls_responses(poll_id, user_id, created_at);

  CREATE INDEX IF NOT EXISTS idx_runs_user_status
    ON runs(user_id, status);

  CREATE INDEX IF NOT EXISTS idx_runs_finished_at
    ON runs(finished_at DESC) WHERE status = 'finished';

  CREATE INDEX IF NOT EXISTS idx_run_category_coverage_run_id
    ON run_category_coverage(run_id);

  CREATE INDEX IF NOT EXISTS idx_polls_options_poll_id
    ON polls_options(poll_id);

  CREATE INDEX IF NOT EXISTS idx_polls_history_user_id
    ON polls_history(user_id);

  -- ============================================================================
  -- PHASE 2: HIGH PRIORITY INDEXES
  -- ============================================================================

  CREATE INDEX IF NOT EXISTS idx_leaderboard_user_id
    ON leaderboard(user_id);

  CREATE INDEX IF NOT EXISTS idx_leaderboard_season_id
    ON leaderboard(season_id);

  CREATE INDEX IF NOT EXISTS idx_leaderboard_category_code
    ON leaderboard(category_code);

  CREATE INDEX IF NOT EXISTS idx_leaderboard_lookup
    ON leaderboard(season_id, category_code, user_id);

  CREATE INDEX IF NOT EXISTS idx_polls_status
    ON polls(status);

  CREATE INDEX IF NOT EXISTS idx_polls_category_code
    ON polls(category_code);

  CREATE INDEX IF NOT EXISTS idx_polls_response_options_response_id
    ON polls_response_options(response_id);

  CREATE INDEX IF NOT EXISTS idx_polls_response_options_option_id
    ON polls_response_options(option_id);

  CREATE INDEX IF NOT EXISTS idx_run_category_coverage_category
    ON run_category_coverage(category_code);

  CREATE INDEX IF NOT EXISTS idx_runs_season_id
    ON runs(season_id);

  -- ============================================================================
  -- PHASE 3: MEDIUM PRIORITY INDEXES
  -- ============================================================================

  CREATE INDEX IF NOT EXISTS idx_polls_created_by
    ON polls(created_by);

  CREATE INDEX IF NOT EXISTS idx_polls_responses_created_at
    ON polls_responses(created_at);

  CREATE INDEX IF NOT EXISTS idx_seasons_status
    ON seasons(status);

  CREATE INDEX IF NOT EXISTS idx_seasons_dates
    ON seasons(start_date, end_date);

  CREATE INDEX IF NOT EXISTS idx_polls_created_at
    ON polls(created_at DESC);

  -- ============================================================================
  -- STATISTICS UPDATE
  -- ============================================================================

  ANALYZE polls;
  ANALYZE polls_options;
  ANALYZE polls_responses;
  ANALYZE polls_response_options;
  ANALYZE polls_history;
  ANALYZE runs;
  ANALYZE run_category_coverage;
  ANALYZE leaderboard;
  ANALYZE seasons;

END $$;
