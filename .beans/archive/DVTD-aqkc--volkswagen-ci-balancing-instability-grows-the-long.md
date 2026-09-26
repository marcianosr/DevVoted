---
# DVTD-aqkc
title: 'Volkswagen CI balancing: instability grows the longer you run it'
status: scrapped
type: task
priority: normal
created_at: 2026-08-20T12:28:02Z
updated_at: 2026-09-06T10:09:16Z
---

Nerf lever for if/when Volkswagen CI proves too strong, parked until playtesting says so.

Balancing idea (Marciano, 2026-08-20), only if Volkswagen CI needs a nerf: the defeat device destabilizes the app the longer it runs. Each gate you hold it (or each audit it suppresses), instability grows — and with it the chance that a system malfunctions, e.g. the shop refuses to open this visit.

## Sketch

- Instability level ticks per gate held (or per fraud committed — decide which; per-fraud fits the name better: a device that never cheats never destabilizes).
- Roll per shop/system touchpoint: seeded like the audits' offline picks, so a reload never re-rolls the outage.
- First malfunction candidate: the shop — present it as the existing Read-only treatment rather than a new screen (reuse vocabulary, no new words).
- Escalation: later levels could take the linter or the peek down for a window.

## Constraints to respect

- ADR-038 learnability: this must not randomize the gate's fixed audits. It is self-inflicted risk from a config the player chose — the roll targets the player's own systems, never the gate's rules.
- The receipt should state the instability level before the gate, the way audits are stated: visible odds, no hidden dice.
- Reducer stays pure: seeded rolls only.

## Why this shape

True to the name: an emissions defeat device is exactly a hack that degrades the system the longer it runs undetected. Price (384KB) stays the entry cost; instability becomes the usage cost — note this bends "price is the cost, no per-use fees", which is why it stays parked until the config actually proves too strong.
