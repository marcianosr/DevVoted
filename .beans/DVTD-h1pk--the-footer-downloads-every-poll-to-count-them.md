---
# DVTD-h1pk
title: The footer downloads every poll to count them
status: completed
type: bug
priority: normal
created_at: 2026-10-01T18:14:06Z
updated_at: 2026-10-01T18:15:59Z
parent: DVTD-lk20
---

**What:** The footer asks the server for one number, the count of published polls, instead of every poll.

**Why:** Anyone, signed in or not, could fetch every poll row, drafts included, through the footer's request; the count also included drafts and archived polls.

## Done when
- [x] The footer's poll count is the number of published polls
- [x] No public request returns poll rows the caller has not been shown
- [x] Lint, typecheck and tests pass

## Notes
Found in the 2026-10-01 deepening pass. getAllPolls in poll.serverfn.ts had no auth wrapper; its only caller was Footer.component.tsx, which read data.length. getUserPollsOrAll keeps the admin all-polls path.

## Summary of Changes

The public getAllPolls server function is gone. getPublishedPollCount (countPublishedPolls → one COUNT query on published polls) replaces it, and the footer reads the number directly under pollQueryKeys.publishedCount (the unused list key went with it). getAllPollsService stays for the admin path in getUserPollsOrAll. No changelog entry: the footer count shipped unreleased.
