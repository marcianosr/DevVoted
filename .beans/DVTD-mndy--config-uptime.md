---
# DVTD-mndy
title: 'Config: Uptime'
status: todo
type: task
tags:
    - config
created_at: 2026-08-19T20:36:09Z
updated_at: 2026-08-19T20:36:09Z
parent: DVTD-72d9
---

Scaling-through-play config (Balatro Ride the Bus pattern; brainstorm 2026-08-19).

Pays +8KB on gate clear, grows +8KB per CONSECUTIVE gate cleared without a
miss; a miss resets it to base (the uptime counter resets on incident — the
name is the mechanic). First config that grows from in-run events instead of
purchased levels. Gives the peel a second bite: a miss that doesn't strip
Uptime still zeroes its growth. Family: economy, uncommon. Axis: storage on
clear (reused) + growth trigger (new).
