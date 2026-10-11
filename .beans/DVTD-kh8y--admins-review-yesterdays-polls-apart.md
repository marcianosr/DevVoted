---
# DVTD-kh8y
title: Admins review yesterday's polls apart
status: completed
type: feature
created_at: 2026-10-08T09:49:37Z
updated_at: 2026-10-08T09:49:37Z
---

**What:** The admin poll list shows yesterday's five dealt polls in their own section above the list.

**Why:** A poll is safe to edit once players have answered it, and yesterday's five are the ones to check first.

## Done when
- [x] An admin sees the five polls dealt yesterday, in dealt order
- [x] A player never sees the section
- [x] Each row opens the poll like any other row
- [x] Wiki and changelog updated

## Notes
The day's five come from daily_run_polls for the previous local date. Replacement polls dealt to a player who had already answered a seed poll are not shown.

## Summary of Changes

listPollsFor takes today and returns yesterday's dealt poll ids for admins only; yesterdaysRowsOf builds rows in dealt order through pollRowsOf; PollList draws a Dealt yesterday panel above the list. dayBefore added to dateUtils.
