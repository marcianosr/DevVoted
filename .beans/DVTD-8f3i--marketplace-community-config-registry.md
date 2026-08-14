---
# DVTD-8f3i
title: 'Marketplace: Community Config Registry'
status: draft
type: feature
priority: normal
created_at: 2026-08-11T15:29:50Z
updated_at: 2026-08-11T15:30:48Z
---

Player-selling system for upgraded configs

## Concept
Players can list upgraded configs for other players to purchase, creating an economy around config trading.

## Implementation Questions
- Seller loses the config on listing (doesn't duplicate)?
- Shop takes a 10-20% KB fee on sales?
- Which configs can be sold (exclude starters)?
- How to prevent price manipulation by whales?
- Do listings expire? After how long?

## Features to Design
- List view: **Seller name** + Config name + Level + KB cost + Recent sales price
- Buy order / Sell order system
- Suggested market value
- Inventory status (remove from seller until sold/cancelled)
- Social layer: "Matthijs offers his rare config React Query Lv.5 for 420 KB"

## Design Notes
- This is a game-within-the-game mechanic
- Should be a later unlock, not early build
- Real economy requires actual cost (KB fee) and inventory constraint
- Could show: 'Only 3 Lv.5 React Query configs currently listed'
