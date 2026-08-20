---
# DVTD-ne85
title: 'Config: WTFPL'
status: completed
type: task
priority: normal
tags:
    - config
created_at: 2026-08-15T13:55:06Z
updated_at: 2026-08-20T12:21:45Z
parent: DVTD-72d9
---

Draft full roster, 0 sell refund

## Pricing (Marciano, 2026-08-20)

Definitely legendary, and expensive on purpose: draftCost at least 512KB (override, like Volkswagen CI's 384). The whole roster on the table is the strongest shop effect in the game; 0 sell refund means the KB you spend through it never comes back.

## Summary of Changes

Shipped as specced plus Marciano's pricing (legendary, draftCost 512KB override, Volkswagen precedent).

- New Config axes: `offersFullRoster` (shop-agency axis, first use of ADR-029's space) and `sellRefundKb` (sell-price override; WTFPL sets 0 — the no-warranty clause).
- `rollDraft` returns the whole remaining catalog in roster order when the build holds the license; held (locked) offers still lead. Seed is ignored in that branch, so a reroll provably changes nothing.
- The table opens the moment WTFPL is drafted (the `draft` reducer re-rolls draftOptions with the new pipeline), not at the next shop.
- Rebuild, Lock and Extend retire while installed: new `rebuildAvailable` rule + RunView field (rebuild button hides, not disables), `lockAvailable`/`extendAvailable` gained the same term, and the reducers refuse regardless of UI.
- Interpretation call, flagged: "0 sell refund" implemented as WTFPL itself selling for 0 (commitment seal), NOT as a global no-refund aura while held — the price is the cost, per the established pricing philosophy. Easy to flip if playtest disagrees.
- Selling WTFPL mid-shop leaves that visit's open table in place (harmless: 512KB spent, 0 back); the next shop rolls five again.
- Story `Shop/WTFPLOpenCatalog`; 9 new specs across draft/config/run/ShopScreen. Wiki: moved from designed-not-built to shipped roster (27 configs). Changelog entry added.
- Verified: 1638 tests pass (123 files), oxlint + dependency-cruiser clean, tsc clean.
