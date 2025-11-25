# Test Comparison: Bad vs Good

## ❌ Current Approach: Over-Mocked Query Test

**File:** `src/domains/polls/api/queries.spec.ts:56-80`

```typescript
// 40 lines of mock setup (lines 22-49)
vi.mock("~/database/db", () => {
  const createMockQueryBuilder = () => {
    const returningMock = vi.fn().mockResolvedValue([{ response_id: 123 }]);
    const valuesMock = vi.fn().mockReturnValue({ returning: returningMock });
    return { values: valuesMock };
  };

  const insertMock = vi.fn(() => createMockQueryBuilder());
  const transactionMock = vi.fn((cb) => cb({
    insert: vi.fn(() => createMockQueryBuilder()) as any,
  }));

  return {
    db: {
      select: vi.fn(),
      insert: insertMock,
      update: vi.fn(),
      delete: vi.fn(),
      transaction: transactionMock,
    },
  };
});

describe("fetchAllPolls", () => {
  it("returns transformed to DTOs for all polls", async () => {
    const mockPollRecords = createMockPollRecordArray(3);

    // Setting up mocks for each layer
    const mockOrderBy = vi.fn().mockResolvedValue(mockPollRecords);
    const mockFrom = vi.fn().mockReturnValue({ orderBy: mockOrderBy });
    vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

    const result = await fetchAllPolls();

    // Testing that mocks were called
    expect(db.select).toHaveBeenCalled();
    expect(mockFrom).toHaveBeenCalled();
    expect(mockOrderBy).toHaveBeenCalled();
    expect(result).toHaveLength(3);
  });
});
```

### What's Wrong:
1. ❌ **40+ lines of mock setup** - complex, hard to maintain
2. ❌ **Testing implementation details** - checks if `db.select()` was called
3. ❌ **Brittle tests** - breaks if you refactor query builder usage
4. ❌ **Low confidence** - doesn't verify SQL correctness
5. ❌ **Doesn't catch bugs** - test passes even if query selects wrong columns

### Example Bug This Would Miss:

```typescript
// BUG: Selecting from wrong table
export const fetchAllPolls = async () => {
  const records = await db
    .select()
    .from(users)  // ❌ WRONG TABLE!
    .orderBy(polls.id);

  return factory.toDTOs(records);
};
```

**Result:** ✅ Test still passes because mocks don't care about table names

---

## ✅ Better Approach: Integration Test

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";

// In-memory database - fast, isolated, real SQL
const sqlite = new Database(":memory:");
const testDb = drizzle(sqlite);

beforeEach(async () => {
  // Run migrations or create schema
  await setupTestSchema(testDb);
});

describe("fetchAllPolls", () => {
  it("returns all polls from database", async () => {
    // Insert real test data
    await testDb.insert(polls).values([
      {
        id: 1,
        question: "What is TypeScript?",
        status: "active",
        answer_type: "single",
        category_code: "typescript",
      },
      {
        id: 2,
        question: "What is React?",
        status: "active",
        answer_type: "multiple",
        category_code: "react",
      },
    ]);

    // Test actual query behavior
    const result = await fetchAllPolls();

    // Verify real data
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      id: 1,
      question: "What is TypeScript?",
      status: "active",
      answerType: "single",  // Verify DTO transformation
      categoryCode: "typescript",
    });
  });

  it("returns empty array when no polls exist", async () => {
    const result = await fetchAllPolls();
    expect(result).toEqual([]);
  });

  it("orders polls by ID", async () => {
    await testDb.insert(polls).values([
      { id: 3, question: "Third", status: "active", answer_type: "single", category_code: "js" },
      { id: 1, question: "First", status: "active", answer_type: "single", category_code: "js" },
      { id: 2, question: "Second", status: "active", answer_type: "single", category_code: "js" },
    ]);

    const result = await fetchAllPolls();

    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(2);
    expect(result[2].id).toBe(3);
  });
});
```

### What's Better:
1. ✅ **No mock setup** - just real data
2. ✅ **Tests behavior** - verifies actual query results
3. ✅ **Catches real bugs** - wrong table, wrong columns, bad ordering
4. ✅ **High confidence** - uses real SQL engine
5. ✅ **Survives refactoring** - tests output, not implementation

### Example Bug This Would Catch:

```typescript
// BUG: Selecting from wrong table
export const fetchAllPolls = async () => {
  const records = await db
    .select()
    .from(users)  // ❌ WRONG TABLE!
    .orderBy(polls.id);

  return factory.toDTOs(records);
};
```

**Result:** ❌ Test fails with clear error:
```
Error: column "question" does not exist in table "users"
```

---

## Another Example: Testing Date Logic

### ❌ Bad: Mock-Based Test

```typescript
it("returns false when user only answered yesterday", async () => {
  const mockWhere = vi.fn().mockResolvedValue([]);
  const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
  vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

  const result = await hasUserAnsweredPoll(1, "user-123");

  expect(result).toBe(false);
  expect(mockWhere).toHaveBeenCalled();  // ❌ What does this prove?
});
```

**Problem:** You're **assuming** the query filters by date correctly, but not **verifying** it.

---

### ✅ Good: Integration Test

```typescript
it("returns false when user only answered yesterday", async () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  // Insert real test data
  await testDb.insert(polls).values({
    id: 6,
    question: "Old poll",
    status: "active",
    answer_type: "single",
    category_code: "css",
  });

  await testDb.insert(pollsResponses).values({
    poll_id: 6,
    user_id: "charizard",
    created_at: yesterday,  // Answered yesterday
  });

  // Test actual date filtering logic
  const result = await hasUserAnsweredPoll(6, "charizard");

  expect(result).toBe(false);  // ✅ Verifies date logic works!
});

