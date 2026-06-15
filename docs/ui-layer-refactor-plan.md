# UI Layer Refactor Plan

**Goal:** Enforce strict two-tier UI separation across the codebase so that all HTML/CSS lives in presentational components (`src/ui/` and `src/domains/*/ui/`) and all composition lives in smart components (`src/domains/*/components/` and `src/routes/`). This makes the entire visual layer independently renderable in Storybook.

See CLAUDE.md § "UI Layer Architecture" for the enforced rules.

---

## Regression prevention strategy

Three layers of protection, introduced in order of when they become safe to enable:

| Layer | What it catches | When to add |
|-------|----------------|-------------|
| Testing Library unit tests | Rendering regressions in UI components | As part of each extraction phase |
| Chromatic visual snapshots | Visual/style regressions across all stories | After Phase 1 (Storybook has stories) |
| ESLint architectural rule | New violations of the two-tier rule | **After Phase 7** (migration complete — would fail CI on all existing violations if added earlier) |

The ESLint rule is the most powerful long-term guard but would block every PR until migration is complete, so it is deliberately the last step.

---

## Why this order

Each phase is independently shippable and leaves the app fully working. Later phases depend on the naming conventions and patterns established in earlier ones. Storybook is installed before domain work begins so stories can be written as part of each phase rather than retrofitted.

---

## Phase 1 — Foundation

### 1.1 Install and configure Storybook

- Add Storybook with the Vite + React + Tailwind preset
- Point it at `src/ui/**/*.stories.tsx` and `src/domains/**/ui/**/*.stories.tsx`
- Confirm Tailwind v4 classes render correctly inside Storybook
- Add `npm run storybook` to CLAUDE.md Common Commands

### 1.2 Write stories for existing `src/ui/` primitives

For each existing primitive, write a `.stories.tsx` file next to it:
- `PrimaryButton`, `SecondaryButton`, `TextButton`
- `LoadingSkeleton`
- `Dropdown`, `Popover`
- `ConfirmDialog`
- `ErrorComponent`

This validates the Storybook setup and documents the current primitive API.

### 1.3 Write Testing Library unit tests for existing `src/ui/` primitives

For each primitive, write a `.spec.tsx` file next to it that:
- Renders the component with representative props (seeded from the same mock data used in stories)
- Asserts on visible output (text, ARIA roles, disabled state) — not on CSS classes
- Covers any conditional rendering branches

These tests run in CI from day one and establish the baseline before any refactoring.

### 1.4 Set up Chromatic

- Connect the repository to Chromatic
- Add `chromatic --project-token=...` as a CI step after Storybook build
- Accept the initial baseline snapshots from step 1.2
- From this point on, every PR that changes a story shows a visual diff

### 1.5 Create `src/domains/*/ui/` directories

Create the `ui/` subdirectory inside each domain that has components:
- `src/domains/polls/ui/`
- `src/domains/runs/ui/`
- `src/domains/economy/ui/`
- `src/domains/ranking/ui/`

No files yet — just the scaffolding so the pattern is visible.

---

## Phase 2 — Global shared components

**Target:** `src/components/` (layouts, navigation, auth).

These are the most reused components. Splitting them first proves the pattern at low risk.

For each component in `src/components/`:
1. Extract all HTML/CSS into a sibling `src/ui/` primitive (or a new `src/components/ui/` if it is layout-only).
2. Reduce the original file to a pure composition component that calls hooks/context and passes props.
3. Write a Storybook story for the extracted primitive.
4. Write a Testing Library unit test for the extracted primitive.

Key targets:
- Navigation/header components
- Layout wrappers
- Auth guard wrappers (the guard logic stays in the component; only the rendered chrome moves to UI)

---

## Phase 3 — `src/domains/economy/`

Economy is the cleanest domain. `useArchiveState` already abstracts state correctly; `BorderShop.component.tsx` is close to correct. This makes it the lowest-effort domain to demonstrate the full pattern end-to-end.

### Steps
1. Create `src/domains/economy/ui/BorderShopUI.ui.tsx` — extract all HTML/CSS from `BorderShop.component.tsx` into a pure props component.
2. Reduce `BorderShop.component.tsx` to call `useArchiveState` and pass results to `BorderShopUI`.
3. Write `BorderShopUI.stories.tsx` seeded with `createMockArchiveState`.
4. Write `BorderShopUI.spec.tsx` — renders with mock props, asserts on visible output.
5. Repeat for `ShopContainer`: extract `ShopContainerUI`, write story and unit test.
6. Extract inline mutations from `ShopContainer` into `useInstallConfig`, `useRerollShop`, `useSkipShop` hooks (from the analysis: medium-severity violation).

