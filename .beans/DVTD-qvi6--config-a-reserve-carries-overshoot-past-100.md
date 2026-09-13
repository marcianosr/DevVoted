---
# DVTD-qvi6
title: 'Config: a reserve carries overshoot past 100%'
status: todo
type: feature
priority: high
created_at: 2026-09-13T13:23:48Z
updated_at: 2026-09-13T13:23:48Z
---

Run coverage caps at 100% (DVTD-vhuh). That cap is deliberate, but it flattens the
multiplier ladder: x2, x3 and x6 all land within noise of each other because the
score is already pinned.

Measured, 2000 trials per cell, win rate at 70% accuracy:
  bare 0.005 | x2 0.659 | x3 0.672 | x6 0.657

The algebra: you need `accuracy x M >= line`, and `line <= 1.0`, so `M <= 1 / accuracy`.
At 70% accuracy no ladder can ever demand more than x1.43.

A reserve config gives the overshoot somewhere to go, which is what makes a big
multiplier worth its slots again. Without it AGENTS.md (8 slots, x2) is strictly
dominated by Intellisense (4 slots, x1.5) for every player above 60% accuracy.

ADR-073 D4 already named this the one sanctioned exception: "A config that carries
coverage across the boundary (spillover) is the only exception."

Related: DVTD-nljz (reward coverage spill above the gate demand).

## Todo

- [ ] Decide reserve shape: carry N units, or a fraction of the overshoot
- [ ] Decide whether reserve competes with or replaces the surplus KB payout
- [ ] Check it does not reopen the coasting hole the floor rule closes
- [ ] Re-run the balance sim: x2 / x3 / x6 must separate with a reserve installed
