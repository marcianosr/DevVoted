---
# DVTD-l6yi
title: An admin walks the poll list without losing their place
status: completed
type: feature
priority: normal
created_at: 2026-10-06T12:40:34Z
updated_at: 2026-10-06T13:22:56Z
---

**What:** The poll list keeps its filters in the URL, a poll steps to the one before or after it in that list, "Save & next" opens the next poll's form, and each poll can be marked reviewed.

**Why:** Reviewing all 478 polls one by one reset the filters on every visit and left no record of which polls were done.

## Done when
- [x] Leaving and returning to the poll list keeps every filter
- [x] A poll's page and form step to the previous and next poll in the filtered list
- [x] Saving with "Save & next" opens the next poll's form
- [x] A poll can be marked reviewed, and the list filters on reviewed

## Notes
- Filters live in validateSearch on /polls, /polls/$pollId and /polls/$pollId/edit (pollListSearchOf).
- The list order gained an id tie-break: seeded polls share a created_at, so ties came back in arbitrary order.
- reviewed_at is separate from updated_at, which status changes and author payouts also bump.

- Routes may import presentation only, so each route passes its raw search through and the component parses it.
- The edit form is keyed by poll id: stepping between edit routes reuses the component, and the form state would otherwise keep the previous poll.
- Not browser-checked locally: applying the migration to the local DB was blocked in-session.

## Summary of Changes

Shipped in v2.0.7 (PR #120). The poll list's filters live in the URL, a poll's page and form step through the filtered list, Save & next saves, stamps reviewed_at and opens the next form, and the list gained a reviewed filter and badge. The migration applied to production on merge.
