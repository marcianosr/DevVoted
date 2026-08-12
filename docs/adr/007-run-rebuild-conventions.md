# ADR-007: Run rebuild — design system and scope

## Status
Accepted. Governs the from-scratch rebuild of the run experience (ADR-005 container,
ADR-006 mechanics). Module/domain architecture is owned by ADR-002 — this ADR covers
the design system and what's in/out of scope for the rebuild.

## Context
The prototype proved the loop is fun (ADR-006). We're rebuilding the run frontend from
scratch — re-implementing proven mechanics cleanly, not porting prototype code — while
the existing app keeps running alongside it.

## Decision

### Design system
- ~~Categories are themed via Kanto colors~~ **Superseded by
  [ADR-020](020-gate-theme-replaces-category-colors.md)**: categories carry no
  color; the current gate's swatch drives `--theme-color` via `[data-gate-theme]`
  in `app.css` — still the single source of truth for the mapping, never
  duplicated in TypeScript. Style descendants with the `.text-theme` /
  `.bg-theme` / `.bg-theme-soft` / `.border-theme` / `.accent-theme` utilities.
  Theme color is for accents only — never large fills.
- All run text goes through three primitives in `src/ui/typography/` — `Title`,
  `Subtitle`, `Paragraph` — each with a Storybook story under "Design System/…".
  No ad-hoc `<h1>`/`<p>`/`<span>` with inline sizes, no additional label
  primitive.
- Pure engine first: ADR-006 mechanics port as tested reducers/functions before any
  presentation wires to them.

### Scope boundaries
- Schema is the only existing code the rebuild builds on; everything else in the run
  frontend/domain is rebuilt, not extended.
- No destructive migrations — DB and `usersTable` stay intact (ADR-005: in-flight
  calendar runs finish read-only).
- Border shop, profile, and similar non-run features are untouched.
- Routes may be edited to render new components — that's the seam where new meets old.
- Work against the new rebuild beans and ADRs 005–007; ignore old-concept/brainstorm
  beans unless a new bean explicitly revives one.

## Resolved (2026-07-17, restated 2026-08-12)
Component placement is settled in ADR-002: an aggregate's visuals and wiring both
live in `modules/{context}/{aggregate}/presentation/`, alongside that aggregate's
`domain/`, `application/` and `infrastructure/` folders. Legacy flat
`components/` folders migrate opportunistically.

"Pure engine first" is now a structural rule rather than a habit: the engine is
`{aggregate}/domain/`, and ADR-002 §3 forbids it from importing React, Drizzle or
anything outside `domain/`.

## Consequences
- Positive: one type system for color and text, Storybook-testable, old app keeps
  working during the rebuild, no data risk.
- Negative: temporary duplication (`session-run` alongside `runs`) until the old run UI
  retires. Accepted — parallel is safer than in-place rewrite.