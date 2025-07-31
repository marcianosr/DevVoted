# DevVoted Optimization Analysis

This document outlines potential optimizations identified in the DevVoted codebase, organized by priority and impact.

## 🚨 High Priority Optimizations

### 1. Database Query Optimization

#### N+1 Query Issues

**Location:** `src/domains/polls/api/queries.ts:107-119`

Current implementation makes separate queries for polls and options:
```typescript
export const fetchPollByIdWithOptions = async (id: string) => {
  const poll = await fetchPollById(id);
  const pollOptions = await db
    .select()
    .from(pollOptionsTable)
    .where(eq(pollOptionsTable.poll_id, id));
  
  return { poll, pollOptions };
};
```

**Impact:** Each poll fetch results in 2 database round trips.

**Solution:** Use LEFT JOIN to fetch in a single query:
```typescript
const result = await db
  .select({
    poll: pollsTable,
    option: pollOptionsTable
  })
  .from(pollsTable)
  .leftJoin(pollOptionsTable, eq(pollsTable.id, pollOptionsTable.poll_id))
  .where(eq(pollsTable.id, id));
```

#### Multiple Sequential Queries in Run Operations

**Location:** `src/domains/runs/api/queries.ts`

Similar pattern in `getActiveRunByUserId` and `getRunWithCategoryXp` where run and XP records are fetched separately.

**Impact:** Doubles database latency for critical user operations.

### 2. Missing Database Indexes

Based on query patterns, these columns need indexes:

| Table | Column(s) | Usage Pattern |
|-------|-----------|--------------|
| `polls` | `status` | Filtered in daily poll queries |
| `polls_responses` | `user_id, poll_id` | Compound index for uniqueness checks |
| `runs` | `user_id, status` | Compound index for active run queries |
| `run_category_xp` | `run_id` | Foreign key lookups |

**Impact:** Query performance will degrade significantly as data grows.

### 3. React Component Re-rendering

**Critical Finding:** Zero usage of React optimization hooks across the codebase.

#### Components Needing Optimization:

1. **PollPageContainer** (`src/routes/_authed/polls.$id/PollPageContainer.tsx`)
   - 330 lines with multiple state updates
   - Re-renders entire tree on any state change
   
2. **ShopContext** (`src/components/Shop/ShopContext.tsx`)
   - Context value object recreated on every render
   - Causes all consumers to re-render

3. **Option Component** (`src/domains/polls/components/Option.tsx`)
   - Rendered in lists without key optimization
   - No memoization for expensive renders

**Example Fix:**
```typescript
// ShopContext optimization
const value = useMemo(() => ({
  isShopOpen,
  openShop,
  closeShop,
  addConfigToRun,
  removeConfigFromRun,
}), [isShopOpen, onAddConfig, onRemoveConfig]);

// Option component optimization
export const Option = React.memo(({ option, ... }) => {
  // component logic
});
```

## 🟡 Medium Priority Optimizations

### 4. Bundle Size & Code Splitting

**Current State:**
- No code splitting implemented
- All routes loaded upfront
- Large dependencies imported entirely

**Opportunities:**
1. Implement route-based code splitting:
   ```typescript
   const Shop = lazy(() => import('./components/Shop'));
   ```

2. Tree-shake large dependencies:
   ```typescript
   // Instead of: import { format } from 'date-fns';
   import format from 'date-fns/format';
   ```

3. Split vendor chunks in Vite config

**Impact:** Initial load time could be reduced by 40-60%.

### 5. API Endpoint Efficiency

**Issue:** Multiple query invalidations causing redundant fetches.

**Location:** `src/routes/_authed/polls.$id/PollPageContainer.tsx:245-250`

**Solution:** Implement optimistic updates:
```typescript
// Instead of invalidating
queryClient.setQueryData(['activeRun', user?.id], (old) => {
  // Update data optimistically
});
```

### 6. Code Duplication

**Duplicate Patterns Found:**

1. **Factory Pattern** - Repeated in 4+ domains
2. **Error Handling** - Same pattern in all handlers
3. **Test Setup** - Mock configuration repeated

**Solution:** Create shared utilities:
```typescript
// src/utils/factory.ts
export const createFactory = <TDB, TDTO>(
  toDTO: (record: TDB) => TDTO
) => ({
  toDTO,
  toDTOs: (records: TDB[]) => TDTO[],
  fromDTO: (dto: TDTO) => TDB,
  fromDTOs: (dtos: TDTO[]) => TDB[]
});

// src/utils/api.ts
export const handleApiError = (error: unknown) => {
  const message = error instanceof Error 
    ? error.message 
    : "Something went wrong";
  return { success: false, error: message };
};
```

## 🟢 Lower Priority Optimizations

### 7. Testing Improvements

**Issues:**
- Verbose mock setup
- No test utilities
- Complex database mocks

**Recommendations:**
1. Create test factories for consistent mock data
2. Implement custom render with providers
3. Create database mock utilities

### 8. Performance Bottlenecks

**Critical Path: Poll Submission Flow**

Current flow involves 6+ sequential operations:
1. Check if user already answered
2. Fetch poll details
3. Create response record
4. Calculate XP changes
5. Check category threshold
6. Potentially end run

**Optimization:** Consider queuing XP calculations or batch processing.

### 9. State Management

**Issue:** Props drilling in PollPageContainer passing `user` and `activeRun` through 3+ levels.

**Solution:** Consider Zustand or Context for cross-cutting concerns.

## 📊 Performance Impact Summary

| Optimization | Effort | Impact | Priority |
|--------------|--------|--------|----------|
| Database Indexes | Low | High | Immediate |
| React Memoization | Medium | High | High |
| Query Optimization | Medium | High | High |
| Code Splitting | Medium | Medium | Medium |
| Bundle Optimization | Low | Medium | Medium |
| Code Deduplication | High | Low | Low |

## 🚀 Quick Wins

1. Add database indexes (1 hour effort, massive impact)
2. Memoize ShopContext value (15 minutes, prevents cascading renders)
3. Add React.memo to list components (30 minutes, reduces re-renders)
4. Import specific date-fns functions (15 minutes, reduces bundle)

## 📈 Metrics to Track

After implementing optimizations, monitor:
- Database query execution time
- React DevTools Profiler flame graphs
- Bundle size via `npm run build`
- Lighthouse performance scores
- Time to Interactive (TTI)

## 🔄 Next Steps

1. Start with database indexes (immediate impact)
2. Add React optimization hooks to hot paths
3. Implement query consolidation for N+1 issues
4. Set up performance monitoring
5. Create ADR for major architectural decisions