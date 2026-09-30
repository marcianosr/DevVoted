---
# DVTD-euw1
title: A gate asks the window for a minimum, then asks the bands
status: completed
type: feature
priority: high
created_at: 2026-09-29T18:07:29Z
updated_at: 2026-09-30T08:42:34Z
---

**What:** A gate clears only when the window itself scores a minimum of units, counted before the build touches them, replacing the rule that asked for two right answers.

**Why:** A blank window could coast through on a previous gate's cushion while the meter read HEALTHY, the rule was blind to partials, and no screen named it.

## Done when

- [x] A window under the minimum holds the gate; partials count toward it and no multiplier can buy past it
- [x] The stakes panel states the rule before the window, and the debrief names it as the reason the gate held
- [x] The debrief balance moves by what the peel actually charged
- [x] A shut shop names the audit that shut it, and a gate never shows an empty audit list it should have drawn
- [x] A held start press always states why it is held

## Notes

ADR-157. `windowScored(close)` reads `close.baseUnitsThisGate` against
`MIN_WINDOW_UNITS = 2`; hold reason `unscored`. `FLOOR_CORRECT` and
`meetsGateFloor` are deleted, leaving `floorAt(gate)` as the only floor.

The accumulator is a new `GateWindow.baseUnits`, summing `ledger.factors.correct`
(the raw share) per answer. It sits on the window beside `correct` and
`unitsEarned` — the other two numbers the close reads — because `freshWindow`
resets all three together. Summing `answeredThisGate` would also work (it holds
exactly 5 at the hold and is emptied by `finishReward` before the retry, probed),
but it ties the close to the shop exit having run.

Why pre-multiplier: an earlier `unitsThisGate > 0` draft was caught by the
balance simulation in `coverageRatio.model.spec.ts`. A build holding one doubler
went from a 30.6% win rate at p=0.6 to 87.7%. That spec now runs the minimum and
passes on its original `< 0.5` assertion, which is the regression guard.

Consequences accepted: `baseUnits` is net of the `strict` wager; a partial-only
window clears and pays 0 KB; the thinnest clear drops from 40% to 20% of the row.

Also fixed, found tracing the same playtest:

- `storageBeforeClearKb` is now written on the held branch and cleared in
  `resumeClimb`, and `balanceOf` no longer adds the faucet a second time.
- The peel bill reads `peelSlotsRemaining` instead of re-deriving it.
- `ShopView` passes the gate's audits to `ShopScreen`; the two `shopClosed`
  refusals are split; 405 names the incident desk; `rivalsInReach === null` has
  its own copy.
- `createRun` seeds the starting gate's audits and the settlement path backfills
  a missing schedule while in a prep phase.
- `PrepView` derives hold and refusal from one function, so a silent hold is
  unrepresentable.
- The prep Audits panel no longer prints the subscription bill; the shortfall
  warning moved to Subscriptions.

Closes DVTD-s6t1.

## Summary of Changes

Domain: `rules.model` (`MIN_WINDOW_UNITS`, `meetsWindowMinimum`), `gate.model`
(`windowScored`, `GateHoldReason`, `GateClose.baseUnitsThisGate`,
`gateProjectionFor`), `effect.model` (`GateWindow.baseUnits`), `answer.model`,
`runSnapshot.model` (hydration fallback), `strip.model`, `audit.model`.

Application/presentation: `runView.viewmodel` (`scoredThisGate`),
`bandOutcomes.viewmodel` (third objective + live standing line),
`gateOutcome.viewmodel` (reason copy, honest meter, `outcome` band),
`prepScreen.viewmodel`, `shopScreen.viewmodel`, `PrepView`, `ShopView`,
`GateOutcomeView`, `GateOutcomeScreen.ui` (band lifted out of the UI per ADR-010),
`run.service`, `incidentSettlement.service`.

Docs: ADR-157 + index row, wiki §2.2/§2.6/§4/§10, CHANGELOG.

Verified: 5125 tests pass, 4 failures are pre-existing in `look.model`/`look.service`
from another session's in-flight work (`lookRefusalOf` returns null where its spec
expects a refusal code) and are untouched here. `npm run lint` clean, typecheck clean.
