# UI Layer Refactor Plan

**Goal:** Enforce strict two-tier UI separation across the codebase so that all HTML/CSS lives in presentational components under `src/ui/` and all composition lives in smart components (`src/domains/*/components/` and `src/routes/`). This makes the entire visual layer independently renderable in Storybook.

**Architectural principle:** `src/domains/` is the business logic and application layer — it must contain no UI. Domain-specific presentational components live in `src/ui/{domain}/` (e.g. `src/ui/polls/`, `src/ui/runs/`). This keeps domains portable across interfaces (CLI, API, web).

See CLAUDE.md § "UI Layer Architecture" for the enforced rules.

---

## Regression prevention strategy

Three layers of protection, introduced in order of when they become safe to enable:

| Layer | What it catches | When to add |
|-------|----------------|-------------|
| Testing Library unit tests | Rendering regressions in UI components | As part of each extraction phase |
| ESLint architectural rule | New violations of the two-tier rule | **After Phase 7** (migration complete — would fail CI on all existing violations if added earlier) |

The ESLint rule is the most powerful long-term guard but would block every PR until migration is complete, so it is deliberately the last step.

---

## Why this order

Each phase is independently shippable and leaves the app fully working. Later phases depend on the naming conventions and patterns established in earlier ones. Storybook is installed before domain work begins so stories can be written as part of each phase rather than retrofitted.

---

## Phase 1 — Foundation ✅

### 1.1 Install and configure Storybook ✅

- Storybook 10 with Vite + React + Tailwind v4
- Points at `src/ui/**/*.stories.tsx` and `src/ui/**/**/*.stories.tsx`
- Dark mode by default with toolbar toggle
- `npm run storybook` starts on port 6006

### 1.2 Write stories and unit tests for existing `src/ui/` primitives ✅

Stories and tests written for:
- `PrimaryButton`, `SecondaryButton`, `TextButton`
- `LoadingSkeleton`
- `Dropdown`, `DropdownItem`, `DropdownDivider`
- `Popover`
- `ConfirmDialog`

### 1.3 Scaffold `src/ui/{domain}/` directories ✅

- `src/ui/polls/`
- `src/ui/runs/`
- `src/ui/economy/`
- `src/ui/ranking/`

---

## Phase 2 — Global shared components ✅

**Target:** `src/components/` (layouts, navigation, auth).

Extracted primitives (all with `.stories.tsx` and `.spec.tsx`):
- `ContentSection` — `<section>` with category theme attribute
- `PageLayoutUI` — `<main>` shell with footer slot
- `FooterUI` — stats footer with configurable link slot
- `NotFoundUI` — 404 page with back button and home link slot
- `CatchBoundaryUI` — error boundary UI with retry button and navigation slot
- `DevPollNavigatorUI` — dev-only poll navigator

---

## Phase 3 — `src/domains/economy/`

Economy is the cleanest domain. `useArchiveState` already abstracts state correctly; `BorderShop.component.tsx` is close to correct. This makes it the lowest-effort domain to demonstrate the full pattern end-to-end.

### Steps
1. Create `src/ui/economy/BorderShopUI.ui.tsx` — extract all HTML/CSS from `BorderShop.component.tsx` into a pure props component.
2. Reduce `BorderShop.component.tsx` to call `useArchiveState` and pass results to `BorderShopUI`.
3. Write `BorderShopUI.stories.tsx` seeded with `createMockArchiveState`.
4. Write `BorderShopUI.spec.tsx` — renders with mock props, asserts on visible output.
5. Repeat for `ShopContainer`: extract `src/ui/economy/ShopContainerUI.ui.tsx`, write story and unit test.
6. Extract inline mutations from `ShopContainer` into `useInstallConfig`, `useRerollShop`, `useSkipShop` hooks.

---

## Phase 4 — `src/domains/ranking/`

