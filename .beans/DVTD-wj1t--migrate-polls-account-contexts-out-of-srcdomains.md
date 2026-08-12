---
# DVTD-wj1t
title: Migrate polls + account contexts out of src/domains
status: todo
type: task
priority: normal
created_at: 2026-08-12T19:52:09Z
updated_at: 2026-08-12T19:52:09Z
---

Follow-up to DVTD-36ct, which migrated run, collection and shared. What remains is src/domains legacy: polls context (poll reads, answer evaluation, authoring — domains/polls) and account context (auth, profile — domains/users), plus domains/economy and domains/runs which are mostly reachable only via the /old routes that DVTD-7q8l deletes.

Order matters: let 7q8l delete the /old surface first, then migrate what is still alive. Per CLAUDE.md the default remains migrate-a-slice-when-you-touch-it, not wholesale.

## Todo
- [ ] After 7q8l: inventory what in src/domains is still imported by live routes
- [ ] account: domains/users -> modules/account/{auth,profile}
- [ ] polls: domains/polls -> modules/polls/{poll,authoring}
- [ ] Retire the legacy-* dependency-cruiser rules as each slice lands
