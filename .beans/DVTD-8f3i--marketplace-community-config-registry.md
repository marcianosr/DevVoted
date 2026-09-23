---
# DVTD-8f3i
title: 'Marketplace: Community Config Registry'
status: draft
type: feature
priority: critical
created_at: 2026-08-11T15:29:50Z
updated_at: 2026-09-22T11:33:26Z
parent: DVTD-h175
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

## Design — availability and visibility (Marciano, 2026-09-22)

**The market is always browsable; builds can only change inside the Registry.**
That preserves the gate rhythm while making the social system alive between
daily segments.

### Always available (Community, or another player's profile)

- Inspect builds
- Browse completed-run listings
- Watch configs
- Submit bids
- Create Config Requests
- Click a config in someone's active build and request it

### Registry only

- Claim a purchased config
- Install it
- Sell or transfer one of your own eligible configs
- Merge or modify configs
- Resolve capacity problems

A bid accepted while the buyer is mid-gate becomes an **incoming package**
waiting in their next Registry. **It never modifies the live build.**

### Two doors

The shop carries the contextual escape link:

> Didn't find what your build needs? **Browse the Config Market →**

But the market must also be reachable from **Community**, because players spend
most of the real-world day outside the Registry.

## Builds are public

Yes, and it strengthens the whole social layer.

**Show:** installed configs · levels · weight · provenance · configs currently
listed or receiving requests.

**Hide:** the current poll · picks · prefetched future categories · unrevealed
audits · anything that could reveal an answer.

Open builds create the interactions that make a board worth visiting:

- "That is a clever build."
- "I need their ESLint v3."
- "Everyone at Volcano appears to be running Cache."
- "This config survived six gates and two outages."
- "I want to challenge this player."

Better than builds being private until somebody installs a visibility config.

## Active-build requests

Requesting a config from a **live** build does not remove it. Instead:

1. You submit a bid using **archived storage**.
2. The amount is **escrowed**.
3. The owner sees the request.
4. They may **accept provisionally**.
5. The transfer **settles only when their run ends**.
6. If the config is **peeled** before then, the request fails and escrow returns.
7. The buyer receives it as an **incoming package**.

Listings from **finished** runs can be bought immediately, but are still
installed only inside a Registry.

## What this answers from the questions above

- *Seller loses the config on listing?* For a live build, no: it settles at run
  end, and a peel voids the sale.
- *Inventory status?* Escrow plus provisional accept replaces removing it from
  the seller.
- *Where does it live?* Two doors, Community and the shop's escape link, not a
  shop-only screen.

Still open: the KB fee, which configs are eligible, listing expiry, and price
manipulation.

## Open

- [ ] Escrow in **archived storage**, not run KB: confirm it cannot touch a live
      run's economy
- [ ] What the owner sees, and whether a provisional accept can be withdrawn
- [ ] Incoming-package UI in the Registry, and what happens if it no longer fits
- [ ] Build visibility on a **dead** run vs a live one
- [ ] Whether requesting from a live build leaks anything the hide-list protects
