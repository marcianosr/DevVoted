# ADR-181: Accuracy is a bonus the run carries

## Status

Accepted — 2026-10-03 (Marciano, DVTD-eig5). Supersedes
[ADR-161](161-accuracy-multiplies-the-gate.md) Decision 1 (the per-gate
`2 ^ (earned ÷ available)` curve) and retunes ADR-161 §6's `GATE_RUNGS`. Revisits the
carried meter that [ADR-169](169-a-poll-can-be-skipped-and-speed-is-a-config.md) rejected, without
the cap that sank it.

## Context

The accuracy multiplier reset every gate and topped out at ×2. A perfect Pallet already
reached the top, so the multiplier had nowhere to grow for the rest of the run. Marciano
wanted it to grow more slowly, across the whole run, and to be hard to lose.

## Decision 1: the run carries an accuracy bonus

`RunState.accuracyBonus` starts at 0, and a gate's output is its polls' units ×
`(1 + bonus after this window)`. Each window moves the bonus by its credit-weighted
share `s = earned ÷ available`:

`delta = ACCURACY_GAIN_PER_GATE × s − ACCURACY_LOSS_PER_GATE × (1 − s)`, gain 0.08,
loss 0.04, floored at 0.

Over five singles that is +0.016 a right answer and −0.008 a miss. A miss costs half
of what a right answer earns, so the bonus is hard to lose. A perfect first gate gives
×1.08, and a flawless run reaches ×2.04 at the Champion.

- **A skip moves nothing.** It stays out of the share (ADR-169 still holds), and a
  window where every poll was skipped leaves the bonus where it stood.
- **Committed only on a clear.** A held or retried gate starts a fresh window and
  throws its delta away, so a failure costs nothing on top of the peel.
- **No cap.** The ADR-169 meter rejected on 2026-10-02 saturated: a 90% player sat at
  its cap for 10 of 13 gates. This bonus keeps rising, and the codebase rises with it
  (Decision 2).
- No config touches the bonus. A build still amplifies what you know and never
  replaces it.

## Decision 2: the codebase follows a flawless carry

With a small step, a bare 5/5 window no longer filled Pallet's 9-change codebase, so
PERFECT, its bonus and the swatch would have needed a build. Marciano chose to keep
PERFECT reachable by knowledge alone. Each gate's codebase is now
`floor(5 × (1 + 0.08 × (gate + 1)))`, the output a flawless bare player brings to it:

| gate | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| codebase | 5 | 5 | 6 | 6 | 7 | 7 | 7 | 8 | 8 | 9 | 9 | 9 | 10 |
| floor % | 0 | 43 | 47 | 50 | 53 | 56 | 60 | 63 | 66 | 69 | 73 | 76 | 79 |
| OK % | 52 | 55 | 57 | 60 | 63 | 66 | 68 | 71 | 74 | 77 | 79 | 82 | 84 |
| HEALTHY % | 64 | 66 | 68 | 71 | 73 | 75 | 77 | 79 | 81 | 84 | 86 | 88 | 90 |

The smaller codebases made the run far easier, so every line moved 40% of the way
from its ADR-161 value toward 100%. That shift keeps the lines from crossing, keeps
SHAKY and OK narrowing, and keeps PERFECT at 100%. 0.4 is the largest shift that still
lets a bare build at 90% summit more than 30% of the time in
`coverageRatio.model.spec.ts`.

## Rejected

- **A per-gate top that grows** (`topAt(gate) ** s`, ×1.2 at Pallet to ×2 at the
  Champion). Marciano: "there shouldn't per se be a gate cap, the increase should just
  be lower."
- **Gain 0.2 / loss 0.1** (+0.04 a right answer). The run snowballed: lean
  .05/.79/.99, ×2 .28/.70/.93, ×3 .54/.88.
- **Scaling the lines ×1.35.** It came closest to the target (total gap .37), but
  capped the late gates at 95% so the lines crossed.
- **Accepting that early PERFECT needs a build.** Rejected for the codebase that
  follows the carry (Decision 2).
- **A 5/5 window always counting as PERFECT.** A special case on top of the rule.

## Consequences

Engine win rates (ADR-161 §6's guard: 300 runs a cell, spread pool, build from gate 0,
shop skipped). The sweep that chose the constants:

| variant | lean .6/.8/.9 | ×2 .6/.7/.8 | ×3 .6/.7 |
|---|---|---|---|
| target | .00/.15/.50 | .10/.35/.70 | .25/.55 |
| ADR-161 per gate (before) | .00/.19/.68 | .06/.29/.71 | .47/.77 |
| carry .08/.04, old codebase | .00/.17/.76 | .04/.32/.75 | .23/.68 |
| carry .08/.04, new codebase, old lines | .00/.47/.92 | .22/.57/.86 | .45/.81 |
| **chosen: new codebase, lines 40% toward 100** | **.00/.13/.69** | **.06/.29/.75** | **.21/.65** |

- The ×3 build's lead over the target drops from +.22 to about +.08.
- Lean at 90% stays above its target (.69 against .50), as it already was.
- ×2 at 60–70% stays under its target. ADR-169 already found that separating
  builds is a config problem, not an accuracy one.
- The early gates now ask more per change, since a bare window brings less. Pallet's
  HEALTHY is 64% of 5 changes, so 4 right out of 5 clears it bare.
- Old snapshots hydrate with a bonus of 0.
- A close records the multiplier it applied (`LastClose.multiplier`), and the poll
  screen's ×N reads that record instead of recomputing it.
- The poll screen's accuracy track scales to the next whole multiplier above the best
  case (×2, then ×3), because there is no top any more.
- Prep's Scoring fold states this gate's curve from the carried bonus.
