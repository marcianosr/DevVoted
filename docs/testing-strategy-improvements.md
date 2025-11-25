# Testing Strategy Improvements

## Current Problems

### ❌ Over-Mocking in Query Layer Tests

**Files to fix:**
- `src/domains/polls/api/queries.spec.ts`
- `src/domains/runs/api/queries.spec.ts`

**Issue:** These tests mock the entire Drizzle query builder chain, testing implementation details instead of behavior.

**Impact:**
- Tests are brittle (break when implementation changes)
- Don't catch real SQL bugs (wrong column names, bad JOINs, incorrect WHERE clauses)
- Low confidence in query correctness
- High maintenance burden (40+ lines of mock setup per file)

---

## ✅ Recommended Testing Strategy

### Layer 1: Database Queries → Integration Tests

**Replace:** Mock-heavy unit tests
**With:** Integration tests using in-memory SQLite

```typescript
// ✅ queries.integration.spec.ts
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";

const sqlite = new Database(":memory:");
const testDb = drizzle(sqlite);

it("fetches poll with options correctly", async () => {
  // Insert real test data
  await testDb.insert(polls).values({...});
  await testDb.insert(pollsOptions).values([...]);

  // Test actual query behavior
  const result = await fetchPollByIdWithOptions(1);

  // Verify real data relationships
  expect(result.poll.question).toBe("...");
  expect(result.options).toHaveLength(3);
});
```

**Benefits:**
- Catches real SQL bugs
- Tests actual database relationships
- Validates date filtering, transactions, etc.
- Still fast (in-memory)
- High confidence

---

### Layer 2: Handlers/Services → Keep Current Approach ✅

**Current approach is GOOD - no changes needed**

```typescript
// ✅ handlers.spec.ts (already correct)
vi.mock("~/domains/polls/api/queries");

it("returns error when poll not found", async () => {
  vi.mocked(queries.fetchPollById).mockResolvedValue(null);

  const result = await getPollByIdHandler({ data: { id: 999 } });

  expect(result).toEqual({
    success: false,
    error: "Poll not found",
  });
});
```

**Keep testing:**
- Error handling
- Response structure transformation
- Business logic orchestration
- Authorization checks

---

### Layer 3: Components → Keep Current Approach ✅

**Current approach is EXCELLENT - no changes needed**

```typescript
// ✅ Option.spec.tsx (already excellent)
it("renders the option text correctly", () => {
  const mockOption = createPollOption({ option: "JavaScript" });

  render(<Option option={mockOption} type="radio" field={mockField} checked={false} />);

  expect(screen.getByText("JavaScript")).toBeInTheDocument();
});
```

**Keep:**
- Factory-based test data
- Minimal mocking (only event handlers)
- Testing user-visible behavior

---

### Layer 4: Pure Functions → Keep Current Approach ✅

**Current approach is PERFECT - no changes needed**

```typescript
// ✅ storage.spec.ts (already perfect)
it("formats bytes correctly", () => {
  expect(formatStorage(0)).toBe("0 B");
  expect(formatStorage(1024)).toBe("1 KB");
});
```

---

## Implementation Plan

### Phase 1: Add Integration Tests for Queries
1. Install `better-sqlite3` and `@types/better-sqlite3`
2. Create `queries.integration.spec.ts` files for both `polls` and `runs` domains
3. Test critical paths: CRUD operations, date filtering, transactions, relationships

### Phase 2: Remove or Reduce Query Unit Tests
- **Option A (Recommended):** Delete `queries.spec.ts` files entirely, rely on integration tests
- **Option B:** Keep only tests for edge cases not covered by integration tests

### Phase 3: Keep Everything Else
- Handler tests ✅
- Service tests ✅
- Component tests ✅
- Pure function tests ✅

---

## Testing Pyramid for DevVoted

```
         /\
        /  \  E2E Tests (few, critical paths only)
       /----\
      /      \  Integration Tests (queries, complex services)
     /--------\
    /          \  Unit Tests (handlers, services, components)
   /------------\
  /              \  Pure Function Tests (utilities, models)
```

**Current distribution:**
- 🔴 Too many brittle query unit tests with mocks
- 🟢 Good handler/service unit tests
- 🟢 Excellent component tests
- 🟢 Excellent pure function tests

**Target distribution:**
- ✅ Integration tests for database queries
- ✅ Unit tests for handlers/services (keep current)
- ✅ Component tests (keep current)
- ✅ Pure function tests (keep current)

---

## Expected Improvements

### Before
```typescript
// 40 lines of mock setup
vi.mock("~/database/db", () => {
  const createMockQueryBuilder = () => { /* ... */ };
  // ...
});

// Tests implementation details
expect(db.select).toHaveBeenCalled();
expect(mockFrom).toHaveBeenCalled();
```

**Confidence:** 🔴 Low (doesn't catch SQL bugs)
**Maintenance:** 🔴 High (breaks on refactoring)

### After
```typescript
// Real database, real queries
const sqlite = new Database(":memory:");
await testDb.insert(polls).values({...});

const result = await fetchPollById(1);

expect(result.question).toBe("...");
```

**Confidence:** 🟢 High (catches real bugs)
**Maintenance:** 🟢 Low (tests behavior, not implementation)

---

## Quick Wins

1. **Add `better-sqlite3` to devDependencies**
   ```bash
   npm install -D better-sqlite3 @types/better-sqlite3
   ```

2. **Create first integration test** for `fetchPollByIdWithOptions` (most complex query)

3. **Run side-by-side** - keep old tests until integration tests prove stable

4. **Measure confidence** - intentionally break a query, see which tests catch it:
   - Mock-based tests: ❌ Still pass
   - Integration tests: ✅ Fail correctly

---

## What NOT to Change

### ✅ These patterns are already excellent:

1. **Service layer mocking** (`progress.service.spec.ts`)
2. **Handler error handling tests** (`handlers.spec.ts`)
3. **Component factory pattern** (`Option.spec.tsx`)
4. **Pure function tests** (`storage.spec.ts`)

### ❌ Don't add mocks here:

- Component tests (use real props/factories)
- Pure function tests (no dependencies to mock)
- Model/domain logic tests (no external dependencies)

---

## Summary

**One sentence:** Replace database query mock chains with integration tests using in-memory SQLite, keep everything else the same.

**Impact:**
- 🟢 Higher confidence in database operations
- 🟢 Catch more real bugs
- 🟢 Easier maintenance (no mock setup)
- 🟢 Tests survive refactoring
- 🟢 Faster feedback on SQL correctness
