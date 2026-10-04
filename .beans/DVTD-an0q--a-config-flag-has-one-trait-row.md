---
# DVTD-an0q
title: A config flag has one trait row
status: todo
type: task
priority: normal
created_at: 2026-09-25T19:45:50Z
updated_at: 2026-09-25T19:45:50Z
parent: DVTD-y3vn
---

**What:** Every optional config flag has one row naming its axis, its online test and its skip reason, and a new flag without a row fails to compile.

**Why:** Adding a flag today means editing the roster, the type, two predicate tables and the seed's archetype pools by hand, and nothing catches a missed edit.

## Done when
- [ ] Status and skip reasons are read from the trait table and every existing status spec passes unchanged
- [ ] A flag without a trait row is a compile error
- [ ] The seed's archetype pools derive from the trait axis and produce the same builds as before
- [ ] The config status module has its own spec, including a sweep over every roster entry

## Notes
Plan section "Slice 6" (6a). `FLAG_TRAITS satisfies Record<FlagKey, FlagTrait>` in `configStatus.model.ts` with an explicit `order` field (unique; OR groups become adjacent rows emitting the same literal). The `coverage !== undefined` short-circuit stays outside the table. `configsOnAxis(axis)` feeds `seed/cast.ts`. Move the five `configStatusFor` describes from `effect.model.spec.ts` verbatim. `SKIP_WORDS` untouched; all eight per-flag models stay. Fix the CONTEXT.md "Config status" row (it names the wrong file).
