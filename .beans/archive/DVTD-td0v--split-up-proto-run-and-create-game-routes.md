---
# DVTD-td0v
title: Split up proto-run and create game routes
status: scrapped
type: task
priority: normal
created_at: 2026-07-24T15:06:29Z
updated_at: 2026-08-26T12:53:45Z
parent: DVTD-82c4
---

Refactor proto-run into modular components and establish proper routing structure for the game flow

## Proto-Run Cleanup

### Remove Proto Components
- [ ] Deprecate/remove src/routes/proto-run.tsx (no longer needed)
- [ ] Migrate any working prototypes to real run implementation
- [ ] Remove stub/placeholder implementations
- [ ] Clean up test files for removed proto routes

### Extract Reusable Logic
- [ ] Identify shared patterns used in proto-run
- [ ] Extract into proper modules (src/modules/run)
- [ ] Ensure no duplication between proto and real implementations
- [ ] Update imports across codebase

## Game Routes Structure

### Main Game Routes
- [x] /run - Enter a new run (loadout → start)
- [ ] /run/:id - Active run gameplay
- [ ] /run/:id/game - Game screen (answering polls)
- [ ] /run/:id/results - Run end screen / game over
- [ ] /run/:id/review - Poll review (answer explanation)
- [x] /run/community - Leaderboard / community view

### Hub/Meta Routes
- [ ] /hub - Main hub (shows vault, configs, stats)
- [ ] /hub/configs - Config dex / encyclopedia
- [ ] /hub/upgrades - Upgrade configs screen
- [ ] /hub/stats - Player stats / achievements
- [ ] /shop - Seasonal shop (if applicable)

### Nested Layouts
- [x] /(_authed) - Protected routes (require authentication)
- [x] Use TanStack Router layout groups properly
- [x] Preserve layout state during navigation

## Route Organization

### File Structure
- [ ] src/routes/_authed/run.tsx (index)
- [ ] src/routes/_authed/run.game.tsx (game screen)
- [ ] src/routes/_authed/run.results.tsx (end screen)
- [ ] src/routes/_authed/run.community.tsx (leaderboard)
- [ ] src/routes/_authed/hub.tsx
- [ ] src/routes/_authed/hub.configs.tsx
- [ ] Continue pattern for other routes

### Presentation Layer
- [ ] Organize presentation components by route:
  - src/modules/run/presentation/screens/GameScreen.component.tsx
  - src/modules/run/presentation/screens/ResultsScreen.component.tsx
  - src/modules/hub/presentation/ConfigDex.component.tsx
  - etc.

## Navigation Flow
- [x] Define transitions between routes
- [x] Handle back/forward navigation
- [x] Preserve run state during navigation
- [ ] Clear data on run completion

## Testing
- [x] Route navigation tests (runRoutes.viewmodel.spec + RunLayout.component.spec)
- [ ] Layout persistence tests
- [x] Deep linking verification (deep link self-corrects to run status)
- [ ] Mobile back-button handling

## Implementation notes (2026-07-25)

Game routes shipped **without `:id`** — the server resolves today's run from the session; an id adds deep-link surface with no use until run history/spectating exists.

Actual structure (per-screen routes, server-owned status — the URL is a projection of `RunStatus`, never a second source of truth):

- `/run` layout (`run/route.tsx`): owns the query, renders the HUD, runs `useRunRouteSync`
- `/run` index → start screen; `/run/configure`, `/run/answer`, `/run/reward`, `/run/shop`, `/run/strip`, `/run/over` → one route per screen (`rewarding` spans reward+shop)
- `/run/community` via `run_.community.tsx` — escapes the layout on purpose (no HUD, and the status sync must not redirect the detour)
- `routesForStatus` (`view/runRoutes.viewmodel.ts`) maps status → allowed routes; the layout redirects with `replace: true`
- `RunGame.component.tsx` dissolved into per-screen Tier 2 components + `useTodaysRun.hook` / `useRunActions.hook`

Still open: hub routes, proto-run removal, run-over data clearing.
