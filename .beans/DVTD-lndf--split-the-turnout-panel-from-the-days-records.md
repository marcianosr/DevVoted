---
# DVTD-lndf
title: Split the turnout panel from the day's records
status: completed
type: task
priority: normal
created_at: 2026-10-12T09:19:28Z
updated_at: 2026-10-12T09:22:51Z
---

**What:** The community board draws how everyone finished and the day's record holders as two panels instead of one long list.

**Why:** The two halves answer different questions, and fifteen rows in one panel read as a single undifferentiated list.

## Done when
- [x] The outcomes panel lists Answered today and the five outcome rows only
- [x] The day's records sit in their own panel directly under it
- [x] The decision record and the wiki describe two panels
- [x] The changelog names the change

## Notes
Amends ADR-176 Decision 2, which had rejected a separate records panel.

## Summary of Changes

The turnout panel is now titled Who cleared what and carries only Answered today and the five outcomes. A new Today's records panel under it draws the eight records. The viewmodel gained recordsFor beside turnoutFor, the screen draws both through one TurnoutPanel, and proto-run passes both. ADR-176 Decision 2 is amended, its rejection of a separate panel is replaced, and the wiki and changelog are updated.
