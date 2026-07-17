# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DevVoted is a developer quiz game built with TanStack Start, combining trivia with roguelike mechanics.
For a thorough understanding of the game's vision, mechanics, and design decisions, please refer to our [stories][.beans]

Older but still useful documentation can be found here:
[Concept](https://www.notion.so/Concept-26407387629780e3b753e50c417a7901?source=copy_link) and [Brainstorming](docs/brainstorm)


## Common Commands

### Development

- `npm run dev` - Start development server on port 3005
- `npm run build` - Build for production and run TypeScript checks
- `npm run start` - Start production server
- `npm run lint` - oxlint + architecture boundaries (dependency-cruiser)

### Testing

- `npm test` - Run all tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm test -- --run path/to/specific.spec.ts` - Run specific test file

### Database Operations

- `npm run db:push` - Push schema changes to database
- `npm run db:generate` - Generate migration files
- `npm run db:migrate` - Run pending migrations
- `npm run db:seed` - Seed database with initial data
- `npm run db:reset` - Reset database (drops all data)
- `npm run db:refresh` - Complete database refresh (reset + generate + push + seed)

## Architecture Overview

### Technology Stack

- **Framework**: TanStack Start (React-based full-stack framework)
- **Routing**: TanStack Router (file-based routing)
- **Data Fetching**: TanStack Query
- **Forms**: TanStack React Form
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Supabase Auth
- **Testing**: Vitest with Testing Library
- **Styling**: Tailwind CSS v4
- **Error Monitoring**: Sentry
- **Utilities**: date-fns, clsx, deepmerge

### Module Architecture

Feature modules under `src/modules/` (legacy `src/domains/` migrates opportunistically), each layered as server function → handler → query, with models/services/validation alongside. [ADR-002](docs/adr/002-domain-architecture.md) owns the structure, naming conventions, layer table, and the dependency rule — read it before adding files to a module. The rule is machine-enforced: `npm run lint` includes the architecture check (`lint:arch`, dependency-cruiser).

### UI Layer Architecture (CRITICAL)

Strict two-tier separation — see [ADR-010](docs/adr/010-ui-layer-separation.md) for the full decision:

- **Tier 1** (`src/ui/`, `src/ui/{domain}/`) owns **all** HTML and Tailwind in the codebase, accepts plain data props only, every component has a Story.
- **Tier 2** (`src/modules/*/presentation/{concept}/`, `src/routes/`; legacy flat `components/`) wires data and mutations to Tier 1 — zero HTML/CSS.

**Rules enforced on every new file:**
- [ ] Renders HTML or uses Tailwind classes? → `src/ui/` (or `src/ui/{domain}/`), plain props, has a Story.
- [ ] Calls a hook, query, or server function? → `presentation/{concept}/` or `src/routes/`, zero HTML/CSS.
- [ ] Never mix both in the same file.

### Database Tables

`src/database/schema.ts` is the single source of truth — every table is documented inline there. Do not maintain a table list in this file.

### Path Aliases

- `~` maps to `./src`
- `@/src` maps to `./src`

### Testing Philosophy

- Tests are co-located with source files using `.spec.ts` or `.spec.tsx`
- Database operations are mocked with Vitest for unit tests
- Use `vi.clearAllMocks()` instead of `vi.resetAllMocks()` to preserve mock implementations
- Mock Drizzle query builders by chaining `.values()` and `.returning()` methods
- Clear test descriptions that doesn't use verbs like "should"
- Never use function mocks, but use factory pattern for component data testing
- For testing data, please always use stuff from RareWare, Pokemon, Banjo-Kazooie. Also, for instance when testing dates, prefer my birth day (13-05) or Christmas related dates. Just for fun. Canonical pool: `src/test/kanto.ts`.

### Common Patterns

- Function composition pattern. Immutability is important.
- Prevent usage of "else" if needed in if conditions
- Use arrow functions over regular functions

#### Query Keys Pattern

Centralized query keys in `src/domains/shared/queryKeys.ts` for consistent TanStack Query cache management:

```typescript
export const pollQueryKeys = {
  all: ["polls"] as const,
  detail: (pollId: number) => [...pollQueryKeys.all, pollId] as const,
  daily: (userId: string | undefined) =>
    [...pollQueryKeys.all, "daily", userId] as const,
};
```

#### Mock Data Factory Pattern

Use `src/test/createMockDataFactory.ts` for test data with sensible defaults, and pull values from the Kanto pool in `src/test/kanto.ts` (towns + mottos, gym leaders + badges, landmarks, poll-shaped `KANTO_QUIZ` questions, canonical `TEST_DATES`) instead of inventing ad-hoc strings:

```typescript
import { createMockDataFactory } from "~/test/createMockDataFactory";
import { KANTO_QUIZ, TEST_DATES } from "~/test/kanto";

export const createMockPoll = createMockDataFactory<Poll>(defaultPoll);

// Usage in tests:
const poll = createMockPoll({
  id: 64,
  question: KANTO_QUIZ[0].question, // "What is the tallest building in Saffron City?"
  createdAt: new Date(TEST_DATES.birthday),
});
```


#### Database Transactions

```typescript
await db.transaction(async (tx) => {
	const [record] = await tx.insert(table).values(data).returning();
	// Additional operations...
});
```

#### DTO Conversion in Models

Models contain TypeScript types and conversion functions (not in factories/):

```typescript
// src/domains/polls/models/poll.ts
export const pollFactory = {
  toDTO: (record: PollRecord): Poll => ({...}),
  fromDTO: (dto: Poll): PollRecord => ({...}),
  toDTOs: (records: PollRecord[]): Poll[] => records.map(pollFactory.toDTO),
  fromDTOs: (dtos: Poll[]): PollRecord[] => dtos.map(pollFactory.fromDTO),
};
```

#### Error Handling in Handlers

Use `handleApiOperation` wrapper from `src/utils/errorHandling.ts`:

```typescript
import { handleApiOperation } from "~/utils/errorHandling";

export const getPollByIdHandler = async ({ data }: { data: { id: number } }) => {
  return handleApiOperation(async () => {
    const poll = await fetchPollById(data.id);
    if (!poll) throw new Error("Poll not found");
    return poll;
  });
};
```

This returns a typed `ApiResponse<T>`:

```typescript
type ApiResponse<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string };
```

#### Authorization Pattern (CRITICAL)

**Never trust client-provided userId parameters** in server functions. Always extract userId from authenticated session.

```typescript
// ❌ WRONG: Accepts userId from client (security vulnerability)
export const getUserData = createServerFn()
	.validator(z.object({ userId: z.string() }))
	.handler(async ({ data }) => {
		return await fetchUserData(data.userId);
	});

// ✅ CORRECT: Gets userId from authenticated session
export const getUserData = createServerFn({ method: "GET" }).handler(
	async () => {
		const userId = await getAuthenticatedUserId();
		return await fetchUserData(userId);
	}
);
```

**Authorization utilities** (`src/utils/authorization.ts`):

- `getAuthenticatedUserId()` - Extracts userId from Supabase auth session
- `ensureAuthorizedUser(authenticatedUserId, requestedUserId)` - Validates user access

**When to accept userId as parameter:**

- Read-only public data (profiles, leaderboards) where viewing others' data is intentional
- Always validate the userId exists in the database
- Never for write operations (creating, updating, deleting user data)

**Development checklist for new server functions:**

- [ ] Does this function modify user data? → Use `getAuthenticatedUserId()`
- [ ] Does this function access sensitive user data? → Use `getAuthenticatedUserId()`
- [ ] Is this public read-only data? → Can accept userId parameter with validation
- [ ] Test unauthorized access attempts fail properly

## Development Notes

- The project uses TanStack Router with file-based routing in `src/routes/`
- Authentication routes are protected under `_authed/` layout
- Database schema is defined in `src/database/schema.ts` with comprehensive documentation
- Test setup includes jsdom environment and jest-dom matchers
- Development server runs on port 3005 (configured in vite.config.ts)
- Architecture Decision Records are stored in `docs/adr/` (index + conventions: `docs/adr/README.md`)
- If I disagree with something, please write this down in an ADR file
- Docs boyscout rule: when this file or an ADR contradicts the code, fix the doc in the same session (or flag it explicitly). Never silently work around a stale doc. Prefer deleting doc content in favor of a pointer when the code already documents it.
- When making player-visible changes, follow `docs/changelog-maintenance.md` to update `CHANGELOG.md`
- Don't make stories for every action, only when I tell you. You are allowed to ask though.
