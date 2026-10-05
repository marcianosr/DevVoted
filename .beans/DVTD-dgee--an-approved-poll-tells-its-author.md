---
# DVTD-dgee
title: An approved poll tells its author
status: in-progress
type: feature
priority: normal
created_at: 2026-10-05T09:58:51Z
updated_at: 2026-10-05T10:02:35Z
---

**What:** The first time an admin publishes a poll a player suggested, the author's next visit opens a dialog naming the poll and showing their archived storage grow by the reward.

**Why:** The reward for suggesting a poll lands silently today, so it never lures anyone into suggesting another.

## Done when

- [ ] An author sees the dialog once, on the visit after their poll is first published
- [ ] The dialog names every poll published since their last visit and the summed reward
- [ ] Archived storage counts up from before to after inside the dialog
- [ ] Admins and polls published before this shipped never raise it
- [x] The wiki, ADR-185 and the changelog state it

## Notes

- Plan: mirror the title-grant notice (user_titles.announced_at, TitleAnnouncement, Modal). New column polls.author_announced_at, backfilled from author_paid_at.
- Before is derived from the current balance (after minus reward), not stored.
