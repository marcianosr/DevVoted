# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DevVoted is a developer quiz game built with TanStack Start, combining trivia with roguelike mechanics.
For a thorough understanding of the game's vision, mechanics, and design decisions, please refer to [Concept](https://www.notion.so/Concept-26407387629780e3b753e50c417a7901?source=copy_link) and [Brainstorming](docs/brainstorm)


Refer to `roadmap.md` for the current roadmap and MVP. Currently we are past MVP stage.

## Common Commands

### Development

- `npm run dev` - Start development server on port 3005
- `npm run build` - Build for production and run TypeScript checks
- `npm run start` - Start production server

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

### Directory Structure

```
src/
├── components/     # Global shared React components (layouts, navigation, auth)
├── config/         # Application configuration constants
├── database/       # Drizzle ORM setup, schema, migrations, seeds
├── domains/        # Feature-oriented domain modules (DDD approach)
├── hooks/          # Global custom React hooks
├── lib/            # Pure utility functions (date utils, storage helpers)
├── presentation/   # Presentation mode feature (slides)
├── routes/         # TanStack Router file-based routes
├── styles/         # Global CSS (Tailwind)
├── test/           # Test setup and utilities (mock factories)
├── ui/             # Reusable UI primitives (buttons, skeletons)
└── utils/          # Application utilities (auth, error handling, SEO)
```

### Domain-Driven Architecture

The codebase follows a domain-driven structure under `src/domains/`. For the complete architecture documentation including the server function flow, see [ADR-002: Domain Architecture](docs/adr/002-domain-architecture.md).

```
src/domains/{domain}/
├── api/
│   ├── {domain}.ts     # Server functions (createServerFn) - entry point
│   ├── handlers.ts     # Business logic handlers (pure functions)
│   └── queries.ts      # Database operations (Drizzle ORM)
├── components/         # Domain-specific React components
├── factories/          # Test data factories + seed data factories
├── hooks/              # Domain-specific custom hooks
├── models/             # TypeScript types + DTO conversion functions (toDTO/fromDTO)
├── services/           # Complex business logic, orchestration
├── utils/              # Domain-specific utility functions
└── validation/         # Zod schemas for input validation
```

### UI vs Components

| Location | Purpose |
|----------|---------|
| `src/ui/` | Pure presentational primitives (buttons, skeletons) - no business logic, no data fetching |
| `src/ui/{domain}/` | Domain-specific presentational components - compose `src/ui/` primitives, no data fetching or state |
| `src/components/` | Global shared components with logic (layouts, auth, navigation) |
| `src/domains/*/components/` | Domain composition layer - wires data and logic to UI components, no HTML/CSS |
| `src/routes/` | Route composition layer - wires loader data and mutations to components, no HTML/CSS |

### UI Layer Architecture (CRITICAL)

The app enforces a strict two-tier UI separation to keep all visual code independently testable in Storybook:

**Tier 1 — Presentational (design system)**
- `src/ui/` — global primitives: `Button`, `Card`, `Badge`, `Skeleton`, etc.
- `src/ui/{domain}/` — domain-specific visuals: `src/ui/polls/PollCard.ui.tsx`, `src/ui/runs/RunHeader.ui.tsx`, etc.
- These files contain **all HTML tags and Tailwind CSS classes** in the codebase.
- They accept only plain data props (no hooks, no server functions, no TanStack Query).
- They are fully renderable from mock factory data in Storybook without a running server.

`src/domains/` is the application and business logic layer. It must not contain any UI (React components, HTML, CSS). Domain-specific UI belongs in `src/ui/{domain}/` so the domain stays portable across interfaces (CLI, API, web).

**Tier 2 — Composition (app layer)**
- `src/domains/*/components/` — domain smart components
- `src/routes/` — route files
- These files contain **zero HTML tags and zero CSS classes**.
- Their only job is: read data (from loader, hook, or query), call mutations, and pass results as props to Tier 1 components.

