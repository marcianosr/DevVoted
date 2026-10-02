---
# DVTD-rreq
title: The crowd pick goes through the run commit path
status: completed
type: task
created_at: 2026-10-01T18:29:58Z
updated_at: 2026-10-01T18:29:58Z
parent: DVTD-y3vn
---

**What:** Approving a poll with the room is dispatched, staged and committed like any other answer.

**Why:** The approval ran beside the run actions, so a second press could fire while it was in flight, a refusal vanished, and leaving the poll before Next left the run view stale.

## Done when

- [x] An approval blocks every other run press while it is in flight
- [x] A refused approval tells the player why
- [x] Leaving the poll with an unread reveal still updates the run
- [x] The player still sees the room's answer before moving on

## Notes

useRunActions gains sendCrowdPickWith on the same dispatch mutation; useSubmitCrowdPick is deleted. RunPoll commits a staged reveal on unmount, which also covers a normal answer.

## Summary of Changes

useRunActions has one dispatch mutation over a run request (action or crowd pick); sendCrowdPickWith stages the room's answer. useSubmitCrowdPick deleted. RunPoll states a refusal on the LGTM press (approvalCommitFor takes a refusal) and commits an unread reveal on unmount; useRunCommit is memoised so that effect runs once. ADR-165 D2. No changelog entry: LGTM is unreleased.