it("returns true when answered at midnight today", async () => {
  const midnight = new Date();
  midnight.setHours(0, 0, 0, 0);

  await testDb.insert(polls).values({
    id: 25,
    question: "Midnight poll",
    status: "active",
    answer_type: "single",
    category_code: "js",
  });

  await testDb.insert(pollsResponses).values({
    poll_id: 25,
    user_id: "pikachu",
    created_at: midnight,
  });

  const result = await hasUserAnsweredPoll(25, "pikachu");

  expect(result).toBe(true);  // ✅ Verifies midnight boundary!
});
```

**Benefits:**
- ✅ Actually tests date comparison logic
- ✅ Catches off-by-one errors
- ✅ Verifies timezone handling
- ✅ Tests edge cases (midnight boundary)

---

## Testing Transactions

### ❌ Bad: Mock-Based Test

```typescript
it("inserts poll response and links selected option IDs", async () => {
  const pollId = 1;
  const userId = "user-123";
  const selectedOptionIds = [10, 20];

  await expect(
    createPollResponse({ pollId, userId, selectedOptionIds })
  ).resolves.not.toThrow();

  // ❌ Only verifies transaction was called
  expect(vi.mocked(db.transaction)).toHaveBeenCalledWith(expect.any(Function));
});
```

**Problem:** Doesn't verify transaction **actually creates records** or **rolls back on error**.

---

### ✅ Good: Integration Test

```typescript
it("creates response and links options in transaction", async () => {
  await testDb.insert(polls).values({
    id: 1,
    question: "Test",
    status: "active",
    answer_type: "multiple",
    category_code: "js",
  });

  await testDb.insert(pollsOptions).values([
    { id: 10, poll_id: 1, option: "A", is_correct: true },
    { id: 20, poll_id: 1, option: "B", is_correct: false },
  ]);

  // Execute transaction
  await createPollResponse({
    pollId: 1,
    userId: "banjo",
    selectedOptionIds: [10, 20],
  });

  // ✅ Verify data was actually inserted
  const responses = await testDb
    .select()
    .from(pollsResponses)
    .where(eq(pollsResponses.user_id, "banjo"));

  expect(responses).toHaveLength(1);
  expect(responses[0].poll_id).toBe(1);

  // ✅ Verify option links were created
  const links = await testDb
    .select()
    .from(pollsResponseOptions)
    .where(eq(pollsResponseOptions.response_id, responses[0].response_id));

  expect(links).toHaveLength(2);
  expect(links.map(l => l.option_id)).toEqual([10, 20]);
});

it("rolls back transaction on error", async () => {
  await testDb.insert(polls).values({
    id: 1,
    question: "Test",
    status: "active",
    answer_type: "single",
    category_code: "js",
  });

  // Try to insert with invalid option ID
  await expect(
    createPollResponse({
      pollId: 1,
      userId: "kazooie",
      selectedOptionIds: [999],  // Doesn't exist
    })
  ).rejects.toThrow();

  // ✅ Verify nothing was inserted (transaction rolled back)
  const responses = await testDb
    .select()
    .from(pollsResponses)
    .where(eq(pollsResponses.user_id, "kazooie"));

  expect(responses).toHaveLength(0);
});
```

**Benefits:**
- ✅ Verifies transaction atomicity
- ✅ Tests rollback behavior
- ✅ Catches constraint violations
- ✅ High confidence in data integrity

---

## Summary Table

| Aspect | ❌ Mock-Based | ✅ Integration Test |
|--------|--------------|-------------------|
| **Setup complexity** | 40+ lines of mocks | 5 lines of real data |
| **What it tests** | Mock calls | Actual behavior |
| **Catches SQL bugs** | No | Yes |
| **Catches date logic bugs** | No | Yes |
| **Catches transaction bugs** | No | Yes |
| **Survives refactoring** | No | Yes |
| **Test maintenance** | High | Low |
| **Confidence level** | Low | High |
| **Speed** | Fast (~1ms) | Fast (~5ms) |

---

## The Bottom Line

**Your instinct is correct** - you have too much mocking in the wrong places.

**Fix:**
- ❌ Remove: Query layer mock chains
- ✅ Add: Integration tests with in-memory SQLite
- ✅ Keep: Handler/service/component tests (they're already good!)

**One sentence:** Test database queries with real databases, everything else with mocks at the right boundary.
