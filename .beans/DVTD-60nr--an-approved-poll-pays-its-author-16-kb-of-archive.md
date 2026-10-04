---
# DVTD-60nr
title: An approved poll pays its author 16 KB of archive
status: completed
type: feature
priority: normal
created_at: 2026-10-04T12:29:30Z
updated_at: 2026-10-04T12:46:27Z
---

**What:** The first time an admin publishes a suggested poll, its author banks 16 KB of archive.

**Why:** Writing polls should pay into the same wallet runs do, so players want to suggest them.

## Done when
- [x] Publishing a poll for the first time credits its author 16 KB of archive
- [x] Republishing a poll never pays again
- [x] Polls published before this pay nothing
- [x] The nav and Your suggested polls state the reward
- [x] Wiki, ADR and changelog say archive has a second source

## Notes
Plan: guarded `polls.author_paid_at` column, set inside `updatePollWithOptions`. Per-answer pay stays in DVTD-ofah.

## Summary of Changes

- `polls.author_paid_at` plus guarded migration that stamps already-published polls without paying.
- `payAuthorOnFirstPublish` runs inside `updatePollWithOptions`: a guarded update returns the author only on the first publish, then credits `APPROVED_POLL_ARCHIVE_KB` (16).
- Nav suggest link reads `Suggest a poll · +16 KB`; Your suggested polls states the reward.
- ADR-185, wiki §6.1 / §7.5 / numbers table, changelog.
