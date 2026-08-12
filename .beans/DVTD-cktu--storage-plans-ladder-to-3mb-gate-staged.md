---
# DVTD-cktu
title: 'Storage plans: ladder to 3MB, gate-staged'
status: completed
type: feature
created_at: 2026-08-11T15:46:30Z
updated_at: 2026-08-11T15:46:30Z
---

ADR-030. Extends ADR-023's three-rung ladder to seven, and stages each rung by
gate depth.

| Tier | Cap | Bill/gate | Opens after |
|---|---|---|---|
| 1 | 512KB | Free | — |
| 2 | 640KB | 8KB | — |
| 3 | 768KB | 16KB | gate 2 |
| 4 | 1MB | 32KB | gate 4 |
| 5 | 1.5MB | 48KB | gate 6 |
| 6 | 2MB | 72KB | gate 8 |
| 7 | 3MB | 112KB | gate 10 |

Rationale: a clear pays ~32KB x gate and the bill lands pass or fail, so a cap is
only worth its bill once income can fill it. Sold at gate 0, a 3MB cap is a
recurring charge against storage the run cannot yet earn - a trap, not a decision.
Each rung's bill is ~a fifth to a third of a perfect clear at its unlock gate.

## Summary of Changes

- `rules.model.ts`: STORAGE_PLANS gains `fromGate`; new `isStoragePlanUnlocked`
  and `storagePlanLadder` (unlocked rungs + exactly one locked, so the section
  does not become seven rows of things you cannot buy).
- `run.model.ts`: `changePlan` refuses a rung the run has not reached - the wire
  carries a bare tier, so staging cannot live in the shop's rendering.
- Viewmodel: `StoragePlanOption` gains `fromGate`/`locked`; the list comes from
  `storagePlanLadder(gatesCleared)`.
- Shop rows use Marciano's format: `512KB | Free`, `640KB | 8KB / gate`, caps over
  1023KB in MB via a new `formatKb` in `src/lib/storage.ts`. The locked rung is a
  greyed row (not a button) reading "Opens after gate N", with a tooltip on why.
- Wiki gained §2.10 "What Unlocks When": one per-gate table (swatch, configs
  demanded, strips on fail, escalation, unlocks) plus a second table for the
  tracks that are NOT gate-staged (slots by coverage, upgrades, lint fee, rebuild
  price, meta). Added because gate-staged unlocks now come from two files and
  Marciano lost track.
- Storage plan tests that switched to tier 3 at gate 1 now use tier 2; the ladder
  test asserts the bill/clear ratio rather than exact prices so retuning is free.

Verification: 1425 passed (+18), lint + build + tsc clean; the 26 failures are the
same pre-existing ones as HEAD.

Open risk: the insolvency cliff scales with the rung - going unpaid on 3MB drops
you to free and burns ~2MB at Climb on. Intended as a real gamble; first thing to
watch in playtest.
