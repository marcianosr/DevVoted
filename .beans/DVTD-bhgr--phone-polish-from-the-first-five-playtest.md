---
# DVTD-bhgr
title: Phone polish from the first-five playtest
status: completed
type: task
priority: normal
created_at: 2026-10-02T11:33:49Z
updated_at: 2026-10-02T11:44:40Z
---

**What:** Seven phone-width fixes across new run, prep, gate result and community screens.

**Why:** On a phone the screens scroll from the wrong place, open every card and wrap rows that fit on one line.

## Done when
- [x] The warm boot panel sits last on a phone, and every config card arrives folded there
- [x] Moving to the next screen on a phone starts at the top
- [x] The gain per answer reads as single choice and multiple choice figures
- [x] A gate's score row and the community controls sit cleanly on a phone
- [x] A flat payout on the gate result names its config as a chip

## Notes
Screenshots from a 390px playtest (2026-10-02).

## Summary of Changes
- New run grid: warm boot is the last DOM child, placed under the build from md up via grid rows auto/1fr.
- useDisclosure folds open-by-default cards below 48rem (useIsSmallScreen, useSyncExternalStore, server snapshot = wide).
- PollView scrolls to the top on a small screen when the poll id changes; route changes already reset via the router (verified headless at 390px).
- CHOICE_LABEL in shared copy feeds the prep brief, the gate result note and the Scoring column.
- PollScores score no longer forced onto its own line; CommunityScreen controls are a full-width grid on a phone.
- LedgerRow gains a config chip; flat clear payouts use it.
