---
# DVTD-i16m
title: An admin sees when a poll was reviewed and whether it changed since
status: completed
type: feature
priority: normal
created_at: 2026-10-07T09:01:14Z
updated_at: 2026-10-07T09:07:05Z
---

**What:** The poll list and detail state when a poll was last reviewed and updated, filter on never reviewed, changed since review or up to date, and the account menu links admins to the admin page.

**Why:** A reviewed flag goes stale the moment a poll is edited; the admin needs a re-review queue and a way to reach the admin page.

## Done when
- [x] An admin reaches the admin page from the account menu
- [x] Marking a poll reviewed or paying its author no longer counts as an update
- [x] The list filters on never reviewed, changed since review and up to date
- [x] List rows and the detail page state the last review and update dates
- [x] A poll edited after its review can be marked reviewed again

## Notes
- updated_at carried $onUpdate, so markPollReviewed, payAuthorOnFirstPublish and markPollsAnnounced all bumped it; past reviews polluted it, backfilled by migration.

## Summary of Changes

- Account menu gains an Admin row for admins (NavViewer.adminHref).
- Bookkeeping writes on polls preserve updated_at; migration 20261007130000 backfills polls whose update was the review itself.
- reviewStateOf in poll.model: never / changed / current. List filter, badges (changed = vermillion), and review/update dates on list rows and the detail footer; Mark reviewed returns for a changed poll.
