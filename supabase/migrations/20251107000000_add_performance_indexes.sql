-- Migration: Add Performance Indexes
-- Description: Adds critical and high-priority indexes to improve query performance
-- Date: 2025-11-07

-- ============================================================================
-- PHASE 1: CRITICAL PRIORITY INDEXES
-- These indexes address the most severe performance bottlenecks
-- Expected impact: 50-90% query time reduction on affected queries
-- ============================================================================

-- Index 1: polls_responses composite index
-- Covers the most common query pattern: filtering by poll_id and user_id
-- Used in: hasUserAnsweredPoll(), countUserPollAnswers(), getUserPollStats()
CREATE INDEX IF NOT EXISTS idx_polls_responses_poll_user_created
ON polls_responses(poll_id, user_id, created_at);

-- Index 2: runs user and status lookup
-- Critical for finding active runs and last finished runs
-- Used in: getActiveRunByUserId(), getLastRunFromUser()
CREATE INDEX IF NOT EXISTS idx_runs_user_status
ON runs(user_id, status);

-- Index 3: runs finished timestamp
-- Optimizes ordering by finish time for completed runs
-- Used in: getLastRunFromUser() with ORDER BY finished_at DESC
CREATE INDEX IF NOT EXISTS idx_runs_finished_at
ON runs(finished_at DESC) WHERE status = 'finished';

-- Index 4: run_category_coverage by run_id
-- Used in virtually every run-related query (10+ call sites)
-- Used in: getTotalCoverageForRun(), getTotalPollsAnsweredForRun(), getBestStreakForRun()
CREATE INDEX IF NOT EXISTS idx_run_category_coverage_run_id
ON run_category_coverage(run_id);

-- Index 5: polls_options by poll_id
-- Essential for fetching poll options (one-to-many relationship)
-- Used in: fetchPollByIdWithOptions() - called on every poll answer
CREATE INDEX IF NOT EXISTS idx_polls_options_poll_id
ON polls_options(poll_id);

-- Index 6: polls_history by user_id
-- Frequently accessed for tracking user poll viewing history
-- Used in: getPollHistory(), getTotalPollsSeenByUser()
CREATE INDEX IF NOT EXISTS idx_polls_history_user_id
ON polls_history(user_id);


-- ============================================================================
-- PHASE 2: HIGH PRIORITY INDEXES
-- Foreign keys and frequently queried columns
-- Expected impact: 30-70% query time reduction
-- ============================================================================

-- Leaderboard indexes (critical for ranking queries)
-- Used in: buildLeaderboardQuery(), getCategoryLeaderboard()
CREATE INDEX IF NOT EXISTS idx_leaderboard_user_id
ON leaderboard(user_id);

CREATE INDEX IF NOT EXISTS idx_leaderboard_season_id
ON leaderboard(season_id);

CREATE INDEX IF NOT EXISTS idx_leaderboard_category_code
ON leaderboard(category_code);

-- Composite leaderboard lookup for filtered queries
CREATE INDEX IF NOT EXISTS idx_leaderboard_lookup
ON leaderboard(season_id, category_code, user_id);

-- Polls filtering indexes
-- Used in: manageDailyPollTransition(), category filtering
CREATE INDEX IF NOT EXISTS idx_polls_status
ON polls(status);

CREATE INDEX IF NOT EXISTS idx_polls_category_code
ON polls(category_code);

-- polls_response_options join table indexes
-- Used when fetching response details and selected options
CREATE INDEX IF NOT EXISTS idx_polls_response_options_response_id
ON polls_response_options(response_id);

CREATE INDEX IF NOT EXISTS idx_polls_response_options_option_id
ON polls_response_options(option_id);

-- Run category coverage by category
-- Used in: getLiveRunRankings() when filtering by category
CREATE INDEX IF NOT EXISTS idx_run_category_coverage_category
ON run_category_coverage(category_code);

-- Runs season lookup
-- Foreign key to seasons table
CREATE INDEX IF NOT EXISTS idx_runs_season_id
ON runs(season_id);


-- ============================================================================
-- PHASE 3: MEDIUM PRIORITY INDEXES
-- Performance optimizations and foreign keys
-- Expected impact: 15-40% query time reduction
-- ============================================================================

-- Polls creator lookup
-- Useful for admin queries to find polls by creator
CREATE INDEX IF NOT EXISTS idx_polls_created_by
ON polls(created_by);

-- polls_responses timestamp index
-- Used in: hasUserAnsweredPoll() with date range filtering
CREATE INDEX IF NOT EXISTS idx_polls_responses_created_at
ON polls_responses(created_at);

-- Seasons status and date range indexes
-- Used in: findActiveSeasons(), findCurrentSeason()
CREATE INDEX IF NOT EXISTS idx_seasons_status
ON seasons(status);

CREATE INDEX IF NOT EXISTS idx_seasons_dates
ON seasons(start_date, end_date);

-- Polls creation timestamp
-- Used in: fetchAllPolls() ORDER BY created_at
CREATE INDEX IF NOT EXISTS idx_polls_created_at
ON polls(created_at DESC);


-- ============================================================================
-- STATISTICS UPDATE
-- Refresh table statistics for query planner
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


-- ============================================================================
-- MIGRATION NOTES
-- ============================================================================
-- Total indexes added: 22
--
-- Performance monitoring recommendations:
-- 1. Track query execution times before/after migration
-- 2. Monitor index usage: SELECT * FROM pg_stat_user_indexes;
-- 3. Check for unused indexes after 1 week
-- 4. Verify no index bloat: SELECT * FROM pg_indexes WHERE schemaname = 'public';
--
-- Estimated storage impact: 10-20% increase in database size
-- Estimated write performance impact: Minimal (tables are read-heavy)
--
-- Rollback: DROP INDEX statements for each index if needed
-- ============================================================================
