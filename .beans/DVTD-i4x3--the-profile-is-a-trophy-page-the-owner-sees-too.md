---
# DVTD-i4x3
title: The profile is a trophy page the owner sees too
status: completed
type: feature
priority: normal
created_at: 2026-10-03T18:39:37Z
updated_at: 2026-10-03T18:50:35Z
---

**What:** Redesign the profile page so one hero leads (face, trophies, swatch track), followed by best run, seats, climbing, run history and collection, and show the same showcase on your own page.

**Why:** The page has no hierarchy and the owner, its main audience, never sees their own trophies.

## Done when
- [x] A hero card leads the page with three trophy figures and the swatch track
- [x] The best finished run has its own panel
- [x] Seats show only when held
- [x] Your own profile shows the same showcase above the Dex tabs
- [x] An ADR records the decision and the wiki and changelog are updated

## Notes
Plan: ~/.claude-work/plans/redesign-the-profile-page-zesty-horizon.md. Supersedes ADR-129 D1 and D5.

## Summary of Changes

ADR-180. New ProfileHero, ProfileBestRun and ProfileSeats (with stories and specs); ProfileRecord deleted. bestRunIn and runsWonIn fold every finished run in the service. ProfileClimbing renders only while a run is open, without the build. Owner page draws hero and highlights above the Dex. Wiki 6.7 and CHANGELOG updated.
