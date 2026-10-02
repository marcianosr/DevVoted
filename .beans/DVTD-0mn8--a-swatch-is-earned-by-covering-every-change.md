---
# DVTD-0mn8
title: A swatch is earned by covering every change
status: completed
type: feature
priority: normal
created_at: 2026-10-02T08:21:11Z
updated_at: 2026-10-02T08:31:01Z
---

**What:** The gate's swatch is earned on a full bar instead of five right answers, and the At stake panel states how many changes the gate ships.

**Why:** Accuracy multiplies the window, so five right is not what a gate asks; covering every change is.

## Done when
- [x] A close at a full bar earns the swatch, whatever the right count
- [x] Five right under a full bar earns no swatch
- [x] At stake states the changes the gate ships, what one right answer covers, and a box per change
- [x] The gate result, the Dex and the wiki state the new rule

## Notes
Plan: ~/.claude-work/plans/add-this-to-stakes-floofy-meerkat.md. The flawless 5/5 floor (isFlawlessGate) stays.

## Summary of Changes

- coversEveryChange (gate.model) decides the stamp in settleGate; changesCoveredAt (coverageRatio.model) is the one count both screens read.
- BandOutcomes gains a changes block (statement, hint, a large swatch per change); swatch objective reads Cover all N changes.
- Gate result Earned row counts changes covered; Dex copy, wiki, CHANGELOG, ADR-170 (080 D1-D2 collapsed to pointers).
- Visual check in Storybook not done: Playwright browser was held by another session.
