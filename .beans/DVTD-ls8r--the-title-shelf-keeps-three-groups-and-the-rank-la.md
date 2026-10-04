---
# DVTD-ls8r
title: The title shelf keeps three groups and the rank ladder joins it
status: completed
type: feature
priority: normal
created_at: 2026-09-29T08:40:51Z
updated_at: 2026-09-29T08:50:43Z
---

**What:** The title shelf drops twenty-five titles, gains the fourteen poll-count rungs as earnable titles, and is split into Poll count, Category and Other.

**Why:** The second roster read as noise, and the rank names had nowhere to be collected or worn.

## Done when

- [x] The twenty-five named titles are gone from the shelf and no account is left wearing one
- [x] Every poll-count rung is a title earned at its polls-answered threshold, and its name is hidden until earned
- [x] The shelf shows three labelled groups: Poll count, Category, Other
- [x] Existing accounts already past a rung hold that title without playing again

## Notes

Removed: Heisenbug, No Estimates, Warm Path, 99.9%, Green Build, Six Nines, Touch Grass, Force Push, Semver Major, All Green, Zero Warnings, Completer, Summit, Flawless, First Ascent, Off By One, Chaos Monkey, Nuke It From Orbit, Technical Debt, Feature Flag, Negative Test, Fire Sale, Backup Strategy, Serverless, node_modules.

Amends ADR-134 Decision 6: a rung is a threshold title that accumulates; the rank line on the card stays derived.

## Summary of Changes

Retired 25 titles plus the race and every-category earn kinds and the run-streak emissions. The 14 rank rungs are threshold titles on polls-answered (ids title-rank-*), named only once earned. TitleShelf renders three derived groups. Migration 20260929120000 strips retired ids from equipped_title_ids before deleting rows, then backfills rungs as announced. ADR-140 replaces ADR-134 D6; wiki 6.6 and CHANGELOG updated. Left in place: the user_titles.exclusive column and its index (always false now).
