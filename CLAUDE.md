# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DevVoted is a developer quiz game built with TanStack Start, combining trivia with roguelike mechanics and XP betting systems. See `concept.md` for the complete vision and game mechanics.

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
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Supabase Auth
- **Testing**: Vitest with Testing Library
- **Styling**: Tailwind CSS

### Domain-Driven Architecture

The codebase follows a domain-driven structure under `src/domains/`:

```
src/domains/polls/
├── api/           # Server-side handlers and database queries
├── components/    # React components specific to polls
├── factories/     # Data transformation utilities (DTO <-> DB records)
└── models/        # TypeScript types and business logic
```

### Key Database Tables
- `polls` - Quiz questions with metadata (status, answer type, category)
- `polls_options` - Answer choices for each poll
- `polls_responses` - User submissions
- `polls_response_options` - Links responses to selected options
- `users` - Player profiles and stats

### Data Flow Pattern
1. **API Handlers** (`src/domains/polls/api/handlers.ts`) - Process requests and handle errors
2. **Queries** (`src/domains/polls/api/queries.ts`) - Database operations with Drizzle
3. **Factories** - Transform between DTOs and database records
4. **Models** - Define TypeScript types and business rules

### Path Aliases
- `~` maps to `./src`
- `@/src` maps to `./src`

### Testing Philosophy
- Tests are co-located with source files using `.spec.ts` or `.spec.tsx`
- Database operations are mocked with Vitest for unit tests
- Use `vi.clearAllMocks()` instead of `vi.resetAllMocks()` to preserve mock implementations
- Mock Drizzle query builders by chaining `.values()` and `.returning()` methods

### Common Patterns

#### Database Transactions
```typescript
await db.transaction(async (tx) => {
  const [record] = await tx.insert(table).values(data).returning();
  // Additional operations...
});
```

#### Factory Pattern for Data Transformation
```typescript
export const factory = {
  toDTO: (record: DatabaseRecord) => DTO,
  fromDTO: (dto: DTO) => DatabaseRecord,
  toDTOs: (records: DatabaseRecord[]) => DTO[],
  fromDTOs: (dtos: DTO[]) => DatabaseRecord[]
};
```

#### Error Handling in Handlers
```typescript
try {
  const result = await someOperation();
  return { success: true, data: result };
} catch (error) {
  const message = error instanceof Error ? error.message : "Something went wrong";
  return { success: false, error: message };
}
```

## Development Notes

- The project uses TanStack Router with file-based routing in `src/routes/`
- Authentication routes are protected under `_authed/` layout
- Database schema is defined in `src/database/schema.ts` with comprehensive documentation
- Test setup includes jsdom environment and jest-dom matchers
- Development server runs on port 3005 (configured in vite.config.ts)