---
# DVTD-l375
title: Poll access is one rule and authoring is one hook
status: completed
type: task
priority: normal
created_at: 2026-10-01T18:29:06Z
updated_at: 2026-10-01T18:36:20Z
parent: DVTD-y3vn
---

**What:** Who may see or edit a poll is decided by one rule, the screens learn whether you administer polls from the poll data itself, and creating or editing a poll goes through one hook.

**Why:** The rule was written inline in two server functions, admin status reached the client from three places, and create and edit each wired their own save and refresh.

## Done when

- [x] One tested rule decides which polls a session sees and whether it may edit them
- [x] Every poll read and write goes through that rule
- [x] Admin status reaches the poll screens only inside the poll data
- [x] Create and edit save, refresh and navigate through one hook
- [x] No service is left that only forwards a repository call

## Notes

Scope: src/modules/polls/poll and src/modules/polls/authoring. Delete hasAnswered (no reader), hasPollAdminAccess, the pass-through services, and the repeated field mapping between server function, service and repository. Query reads use useApiQuery.

## Summary of Changes

- New domain rule `poll/domain/pollAccess.model.ts` (`pollScopeOf`, `isInPollScope`, `maySeePoll`, `canAdministerPolls`, `ACCESS_DENIED`) with 12 tests.
- `poll.service.ts` is now `listPollsFor(viewer)` and `pollDetailFor(viewer, id)`, both carrying `canAdminister`. The repository list read takes a `PollScope` (`fetchPollsIn`); `fetchAllPolls`, `fetchPollsByUser` and `hasUserAnsweredPoll` (no reader) are deleted.
- Server functions renamed `getPollDetail` / `getPollList`; they only authenticate and hand the session to a service. Published count and creators call the repository through `handleApiOperation` directly (pass-through services deleted).
- Authoring: `suggestPoll` (forces draft, author from session) and `editPoll` (refuses a non-admin). `updatePoll` validates with `updatePollSchema` instead of an inline copy; services no longer re-parse. `hasPollAdminAccess` and the `adminAccess` query key are deleted. The repository has one column mapper for insert and update.
- `usePollAuthoring(pollId?)` owns save, invalidation and navigation for create and edit; no `router.invalidate()` (no poll route has a loader).
- Every touched query reads through `useApiQuery`.
- ADR-164 records the decision.
