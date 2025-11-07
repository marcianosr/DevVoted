# ADR 001: Database Indexing Strategy

**Date:** 2025-11-07
**Status:** Accepted
**Context:** Performance optimization for database queries

## Problem

The application was experiencing performance issues due to missing database indexes. Analysis revealed:

- **26 missing indexes** on foreign keys and frequently queried columns
- Full table scans on virtually every query involving foreign key relationships
- No indexes on common filtering columns (status, user_id, poll_id, etc.)
- N+1 query patterns in some areas

Critical queries affected:
- `hasUserAnsweredPoll()` - filtering by poll_id and user_id
- `getActiveRunByUserId()` - filtering by user_id and status
- `getTotalCoverageForRun()` - JOIN on run_id
- All leaderboard queries - GROUP BY and filtering

## Decision

Implemented a comprehensive indexing strategy with 22 indexes across 3 priority levels:

### Critical Priority (5 indexes)
- `idx_polls_responses_poll_user_created` - Composite index on (poll_id, user_id, created_at)
- `idx_runs_user_status` - Composite index on (user_id, status)
- `idx_runs_finished_at` - Partial index WHERE status = 'finished'
- `idx_run_category_coverage_run_id` - Foreign key index
- `idx_polls_options_poll_id` - Foreign key index
- `idx_polls_history_user_id` - Foreign key index

### High Priority (10 indexes)
- Leaderboard indexes: user_id, season_id, category_code, composite lookup
- Poll filtering: status, category_code
- Response options: response_id, option_id
- Run category coverage: category_code
- Runs: season_id

### Medium Priority (6 indexes)
- Poll metadata: created_by, created_at
- Response timestamps: created_at
- Season filtering: status, date ranges

## Rationale

### Index Selection Criteria
1. **Foreign keys first** - All foreign key columns indexed for JOIN performance
2. **WHERE clause columns** - Columns frequently used in filtering
3. **Composite indexes** - Multi-column indexes for common query patterns
4. **Partial indexes** - For selective filtering (e.g., only finished runs)

### Composite Index Design

Composite indexes follow the principle of **selectivity ordering**:
```sql
-- Most selective column first
CREATE INDEX idx_polls_responses_poll_user_created
ON polls_responses(poll_id, user_id, created_at);
```

This allows PostgreSQL to use the index for queries that filter on:
- Just `poll_id`
- `poll_id` and `user_id`
- `poll_id`, `user_id`, and `created_at`

But NOT for queries that only filter on `user_id` or `created_at`.

### Partial Index Strategy

For columns with low cardinality where we frequently filter on specific values:
```sql
-- Only index finished runs (99%+ of all runs)
CREATE INDEX idx_runs_finished_at
ON runs(finished_at DESC) WHERE status = 'finished';
```

Benefits:
- Smaller index size (only indexes relevant rows)
- Faster index scans
- Lower maintenance cost

### Why Not More Indexes?

We deliberately excluded some potential indexes:
- Columns with very low cardinality (few distinct values)
- Tables with small row counts (< 1000 rows)
- Columns that are never queried independently

## Expected Impact

| Priority | Expected Improvement | Queries Affected |
|----------|---------------------|------------------|
| Critical | 50-90% reduction | hasUserAnsweredPoll, getActiveRunByUserId, all run queries |
| High | 30-70% reduction | All leaderboard queries, poll filtering |
| Medium | 15-40% reduction | Admin queries, time-based queries |

### Storage Impact
- Each index: ~8KB (empty tables)
- Estimated production size: ~50-100MB total
- Estimated storage increase: 10-20% of database size
- Trade-off: Acceptable for 50-90% query performance improvement

## Implementation

Migration file: `supabase/migrations/20251107000000_add_performance_indexes.sql`

Applied in production via:
```bash
# Local testing
npm run db:push
psql $DATABASE_URL -f supabase/migrations/20251107000000_add_performance_indexes.sql

# Production deployment
git push origin main  # Triggers GitHub Actions → supabase db push
```

## Monitoring Plan

Post-deployment monitoring checklist:

1. **Query Performance**
   ```sql
   -- Check slow queries
   SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;
   ```

2. **Index Usage**
   ```sql
   -- Verify indexes are being used
   SELECT * FROM pg_stat_user_indexes WHERE schemaname = 'public';
   ```

3. **Index Efficiency**
   ```sql
   -- Check for unused indexes (after 1 week)
   SELECT schemaname, relname, indexrelname, idx_scan
   FROM pg_stat_user_indexes
   WHERE idx_scan = 0 AND indexrelname LIKE 'idx_%';
   ```

4. **Index Bloat**
   ```sql
   -- Check for bloated indexes (after 1 month)
   SELECT * FROM pg_indexes WHERE schemaname = 'public';
   ```

## Alternatives Considered

### Alternative 1: Drizzle ORM Auto-Generated Indexes
Drizzle can generate indexes via schema definitions:
```typescript
export const pollsResponses = pgTable('polls_responses', {
  // ...
}, (table) => ({
  pollUserIdx: index('idx_poll_user').on(table.poll_id, table.user_id)
}));
```

**Rejected because:**
- SQL migration gives more control over index types (partial, DESC, etc.)
- Easier to review and understand in a single migration file
- Better documentation of intent through comments
- Easier rollback strategy

### Alternative 2: Materialized Views
Create materialized views for complex aggregations like leaderboards.

**Rejected because:**
- Adds complexity to refresh strategy
- Current query patterns are fast enough with indexes
- Real-time leaderboard updates preferred over eventual consistency
- Can revisit if needed after measuring actual load

### Alternative 3: Read Replicas
Scale reads horizontally with database replicas.

**Rejected because:**
- Premature optimization - current scale doesn't justify cost
- Indexes solve the root problem (full table scans)
- Can add replicas later if needed

## Consequences

### Positive
- 50-90% faster queries on critical paths
- Better user experience (faster page loads)
- Lower database CPU usage
- More scalable architecture

### Negative
- ~10-20% increase in database storage
- Slightly slower write operations (negligible for read-heavy app)
- Additional indexes to maintain
- Risk of over-indexing (mitigated by monitoring plan)

### Risks & Mitigation
- **Risk:** Unused indexes waste storage
  - **Mitigation:** Monitor index usage, remove unused indexes after 1 week
- **Risk:** Index bloat over time
  - **Mitigation:** Regular VACUUM and REINDEX operations
- **Risk:** Wrong index type for query pattern
  - **Mitigation:** Monitor query plans, adjust indexes as needed

## Future Considerations

1. **After 1 week:** Review `pg_stat_user_indexes` and remove unused indexes
2. **After 1 month:** Analyze query patterns and add/remove indexes as needed
3. **Consider:** Materialized views for heavy aggregation queries if needed
4. **Consider:** Partitioning large tables (polls_history, polls_responses) if they exceed 1M rows

## References

- PostgreSQL Index Documentation: https://www.postgresql.org/docs/current/indexes.html
- Index Analysis Query: `docs/optimization-analysis.md`
- Database Schema: `src/database/schema.ts`
- Migration File: `supabase/migrations/20251107000000_add_performance_indexes.sql`
