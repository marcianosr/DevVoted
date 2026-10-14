---
paths:
  - "src/**/*.tsx"
  - "src/routes/**"
  - "src/shared/queryKeys.ts"
---

# React

## UI Layer Architecture (CRITICAL)

Strict two-tier separation, both tiers inside `presentation/`. See
[ADR-010](../../docs/adr/010-ui-layer-separation.md) for the full decision:

- **Tier 1** `{Name}.ui.tsx` owns **all** HTML and Tailwind in the codebase, accepts plain data props only, every component has a Story. Lives in `{aggregate}/presentation/` or `src/ui/` (global primitives).
- **Tier 2** `{Name}.component.tsx` and `src/routes/` wire data and mutations to Tier 1: zero HTML, zero CSS.

**Rules enforced on every new file:**
- [ ] Renders HTML or uses Tailwind classes? → `{aggregate}/presentation/{Name}.ui.tsx`, plain props, has a Story.
- [ ] Calls a hook or server function? → `{aggregate}/presentation/{Name}.component.tsx` or `src/routes/`, zero HTML/CSS.
- [ ] Never mix both in the same file.
- [ ] User-facing text? → a `COPY` object in the `.ui.tsx`, or `~/shared/lib/copy.ts` if a second surface states it. Run state picks the string → the viewmodel owns it ([ADR-102](../../docs/adr/102-copy-has-one-owner.md)).
- [ ] `presentation/` may not import `infrastructure/` at all: go via an application hook or server function.

## Stories

Only create a Story when the component affects player-visible game behavior
or feel (not layout/admin/internal tooling). Before creating one, state the
one-sentence game-design reason in the PR/commit message. If you're not sure
it qualifies, ask rather than creating it.

## Routing

- The project uses TanStack Router with file-based routing in `src/routes/`
- Authentication routes are protected under `_authed/` layout

## Query Keys Pattern

Centralized query keys in `~/shared/queryKeys.ts` for consistent TanStack Query cache management:

```typescript
export const pollQueryKeys = {
  all: ["polls"] as const,
  detail: (pollId: number) => [...pollQueryKeys.all, pollId] as const,
  daily: (userId: string | undefined) =>
    [...pollQueryKeys.all, "daily", userId] as const,
};
```

## QueryClient

One `QueryClient`, created in `getRouter()` and handed to routes as `context.queryClient`; never `new QueryClient()` in a component. Sign-in, sign-up, the auth callback and logout call `queryClient.clear()` because most run keys carry a date, not an account. After a run action, `useRunCommit` is the one owner of what gets written and what gets staled.
