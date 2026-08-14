---
# DVTD-iide
title: userSync.service does raw DB work — move to queries layer
status: completed
type: task
priority: low
created_at: 2026-07-17T09:22:38Z
updated_at: 2026-08-13T11:13:57Z
parent: DVTD-82c4
---

src/domains/users/services/userSync.service.ts imports db/schema/drizzle directly instead of going through a queries file — the only runtime violation of ADR-002's dependency rule. It carries an explicit exception in .dependency-cruiser.cjs (rule engine-stays-pure-no-db); remove the exception when fixed. Legacy domains/users — consider folding into its module migration instead of fixing in place.

## Summary of Changes

Closed as part of the DVTD-wj1t account slice.

`userSync.service` moved to `src/modules/account/auth/application/` and its raw Drizzle work split into `auth/infrastructure/user.repository.ts` (`findUserById`, `findUserByEmail`, `insertUser`), with row-to-domain mapping inside the repository per ADR-002.

The `userSync\.service\.ts$` exception in `legacy-engine-stays-pure-no-db` is deleted, so that rule is unconditional again.

Its spec was three type-literal tautologies; replaced with four behavioural cases including the concurrent-insert race the fallback exists for.
