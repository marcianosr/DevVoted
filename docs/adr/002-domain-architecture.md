# Agent Instructions — SPA Frontend

This document is a template for a project-level `CLAUDE.md` (or equivalent agent instruction file). Copy it into the root of a project and adjust the specifics. It encodes the rules from the [SPA Reference Architecture](./reference-architecture-spa.md).

---

## Validation

- All data entering the system from outside must be parsed through a Zod schema before use. This includes API responses, form submissions, URL parameters, and any browser storage reads.
- Never use `as SomeType` or type assertions to bypass unknown data — parse it instead.
- Zod schemas live in `src/domain/schemas/`. The inferred TypeScript types from those schemas are the domain types.

## Domain layer

- `src/domain/` is framework-agnostic. No React imports, no hooks, no JSX.
- Business logic lives here as pure functions: data in, data out.
- Mutations of domain objects use `produce` from immer. Never mutate objects directly.
- A function that changes domain state belongs in `src/domain/functions/`, not in a component or hook.
- If you find yourself writing the same transformation in two places, it belongs here.

## Application layer

- `src/modules/` is where React-specific logic lives: hooks, state, routing, feature composition.
- Never write raw HTML or CSS in a module component. All visual output comes from `src/ui/`.
- Extract distinct behavior topics into custom hooks. One hook, one concern.
- Data fetching, form state, and domain mutations each belong in their own hook.
- A component that imports more than one or two hooks is a signal to split it.

## UI layer

- `src/ui/` components are stateless. They receive data and emit events via props. No internal state, no domain knowledge, no API calls.
- When you need a stateful version of a UI component, wrap it in a module-level component that owns the state and passes it down.
- Props express intent, not implementation. Use named variants: `size="sm"` not `width={14}`. Use `intent="primary"` not `color="blue"`.
- Use CVA (`cva`) to define component variants. Do not concatenate class strings with conditional logic.

## Theming and dark mode

- Do not use `dark:` modifier classes on individual UI components.
- Define semantic color names in `@theme` (e.g. `--color-surface`, `--color-on-surface`, `--color-primary`).
- Override those variables under a `[data-theme="dark"]` selector in one place.
- Components use `bg-surface`, `text-on-surface`, etc. — never hardcoded color values.

## Testing

- Domain functions in `src/domain/` must have near-100% unit test coverage. They are pure functions — tests are straightforward.
- Use Vitest as the test runner. Use React Testing Library for component tests.
- Test from the user's perspective: find elements by role, label, or text — not by class names or test IDs.
- UI components should have Storybook stories covering all variants and interactive states.

## File placement

When adding new code, follow this decision tree:

1. Is it a pure transformation or validation of domain data? → `src/domain/`
2. Is it an API call or adapter? → `src/api/`
3. Is it a reusable, stateless UI component? → `src/ui/`
4. Is it a behavior hook for a specific feature? → `src/modules/[feature]/hooks/`
5. Is it a composed screen or feature component? → `src/modules/[feature]/components/`
6. Is it a cross-cutting React concern (provider, layout)? → `src/application/`

If it doesn't fit any of the above, ask before creating a new top-level folder.