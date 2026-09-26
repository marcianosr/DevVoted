---
# DVTD-qkiq
title: Simulate the build space curve against run income
status: todo
type: task
priority: normal
created_at: 2026-09-14T17:09:27Z
updated_at: 2026-09-14T17:09:27Z
---

ADR-082 shipped ADR-074's hand-set rung prices unchanged: 4/free, 6/16, 8/32, 12/64, 16/128, 24/256, 32/512 KB a gate. Nobody has simulated them against what a run actually earns.

This is the same subject as DVTD-8gns, narrowed to the one table that is now live and is the economy's main brake. Questions it should answer:

- At what gate does a heavy build stop out-earning its own bill?
- Is the doubling per rung right, or does it price the top two rungs out of every real run the way storage plan tiers 5 and 6 were (DVTD-wli9)?
- Does the free four hold long enough that gate 2 is the right place to open the ladder?
- `KB_PER_PROVEN_SLOT` and the rung prices are tuned against each other; neither can move alone.

Precedent: `coverageRatio.model.ts` is a pure model with a seeded Monte Carlo in its spec.

## Todo

- [ ] Model income against the build space bill per gate
- [ ] Assert the headline numbers so a reprice moves a test rather than a guess
