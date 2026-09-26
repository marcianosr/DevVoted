---
# DVTD-mcxk
title: Creating a poll silently drops its explanation
status: todo
type: bug
priority: low
created_at: 2026-09-23T09:37:07Z
updated_at: 2026-09-23T09:37:07Z
---

`createPoll`'s validator (`authoring.serverfn.ts`) has no `explanation` field, and `createPollService` does not pass one to the repository — so the explanation typed into /polls/new is discarded on save. The edit screen writes it fine, so the field is reachable, just not on first save.

Pre-dates the ADR-002 migration (DVTD-wj1t): the old `createPollInputSchema` in `domains/polls/api/polls.ts` had the same omission. Carried across unchanged rather than fixed silently.

## Todo

- [ ] Add `explanation` to `createPoll`'s validator in `src/modules/polls/authoring/application/authoring.serverfn.ts`
- [ ] Pass it through `createPollService` to `createPollWithOptions`
- [ ] Cover it in `poll.validation.spec.ts`
