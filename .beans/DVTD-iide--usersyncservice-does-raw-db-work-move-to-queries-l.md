---
# DVTD-iide
title: userSync.service does raw DB work — move to queries layer
status: todo
type: task
priority: low
created_at: 2026-07-17T09:22:38Z
updated_at: 2026-07-27T14:17:00Z
parent: DVTD-82c4
---

src/domains/users/services/userSync.service.ts imports db/schema/drizzle directly instead of going through a queries file — the only runtime violation of ADR-002's dependency rule. It carries an explicit exception in .dependency-cruiser.cjs (rule engine-stays-pure-no-db); remove the exception when fixed. Legacy domains/users — consider folding into its module migration instead of fixing in place.
