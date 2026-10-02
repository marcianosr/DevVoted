# ADR-164: Poll access is one rule in the domain

## Status

Accepted — 2026-10-01 (Marciano, DVTD-l375). Applies the CLAUDE.md
authorization rule ("anything a screen needs to know about the caller travels
inside `data`") to the poll authoring screens.

## Context

Who may see or edit a poll was written three times. The detail server function
refused a non-author inline (`!isAdmin && createdBy !== userId`), the list
server function chose between "every poll" and "my polls" inline, and the edit
server function relied on `withAdminUser`. None of the three was testable:
server functions cannot be imported under vitest.

Whether the caller administers polls reached the client from three sources: a
dedicated `hasPollAdminAccess` server function (one extra round trip, used only
by the edit screen), an `isAdmin` beside the list, and an `isAdmin` beside the
detail.

## Decision 1: one pure rule decides visibility and editing

`poll/domain/pollAccess.model.ts` owns it. `pollScopeOf(viewer)` answers which
polls a session sees (`every` for an admin, `authoredBy` for anyone else);
`maySeePoll` is that scope applied to one poll, so the list and the detail
cannot disagree; `canAdministerPolls` decides editing. The repository takes a
`PollScope` (`fetchPollsIn`), so the list query is built from the same rule.

Editing stays admin-only, even for a poll's own author. The rule says so out
loud instead of leaving it to which wrapper a server function picked.

## Decision 2: the services apply the rule, the server functions only authenticate

Every poll server function runs inside `withAuthenticatedUser` and hands the
`Session` to a service (`listPollsFor`, `pollDetailFor`, `suggestPoll`,
`editPoll`), which applies the rule. A refusal is an `ApiResponse` failure, not
a thrown error, so it is not reported to Sentry. `withAdminUser` is no longer
used here: two places deciding "admin only" is how they drift.

## Decision 3: `canAdminister` travels inside the poll data

The list and the detail both carry `canAdminister`. `hasPollAdminAccess` is
deleted. The edit screen reads the detail it needs anyway and shows the denied
state when `canAdminister` is false or the detail was refused.

## Decision 4: one hook saves a poll

`usePollAuthoring(pollId?)` creates when given no id and edits when given one,
then stales every poll query and opens the poll. It does not call
`router.invalidate()`: no poll route has a loader, so there is nothing for it to
rerun.

## Consequences

- Services that only wrapped a repository call in `handleApiOperation` are
  deleted; the server function calls the repository through
  `handleApiOperation` itself (published count, creators).
- Input is validated once, by the server function's validator. The services no
  longer re-parse.
