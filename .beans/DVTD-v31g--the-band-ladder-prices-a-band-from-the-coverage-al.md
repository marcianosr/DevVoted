---
# DVTD-v31g
title: The band ladder prices a band from the coverage already held
status: completed
type: bug
priority: normal
created_at: 2026-10-14T14:53:15Z
updated_at: 2026-10-14T14:58:58Z
---

**What:** The At stake ladder quotes what a band pays at the right answers the run actually needs from where it starts the gate.

**Why:** A run that starts with a head start reaches a band in fewer right answers and was paid less than the ladder promised.

## Done when
- [x] A clearing band is priced from the coverage the run already holds
- [x] A run with no head start reads the same figures as before
- [x] The changelog names the fix

## Notes
answersToLand in bandOutcomes.viewmodel.ts counted answers from 0% coverage. Estimate units are still left out of the price; they only apply when an estimate is committed.

## Summary of Changes

answersToLand now counts the right answers owed from the frame's held coverage instead of 0, so each clearing rung quotes the payout at the answers the run actually needs. Two specs pin it: one answer short prices one answer, a line already stood on prices none.
