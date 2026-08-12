# ADR-010: Two-tier UI separation

## Status

Accepted. Convention in force since the Storybook adoption; extracted from
CLAUDE.md into an ADR 2026-07-17; paths updated 2026-08-12 for ADR-002's
context/aggregate/layer restructure. Complements ADR-002 (module layers): this
ADR is the internal split of the `presentation/` layer.

## Context

Visual code must be testable in Storybook without a running server, and modules
must stay portable across interfaces (web today; CLI/API conceivable). Both
demand that markup and data-wiring never live in the same file.

## Decision

The split is **per file, never per directory** — a directory may hold both
tiers, but no file mixes them.

**Tier 1 — Presentational (design system): `{Name}.ui.tsx`**

- `src/ui/` — global primitives (`Button`, typography; legacy files still use
  the `.component.tsx` suffix, rename opportunistically).
- `src/modules/{context}/{aggregate}/presentation/` — aggregate visuals,
  colocated with the concept's own domain and application layers
  (e.g. `run/gate/presentation/GateRewardReport.ui.tsx`).
- `src/ui/{domain}/` — older domain visuals (`runs/`, `economy/`, `polls/`,
  `ranking/`); stays until each retires, no new files here.
- These files own **all HTML tags and Tailwind classes in the codebase**.
- They accept plain data props only — no hooks, no server functions, no
  TanStack Query. Every component has a Story rendering from mock factory data.

**Tier 2 — Composition (app layer): `{Name}.component.tsx` and routes**

- Sibling `{Name}.component.tsx` files in the same
  `{aggregate}/presentation/` folder (legacy: flat `components/`), and
  `src/routes/`.
- Zero HTML tags, zero CSS classes. Their only job: read data (loader or hook),
  call mutations, pass results as props to Tier 1.
- They reach data through an application hook or server function. ADR-002 §3
  forbids `presentation/` importing `infrastructure/` at all, which is stricter
  than the previous "no direct query imports" rule.

```tsx
// src/modules/run/poll/presentation/PollCard.ui.tsx — owns the HTML/CSS
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
  imports from modules. Any runtime import of hooks, repositories or server
  functions fails the build. This rule scopes `src/ui/` only; `.ui.tsx` purity
  inside `{aggregate}/presentation/` is review-enforced.
- ADR-002 §4.1 pins both suffixes to `presentation/`, so a `.ui.tsx` in
  `domain/` or a `.model.ts` in `presentation/` is a placement violation
  independent of what it imports.
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
