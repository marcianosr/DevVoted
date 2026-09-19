# DevVoted

A developer quiz game combining trivia with roguelike mechanics. Test your knowledge across various programming topics while strategically managing resources and building configurations.

## Quick Start

1. Clone the repository
2. Copy `.env.sample` to `.env` and fill in your Supabase credentials
3. Install dependencies: `npm install`
4. Set up database: `npm run db:refresh`
5. Start development server: `npm run dev`

Visit http://localhost:3005 to play!

### Seeded accounts

`npm run db:seed` creates five Kanto logins, all with the password `kanto123`.
They differ only in their unlocked configs, so each opens on a different kind of
build:

| Login | Configs | Build |
|---|---|---|
| `lt.surge@kanto.dev` | all 40 | everything unlocked |
| `koga@kanto.dev` | 23 | coverage multipliers and focus categories |
| `blaine@kanto.dev` | 13 | wagers, streak growth, audit suppression |
| `sabrina@kanto.dev` | 12 | storage, interest, subscriptions |
| `erika@kanto.dev` | 8 | the free starter set — a fresh account |

The seed also writes the whole 96-poll bank into today's sequence, so a full
13-gate run is playable in one sitting rather than over 13 days. It is
idempotent — re-run it any time, and re-run it the next day to refresh the date.
It needs `SUPABASE_SERVICE_ROLE_KEY` in `.env` (from `npx supabase status`) to
create the login accounts, and refuses to run without it.

## Tech Stack

- TanStack Start (React-based full-stack framework)
- PostgreSQL + Drizzle ORM
- Supabase Auth
- Tailwind CSS
- Vitest + Testing Library

## Database Migrations

### Local Development

1. Make schema changes in `src/database/schema.ts`
2. Apply them locally: `npm run db:push` (prototyping only)
3. Add a guarded SQL file under `supabase/migrations/` — CI applies it to
   production on merge. See [ADR-012](docs/adr/012-migration-strategy.md).

