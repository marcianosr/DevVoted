---
# DVTD-svbl
title: 'Config: S3 Glacier improves the death-banking rate'
status: draft
type: feature
priority: normal
tags:
    - config
created_at: 2026-09-06T08:04:59Z
updated_at: 2026-09-06T09:57:03Z
parent: DVTD-72d9
---

## Design (2026-09-06 session)

- 2 slots. While installed at run end, the death conversion to archived storage improves: gatesCleared / 13 gains +20 percentage points (placeholder), capped at 100%. Victory stays 100%, abandon stays 0, so there is no farm.
- The purchase mood is the novelty: every config on the roster is bought in optimism; Glacier is rational mid-decline, when a run starts looking doomed. Insurance you buy while the ship is taking water.
- Cold storage semantics are literal: long-term archival at the cost of slots you could have spent on saving the run instead. The trade IS the flavor.

## Todo

- [ ] Sim the rate shape (+flat points vs multiplier on the proportional rate)
- [ ] Decide the interaction with tag-rescued runs (they bank only the gates actually climbed)
- [ ] Decide whether it must survive the final peel to pay (a peel that takes Glacier takes the insurance)
