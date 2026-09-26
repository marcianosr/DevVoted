---
# DVTD-9ib5
title: Make sure all rewards, also form configs are shown on the reward page
status: todo
type: feature
priority: normal
created_at: 2026-08-14T13:27:41Z
updated_at: 2026-08-14T15:53:40Z
---

Display all configs used in the run and their individual reward contributions on the reward/completion screen.

## Scope

The reward screen should show:
- [ ] All configs from the completed run's pipeline
- [ ] Each config's label, description, and rarity
- [ ] Per-config reward breakdown (storage earned, coverage gained, etc.)
- [ ] Aggregated totals matching the gate reward

Currently only shows total storage earned and gate completion status.

## Status 2026-08-14

Storage half delivered in child DVTD-rjq3, built to Marciano's mockup: base reward + one `+ <config>` row per config that paid KB + ruled total, and the unlock section reusing the ledger's panel shell.

The mockup is narrower than this bean's original scope. Still open, and worth confirming these are still wanted before building:

- [ ] **All** pipeline configs listed, not only the ones that paid storage — the ledger deliberately filters `kb > 0`, since a row reading `+0KB` is noise on a payoff screen.
- [ ] Per-config **coverage** contribution — deliberately left out: ADR-026 §3 (as amended) keeps the pipeline report off the clear, and coverage attribution already exists on the failed gate's `GateRewardReport`.
- [ ] Config **description and rarity** on the row — the ledger shows label + KB only, per the mockup's spacing.
