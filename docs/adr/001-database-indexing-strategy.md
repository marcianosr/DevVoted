# ADR-001: Database indexing strategy

## Status

Accepted — 2025-11-07. Implemented in
`supabase/migrations/20251107000000_add_performance_indexes.sql` (source of truth
for the full index list).

## Context

Analysis found 26 missing indexes on foreign keys and frequently filtered columns,
causing full table scans on nearly every JOIN — `hasUserAnsweredPoll()`,
`getActiveRunByUserId()`, coverage lookups, and all leaderboard queries.

## Decision

Add 22 indexes via a hand-written SQL migration, selected by these criteria:

1. **Foreign keys first** — every FK column indexed for JOIN performance.
2. **WHERE-clause columns** — frequent filters (`status`, `category_code`, …).
3. **Composite indexes** for common multi-column patterns, most selective column
   first — `(poll_id, user_id, created_at)` serves `poll_id`-only,
   `poll_id + user_id`, and full-triple filters, but not `user_id`-only.
4. **Partial indexes** where a low-cardinality column is filtered on one value
   (`WHERE status = 'finished'`) — smaller, faster, cheaper to maintain.

Deliberately not indexed: very-low-cardinality columns, tables under ~1000 rows,
and columns never filtered independently.

## Alternatives considered

- **Drizzle schema-defined indexes** — rejected: raw SQL gives partial/`DESC`
  control, one reviewable migration file, easier rollback.
- **Materialized views for leaderboards** — rejected: adds refresh complexity;
  indexes make current queries fast enough; revisit under real load.
- **Read replicas** — rejected: premature at current scale; indexes fix the root
  cause (full scans), replicas would only spread it.

## Consequences

- **Positive**: critical-path queries go from full scans to index scans; lower
  database CPU.
- **Negative**: ~10–20% more storage and marginally slower writes — acceptable
  for a read-heavy app.
- **Maintenance**: periodically check `pg_stat_user_indexes` for `idx_scan = 0`
  and drop indexes that never get used.
