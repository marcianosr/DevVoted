---
paths:
  - "src/database/**"
  - "supabase/**"
  - "src/modules/**/infrastructure/**"
---

# Database

PostgreSQL with Drizzle ORM.

## Tables

`src/database/schema.ts` is the single source of truth for table shape. What the columns mean lives in [the wiki](../../docs/wiki.md) and the ADRs. Do not maintain a table list in the instruction files.

## Commands

- `npm run db:push` - Push schema changes to the local database (prototyping only — see ADR-012)
- `npm run db:seed` - Seed database with initial data
- `npm run db:reset` - Reset database (drops all data)
- `npm run db:refresh` - Rebuild the local database from `supabase/migrations` alone, then seed

## Migrations (ADR-012)

`src/database/schema.ts` is the source of truth for shape. Changes are guarded:
1. Edit `schema.ts`, `npm run db:push` (dev/prototyping only)
2. Add a guarded SQL file: `supabase/migrations/YYYYMMDDHHMMSS_description.sql`
3. CI applies migrations to production on merge

## Transactions

```typescript
await db.transaction(async (tx) => {
	const [record] = await tx.insert(table).values(data).returning();
	// Additional operations...
});
```
