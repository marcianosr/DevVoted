---
# DVTD-mpd4
title: 'Memory Leak config: footprint grows each gate until restarted'
status: draft
type: feature
priority: normal
created_at: 2026-09-02T08:53:58Z
updated_at: 2026-09-12T12:58:03Z
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

## Model change 2026-09-12 (DVTD-nd6r)

The mechanic gets simpler. A footprint that grows +1 slot per gate now grows the
config's share of the weight upkeep bill (ADR-074 decision 1), so the cost is
stated in KB every gate instead of in slots the player may or may not be able to
spare. That is a readable condition without needing a new cost axis, which
answers the count-the-axes todo: growing footprint is not a new axis any more,
it is the existing upkeep axis moving.

Two todos above change:

- Interaction with "peel share": there is no peel share. ADR-074 decision 4
  peels only what it takes to make the upkeep affordable, which a leaked config
  will trigger on its own eventually. That is arguably the config's real
  failure mode and worth designing deliberately.
- "Whether growth pauses on a redo gate (redos are free of recurring costs per
  ADR-046)": ADR-046 is superseded. Upkeep bills at every gate close, and under
  ADR-071 a repeat is a full gate, so nothing is free of recurring costs now.
  Decide whether a leak grows on a repeat.
