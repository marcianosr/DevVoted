---
# DVTD-w5g8
title: Steepen the wrong-answer loss and reprice the last two gates
status: completed
type: task
priority: normal
created_at: 2026-09-05T09:01:49Z
updated_at: 2026-09-05T09:07:30Z
---

The loss share was one flat 0.5 at every gate while the demand table grows ~13x faster than the earn, so a miss shrank from 1/6 of gate 0 to 1/50 of gate 12.

- [x] wrongLossShareFor(gate) = 0.5 + 0.03 * gate, clamped at VICTORY_GATE
- [x] coverageLossFor reads the gate share; WRONG_COVERAGE_LOSS renamed BASE_WRONG_COVERAGE_LOSS
- [x] COVERAGE_DEMANDS gate 11 -> 300, gate 12 -> 375
- [x] ADR-013 Decision 2 amended, wiki scoring + constants + gate table, CHANGELOG

## Summary of Changes

Loss at gate 12 goes 6.5 -> 11.2 on a plain build; break-even accuracy runs 33% at Pallet to 46% at the Champion. Step landed at 0.02 first, raised to 0.03 the same session on his read ("a little steeper") — treat it as a live knob. Lockstep with the build is untouched (the share still multiplies your own per-correct coverage), so a greedy build still loses more per mistake.

Marciano picked +2 points a gate over compounding 2%/gate and over keying the loss to the gate's demand (that third one drops the build lockstep ADR-013 bought deliberately).

Note for the next tuning pass: +3pp/gate softens the decay rather than stopping it. A miss is still 3.0% of the Champion's demand against 16.7% of Pallet's, because demand outgrows both the earn and the share.
