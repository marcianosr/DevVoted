---
# DVTD-du7y
title: 'Config: freeze what a wrong answer costs'
status: todo
type: task
priority: normal
created_at: 2026-09-05T09:06:42Z
updated_at: 2026-09-05T09:06:42Z
parent: DVTD-72d9
---

A config that freezes what a wrong answer costs, so the miss price stops climbing while you hold it. Working name: **`Object.freeze()`** — it freezes a value in place, which is exactly the effect. (`yarn.lock` is already the shop-lock config, so lockfile naming is taken.)

## What it would actually stop

The wrong-answer loss is `wrongLossShareFor(gatesCleared) × coveragePerCorrectRaw(configs, gatesCleared)`, and **every factor in it grows**:

| factor | formula | at gate 0 | at gate 12 |
| --- | --- | --- | --- |
| the share | `0.5 + 0.03 × min(gatesCleared, 12)` | 0.50 | **0.86** |
| the base | `gateBaseMultiplier(gatesCleared)` | — | climbs with depth |
| the build | `(1 + add) × mult × throttle` | — | climbs as you install |

So a miss at the Champion gate costs 86 percent of what a correct answer earns, before the depth and build multipliers are applied on top. The escalation, not the base rate, is what makes late misses feel fatal — which is precisely the thing a config can sell insurance against.

## Three different things "lock" could mean

1. **Freeze the share ladder** at 0.5, cancelling the `0.03` per gate step. Smallest, most predictable, and it reads in one line.
2. **Freeze the whole loss at install time.** Your miss costs what it cost the day you installed it, forever. This is the interesting one: it creates a genuine timing decision (install early to lock a small number, but early is when you can least spare the slots) and the roster has very few configs whose value depends on *when* you buy them.
3. **Freeze the build term only**, so later installs raise what a correct answer earns but not what a miss costs. Same flavour as 2, narrower, and it rewards buying it before a big build rather than after.

My pick is **2**, with the copy stating the locked figure outright so the player watches the gap open as they climb.

**The trap to avoid:** `coveragePerCorrectRaw` feeds both the gain and the loss. A naive implementation that freezes it would freeze your earnings too. The lock must apply on the loss path only.

## The loss-side family

Three beans now sit on the same term, and they need to stay distinct or two of them are dead weight:

- **DVTD-w0ul, Bug Bounty**: +16 KB storage per wrong answer. A hedge, paying on a different axis.
- **DVTD-zvcv, `Math.abs()`**: the loss becomes a gain. An inversion.
- **This one**: the loss stops growing. Insurance.

Hedge, inversion, insurance is a clean division, and each is legible on its own. Worth deciding before any of them ships whether all three are wanted, because they compete for the same slot in a build and the same sentence in a shop row.

## Todo

- [ ] Pick which of the three lock readings ships, and the name
- [ ] Effect applies on the loss path only, never to `coveragePerCorrect`
- [ ] Where the frozen figure lives: a config-level snapshot at install, if reading 2 wins
- [ ] The pre-gate stake screen already prints `coveragePerWrong`, so it shows the frozen number for free; check the copy says it is frozen rather than looking like a bug
- [ ] Specs: frozen across a gate clear, unaffected by later installs, correct interaction with the audited-share zeroing
- [ ] Decide the family question against DVTD-w0ul and DVTD-zvcv
- [ ] Wiki roster entry
