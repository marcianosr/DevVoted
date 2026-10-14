# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DevVoted is a developer quiz game built with TanStack Start, combining trivia with roguelike mechanics.
For a thorough understanding of the game's vision, mechanics, and design decisions, please refer to our [stories](.beans/) and to the [wiki](./docs/wiki.md) for full documentation about the game. For each story we complete, check and update the wiki if somehting changed.

Older but still useful documentation can be found here:
[Concept](https://www.notion.so/Concept-26407387629780e3b753e50c417a7901?source=copy_link) and [Brainstorming](docs/brainstorm)

## Common Commands

- `npm run dev` - Start development server on port 3005 (configured in vite.config.ts)
- `npm run build` - Build for production and run TypeScript checks
- `npm run start` - Start production server
- `npm run lint` - oxlint + architecture boundaries (dependency-cruiser)
- `npm test` - Run all tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm test -- --run path/to/specific.spec.ts` - Run specific test file
- Database commands: see `.claude/rules/database.md`

## Technology Stack

- **Framework**: TanStack Start (React-based full-stack framework)
- **Routing**: TanStack Router (file-based routing)
- **Data Fetching**: TanStack Query
- **Forms**: controlled components with `useState`; Zod for validation schemas
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Supabase Auth
- **Testing**: Vitest with Testing Library
- **Styling**: Tailwind CSS v4
- **Error Monitoring**: Sentry
- **Utilities**: date-fns, clsx

## Path Aliases

Standardize on `~/` (the only configured alias, mapping to `src/`). Every import starts from it: `~/shared/utils/errorHandling`, `~/test/kanto`. No deep relative imports.

## Security

Server functions never trust a client-provided `userId`: wrap them in `withAuthenticatedUser` or `withAdminUser`. Full rule and checklist: `.claude/rules/backend.md`.

## Topic rules

These load automatically when you read a matching file (`paths:` frontmatter). Read one by hand if the task needs it before you've touched a matching file.

- `.claude/rules/architecture.md`: module layout, ADR-002 decision tree, suffix allowlist, DTOs
- `.claude/rules/react.md`: UI tiers (ADR-010), COPY, Stories, query keys, QueryClient
- `.claude/rules/css.md`: Tailwind, kanto theme, `app.css`
- `.claude/rules/typescript.md`: arrow functions, no `else`, composition, immutability
- `.claude/rules/backend.md`: authorization, `handleApiOperation`
- `.claude/rules/database.md`: schema, migrations (ADR-012), transactions, db commands
- `.claude/rules/testing.md`: Vitest, mocking, test data

## Development Notes

- Architecture Decision Records are stored in `docs/adr/` (index + conventions: `docs/adr/README.md`)
- Every bean you create or edit follows [ADR-107](docs/adr/107-a-bean-states-what-and-why-first.md): `**What:**` and `**Why:**` (one line each, blank line between), then `## Done when` with 2-6 outcome checkboxes, then everything else under `## Notes`. No code symbols, file paths or ADR numbers above Notes. Never delete detail to make a bean shorter.
- If I disagree with something, please write this down in an ADR file
- Docs boyscout rule: when this file, a rule file or an ADR contradicts the code, fix the doc in the same session (or flag it explicitly). Never silently work around a stale doc. Prefer deleting doc content in favor of a pointer when the code already documents it.
- When making player-visible changes, follow `docs/changelog-maintenance.md` to update `CHANGELOG.md`
- Write NO comments. Not JSDoc, not a one-line why, not `{/* */}` in JSX. The
  code is self-documenting: names carry the meaning, and reasoning belongs in an
  ADR or the wiki, which is where the decisions already live. The only things
  that stay are functional directives — `///` references, `eslint-disable`,
  `oxlint-disable`, `@ts-expect-error`, `@ts-nocheck`, `@vitest-environment` —
  and a tool's own user-facing message field (dependency-cruiser `comment`,
  thrown error strings), which is output, not commentary. `src/styles/app.css` is
  exempt: its comments document the Kanto token system. This has been swept three
  times (DVTD-k2aw, DVTD-fw0z, DVTD-8wq2); treat the zero default as standing.
