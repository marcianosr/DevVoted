---
# DVTD-65yi
title: The score halves at a gate boundary and nothing says why
status: completed
type: bug
priority: high
created_at: 2026-09-14T15:37:12Z
updated_at: 2026-09-14T15:46:57Z
---

Clear Pallet on 2.1 units and the debrief reads 42%. The shop, one press later, reads 21%. Coverage is `units / scoringSlotsAt(gate)` and `scoringSlotsAt(gate) = 5 * (gate + 1)`, so clearing Pallet opens Boulder's five slots and the same score is divided by ten.

Both numbers are correct (ADR-073 Decisions 1 and 3). The defect is that no screen says the ruler changed, so the player reads a halving as a loss.

## Fix shape

The shop states what the next gate costs in answers, reusing `answersOwedFor` (prep already speaks this sentence). The debrief names the next gate's slot count via `CoverageBar.note`, a prose slot that was built, tested and never wired.

## Todo

- [x] `NextGate.ui.tsx`: `note?: string` in a `PanelV2.Footer`
- [x] `shopScreen.viewmodel.ts`: build the note via `answersOwedFor`; round `demand` (gate 5 renders 55.00000000000001%)
- [x] `ShopView.component.tsx`: pass `perAnswer.coveragePerCorrect`
- [x] `GateOutcomeView.component.tsx`: `bar.note` naming the next gate's slots
- [x] Specs for both notes, the float, and a story for the new prop
- [x] ADR-073 Decision 4 and wiki 2.2/2.5/2.8 still describe the dead per-gate reset
- [x] Verify: lint, build, tests, engine probe


## Summary of Changes

The shop's **Next gate** panel now closes with what the gate costs in answers, and the debrief names the slot count ahead, so the 42% -> 21% re-base is bracketed by two screens that explain it instead of two that contradict each other.

Both notes reuse what was already built. `answersOwedFor` is the helper prep has been using for this sentence all along; `CoverageBar.note` was built, tested, storied and passed by zero production viewmodels until now.

### Files

- `src/ui/kanto-theme/NextGate.ui.tsx` - `note?: string` in the previously unused `PanelV2.Footer`
- `src/modules/run/shop/application/shopScreen.viewmodel.ts` - `owedNoteFor` over `answersOwedFor`; `nextGateFor` takes the per-answer gain; `demand` now rounded
- `src/modules/run/shop/presentation/ShopView.component.tsx` - passes `perAnswer.coveragePerCorrect`
- `src/modules/run/gate/application/gateOutcome.viewmodel.ts` - `bar.note` naming the next gate's slots, suppressed on a won run and on a gate that did not clear
- `src/test/kantoPoll.factory.ts` - `kantoNextGateAt` threads the gain
- Specs: 5 on `NextGate`, 3 on `GateOutcomeView`, 1 end-to-end on `ShopView`; a 5th `NextGate` story for the out-of-reach branch
- `docs/adr/073`, `docs/wiki.md` 2.2 / 2.5 / constants

### The three note branches

| `answersOwedFor` | Note |
| --- | --- |
| `1..5` | `1 of the 5 right clears it.` |
| `0` | `The run already holds this line.` |
| `undefined` | `5 of the 5 right will not reach it.` |

### Docs corrected

ADR-073's title and Decision 4 described ADR-035's per-gate meter, the opposite of what shipped, which is the origin of the confusion. Decision 4 is now "The denominator is every slot the run has opened". Also removed: the spillover config (does not exist in `src`), the `LOSS_LADDER` miss cost (does not exist; there is no loss term at all), and the perfect window's 1.5x (stated, not routed). Wiki 2.2 and 2.5 said the meter resets every attempt and that a wrong answer bleeds; the constants table listed `LOSS_LADDER` and omitted `scoringSlotsAt` and `STREAK_UNIT_STEP`. The 2.5 drift note is resolved and gone.

### Verified

lint clean (1 pre-existing warning), `npm run build` clean, 4346 passing. The 2 `gate.model.spec.ts` failures are the pre-existing unimplemented floor rule (DVTD-xl63). Browser click-through did not run: chrome-devtools MCP has a profile conflict and the claude-in-chrome extension is disconnected. Covered instead by a `ShopView` spec driving the real reducer end to end.

### Follow-ups filed

Old-theme copy still teaching the per-gate meter; the unreachable perfect bonus; ADR-035 and ADR-013 staleness; the dead `rightsToClear` family.
