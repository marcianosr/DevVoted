---
# DVTD-zu24
title: Redesign the gate outcome screens around the five closing bands
status: completed
type: feature
priority: high
created_at: 2026-09-12T16:48:15Z
updated_at: 2026-09-12T17:08:46Z
---

The kanto kit has two gate screens built before the bands existed:
GateClearScreen and GateHoldScreen. Neither reads a band, neither draws the
coverage bar, and they are near-duplicates sharing zero code (`gain` vs `toll`
are the same shape; LedgerPanel is copy-pasted).

Marciano's mocks show one skeleton across all five bands: hero swatch, headline
figure, gate strip, chips, the band bar, a stack of Folds, an
outcome-specific tail, and a footer. Merge into one GateOutcomeScreen.

## The rule change (decided 2026-09-12, mocks beat ADR-071)

| Band | Outcome | Streak | Swatch |
| --- | --- | --- | --- |
| PERFECT | cleared, pays PERFECT_BONUS | keeps | won, marked |
| HEALTHY | cleared | keeps | won |
| OK | cleared, payout cut | broken | won |
| SHAKY | gate held, a peel owed; pay and retry, or refuse the gate and end the run | broken | not won |
| DANGER | the run ends at once | - | not won |

The OK cut needs no new rule: payoutRatioFor is ratio / healthyAt(gate), so
closing at 30% against a 40% line already pays 0.75x.

SHAKY gets a second exit: refusing the gate ends the run voluntarily and banks
gatesCleared / 13 of the archive.

## Decisions taken without asking

- PERFECT stays "coverage reached 100%" (ADR-075), not "every poll landed".
  The mock's subtitle copy is wrong; it becomes "the bar filled".
- The DANGER screen wears cinnabar, not the gate colour. Deliberate exception
  to screen-colour-follows-its-gate; a run-over screen is not a gate screen.
- The band is derived from the bar's own numbers, never passed as a prop.

## Todo

- [x] CoverageBar: export `coverageBandOf`, add `pin` (marker row ABOVE the track)
- [x] Swatch: `marked?: boolean` on the discovered arm, `.legendary-ring` over the themed fill
- [x] GateChoice.ui.tsx: the two-arm SHAKY tail (peel arm + refusal arm)
- [x] GateOutcomeScreen.ui.tsx: one screen, five bands
- [x] Delete kanto GateClearScreen and GateHoldScreen (terminal-theme twins stay)
- [x] kantoGate.factory.ts: rebase onto coverageRatio.model.ts, merge the frames
- [x] Specs and stories for all five bands
- [x] ADR-076 supersedes ADR-071 (which is deleted)
- [x] Rewrite wiki 2.6 as the five bands

## Summary of Changes

**New**
- `src/ui/kanto-theme/GateOutcomeScreen.ui.tsx` + stories + spec (36 tests). One screen, five bands, band derived from the coverage bar rather than passed.
- `src/ui/kanto-theme/GateChoice.ui.tsx` + stories + spec (17 tests). The shaky tail: a priced retry arm (bill, meter, bribe, drop rows) beside a priced refusal arm.
- `docs/adr/076-the-closing-band-decides-what-it-costs.md`.

**Changed**
- `CoverageBar.ui.tsx`: exports `coverageBandOf` (was a private `bandOf`), adds `pin?: boolean` drawing a landing marker in its own row ABOVE the track, because the boundary marks own the row below and a pin at 72% would collide with `HEALTHY 40%`. The track is `overflow-hidden`, so the pin cannot live inside it.
- `Swatch.ui.tsx`: `marked?: boolean` on the discovered arm, `.legendary-ring` composed over the themed fill.
- `kantoGate.factory.ts`: rebased onto `coverageRatio.model.ts`. `coverageDemandFor`/`gateClearPayout` out, `healthyAt`/`okAt`/`floorAt`/`bandFor`/`gatePayoutKb` in. One `GateOutcomeFrame` replaces the clear and hold frames. Gate 4 asks 40%, not 60%.
- ADR-071 deleted; its citations in 006, 014, 037, 044, 072, 075, README and rejected.md repointed at 076.
- wiki 2.1, 2.6, 2.7, 5.2 rewritten on the five bands.

**Deleted**
- kanto `GateClearScreen.*` and `GateHoldScreen.*` (6 files). The terminal-theme twins stay: `RewardView`/`RemovalView` and the live run routes render those.

**Verification**: `npm run lint` clean (1004 modules, 0 violations), `npm run build` typechecks, `npm test` 250 files / 4605 passed.

**Flagged, not changed**: `gatePayoutKb` quotes large numbers. A 12-slot build closing gate 4 healthy on a streak of 3 is paid over 700 KB against config prices in the low hundreds; perfect pays 1.2 MB. That is the live model, not a fixture choice, and it is recorded in ADR-076s consequences.
