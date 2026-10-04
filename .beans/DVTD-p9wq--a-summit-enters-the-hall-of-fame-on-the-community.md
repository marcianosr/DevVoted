---
# DVTD-p9wq
title: A summit enters the Hall of Fame on the community page
status: completed
type: feature
priority: normal
created_at: 2026-10-04T11:23:29Z
updated_at: 2026-10-04T11:34:32Z
parent: DVTD-kulw
blocking:
    - DVTD-g1p0
---

**What:** The community page shows the reigning champion's card with the moment they won, and every win before it.

**Why:** A win should be seen by everyone, not just banked.

## Done when
- [x] The community page shows the last player to win, as their full card, with the date and time of the win
- [x] Below it, every win is listed newest first, one row per win
- [x] A run that did not start at the first gate is not entered
- [x] With no winner yet, the section says so

## Notes
ADR-184 D1 and D2. Part of the victory reward, DVTD-g1p0.

## Summary of Changes

A champions query over finished victories started at gate 0, a public server function that also returns the reigning champion card, a viewmodel with the copy, and a Hall of Fame panel at the top of the community board right column. Stories: HallOfFame and CommunityScreen WithAChampion. Not yet checked in a browser: the running Storybook served a broken stories index.
