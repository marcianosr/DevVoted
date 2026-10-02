---
# DVTD-emp3
title: Accuracy multiplies the window
status: in-progress
type: feature
priority: high
created_at: 2026-09-30T18:12:22Z
updated_at: 2026-10-01T14:53:22Z
---

**What:** Every right answer in a gate multiplies the gate's output, up to double for all five, and each gate asks its own coverage, tightening from Pallet to the Champion.

**Why:** The build multiplied every poll while knowledge only added, so a player with a strong build and middling answers out-scored a player who knows every answer.

## Done when

- [x] A gate's coverage is its summed answers times an accuracy multiplier that grows with each right answer, partials counting partially
- [x] A wrong answer never grows the multiplier, and no config touches it
- [x] Each gate asks its own demand, the lines forgiving early and hard late
- [x] A knowledgeable bare build can summit, and a build makes it likely without buying past the window minimum
- [ ] The poll screen, prep and the gate result show the multiplier as it grows

## Notes

ADR-161. Plan: ~/.claude-work/plans/brainstorm-a-scoring-progression-recursive-pascal.md.

- Multiplier `2 ** (earned / available)` (amended 2026-10-01): a single offers 1, a multiple 2 (1 under 207); a perfect window is x2 for any mix. `GateWindow.accuracyEarned/accuracyAvailable`.
- The mix stays hidden: the live bar reads output before the multiplier, which lands at the close; `gateStake.accuracy` withholds `available` until all are answered or Prefetch v2 / rebase v2 names the mix. Dry Run clears only on the worst unseen mix.
- Copy speaks in changes covered; the window minimum reads "right".
- `GATE_RUNGS` is `{ slots, floor, ok, healthy }` per gate: codebase 3 to 11, percent lines (Pallet 0/20/40, Elite 60/70/80, Champion 65/74/84).
- Close: `unitsThisGate = windowOutputOf(window) + estimateUnits`; the Planning Poker estimate sits outside the multiplier.
- Overshoot pays `KB_PER_EXTRA_BAR = 16` per full bar past the codebase; 10% of it opens the next gate (`headStartUnits`, renamed from `bankedUnits`). A cumulative-era snapshot hydrates to a head start of 0.
- Lifetime `run_states.coverage` (Dex history, climb map, player card, profile) reads over every codebase played, `runShareOf`.
- `MIN_WINDOW_UNITS = 2` stays and is the wall from about x3.
- Rejected: a share of the window's ceiling, flat N of 5, a product of poll factors, cash out, universal answer order, configs bending the step, "I'm sure" on every answer.
- Balance (spec sim, SHAKY holds twice): bare .45 at p=.9, x2 .81 at p=.8, x3 and x9 converge at .91.
- Remaining: draw the accuracy track (groups, `?` for unseen) on prep, the poll screen and the gate result; design prompt handed over 2026-09-30, needs the weighted groups.

## Playtest evidence (2026-10-01)

The open screen item bites: the gate result keeps "Total units 4.45" while surplus KB and the band use the multiplied ~7.75; Thunder read HEALTHY 93% live and closed PERFECT with nothing on screen saying why. Tracked from the Gameplay bugs epic (DVTD-lk20).
