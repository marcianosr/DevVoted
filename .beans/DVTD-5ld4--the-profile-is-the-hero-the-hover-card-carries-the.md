---
# DVTD-5ld4
title: The profile is the hero, the hover card carries the record
status: completed
type: feature
priority: normal
created_at: 2026-10-03T19:16:15Z
updated_at: 2026-10-03T19:25:02Z
---

**What:** The profile page shows only the hero, and the card that opens on a hovered face gains the player's swatches and poll counts.

**Why:** The page stacked too many panels under the hero; the look matters most, and the record belongs on the card players actually hover.

## Done when
- [x] A player's own profile shows the hero, then the tabs opening on Appearance
- [x] Another player's profile shows the hero only
- [x] The hover card shows every swatch the player earned
- [x] The hover card and the hero say how many polls the player answered, and how many they published when they have
- [x] The decision is recorded in an ADR amendment, the wiki and the changelog

## Notes
Amends ADR-180. Plan: ~/.claude-work/plans/im-bothered-by-the-piped-rain.md

## Summary of Changes

- Profile page renders the hero only; owner keeps the tabs (Appearance first).
- Contribution line states polls answered for every player, author half only when published.
- Hover card carries the swatch track (gatesClearedBy owned swatches) and the poll counts.
- ADR-180 amended, wiki 6.7 and changelog updated.
- Not done: deleting the now-unrendered ProfileBestRun/Seats/Climbing/Collection and their viewmodel functions (another session's uncommitted files). Not visually verified: Storybook index returns 500.
