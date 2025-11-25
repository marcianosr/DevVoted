# Test Types: When to Use What

## The Testing Pyramid for DevVoted

```
      /\
     /E2E\      ← Playwright (5-10 tests)
    /-----\
   /  API  \    ← Vitest + In-Memory DB (50-100 tests)
  /---------\
 /   Unit    \  ← Vitest + Mocks (200+ tests)
/-------------\
```

---

## Test Type Comparison

| Type | Tool | Speed | When to Use | Example |
|------|------|-------|-------------|---------|
| **Unit** | Vitest | 1ms | Handlers, services, pure functions | `handlers.spec.ts` ✅ |
| **Integration** | Vitest + SQLite | 5ms | Database queries, complex services | `queries.integration.spec.ts` |
| **E2E** | Playwright | 1000ms+ | Critical user flows | Login → Answer poll → See score |

---

## Your Proposal vs My Recommendation

### ❌ Your Proposal: Remove Unit Tests, Add Playwright

```typescript
// Playwright test for query logic
test('fetch polls from database', async ({ page }) => {
  // Start dev server (500ms)
  // Navigate to page (200ms)
  // Trigger API call (100ms)
  // Verify response (50ms)
  // Total: ~850ms PER TEST
});
```

**Problems:**
- 🐌 **850ms per test** (vs 4ms for in-memory DB)
- 💰 **Expensive** (browser automation, full stack)
- 🔧 **Brittle** (breaks on UI changes even if query works)
- 🐛 **Harder to debug** (need to check browser, server logs, network)
- ⏰ **Slow feedback** (full test suite takes minutes)

**When to use:** Critical user journeys (login, complete quiz run, leaderboard)

---

### ✅ My Recommendation: Remove Mock Tests, Add In-Memory DB Tests

```typescript
// In-memory SQLite test (runs in Vitest)
it('fetches polls from database', async () => {
  const sqlite = new Database(':memory:');
  const testDb = drizzle(sqlite);

  await testDb.insert(polls).values({...}); // 2ms
  const result = await fetchAllPolls();      // 2ms
  expect(result).toHaveLength(2);            // 0ms
  // Total: ~4ms PER TEST
});
```

**Benefits:**
- ⚡ **4ms per test** (200x faster than Playwright!)
- 💰 **Free** (runs in same Vitest process)
- 🔧 **Stable** (no UI, browser, or network dependencies)
- 🐛 **Easy to debug** (simple stack traces)
- ⏰ **Fast feedback** (full suite runs in seconds)

**When to use:** Testing database queries, transactions, data transformations

---

## Cost Analysis

### Scenario: 50 Query Tests

| Approach | Per Test | Total Time | CI Cost | Maintenance |
|----------|----------|------------|---------|-------------|
| **Current (Mocks)** | 1ms | 50ms | $0 | High (brittle) |
| **In-Memory DB** | 4ms | 200ms | $0 | Low (tests behavior) |
| **Playwright** | 850ms | 42,500ms | $$$ | High (flaky) |

**Difference:**
- In-memory DB: **200ms total** ⚡
- Playwright: **42 seconds total** 🐌 (212x slower!)

---

## When to Use Playwright

**DO use Playwright for:**
- ✅ Complete user flows (signup → quiz → leaderboard)
- ✅ Authentication flows
- ✅ Critical business paths (payment, data export)
- ✅ Cross-browser compatibility
- ✅ Visual regression testing

**DON'T use Playwright for:**
- ❌ Testing database queries (use in-memory DB)
- ❌ Testing service logic (use unit tests)
- ❌ Testing API handlers (use Vitest)
- ❌ Testing data transformations (use unit tests)

---

## Recommended Testing Strategy

### Layer 1: Pure Functions & Models (Unit Tests)
```typescript
// storage.spec.ts - 1ms per test
it("formats storage correctly", () => {
  expect(formatStorage(1024)).toBe("1 KB");
});
```
**Tool:** Vitest
**Keep:** ✅ Your current tests are great!

---

### Layer 2: Database Queries (In-Memory Integration)
```typescript
// queries.integration.spec.ts - 4ms per test
it("fetches poll with options", async () => {
  await testDb.insert(polls).values({...});
  const result = await fetchPollByIdWithOptions(1);
  expect(result.options).toHaveLength(3);
});
```
**Tool:** Vitest + better-sqlite3
**Replace:** ❌ Remove mock-heavy query tests
**Add:** ✅ In-memory DB tests

