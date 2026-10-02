---
# DVTD-ds6z
title: Editing a poll can change another poll's option
status: completed
type: bug
priority: normal
created_at: 2026-10-01T18:14:06Z
updated_at: 2026-10-01T18:15:59Z
parent: DVTD-lk20
---

**What:** Saving a poll only changes options that belong to that poll.

**Why:** The save matched options by their own number alone, so an option number from another poll was rewritten in that other poll.

## Done when
- [x] Saving a poll whose option list names another poll's option leaves that other option unchanged
- [x] Lint, typecheck and tests pass

## Notes
Found in the 2026-10-01 deepening pass. updatePollWithOptions in authoring.repository.ts filtered the per-option UPDATE on pollOptionsTable.id only. updatePoll is admin-only (withAdminUser), so this is a correctness bug, not an auth bypass.

## Summary of Changes

The per-option UPDATE in updatePollWithOptions now filters on the option id AND the poll id, so a foreign option id updates nothing. No unit test: no spec in the repo asserts a Drizzle where clause, and asserting one through a mock tests past the interface. Covered by typecheck only.