---

## Phase 4 — `src/domains/ranking/`

### Steps
1. Move `createServerFn` out of `useCurrentSeason.hook.ts` → `src/domains/ranking/api/ranking.ts`.
2. Register leaderboard query key in `src/domains/shared/queryKeys.ts`.
3. Extract `useLeaderboard(categoryCode)` hook from `Leaderboard.component.tsx`.
4. Create `src/domains/ranking/ui/LeaderboardUI.ui.tsx` — extract all HTML/CSS, add story and unit test.
5. Reduce `Leaderboard.component.tsx` to composition only.

---

## Phase 5 — `src/domains/runs/`

The runs domain already has good mutation hooks. The main work is visual extraction.

### Steps
1. Create `ui/` components for each existing domain component (e.g. `RunHeaderUI`, `UpgradeCardUI`, `PipelineSectionUI`).
2. Write stories and unit tests for each, seeded from existing mock factories.
3. Reduce each `*.component.tsx` to composition only.

---

## Phase 6 — `src/domains/polls/` (largest, highest-impact)

This domain has the most violations. Tackle in this order to avoid cascading breakage:

### 6.1 Move server functions out of component files
- Move `getScoreBreakdown`, `getCommunityStats`, `getRandomAnswer` from `DailyPollContainer.component.tsx` → `src/domains/polls/api/polls.ts`
- Move `getCategoryWeights` from `CategoryWeightsDisplay.component.tsx` → `src/domains/polls/api/polls.ts`
- Update all import sites (`daily-poll/index.tsx`, etc.)

### 6.2 Extract hooks
- `useSubmitDailyPoll` — owns the primary mutation, the five post-answer state values, query invalidation, and navigation. Extracted from `DailyPollContainer`.
- `useDeinstallConfig` — shared hook consumed by both `DailyPollContainer` and `progress.tsx` (eliminates the duplication identified in the analysis).
- `useCategoryWeights` — wraps the query for `CategoryWeightsDisplay`.

### 6.3 Extract UI components, write stories and unit tests
- `DailyPollContainerUI` — receives score, upgrade cards, evaluation context, submission handler as props.
- `CategoryWeightsDisplayUI` — receives `{ category: string; percentage: number }[]` as a prop.
- `PollOptionsFormUI` — the form is already close; extract the remaining HTML.

### 6.4 Reduce component files to composition only

---

## Phase 7 — Routes (`src/routes/`)

By this phase all domain UI is in `ui/` components. Routes only need to:
1. Read loader data.
2. Call domain composition components or (for simple cases) domain UI components directly.
3. Contain zero HTML/CSS themselves.

Key route files to clean up (identified in analysis):
- `src/routes/_authed/admin.tsx` — move 4 server functions + Drizzle queries to `src/domains/ranking/api/` and an admin handler; convert manual loading state to TanStack Query mutations; extract `AdminPanelUI`.
- `src/routes/start.tsx` — extract `useStartRun` hook for the inline mutation.
- `src/routes/_authed/progress.tsx` — use shared `useDeinstallConfig` hook (from Phase 6.2).
- `src/routes/stats.tsx` — move `computeRunStats` to `src/domains/runs/utils/runStats.ts`.

---

## Phase 8 — Enforce via ESLint

**Only add this after Phase 7 is complete.** At that point there are zero existing violations, so the rule becomes a pure guard against regression rather than a source of CI failures.

Add an ESLint rule (or a custom script) that:
- Flags any file in `src/routes/` or `src/domains/*/components/` that contains an HTML tag or a Tailwind class string.
- Flags any file in `src/ui/` or `src/domains/*/ui/` that imports from `@tanstack/react-query`, `@tanstack/react-router`, or `~/domains/*/api/`.

This makes the architectural constraint machine-checkable so it cannot regress silently.

---

## Definition of Done (per phase)

- [ ] All HTML/CSS for the scope is in `src/ui/` or `src/domains/*/ui/` files
- [ ] Every extracted UI component has a Storybook story seeded from a mock factory
- [ ] Every extracted UI component has a Testing Library unit test asserting on visible output
- [ ] Chromatic accepts the new/changed snapshots
- [ ] Composition components in scope contain zero HTML tags and zero Tailwind classes
- [ ] `npm run build` passes
- [ ] `npm test` passes
