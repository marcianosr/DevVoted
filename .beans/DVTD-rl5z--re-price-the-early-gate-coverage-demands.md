---
# DVTD-rl5z
title: Re-price the early-gate coverage demands
status: draft
type: task
priority: high
created_at: 2026-08-27T10:57:18Z
updated_at: 2026-08-27T10:57:18Z
---

Top risk from the 2026-08-27 brainstorm, and the wiki already admits it. §2.7: a solid player (4 of 5 correct, plain 3-option polls, a lean build with no coverage configs) lands around 4.4 x gate multiplier per window, which clears gate 0's 3%, just misses gate 1's 10%, and misses from gate 2 on. Then: 'These demands were priced when a miss was free, so they are the first dial to loosen if early gates read as punishing.'

A miss is no longer free (ADR-037 peels a config, and the retry waits on tomorrow's polls), so the demands are priced against a model that no longer exists. A player who cannot clear gate 2 never sees the game.

Under ADR-042 this is a pillar-1 problem and not only a balance problem: a wall at gate 2 teaches nothing.

Draft because it needs the model before the numbers move.

- [ ] Model win rate per gate against reference builds (lean / starter stacks / coverage-heavy), with the current peel and daily-retry costs priced in
- [ ] Decide which dial: coverageDemandFor, the 0.5 loss ratio, the peel curve, or the gate multiplier
- [ ] Re-check that a low-effort farm still fails the meter (the anti-farm property in §2.2 must survive)
- [ ] Wiki §2.8 table and §2.7 baseline paragraph
- [ ] ADR if the change reverses ADR-034/035 numbers
