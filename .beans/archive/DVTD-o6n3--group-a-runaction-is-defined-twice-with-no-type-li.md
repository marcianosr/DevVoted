---
# DVTD-o6n3
title: 'Group A: RunAction is defined twice with no type link'
status: completed
type: bug
priority: high
created_at: 2026-08-12T09:11:30Z
updated_at: 2026-08-12T20:22:42Z
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
- [x] Delete `drop`, or wire it up and give it a caller (wired to the prep doorstep)

## Summary of Changes

The schema/union binding and the `RunActionInput` re-point landed earlier. This closes the last item.

**`drop` was wired, not deleted.** ADR-027 §3 and §4 design it explicitly ("the prep doorstep's drop", "doorstep-only while answering"), and CHANGELOG already told players the prep screen refuses to drop below the demand. Only the caller was ever missing, so deleting it would have silently reversed an accepted ADR.

- `PrepScreen.ui.tsx`: the pipeline chips are live. Clicking a chip pins a panel carrying a cinnabar `Drop {label}` button — the same click-to-pin pattern the shop uses to install, so no new interaction vocabulary. Two-step on purpose: the drop is irreversible and refunds nothing, so a bare ✕ would be a griefing surface.
- At or under the gate's demand (`configs.length <= max(1, minConfigs)`) the chip loses its button and explains why, mirroring ShopScreen's Uninstall copy. The UI reads `view.minConfigs`, which is the same `minConfigsForGate(gatesCleared)` expression `atMinimumWidth` guards on in the reducer, so the affordance cannot drift from the rule.
- The panel adapts to whether the shop is still open behind prep: while it is, it names Uninstall as the refunding alternative rather than hiding the drop. Prep renders in `rewarding` for the whole normal flow, so hiding it there would have left the action dead in practice.
- `RunPrep.component.tsx` dispatches `{ type: "drop", configId }`; `proto-run.tsx` wired to its local reducer.
- Specs: the old "lists the installed configs as plain chips" test asserted the chips were NOT buttons — it encoded the dead state, so it was replaced by six tests covering confirm-before-drop, the refund warning in both shop states, and both refusal reasons.

Verified: tsc clean, oxlint clean, 0 arch violations (524 modules), 1431 tests passing (+6).
