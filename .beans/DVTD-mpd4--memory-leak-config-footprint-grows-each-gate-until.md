---
# DVTD-mpd4
title: 'Memory Leak config: footprint grows each gate until restarted'
status: draft
type: feature
created_at: 2026-09-02T08:53:58Z
updated_at: 2026-09-02T08:53:58Z
---

Salvaged from the 2026-09-02 Docker run-memory exploration (rejected — slots stay). The one genuinely new mechanic the metaphor surfaced: a config whose slot footprint GROWS over the run until the player pays to restart it.

## Sketch

- Real dev name: Memory Leak (literal, no coinage).
- Effect: strong base multiplier for its size class.
- Cost condition: slots grow +1 per gate cleared, until a flat, stated-up-front restart fee resets it to base. Flat fee, not doubling — a readable condition in the Deprecated mold (its coverage decay, inverted into a growing cost), NOT a per-use fee (banned).
- Bolts onto slots as one roster card: zero economy change, delete-one-config blast radius if it plays badly.

## Must pass before leaving draft

- [ ] Config scrutiny checklist (live decision? competitively rational? true name semantics?)
- [ ] Count-the-axes: growing-footprint is a NEW cost axis — name it in the inventory
- [ ] Interaction with Minify (can you minify a leaked config? what is half of a leaked footprint?) and with peel share
- [ ] Where the restart press lives (shop only, or prep too) and what the row copy says
- [ ] Whether growth pauses on a redo gate (redos are free of recurring costs per ADR-046)
