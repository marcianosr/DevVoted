---
# DVTD-zca4
title: The gate's earn is compared against a cumulative line
status: todo
type: task
priority: low
created_at: 2026-09-14T15:18:26Z
updated_at: 2026-09-14T15:18:26Z
---

On the gate-clear By-category fold, the THIS GATE total row carries a quiet `of {demand}% needed` figure. The total is the gain this gate earned; the demand is the cumulative HEALTHY line the run has to reach. They coincide at gate 0 and drift from gate 1 (gain 50%, line 30%).

The coverage bar directly above already states the level against the line, with a pin and a HEALTHY marker, so the quiet figure is both redundant and misleading.

Options: drop it, or swap it for `run at {level}%` so the fold ties back to the bar honestly.

Found while fixing DVTD-znsu.

## Todo

- [ ] Decide whether the figure goes or changes
- [ ] Update `coverageRows` in `gateOutcome.viewmodel.ts`
