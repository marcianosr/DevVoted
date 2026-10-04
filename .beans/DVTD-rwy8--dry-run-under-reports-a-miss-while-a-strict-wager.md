---
# DVTD-rwy8
title: Dry Run under-reports a miss while a strict wager is armed
status: todo
type: bug
priority: low
created_at: 2026-09-16T18:25:43Z
updated_at: 2026-09-16T18:25:43Z
---

`gateProjectionFor` (gate.model.ts) hardcodes `miss: held` and
`missClears: held >= demand`, ignoring `preview.coveragePerWrong`. Under ADR-073
that was correct: nothing bled. ADR-089 makes an armed `strict: true` wager cost
0.5 units on anything but an exact answer, so Dry Run's projection now overstates
where a miss lands.

Needs Dry Run and strict held together, with the wager armed, to be visible.

## Why it was not fixed with ADR-089

The change is one line (`miss: asHeld(Math.max(0, units + preview.coveragePerWrong))`),
but it breaks two specs that deliberately encode the ADR-073 rule:

- "leaves a wrong answer exactly where the run already stands"
- "says a miss still clears when the run is already past the demand"

Their fixture (`PAYS_TWO`) already carries `coveragePerWrong: -6`, so the specs
are self-inconsistent, but rewriting a projection rule written under an accepted
ADR is its own decision rather than a side effect of adding a config.

## Todo

- [ ] Decide whether the projection reads the stake (needs an ADR-089 amendment)
- [ ] If yes: honour `coveragePerWrong` in both `miss` and `missClears`, clamped at 0
- [ ] Rewrite the two floor specs to state the armed and unarmed cases separately
