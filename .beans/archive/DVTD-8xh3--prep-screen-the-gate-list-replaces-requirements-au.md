---
# DVTD-8xh3
title: 'Prep screen: the gate list replaces Requirements, Audits and Prefetch'
status: completed
type: task
priority: normal
created_at: 2026-09-03T20:28:48Z
updated_at: 2026-09-04T07:14:32Z
---

Mock-driven: one list per the NEXT WINDOW design.

- [x] Section headed by the gate name plus its unearned (pending) swatch
- [x] Rows gate / target / polls / poll type / audits / categories, lowercase and unbulleted
- [x] Audits fold in as a row, suppressed ones still struck and marked reported passing
- [x] Prefetch's categories fold in, next gate row when known

## Summary of Changes

`PrepScreenProps.required` + `audits` became one `window` prop: `{ title, swatch?, gate, target, polls, pollTypes?, audits, categories?, nextCategories? }`. `Section` gained a `mark` slot between the caret and the label, which is where the swatch sits.

The audits row renders `PrepAudit[]` rather than a string so a suppressed audit keeps its strike and its "reported passing" note (ADR intent recorded in PrepView.spec: hiding a defeat device hides the payoff the config was bought for). The Audits block itself no longer renders on prep, so an audit's cue text is now only on the poll screen.

## Follow-up: the list regroups

Gate row removed (the header and swatch track already carried it). Order is now target / polls / type / categories / (next gate) / audits, with the three draw rows indented one step under polls via a `pl-4` on the Row — trailing values stay right-aligned because Row's trailing is `ml-auto`, so only the labels move. `poll type` shortened to `type` now that its parent row names the polls.
