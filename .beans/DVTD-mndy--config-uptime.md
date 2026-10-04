---
# DVTD-mndy
title: 'Config: Uptime'
status: todo
type: feature
priority: normal
tags:
    - config
created_at: 2026-08-19T20:36:09Z
updated_at: 2026-09-24T12:49:09Z
parent: DVTD-72d9
---

**What:** A config that pays more for each gate cleared in a row, and resets the moment you miss one.

**Why:** The first config that grows from how you play rather than what you buy.

## Done when
- [ ] Uptime pays 8 KB on a gate clear, rising 8 KB per gate cleared in a row
- [ ] A missed gate resets it to the base
- [ ] The counter survives a reload
- [ ] A spec covers the climb and the reset

## Notes

Scaling-through-play config (Balatro Ride the Bus pattern; brainstorm 2026-08-19).

Pays +8KB on gate clear, grows +8KB per CONSECUTIVE gate cleared without a
miss; a miss resets it to base (the uptime counter resets on incident — the
name is the mechanic). First config that grows from in-run events instead of
purchased levels. Gives the peel a second bite: a miss that doesn't strip
Uptime still zeroes its growth. Family: economy, uncommon. Axis: storage on
clear (reused) + growth trigger (new).
