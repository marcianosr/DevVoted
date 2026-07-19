# ADR-012: One migration pipeline — guarded SQL in supabase/migrations

## Status

Accepted 2026-07-18. Resolves DVTD-jskv (diverged drizzle journal, orphan columns, push-vs-migrate ambiguity).

## Context

Two migration systems coexisted:

1. **`supabase/migrations/*.sql`** — hand-written, idempotent, guarded DO-block files. CI (`main.yaml`) applies them to production via `supabase db push` on every merge to main. This is the only mechanism that has ever touched PRD.
2. **`drizzle/` + `drizzle.__drizzle_migrations`** — drizzle-kit's generate/migrate pipeline. 61 generated files vs 63 journal entries on the dev DB: diverged and unrepairable without archaeology. Nothing in CI used it.

On top of that, the `runs` table carried four orphan columns from an abandoned scripts/packs experiment (`held_script_ids`, `fired_scripts`, `pending_pack`, `pack_storage_used`) — absent from `schema.ts`, which made every `drizzle-kit push` stop at interactive rename prompts. Data audit: two columns empty, two with exactly one row of experiment leftovers.

## Decision

1. **`src/database/schema.ts` is the source of truth for shape; `supabase/migrations` is the single pipeline for change.** Every schema change ships as a guarded, idempotent SQL file there (see the `20260717*`/`20260718*` files for the DO-block style), applied to dev by hand (tsx one-off or `db:push`) and to PRD by CI.
2. **The drizzle generate/migrate pipeline is retired.** `drizzle/` deleted (git history keeps it), the journal table dropped, `db:generate`/`db:migrate` scripts removed. `db:push` remains for local prototyping only — never for PRD.
3. **The orphan `runs` columns are dropped** via a guarded migration. The one-row experiment leftovers are knowingly discarded.

## Consequences

- One mental model: write a guarded SQL file, apply locally, merge — CI does PRD. No journal to keep honest.
- `db:push` no longer hits rename prompts (schema.ts and the DB agree again).
- Cost: no auto-generated diffs; migration files are written by hand. Acceptable — the guarded style has been the de-facto convention for every migration since the run rebuild, and hand-written files are reviewable.
- `db:refresh` re-scripted to `reset → push → seed` (no generate step).
