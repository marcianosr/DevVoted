---
# DVTD-1xmk
title: Community poll results read cleanly on a phone, and a finished run can review its answers
status: completed
type: bug
priority: normal
created_at: 2026-10-06T09:02:24Z
updated_at: 2026-10-06T09:13:50Z
---

**What:** The community poll results drop clutter on a phone (vote counts, the You badge, the pb label), stack voters under the bar, lift the verdict badges above the question, and a dead or won run can review its last gate's answers.

**Why:** On a phone the question was squeezed to a narrow column by two side badges and two side columns, and a player whose run had ended had no way back to the answers that ended it.

## Done when
- [x] A dead or won run shows Review answers on the community board, and its back press returns to the run's result
- [x] The You badge and the pb label are gone from every screen
- [x] On a phone, poll results hide the vote count and wrap voter faces under the bar
- [x] On a phone, the verdict and share badges sit above the question
- [x] Tests, lint and build pass

## Notes
Plan: ~/.claude-work/plans/some-design-issues-jazzy-sunbeam.md

## Summary of Changes
Finished runs (won/dead) may open the review; its back press returns to the result. PollResult moved to a grid: badges above the question on phones, voters under the bar, vote column sm+ only; category is a badge, the duplicate % right line and the You badge (and the unread yours field end to end) are gone. ClimbMap's pb text replaced by the star with a reader-only label. Changelog and wiki 7.1 updated.

Also in this change: Wiki left the nav bar and account menu (footer only), the wiki wears Pallet, and its articles have tighter spacing (ADR-190 amended).
