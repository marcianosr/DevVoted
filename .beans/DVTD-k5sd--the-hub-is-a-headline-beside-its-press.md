---
# DVTD-k5sd
title: The hub is a headline beside its press
status: completed
type: feature
priority: normal
created_at: 2026-10-08T10:51:42Z
updated_at: 2026-10-08T11:32:23Z
---

**What:** The run hub becomes a two-column page: a headline that states the clock, an action group with one big press and the community faces, and two folding panels for the run so far and the build.

**Why:** The hub led with a press that wore the clock as its label and repeated the nav's strip; a returning player read a menu, not where they stand and what to do.

## Done when

- [x] Waiting: the headline reads `<gate> opens in` over a ticking clock, the shop is the one press, the community row shows faces
- [x] Ready: the headline names the gate, `Continue to <gate>` is the press, the shop is a secondary press beside Community
- [x] Run so far and Build fold; Build draws the weight bar and each config row opens on its description
- [x] The hub draws no strip of its own; the nav carries the track and balance, the run number is an eyebrow
- [x] Stories cover waiting, ready, mid-gate, fresh player, run over, incident, many players
- [x] ADR, wiki and changelog state the change

## Notes

Mock: ~/Downloads/devvoted-run-wait.html. Plan: ~/.claude-work/plans/i-wanna-redeisgn-the-optimized-kernighan.md

## Summary of Changes

- `TodayScreen.ui.tsx` rewritten as a two-column page: headline (eyebrow readout, dashed mark with lock or count, title + ticking clock, subtext), action group (`Action` press, secondary shop `Button`, incidents, refusal, community row with `ClimberStack`), `Fold`ed Run so far (`Panel.Rows`) and Build (`WeightTrack`, folded `ConfigChip` rows, weight free + shop link).
- `todayScreen.viewmodel.ts`: `hubHeadlineFor`, `hubPressFor`, `hubSwatchFor` replace `todayPressFor` + `hubStripFor`; `shopAsideFor` returns null while the shop is the press; `runSoFarFor` takes the clock and quotes nothing while waiting; `HubBuild.held` + row `description`; `TodayCommunity` carries faces + overflow, loses `ahead`; `climbersAtOrPast` deleted.
- `Swatch` gains an `icon` arm; `useNextPollsCountdown` takes a tick and returns `remainingMs`; `formatClock` in dateUtils; `rise-in` + `hub-breathe` keyframes.
- Docs: ADR-194, wiki §2.1 + §8, CHANGELOG Unreleased.
- Verified: tsc clean, `npm run lint` clean, 6079/6079 tests, Storybook screenshots of Waiting + Ready at 1280 and 390.

- Follow-up in the same session: the rise is every run screen's entrance — `Screen enter="rise"` on the eight kit run screens, `screen-rise` class on the hub's grid; Screen spec +2.
