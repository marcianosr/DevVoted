---
# DVTD-dgee
title: An approved poll tells its author
status: completed
type: feature
priority: normal
created_at: 2026-10-05T09:58:51Z
updated_at: 2026-10-05T10:31:29Z
---

**What:** The first time an admin publishes a poll a player suggested, the author's next visit opens a dialog naming the poll and showing their archived storage grow by the reward.

**Why:** The reward for suggesting a poll lands silently today, so it never lures anyone into suggesting another.

## Done when

- [x] An author sees the dialog once, on the visit after their poll is first published
- [x] The dialog names every poll published since their last visit and the summed reward
- [x] Archived storage counts up from before to after inside the dialog
- [x] Admins and polls published before this shipped never raise it
- [x] The wiki, ADR-185 and the changelog state it

## Notes

- Plan: mirror the title-grant notice (user_titles.announced_at, TitleAnnouncement, Modal). New column polls.author_announced_at, backfilled from author_paid_at.
- Before is derived from the current balance (after minus reward), not stored.

## Summary of Changes

polls.author_announced_at (guarded migration, backfilled from author_paid_at) gates a one-time dialog on the visit after a poll is first published. It names every poll published since, sums the reward, and counts archived storage up from before to after. Admins get nothing. Waits behind a title grant.