---

### Layer 3: Handlers & Services (Unit Tests with Mocks)
```typescript
// handlers.spec.ts - 2ms per test
it("returns error when poll not found", async () => {
  vi.mocked(queries.fetchPollById).mockResolvedValue(null);
  const result = await getPollByIdHandler({ data: { id: 999 } });
  expect(result.success).toBe(false);
});
```
**Tool:** Vitest
**Keep:** ✅ Your current tests are great!

---

### Layer 4: Components (Component Tests)
```typescript
// Option.spec.tsx - 15ms per test
it("renders option correctly", () => {
  render(<Option option={mockOption} />);
  expect(screen.getByText("JavaScript")).toBeInTheDocument();
});
```
**Tool:** Vitest + Testing Library
**Keep:** ✅ Your current tests are great!

---

### Layer 5: Critical User Flows (E2E Tests)
```typescript
// complete-quiz-run.spec.ts - 2000ms per test
test("user can complete quiz run", async ({ page }) => {
  await page.goto("/login");
  await page.fill('[name="email"]', 'test@example.com');
  await page.click('[type="submit"]');

  await page.goto("/quiz");
  await page.click('[data-testid="answer-option-1"]');
  await page.click('[data-testid="submit-answer"]');

  await expect(page.locator('[data-testid="score"]')).toBeVisible();
});
```
**Tool:** Playwright
**Add:** ✅ 5-10 critical flow tests

---

## Performance Comparison

### Full Test Suite Timings

```bash
# Recommended Approach
✓ Pure functions (100 tests)          50ms
✓ In-memory DB queries (50 tests)    200ms
✓ Handlers (80 tests)                160ms
✓ Components (50 tests)              750ms
✓ E2E flows (8 tests)             16,000ms
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total:                            ~17 seconds

# Your Proposal (Playwright for queries)
✓ Pure functions (100 tests)          50ms
✓ Playwright query tests (50 tests) 42,500ms
✓ Handlers (80 tests)                 160ms
✓ Components (50 tests)               750ms
✓ E2E flows (8 tests)              16,000ms
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total:                            ~59 seconds (3.5x slower!)
```

---

## Implementation Cost

### In-Memory DB (What I Recommend)

**Setup:**
```bash
npm install -D better-sqlite3 @types/better-sqlite3
```

**Per test file:**
```typescript
// 10 lines of setup (reusable helper)
const sqlite = new Database(':memory:');
const testDb = drizzle(sqlite);

beforeEach(async () => {
  await setupTestSchema(testDb);
});
```

**Cost:** ~1 hour to set up, ~30 minutes per domain

---

### Playwright (Your Proposal)

**Setup:**
```bash
npm install -D @playwright/test
npx playwright install
```

**Per test file:**
```typescript
// 50+ lines of setup per test
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Reset database
  // Seed test data
  // Navigate to page
  // Wait for load
});

test('fetch polls', async ({ page, request }) => {
  // Make API request
  // Parse response
  // Verify data
});
```

**Cost:** ~4 hours to set up, ~2 hours per test suite
**CI Cost:** Higher (needs browser binaries, more compute time)

---

## My Recommendation

### Phase 1: Quick Wins (2 hours)
1. Install `better-sqlite3`
2. Create helper for in-memory DB setup
3. Convert 1 query test file as proof-of-concept
4. Compare speed: old mocks vs new integration tests

### Phase 2: Replace Query Tests (4 hours)
1. Convert `polls/api/queries.spec.ts` → `queries.integration.spec.ts`
2. Convert `runs/api/queries.spec.ts` → `queries.integration.spec.ts`
3. Delete old mock-based tests
4. Run full suite, verify speed (~200ms added)

### Phase 3: Add Playwright for E2E (8 hours)
1. Set up Playwright
2. Write 5-10 critical flow tests:
   - Login → Start Run → Answer Poll → Finish Run
   - View Leaderboard
   - Profile Management
3. Run in CI on main branch only (slow tests)

---

## Summary

| Your Proposal | My Recommendation |
|---------------|-------------------|
| ❌ Remove query unit tests | ✅ Remove query unit tests |
| ❌ Add Playwright for queries | ✅ Add in-memory DB for queries |
| Time: 59s | Time: 17s |
| Cost: High | Cost: Low |
| Maintenance: High (flaky) | Maintenance: Low (stable) |

**Bottom line:** Use in-memory DB for query tests, save Playwright for real E2E user flows.
