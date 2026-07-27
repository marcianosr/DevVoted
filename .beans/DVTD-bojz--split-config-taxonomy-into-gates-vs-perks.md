---
# DVTD-bojz
title: Split config taxonomy into gates vs. perks
status: todo
type: story
priority: normal
created_at: 2026-07-27T10:42:56Z
updated_at: 2026-07-27T14:06:49Z
parent: DVTD-u35m
---

Configs that go up for different reasons (difficulty ramp vs. player investment) currently look identical on screen. Reframe the taxonomy as two species instead of three: **gates** (things that judge you — Unit Tests, Coverage) and **perks** (things that help you — ESLint, Copilot). Reward KB is just what a gate pays out when cleared, not a separate config kind.

## Design decisions

- **Gates auto-scale, locked, un-sellable** — the rising floor. Player doesn't choose or manage them directly.
- **Perks stay manual** — player chooses, upgrades, and sells them. This is "your investment."
- **Coverage is a pure gate** — currently does double duty as both gate and reward, which is the main source of muddiness. Cleanest fix: treat it as a gate that pays out like any other gate, not a reward currency itself.
- **Upgrades cost storage, not coverage** — keeps coverage pure as "the climb" and honors one-currency-per-job (storage buys/upgrades things, coverage measures progress).

## Sister beans

- DVTD-h9s5 (coverage-gated config upgrades) — that bean explores gating upgrades on coverage thresholds; this story's "upgrades cost storage, not coverage" decision runs counter to that and should be reconciled before both move forward.
- DVTD-klz2 (unit-test → core pipeline check rename) and DVTD-1sb7 (swatch: alternate core pipeline check) — both describe things that fall under the "gates" species defined here.

## Todos

- [ ] Shop: split the load-out into two zones — inert/locked gates vs. clickable/mutable perks
- [ ] Shop: show sell/upgrade affordances only on the perks (mutable) half
- [ ] Shop: preview the gate's next-gate ramp so the rising floor reads as pressure
- [ ] Reclassify existing configs (Unit Tests, Coverage, ESLint, Copilot, etc.) into gate vs. perk
- [ ] Decide how reward KB payout is surfaced now that it's tied to gate-clear rather than being its own config
- [ ] Reconcile with DVTD-h9s5 on whether coverage ever gates an upgrade, given upgrades should cost storage
