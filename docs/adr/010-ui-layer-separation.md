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

**Tier 1 — Presentational (design system)**

- `src/ui/` — global primitives (`Button`, `Card`, `Skeleton`, typography).
- `src/ui/{domain}/` — domain-specific visuals (`PollCard.ui.tsx`).
- These files own **all HTML tags and Tailwind classes in the codebase**.
- They accept plain data props only — no hooks, no server functions, no
  TanStack Query. Every component has a Story rendering from mock factory data.

**Tier 2 — Composition (app layer)**

- `src/modules/{domain}/presentation/{concept}/` (legacy: flat `components/`)
  and `src/routes/`.
- Zero HTML tags, zero CSS classes. Their only job: read data (loader, hook, or
  query), call mutations, pass results as props to Tier 1.

```tsx
// src/ui/polls/PollSection.ui.tsx — owns the HTML/CSS
export const PollSection = ({ question }: { question: string }) => (
  <div className="flex flex-col gap-4 p-6 rounded-xl bg-surface">
    <h2 className="text-lg font-bold">{question}</h2>
  </div>
);

// src/modules/polls/presentation/poll/PollSection.component.tsx — owns the wiring
export const PollSection = () => {
  const { poll } = Route.useLoaderData();
  const submit = useSubmitPoll();
  return <PollSectionUI question={poll.question} onSubmit={submit} />;
};
```

Naming: `{Name}.ui.tsx` for Tier 1 domain visuals, `{Name}.component.tsx` for
global primitives and Tier 2 wiring (full table in ADR-002).

## Enforcement

- `npm run lint:arch` (dependency-cruiser): `src/ui` may take only **type**
  imports from modules — any runtime import of hooks/queries/server functions
  fails the build.
- "No HTML/CSS in Tier 2" is not machine-checkable; it is enforced by the
  new-file checklist in CLAUDE.md and review.

## Consequences

- **Positive**: every visual state is reachable in Storybook from factories;
  modules stay UI-free and portable; the seam between data and presentation is
  greppable (`.ui.tsx` vs `.component.tsx`).
- **Negative**: every visual feature is two files instead of one, and props
  must be flattened to plain data at the seam — boilerplate accepted for
  testability.
