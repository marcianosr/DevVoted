# ADR-010: Two-tier UI separation

## Status

Accepted — convention in force since the Storybook adoption; extracted from
CLAUDE.md into an ADR 2026-07-17. Complements ADR-002 (module layers): this ADR
is the interface layer's internal split.

## Context

Visual code must be testable in Storybook without a running server, and modules
must stay portable across interfaces (web today; CLI/API conceivable). Both
demand that markup and data-wiring never live in the same file.

## Decision

The split is **per file, never per directory** — a directory may hold both
tiers, but no file mixes them.

**Tier 1 — Presentational (design system): `{Name}.ui.tsx`**

- `src/ui/` — global primitives (`Button`, typography; legacy files still use
  the `.component.tsx` suffix — rename opportunistically).
- `src/modules/{domain}/presentation/{concept}/` — module visuals, colocated
  with their concept (e.g. `session-run/presentation/poll/PollCard.ui.tsx`).
- `src/ui/{domain}/` — older domain visuals (`runs/`, `economy/`, `polls/`,
  `ranking/`); stays until each retires, no new files here.
- These files own **all HTML tags and Tailwind classes in the codebase**.
- They accept plain data props only — no hooks, no server functions, no
  TanStack Query. Every component has a Story rendering from mock factory data.

**Tier 2 — Composition (app layer): `{Name}.component.tsx` and routes**

- Sibling `{Name}.component.tsx` files in `presentation/{concept}/` (legacy:
  flat `components/`) and `src/routes/`.
- Zero HTML tags, zero CSS classes. Their only job: read data (loader, hook, or
  query), call mutations, pass results as props to Tier 1.

```tsx
// src/modules/run/presentation/poll/PollCard.ui.tsx — owns the HTML/CSS
export const PollCard = ({ question }: { question: string }) => (
  <div className="flex flex-col gap-4 p-6 rounded-xl bg-surface">
    <h2 className="text-lg font-bold">{question}</h2>
  </div>
);

// Sibling PollCard.component.tsx (or the route) — owns the wiring
export const PollCardContainer = () => {
  const { poll } = Route.useLoaderData();
  const submit = useSubmitPoll();
  return <PollCard question={poll.question} onSubmit={submit} />;
};
```

Naming: `{Name}.ui.tsx` for Tier 1 visuals, `{Name}.component.tsx` for Tier 2
wiring (full table in ADR-002).

## Enforcement

- `npm run lint:arch` (dependency-cruiser): `src/ui` may take only **type**
  imports from modules — any runtime import of hooks/queries/server functions
  fails the build. Note this rule scopes `src/ui/` only; `.ui.tsx` purity
  inside `modules/*/presentation/` is review-enforced.
- "No HTML/CSS in Tier 2" is not machine-checkable; it is enforced by the
  new-file checklist in CLAUDE.md and review. Today `src/routes/` and the
  legacy `components/` folders still own HTML wholesale — sanctioned legacy
  surface that migrates opportunistically, not new-code license.

## Consequences

- **Positive**: every visual state is reachable in Storybook from factories;
  modules stay UI-free and portable; the seam between data and presentation is
  greppable (`.ui.tsx` vs `.component.tsx`).
- **Negative**: every visual feature is two files instead of one, and props
  must be flattened to plain data at the seam — boilerplate accepted for
  testability.
