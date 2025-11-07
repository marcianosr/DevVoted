/**
 * Centralized polling interval configuration for TanStack Query
 *
 * These intervals control how frequently data is automatically refetched
 * in the background when components are mounted.
 */

/**
 * Leaderboard refresh interval (3 minutes)
 *
 * Used by:
 * - Live leaderboard rankings (active runs)
 * - Category-specific leaderboards
 *
 * Rationale: Leaderboard queries are expensive (multi-table joins with aggregation).
 * A 3-minute interval reduces database load by 75% compared to 45s while still
 * providing reasonably fresh competitive rankings.
 */
export const LEADERBOARD_REFRESH_INTERVAL = 3 * 60 * 1000;

/**
 * Category coverage refresh interval (30 seconds)
 *
 * Used by:
 * - Active run progress tracking
 * - Real-time category coverage updates
 *
 * Rationale: Coverage data changes frequently during active gameplay and is
 * less expensive to query (single user, indexed lookups).
 */
export const CATEGORY_COVERAGE_REFRESH_INTERVAL = 30 * 1000;
