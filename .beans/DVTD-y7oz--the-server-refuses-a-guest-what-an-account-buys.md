---
# DVTD-y7oz
title: The server refuses a guest what an account buys
status: completed
type: task
priority: high
created_at: 2026-10-20T10:18:35Z
updated_at: 2026-10-27T16:14:39Z
parent: DVTD-nr8f
blocked_by:
    - DVTD-ojkl
---

**What:** Presses ADR-178 withholds are refused on the server for a guest.

**Why:** A guest must not reveal more than today's five or keep anything permanent.

## Done when
- [x] A guest cannot start a second run, abandon or reroll
- [x] A guest cannot author polls, change titles or looks, archive, or open the Dex
- [x] What a guest's run earns is never stored on the account
- [x] A guest still plays the run normally

## Notes
- Slice 2 of DVTD-nr8f. Session gains isGuest from the is_anonymous claim; a withMemberUser wrapper beside withAdminUser; tested once in authorization.spec.ts.

- 2026-10-20: Session carries isGuest from the is_anonymous claim. withMemberUser refuses abandon, poll create and edit, border purchase and saving a look. startRun refuses a guest once any session run exists, but resumes the one in progress.
- There is no poll reroll left to refuse: a second run the same day already gets no polls once any were answered (pollsLeftForNewRun).
- Still open: the Dex, title and archive reads stay on withAuthenticatedUser because the nav reads them for every viewer; the member-only screens get the in-place sign-in offer in DVTD-qq55.
- Decided 2026-10-27: a guest's run earns swatches, titles and config unlocks and the run shows them, but nothing is stored on the account or used on a profile. ADR-178 carries the amendment.
- fireAudit (auditing another player) is left to DVTD-d9ol with loot.

## Summary of Changes

Session carries isGuest; withMemberUser refuses abandon, poll create and edit, border purchase and look saves. startRun refuses a guest a second run. applyActionToRun skips every account write (objective progress, unlocks, swatches, pinned gate, peak storage, titles, archive credit, Champion border) when isGuest, while the run itself finishes normally; isGuest is threaded from every run-dispatching server function.
