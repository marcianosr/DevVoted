---
# DVTD-e5nl
title: Collection counts have one owner
status: completed
type: task
priority: normal
created_at: 2026-10-01T18:30:50Z
updated_at: 2026-10-01T18:42:15Z
parent: DVTD-y3vn
---

**What:** Polls seen, configs held and titles earned are counted by one rule, the same on the profile and the Dex.

**Why:** The profile counted raw history rows and retired titles, so a held count could exceed its total and disagree with the Dex.

## Done when

- [x] Polls seen on the profile equals polls seen on the Dex for the same player
- [x] A held count never exceeds its total
- [x] Configs and titles are counted by the same rule on every surface
- [x] The "seen" definition is written down

## Notes

tally.model.ts in collection/dex/domain owns pollTallyOf, configTallyOf, titleTallyOf. Seen = dealt or answered at least once, in a category the Dex lists. heldOf copies in dexScreen and profileScreen viewmodels collapse into HELD_OF.


## Summary of Changes

- New collection/dex/domain/tally.model.ts: Tally, tallyOf, pollTallyOf, configTallyOf, titleTallyOf.
- polldex.model gains PollSighting, timesSeenOf, isSeenPoll; polldexCoverage and grantedCountIn deleted, their tests moved to tally.model.spec.
- Profile totals are now three tallies; polls read as id + category plus answered counts per poll (new polldex.repository reads), no longer every question.
- Dex and profile viewmodels state tallies through HELD_OF in shared copy; appearance tallies borders and titles by the same rule.
- Seen = dealt or answered at least once, in a category the Dex lists (ADR-166). Wiki and CONTEXT updated. No changelog entry: the profile collection block is unreleased work.