### Steps
1. Move `createServerFn` out of `useCurrentSeason.hook.ts` → `src/domains/ranking/api/ranking.ts`.
2. Register leaderboard query key in `src/domains/shared/queryKeys.ts`.
3. Extract `useLeaderboard(categoryCode)` hook from `Leaderboard.component.tsx`.
4. Create `src/ui/ranking/LeaderboardUI.ui.tsx` — extract all HTML/CSS, add story and unit test.
5. Reduce `Leaderboard.component.tsx` to composition only.

---

## Phase 5 — `src/domains/runs/`

The runs domain already has good mutation hooks. The main work is visual extraction.

### Steps
1. Create `src/ui/runs/` components for each existing domain component (e.g. `RunHeaderUI`, `UpgradeCardUI`, `PipelineSectionUI`).
2. Write stories and unit tests for each, seeded from existing mock factories.
3. Reduce each `*.component.tsx` to composition only.

---

## Phase 6 — `src/domains/polls/` (largest, highest-impact)

This domain has the most violations. Tackle in this order to avoid cascading breakage:

### 6.1 Move server functions out of component files
- Move `getScoreBreakdown`, `getCommunityStats`, `getRandomAnswer` from `DailyPollContainer.component.tsx` → `src/domains/polls/api/polls.ts`
- Move `getCategoryWeights` from `CategoryWeightsDisplay.component.tsx` → `src/domains/polls/api/polls.ts`
- Update all import sites

### 6.2 Extract hooks
- `useSubmitDailyPoll` — owns the primary mutation, post-answer state values, query invalidation, and navigation.
- `useDeinstallConfig` — shared hook consumed by both `DailyPollContainer` and `progress.tsx`.
- `useCategoryWeights` — wraps the query for `CategoryWeightsDisplay`.

### 6.3 Extract UI components into `src/ui/polls/`, write stories and unit tests
- `src/ui/polls/DailyPollContainerUI.ui.tsx` — receives score, upgrade cards, evaluation context, submission handler as props.
- `src/ui/polls/CategoryWeightsDisplayUI.ui.tsx` — receives `{ category: string; percentage: number }[]` as a prop.
- `src/ui/polls/PollOptionsFormUI.ui.tsx` — the form shell with remaining HTML.

### 6.4 Reduce component files to composition only

---

## Phase 7 — Routes (`src/routes/`)

By this phase all domain UI is in `src/ui/{domain}/` components. Routes only need to:
1. Read loader data.
2. Call domain composition components or (for simple cases) UI components directly.
3. Contain zero HTML/CSS themselves.

Key route files to clean up:
- `src/routes/_authed/admin.tsx` — move server functions + Drizzle queries to `src/domains/ranking/api/`; extract `src/ui/admin/AdminPanelUI.ui.tsx`.
- `src/routes/start.tsx` — extract `useStartRun` hook for the inline mutation.
- `src/routes/_authed/progress.tsx` — use shared `useDeinstallConfig` hook (from Phase 6.2).
- `src/routes/stats.tsx` — move `computeRunStats` to `src/domains/runs/utils/runStats.ts`.

---

## Phase 8 — Enforce via ESLint

**Only add this after Phase 7 is complete.** At that point there are zero existing violations, so the rule becomes a pure guard against regression.

Add an ESLint rule (or a custom script) that:
- Flags any file in `src/routes/` or `src/domains/*/components/` that contains an HTML tag or a Tailwind class string.
- Flags any file in `src/ui/` that imports from `@tanstack/react-query`, `@tanstack/react-router`, or `~/domains/*/api/`.
- Flags any file in `src/domains/` that contains JSX or imports React.

---

## Definition of Done (per phase)

- [ ] All HTML/CSS for the scope is in `src/ui/` or `src/ui/{domain}/` files
- [ ] Every extracted UI component has a Storybook story seeded from a mock factory
- [ ] Every extracted UI component has a Testing Library unit test asserting on visible output
- [ ] Composition components in scope contain zero HTML tags and zero Tailwind classes
- [ ] `src/domains/` files in scope contain no JSX or React imports
- [ ] `npm run build` passes
- [ ] `npm test` passes
