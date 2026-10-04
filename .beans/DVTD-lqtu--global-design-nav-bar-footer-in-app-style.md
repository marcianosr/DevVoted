---
# DVTD-lqtu
title: The nav bar and footer do not match the game
status: completed
type: feature
priority: high
created_at: 2026-08-04T16:30:39Z
updated_at: 2026-09-28T10:55:05Z
parent: DVTD-cb52
---

**What:** Restyle the nav bar and footer in the game's own design system.

**Why:** Strangers see them on every screen, and off-style chrome undercuts the run screens.

## Done when
- [x] Nav bar and footer are built from the design system
- [x] Both work on a phone and on a desktop
- [x] Each has a story

## Notes

The global chrome (nav bar, footer) does not match the game's visual style. Needed for 2.0 launch: strangers see the nav and footer on every screen, so off-style chrome undermines the polished run UI. Scope: restyle nav bar and footer to the app's design system (Tier 1 components in src/ui/).

## Summary of Changes

The bar and footer now wear the theme of the screen under them, closing the last gap: both sit outside the screen section, so neither could read its theme, and the bar had been pinned pewter (ADR-130 D9) as the only move available.

`Screen` publishes its theme through `PageThemeContext`; `RootDocument` holds the state and renders the attribute on `<body>`, which both the bar and the footer inherit. React state rather than a `document.body` write, because a write is forbidden by `Screen.spec.tsx`, contradicts the `.storybook/preview.tsx` house rule, and cannot run before hydration.

- New `src/ui/kanto-theme/usePageTheme.hook.ts` - context, hook, and `pageThemeAttributes` (one attribute at a time; pewter where no screen is mounted)
- `AppNav` drops its pewter pin and moves from the zinc roles to theme grounds; `NavDisclosure` panel follows
- `AcrossGates` and `AcrossThemes` sweeps added to `AppNav.stories.tsx`
- ADR-133 written; ADR-130 D9 reversed, ADR-020 D2 corrected, ADR-010 narrowed to data hooks, stale `app.css` comment fixed

Verified: 4431 tests pass (227 files), 0 TypeScript errors, lint and dependency-cruiser clean.

The footer fix was a bug found on the way: it was already built from theme utilities but resolved against the `:root` cerulean, so it had been subtly blue on every screen.
