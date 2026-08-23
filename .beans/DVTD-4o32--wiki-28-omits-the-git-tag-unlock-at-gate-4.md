---
# DVTD-4o32
title: Wiki 2.8 omits the git tag unlock at gate 4
status: todo
type: task
priority: low
created_at: 2026-08-23T18:08:18Z
updated_at: 2026-08-23T18:08:18Z
---

Found while checking the Dex Gates mock against the domain (DVTD-gkln).

The "What unlocks when" table in `docs/wiki.md` 2.8 lists Shop/Rebuild, Lock, Extend, the storage rungs and the slots, but never mentions **git tag** (pin). It unlocks at gate 4 and is last sold at gate 10 (`PIN_FROM_GATE = 4`, `PIN_UNTIL_GATE = 10` in `src/modules/run/run/domain/rules.model.ts:142,155`).

Marciano's own Dex mock has it right, which is how this surfaced.

- [ ] Add git tag to gate 4's "Also unlocks" cell, and note it stops at gate 10
