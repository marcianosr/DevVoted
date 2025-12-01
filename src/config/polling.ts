/**
 * Centralized polling interval configuration for TanStack Query
 *
 * These intervals control how frequently data is automatically refetched
 * in the background when components are mounted.
 */

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
