---
# DVTD-krh0
title: 'Config: Math.random() rolls a seeded die per gate'
status: draft
type: feature
created_at: 2026-09-06T07:17:54Z
updated_at: 2026-09-06T07:17:54Z
parent: DVTD-72d9
---

## Design (2026-09-06 session)

Marciano's extension of a Chaos Monkey pitch: a specific self-outage is just one face of a die, so the die is the config. Literal semantics hold: the config IS a seeded random draw.

- 4 slots. When you press Start on a gate, it rolls one face from a published table and the window plays under it.
- Seeded per (run, gate, attempt): a reload never re-rolls, a retry does (the audit-pick precedent).
- The Dex publishes the full die; the receipt and build track print the roll. The die is public, the roll is yours.
- v1 rolls on Start-press so a roll cannot be shopped around. The receipt-visible variant (build around a known bad roll, Balatro boss-blind style) is the open alternative below.

## Face sketch (faces and weights are the sim question, the shape is the point)

| Face | Effect this window |
| --- | --- |
| ×2 | all coverage doubled |
| ×0.5 | all coverage halved (the bad face) |
| outage | one of your own configs offline (Chaos Monkey absorbed) |
| hazard pay | +25% coverage per audit the gate carries (On-call absorbed) |
| hot streak | streak cap +5 steps |
| free tooling | lint and peek cost 0 |
| payday | gate clear pays double KB |

## Balance

- EV tunes net-positive with variance as the product (Overclock's honesty line: the buy is variance, not magnitude).
- It randomizes only its own effect, never gate rules, so ADR-038's fixed audits stay fixed.

## Todo

- [ ] Sim the face table and weights
- [ ] Decide roll timing: Start-press vs visible on the receipt (the shop-around question)
- [ ] Recheck slots/price once faces settle
