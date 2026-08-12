# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DevVoted is a developer quiz game built with TanStack Start, combining trivia with roguelike mechanics.
For a thorough understanding of the game's vision, mechanics, and design decisions, please refer to our [stories](.beans/) and to the [wiki](./docs/wiki.md) for full documentation about the game. For each story we complete, check and update the wiki if somehting changed.

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

- `npm run db:push` - Push schema changes to the local database (prototyping only — see ADR-012)
- `npm run db:seed` - Seed database with initial data
- `npm run db:reset` - Reset database (drops all data)
- `npm run db:refresh` - Complete database refresh (reset + push + seed)



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

New code lives under `src/modules/{context}/{aggregate}/{layer}`, where layer is one
of `domain/`, `application/`, `infrastructure/`, `presentation/`. Contexts are `run`,
`polls`, `collection`, `account`.

**Before creating any file under `src/modules/`, walk the decision tree in
[ADR-002 §5](docs/adr/002-domain-architecture.md#5-decision-tree-where-does-my-file-go).**
It gives you `(folder, suffix)` and the suffix allowlist in §4.1 is closed: no bare
filenames, no `.utils.ts`, no `.types.ts`, no `.queries.ts`, no `.handlers.ts`.

ADR-002 owns structure, layering, naming, and the dependency rule (machine-enforced
via `npm run lint` → `lint:arch`). [CONTEXT.md](CONTEXT.md) says which aggregate owns
which domain term.

The restructure is partly done (`DVTD-36ct`): **`src/modules/run/` has migrated**
and is the reference for what the shape looks like. `src/modules/polls/` and
`src/domains/` have not, and are legacy-but-live. Migrate a slice when you touch
it, not wholesale. Examples below that reference `@/src/domains/...` are correct
today; that code just hasn't moved yet.

### UI Layer Architecture (CRITICAL)

Strict two-tier separation, both tiers inside `presentation/`. See
[ADR-010](docs/adr/010-ui-layer-separation.md) for the full decision:

- **Tier 1** `{Name}.ui.tsx` owns **all** HTML and Tailwind in the codebase, accepts plain data props only, every component has a Story. Lives in `{aggregate}/presentation/` or `src/ui/` (global primitives).
- **Tier 2** `{Name}.component.tsx` and `src/routes/` wire data and mutations to Tier 1: zero HTML, zero CSS.

**Rules enforced on every new file:**
- [ ] Renders HTML or uses Tailwind classes? → `{aggregate}/presentation/{Name}.ui.tsx`, plain props, has a Story.
- [ ] Calls a hook or server function? → `{aggregate}/presentation/{Name}.component.tsx` or `src/routes/`, zero HTML/CSS.
- [ ] Never mix both in the same file.
- [ ] `presentation/` may not import `infrastructure/` at all: go via an application hook or server function.

### Database Tables

`src/database/schema.ts` is the single source of truth — every table is documented inline there. Do not maintain a table list in this file.

### Path Aliases
Standardize on `@/src`. Every import starts from it: `@/src/utils/errorHandling`, `@/src/test/kanto`. No bare `~/`, no deep relative imports.

### Testing

- Co-located `.spec.ts(x)`; Vitest + Testing Library; jsdom
- Mock at the boundary only: DB ops are mocked (chain `.values()`/`.returning()` on
  Drizzle builders). Don't mock your own component functions — use the factory pattern
  (`@/src/test/createMockDataFactory.ts`) for component data
- `vi.clearAllMocks()` over `vi.resetAllMocks()` (preserves implementations)
- Test names describe scenario + outcome; no "should"
- Canonical data from `@/src/test/kanto.ts`; prefer birthday/Christmas dates via `TEST_DATES`. Source: [https://bulbapedia.bulbagarden.net/wiki/Kanto]


### Common Patterns

- Function composition pattern. Immutability is important.
- Prevent usage of "else" if needed in if conditions:

```
// ❌ Uses else
if (user.isAdmin) {
  return grantAccess();
} else {
  return denyAccess();
}

// ✅ No else — return early
if (!user.isAdmin) {
  return denyAccess();
}
return grantAccess();

// ✅ Also fine — ternary when simple
return user.isAdmin ? grantAccess() : denyAccess();
```

- Use arrow functions over regular functions

#### Query Keys Pattern

Centralized query keys in `@/src/domains/shared/queryKeys.ts` for consistent TanStack Query cache management:

```typescript
export const pollQueryKeys = {
  all: ["polls"] as const,
  detail: (pollId: number) => [...pollQueryKeys.all, pollId] as const,
  daily: (userId: string | undefined) =>
    [...pollQueryKeys.all, "daily", userId] as const,
};
```

#### Database Transactions

```typescript
await db.transaction(async (tx) => {
	const [record] = await tx.insert(table).values(data).returning();
	// Additional operations...
});
```

#### DTO Conversion in Models

`toDTO`/`fromDTO`/`toDTOs`/`fromDTOs` live in model files, never in `factories/`. Shape and naming: [ADR-002](docs/adr/002-domain-architecture.md).

#### Error Handling in Handlers

Use `handleApiOperation` wrapper from `src/utils/errorHandling.ts`:

```typescript
import { handleApiOperation } from "@/src/utils/errorHandling";

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


### Authorization (server functions) — security-critical

Never trust a client-provided `userId`. Extract it from the authenticated session.
(WRONG: `.validator(z.object({ userId }))` then `fetchUserData(data.userId)` — auth bypass.
RIGHT: `const userId = await getAuthenticatedUserId()`.)

Utilities — `@/src/utils/authorization.ts`:
- `getAuthenticatedUserId()` — userId from the Supabase session
- `ensureAuthorizedUser(authenticatedUserId, requestedUserId)` — validates access

Accept `userId` as a parameter ONLY for public read-only data (profiles, leaderboards),
and always validate it exists. Never for writes.

Checklist for a new server function:
- [ ] Modifies user data? → `getAuthenticatedUserId()`
- [ ] Reads sensitive user data? → `getAuthenticatedUserId()`
- [ ] Public read-only? → `userId` param allowed, with validation
- [ ] Test that unauthorized access fails



### Database Migrations (ADR-012)

`src/database/schema.ts` is the source of truth for shape. Changes are guarded:
1. Edit `schema.ts`, `npm run db:push` (dev/prototyping only)
2. Add a guarded SQL file: `supabase/migrations/YYYYMMDDHHMMSS_description.sql`
3. CI applies migrations to production on merge


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
- Only create a Story when the component affects player-visible game behavior
  or feel (not layout/admin/internal tooling). Before creating one, state the
  one-sentence game-design reason in the PR/commit message. If you're not sure
  it qualifies, ask rather than creating it.
- If you're about to add new code to a domain that has legacy code sitting in src/domains/, ask whether to migrate that slice now or leave it.
