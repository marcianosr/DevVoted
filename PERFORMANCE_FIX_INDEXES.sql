-- DevVoted - Critical Performance Indexes
-- This migration adds missing indexes that are causing production slowness
--
-- SAFETY: Use CREATE INDEX CONCURRENTLY to avoid locking tables during creation
-- This is especially important for production deployments
--
-- Estimated time: 1-5 minutes depending on table sizes
-- Expected improvement: 10-100x faster queries

-- ============================================================================
-- CRITICAL INDEXES (DO THESE FIRST)
-- ============================================================================

-- Index for getActiveRunByUserId() - Most frequently called query
-- Used: Every page load, every 30 seconds auto-refresh, after every poll submission
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_runs_user_status
ON runs(user_id, status);

-- Index for run category coverage lookups - N+1 query pattern fix
-- Used: Every time we fetch active run (joins coverage records)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_run_category_coverage_run
ON run_category_coverage(run_id);

-- Composite index for category-specific coverage queries
-- Used: When querying specific category progress within a run
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_run_category_coverage_composite
ON run_category_coverage(run_id, category_code);

-- Index for poll history tracking (view/answer tracking)
-- Used: Every time user views a poll (trackPollView operation)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_polls_history_user_poll
ON polls_history(user_id, poll_id);

-- ============================================================================
-- LEADERBOARD INDEXES (HIGH IMPACT)
-- ============================================================================

-- Index for leaderboard queries by season and category with coverage ordering
-- Used: Leaderboard auto-refresh every 45 seconds, all leaderboard displays
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leaderboard_season_category_coverage
ON leaderboard(season_id, category_code, total_coverage DESC);

-- Index for user-specific leaderboard lookups
-- Used: Finding user's position in leaderboards
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leaderboard_user_season
ON leaderboard(user_id, season_id);

-- Index for category-specific leaderboard ordering
-- Used: Category leaderboard displays
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leaderboard_category_coverage
ON leaderboard(category_code, category_coverage DESC);

-- ============================================================================
-- POLL & RESPONSE INDEXES (MODERATE IMPACT)
-- ============================================================================

-- Index for checking if user has answered a poll
-- Used: hasUserAnsweredPoll() checks before showing poll
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_polls_responses_user_poll
ON polls_responses(user_id, poll_id);

-- Index for poll responses by user with date ordering
-- Used: User history, recent answers, analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_polls_responses_user_created
ON polls_responses(user_id, created_at DESC);

-- Index for poll options lookup by poll_id
-- Used: Every time we fetch poll with options (currently 2 queries, will be 1 with JOIN)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_polls_options_poll
ON polls_options(poll_id);

-- ============================================================================
-- SEASON & RUN INDEXES (MODERATE IMPACT)
-- ============================================================================

-- Index for season-based run queries
-- Used: Season leaderboards, season statistics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_runs_season_status
ON runs(season_id, status);

-- Index for run completion queries
-- Used: Getting user's last finished run
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_runs_user_finished
ON runs(user_id, status, finished_at DESC)
WHERE status = 'finished';

-- ============================================================================
-- CATEGORY & POLL INDEXES (LOW IMPACT BUT CHEAP)
-- ============================================================================

-- Index for polls by category
-- Used: Fetching polls for specific categories
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_polls_category
ON polls(category_code);

-- Index for polls by status and opening time
-- Used: Finding open/active polls
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_polls_status_opening
ON polls(status, opening_time DESC);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- After running this migration, verify indexes are being used:
--
-- EXPLAIN ANALYZE
-- SELECT * FROM runs
-- WHERE user_id = '<some-uuid>' AND status = 'active'
-- LIMIT 1;
--
-- Should show: "Index Scan using idx_runs_user_status"
--
-- EXPLAIN ANALYZE
-- SELECT * FROM leaderboard
-- WHERE season_id = 1 AND category_code = 'react'
-- ORDER BY total_coverage DESC
-- LIMIT 25;
--
-- Should show: "Index Scan using idx_leaderboard_season_category_coverage"

-- ============================================================================
-- ROLLBACK (IF NEEDED)
-- ============================================================================

-- If you need to remove these indexes (not recommended), use:
-- DROP INDEX CONCURRENTLY IF EXISTS idx_runs_user_status;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_run_category_coverage_run;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_run_category_coverage_composite;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_polls_history_user_poll;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_leaderboard_season_category_coverage;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_leaderboard_user_season;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_leaderboard_category_coverage;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_polls_responses_user_poll;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_polls_responses_user_created;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_polls_options_poll;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_runs_season_status;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_runs_user_finished;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_polls_category;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_polls_status_opening;

-- ============================================================================
-- MONITORING
-- ============================================================================

-- Check index sizes:
-- SELECT
--   schemaname,
--   tablename,
--   indexname,
--   pg_size_pretty(pg_relation_size(indexrelid)) as size
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public'
-- ORDER BY pg_relation_size(indexrelid) DESC;

-- Check index usage:
-- SELECT
--   schemaname,
--   tablename,
--   indexname,
--   idx_scan as scans,
--   idx_tup_read as tuples_read,
--   idx_tup_fetch as tuples_fetched
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public'
-- ORDER BY idx_scan DESC;
