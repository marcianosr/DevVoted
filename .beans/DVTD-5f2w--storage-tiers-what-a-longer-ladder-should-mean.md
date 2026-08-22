---
# DVTD-5f2w
title: 'Storage tiers: what a longer ladder should mean'
status: todo
type: task
priority: high
created_at: 2026-08-22T19:50:00Z
updated_at: 2026-08-22T19:50:00Z
parent: DVTD-kulw
---

Open design question: what are storage tiers *for*, once the ladder gets long? If we
had 10 rungs instead of 7, would that be 10 decisions or the same decision 10 times?

## Where it stands today

- `STORAGE_PLANS` (`src/modules/run/run/domain/rules.model.ts`) holds 7 rungs:
  512KB free, 640KB/8, 768KB/16, 1MB/32, 1.5MB/48, 2MB/72, 3MB/112 (bill per closed window).
- Each rung carries a `fromGate`: 0, 0, 2, 4, 6, 8, 10. `VICTORY_GATE` is 12.
- The shop draws the unlocked rungs plus exactly one locked rung (ADR-030 Decision 5).
- Mechanic: ADR-023 (cap is a subscription, bills pass or fail, insolvency auto-downgrades),
  amended by ADR-030 (gate-staged, climbs to 3MB).

## Why more rungs get awkward

1. **The tail is nearly dead content.** Tier 7 opens after gate 10 of 12, so it can be
   billed at most twice before the summit. A rung staged any later than that is
   unbuyable by construction, which caps the useful ladder length at whatever
   `VICTORY_GATE` is, not at whatever cap numbers look nice.
2. **The shop grows into a wall.** Unlocked-plus-one is 3 rows early and 8 late. At 10
   rungs it is 11 rows in the last shop. ADR-030 named "a wall" as a reason to stage in
   the first place; staging only delays it.
3. **Every rung is the same trade.** Bigger cap, bigger per-gate bill. Ten instances of
   one axis is not ten decisions. This is the axis-inventory test we apply to configs,
   pointed at infra.

## Options to weigh

- **A. Keep it short.** Cut the ladder to ~5 rungs, retune the bills, delete the tail.
  Cheapest, and admits the tail was never reachable.
- **B. Sliding window.** Render current rung plus one up and one down, so rung count
  stops driving shop length. Fixes the wall, not the sameness.
- **C. Give tiers a second axis.** Rungs differ in something besides cap and bill:
  bill timing, insolvency behaviour, what survives a clamp. Must stay inside ADR-023
  Decision 5 (infra changes container rules, never multiplies power).
- **D. Move the ladder to meta-progression.** The account unlocks which rungs a run
  *starts* able to buy; the in-run ladder stays short. Ties into DVTD-yqy4.

## Constraints on any answer

- ADR-030 Decision 3 tuning rule: a rung's bill runs a fifth to a third of a perfect
  clear at the gate that opens it. `rules.model.spec.ts` asserts the ratio, not the prices.
- ADR-023 Decision 1: tiers stay unflavoured (no Free/Pro/Enterprise skin) until the
  mechanic proves fun. No new vocabulary for rungs.
- The insolvency cliff scales with the rung, and deep rungs are meant to be a real
  gamble. Any answer says what it does to that edge.

## Todo

- [ ] Playtest read: how often is a rung above tier 3 actually bought, and at which gate?
- [ ] Pick a direction (A/B/C/D or a mix) and say why the others lose
- [ ] Record it as an amendment to ADR-023/ADR-030, not a new ADR, if the mechanic holds
- [ ] Update `STORAGE_PLANS` + the wiki per-gate unlock table if numbers move