```tsx
// ❌ WRONG: HTML/CSS in a domain component
export const PollSection = ({ poll }: { poll: Poll }) => (
  <div className="flex flex-col gap-4 p-6 rounded-xl bg-surface">
    <h2 className="text-lg font-bold">{poll.question}</h2>
  </div>
);

// ✅ CORRECT: domain component is pure composition
// src/ui/polls/PollSection.ui.tsx  ← owns the HTML/CSS
export const PollSection = ({ question }: { question: string }) => (
  <div className="flex flex-col gap-4 p-6 rounded-xl bg-surface">
    <h2 className="text-lg font-bold">{question}</h2>
  </div>
);

// src/domains/polls/components/PollSection.component.tsx  ← owns the wiring
export const PollSection = () => {
  const { poll } = Route.useLoaderData();
  const submit = useSubmitPoll();
  return <PollSectionUI question={poll.question} onSubmit={submit} />;
};
```

**File naming conventions:**
- `src/ui/Button.component.tsx` — global primitive
- `src/ui/{domain}/PollCard.ui.tsx` — domain-scoped UI component
- `src/domains/{domain}/components/PollSection.component.tsx` — domain composition component

**Rules enforced on every new file:**
- [ ] Does this file render HTML or use Tailwind classes? → It belongs in `src/ui/` (or `src/ui/{domain}/`), receives only plain props, has a Story.
- [ ] Does this file call a hook, query, or server function? → It belongs in `src/domains/*/components/` or `src/routes/`, contains zero HTML/CSS.
- [ ] Never mix both in the same file.

### Key Database Tables

- `polls` - Quiz questions with metadata (status, answer type, category)
- `polls_options` - Answer choices for each poll
- `polls_responses` - User submissions
- `polls_response_options` - Links responses to selected options
- `polls_categories` - Quiz categories for organization and filtering
- `daily_polls` - Pre-computed daily poll selection (O(1) lookup by date)
- `users` - Player profiles and stats
- `runs` - Individual game sessions with config storage and run status
- `run_category_coverage` - Coverage tracking per category within each run
- `polls_user_performance` - User's best performance across all runs per category

### Data Flow Pattern

The API layer follows a three-tier pattern. See [ADR-002](docs/adr/002-domain-architecture.md) for detailed examples.

1. **Server Functions** (`api/{domain}.ts`) - Authentication, authorization, input validation
2. **Handlers** (`api/handlers.ts`) - Business logic orchestration, error handling
3. **Queries** (`api/queries.ts`) - Database operations with Drizzle
4. **Models** (`models/`) - TypeScript types + DTO conversion functions
5. **Services** (`services/`) - Complex business logic spanning multiple queries

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
- For testing data, please always use stuff from RareWare, Pokemon, Banjo-Kazooie. Also, for instance when testing dates, prefer my birth day (13-05) or Christmas related dates. Just for fun.

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

Use `src/test/createMockDataFactory.ts` for creating test data with sensible defaults:

```typescript
import { createMockDataFactory } from "~/test/createMockDataFactory";

const defaultPoll: Poll = {
  id: 1,
  question: "What method returns the last element of an array?",
  // ... other defaults
};

export const createMockPoll = createMockDataFactory<Poll>(defaultPoll);

// Usage in tests:
const poll = createMockPoll({ id: 64, question: "Banjo's sister name?" });
```

#### Service Layer Organization

Services should be **feature-scoped** within their domain rather than global:

```typescript
// ✅ Good: Feature-scoped service
src/domains/polls/services/processPollAnswer.service.ts

// ❌ Avoid: Global service for domain-specific logic
src/services/pollAnswerService.ts
```

**Use global services** (`src/services/`) only for:

- Infrastructure concerns (logging, caching, notifications)
- Truly shared utilities (date formatting, validation helpers)
- Cross-cutting concerns (authentication, authorization)

**Use feature-scoped services** (`src/domains/*/services/`) for:

- Domain-specific workflows and orchestration
- Business logic that coordinates multiple subdomains
- Complex operations that span multiple layers within a domain

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
- Architecture Decision Records are stored in `docs/adr/`
- If I disagree with something, please write this down in an ADR file
- When making player-visible changes, follow `docs/changelog-maintenance.md` to update `CHANGELOG.md`
