---
# DVTD-fapc
title: Tech Debt mechanic
status: draft
type: epic
priority: normal
created_at: 2026-06-14T07:36:39Z
updated_at: 2026-06-14T07:36:39Z
---

Tech Debt is a voluntary risk/reward mechanic. Players can accept a Tech Debt (TD) item in exchange for a benefit (item effect, shop discount, config upgrade). Each active TD applies a restriction (mechanical or informational) and persists until its clear condition is met. Run-scoped only.

## Locked design decisions

- **Shape:** Restriction (debuff + clear condition coupled per item) — not a resource bleed
- **Debuff scope:** Both pipeline mutators (e.g. all pipelines +1 grade) and outside-system restrictions (shop locked, config upgrades disabled, information opacity)
- **Cap:** Soft cap (max N active TDs, no death from TD alone — once full, no further TD acquisition possible)
- **Acquisition:** Voluntary only, two surfaces at MVP:
  - Item cost (pick up item that grants benefit + N TDs)
  - Shop trade (discounted purchase for TD risk)
  - (Future: config upgrade for TD cost)
- **Visibility:** Known TDs at acquisition (player sees which TDs they get before accepting)
- **Persistence:** Run-scoped only. No meta-leak across runs.
- **Stacking:** Unique types only for MVP (no duplicates). Pool returns only TDs the player doesn't have.
- **Clear conditions:** Forward-only — progress counter starts at TD spawn, prior progress doesn't count.

## Rejected alternatives

- **Resource bleed (storage/coverage drain)** — too complex for MVP, softlock risk on coverage suppression
- **Wrong-answer punishment (acquisition source C)** — death-spiral anti-pattern
- **Pipeline-failure acquisition (E)** — deferred; need to revisit existing pipeline failure penalties first
- **Stacking** — deferred; pairs badly with soft-cap
- **Retroactive clear progress** — would make TD trivially free in late game
- **Meta-leak across runs** — clean run boundary preferred for MVP

## MVP TD pool (6 items)

| Name | Type | Debuff | Clear condition |
|---|---|---|---|
| Legacy Module | Mechanical | All pipelines +1 grade harder | Gain 15% coverage |
| Lost Docs | Information | Category hidden in pipeline picks | Be first to answer 3 times |
| Flaky Suite | Mechanical | Shop locked | Earn 2 awards |
| Scope Creep | Mechanical | Forced 2-pipeline picks at gates | Complete 1 pipeline |
| Stale Cache | Mechanical | Config upgrades unavailable | Gain 10% coverage in one category |
| Obfuscated Imports | Information | Shop items shown as ??? (blind buy) | Spend 3 storage units on rerolls |

## Open questions for implementation

- [ ] Soft cap value (3? 5?) — needs playtest
- [ ] Information-debuff implementation (UI rendering flags) vs mechanical-debuff (game state changes) — likely two separate code paths
- [ ] Clear-condition progress tracking — counters need persistence on run state

## Todos

- [ ] Write ADR for Tech Debt design rationale
- [ ] Scaffold `domains/techDebt/` module
- [ ] Schema additions (active TDs per run, clear-condition progress)
- [ ] Implement first end-to-end TD (Flaky Suite — smallest blast radius)
- [ ] UI: active TD list + clear-progress indicators
- [ ] Implement remaining 5 MVP TDs
- [ ] Item-cost acquisition surface
- [ ] Shop-trade acquisition surface
- [ ] (Future) Config-upgrade acquisition surface
