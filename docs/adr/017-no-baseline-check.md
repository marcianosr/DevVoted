# ADR-017: No baseline check — checks come only from configs

## Status

Accepted (2026-08-05, Marciano). Amends ADR-016 §1–2 (⚠ markers inline there) and the ADR-014 death path's trigger.

## Context

Since ADR-016 the gate synthesized a "Correct N" baseline check that every build
carried regardless of configs, escalating `+1 per 2 gates cleared`. Its rationale
was anti-freeload: most config checks are conditional (linters bind only when
used, focus checks skip when their category is absent), so a build of
skip-only configs could clear gates answering 0/5.

With every config now carrying a check (a Copilot check is planned as the last
gap), Marciano ruled the baseline redundant with the design motto — *the gate
should demand only what your build demands*. Claude objected that the freeloader
build (ESLint + Stylelint + Copilot, never linting) stays viable and would farm
80 KB per cleared gate into a guaranteed victory bank; Marciano confirmed the
removal anyway, with the explicit requirement that farming still be dealt with.

## Decision

1. **No synthesized baseline.** The "Correct" checklist row exists only while a
   `check === "correct"` config (Unit Tests) is installed; its target is
   `checkAmount + escalation(gatesCleared)`. `CLIMB_BASE_REQUIREMENT` is deleted.
   Unit Tests keeps sole ownership of escalation (ADR-016 §2 survives with
   "baseline" re-read as "Unit Tests' check").
2. **Farming is priced out, not forbidden** (chosen over a frozen floor-of-1,
   all-skip-fails, and prize-gating via AskUserQuestion): the gate payout scales
   with window correctness — `gateClearPayout = round(GATE_REWARD_KB ×
   min(gatesCleared + 1, 12) × rewardMultiplier × correct ÷ SLICE_WINDOW) +
   flat clear payouts`. The 32 KB base rides the same depth curve as coverage
   (Marciano, same day: 32 at gate 1, scaling per gate, capped at gate 12 for
   endless runs). A 0/5 clear pays 0 KB; flat payouts (Unit Tests' +32) stay
   whole because their config's own check demanded the answers. The reducer
   persists the paid amount (`gateRewardKb`) so the reward/shop screens report
   actual pay, not the ceiling.
3. **A bare pipeline never clears** (chosen over "runs no longer die" and
   "leave the hole for debt cards"): with checks coming only from configs, an
   empty checklist would pass vacuously and a stripped-bare run could never
   die. `gatePassed` now fails on `isBare`, keeping ADR-014's "bare build fails
   → dead" reachable. Tightening accepted: a bare build that answered well
   could previously squeak past the baseline; now bareness itself is failure.

   > ⚠ Amended by ADR-027: the gate's structural width demand scales from ≥1
   > to `minConfigsForGate` (one over its strip quota), graded at the gate's
   > door. `isBare` stays as the window-close rule.

## Consequences

- An all-skip build can still climb and reach the summit, but banks (nearly)
  nothing: no scaled payout on 0/5, no coverage, and flat payouts require
  passing the very checks a farmer avoids. The victory *prize* (DVTD-g1p0,
  open) must not be claimable by zero-coverage runs — noted there.
- The view's `gateReward` stays the full-correctness ceiling (a preview);
  the reducer pays `gateClearPayout` on the actual window.
- The escalation-cap problem for `VICTORY_GATE = 12` (demand exceeding the
  5-poll window around gate 8) became a **Unit Tests tuning** question and was
  resolved same-day (DVTD-hbz5): auto-escalation caps at +3 (`ESCALATION_CAP`),
  the total demand clamps to the window, and Unit Tests levels (storage-priced,
  max 5) buy payout + demand together. `dropCount`'s identical growth curve
  still needs the same look — open.
- The legacy prototype engine (`src/domains/runs/prototype/sessionRun.ts`)
  keeps its own baseline copy; it is parked and diverges knowingly.
