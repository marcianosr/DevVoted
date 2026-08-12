---
# DVTD-o6n3
title: 'Group A: RunAction is defined twice with no type link'
status: todo
type: bug
priority: high
created_at: 2026-08-12T09:11:30Z
updated_at: 2026-08-12T09:11:30Z
parent: DVTD-82c4
---

The run action union exists twice and nothing connects the two definitions.

- `climb/run.model.ts:196-217` — `RunAction`, 17 variants
- `validation/schemas.validation.ts:14-42` — `runActionSchema`, `z.discriminatedUnion`, 17 variants

`schemas.validation.ts:1` imports **only zod**. There is no `satisfies`, no
`z.ZodType<RunAction>`, no import of `RunAction`. Add an 18th variant to the
engine and it compiles cleanly, then fails validation at the wire with no
compile-time warning.

Worse: `RunActionInput = z.infer<...>` (`schemas.validation.ts:44`) is what
`useRunActions.hook.ts` types against. The client action type derives from the
schema, not from the engine, so the engine is not the source of truth for its
own action contract.

Related dead surface: the `drop` action (`run.model.ts:216`) is fully
implemented, validated and client-reachable, but dispatched by no component.

Previously surfaced in the scrapped DVTD-wz1b ("single source for RunAction
contract (zod/TS twins)") and never fixed.

## Todo
- [x] Bind the schema to the union so drift is a compile error
- [x] Re-point `RunActionInput` at the engine type
- [ ] Delete `drop`, or wire it up and give it a caller
