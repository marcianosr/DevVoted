---
# DVTD-aeqh
title: The real run route gets the prep screen the redesign was built on
status: completed
type: task
created_at: 2026-09-14T15:10:18Z
updated_at: 2026-09-14T15:10:18Z
---

`/run/prep` rendered `src/modules/run/run/presentation/PrepScreen.ui.tsx`, an
older screen with no objectives on it at all, while only `/proto-run` used the
kanto prep. Every objectives change was invisible in the real app.

## Todo

- [x] RunPrep renders PrepView
- [x] PrepView gains onCommunity and startRefusal; onBackToShop becomes optional
- [x] ScreenFooter takes `asides` (a list) so prep keeps both exits
- [x] Delete the now-unreachable legacy prep screen, spec and stories
- [x] RunLayout route spec moved onto the kanto copy
- [x] Objectives detail text drops to text-xs

## Summary of Changes

`RunPrep` is now wiring only: `useTodaysRun`, `useRunActions`, the countdown,
and `PrepView`. The old-theme `Screen` wrapper went with it, since the kanto
`PrepScreen` is a whole screen.

**`ScreenFooter.aside` became `asides`.** One slot could not hold both of prep's
exits, and a route spec caught it: "prep's community nudge reaches the community
board" fails the moment back-to-shop takes the only slot. Five call sites moved
over (gateOutcome x3, prepScreen, GateOutcomeView).

The countdown lock survives as the footer's `refusal`, so a gate you cannot
start says when tomorrow's polls land rather than presenting a dead button.

## Not carried over

- **Dropping a config from prep.** The legacy screen had `BuildChips` with an
  `onDropConfig`; the kanto prep has no build panel by design (ADR-078). Removing
  a config is a shop action now.
- `UpcomingCategories` is covered by the kanto "The five polls" panel.

## Verification

RunLayout.component.spec 14/14, ScreenFooter.spec 20/20, PrepView.spec passing.
`npm test` 4330 passed, 6 skipped, 2 todo, with only the 2 pre-existing
gate.model.spec "floor rule" failures. `npm run lint` clean, depcruise 0
violations.
