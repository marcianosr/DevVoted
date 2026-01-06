# DevVoted

A developer quiz game combining trivia with roguelike mechanics. Test your knowledge across various programming topics while strategically managing resources and building configurations.

## Quick Start

1. Clone the repository
2. Copy `.env.sample` to `.env` and fill in your Supabase credentials
3. Install dependencies: `npm install`
4. Set up database: `npm run db:refresh`
5. Start development server: `npm run dev`

Visit http://localhost:3005 to play!

## Tech Stack

- TanStack Start (React-based full-stack framework)
- PostgreSQL + Drizzle ORM
- Supabase Auth
- Tailwind CSS
- Vitest + Testing Library

## Database Migrations

### Local Development

1. Make schema changes in `src/database/schema.ts`
2. Generate migration: `npm run db:generate`
3. Apply migration: `npm run db:push`

