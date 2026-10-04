---
# DVTD-ql06
title: The bar names the player and states the clock the press does not
status: completed
type: feature
priority: normal
created_at: 2026-09-27T18:01:40Z
updated_at: 2026-09-27T18:16:50Z
---

**What:** The top bar becomes a kanto surface: a signed-out bar that offers only sign in, a signed-in bar that states the run clock, and an account menu that names who you are before it lists where you can go.

**Why:** The bar is the last pre-kanto surface in the app and it states the wrong things — no clock, no equipped border, and a Daily Run press offered to visitors who can only reach a login wall.

## Done when

- [x] Signed out, the bar offers the logo and a sign-in press and nothing else
- [x] Signed in, the bar states the run press with a live polls-left count, Community, the clock, Suggest a poll, and an avatar wearing its equipped border
- [x] The clock shows on every screen except /run, where the press keeps stating it
- [x] The account menu names the player, their worn title and their archive, and links to Profile and Dex, their suggested polls, and sign out
- [x] The bar is a kit component with a Story and a spec, and the route mounts it without stating any HTML
- [x] An ADR records which surface owns the clock

## Notes

Skipped on purpose: How to play, Settings and Keyboard shortcuts. None has a destination, and the keycaps in the mockup go with them.

The bar carries no storage figure, so the balance keeps its one owner.

## Summary of Changes

The bar is now `AppNav.ui.tsx` in the kit, wired by `Nav.component.tsx`, mounted by the root route. 128 lines of raw JSX left `__root.tsx`.

Signed out it offers the logo and sign in. Signed in it states the run press with a live gate count, Community, the clock, Suggest a poll, and the player's mark wearing its equipped border. The account menu names the player, their title and archive, then Profile and Dex, their suggested polls, sign out.

The clock hook now returns a bare duration so each surface words it; the phrase two of them share moved to shared copy. The archive label and "no title yet" moved to shared so the menu and the profile page state one figure each. ADR-130 records who owns the clock.

Verified: lint clean, no dependency violations, 4351 tests in 224 files pass, build and typecheck clean.

## Deferred

How to play, Settings and Keyboard shortcuts have no destination and were skipped with the keycaps that went beside them.
