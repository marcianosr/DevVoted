---
# DVTD-khf1
title: 'Config: Peer Dependencies'
status: todo
type: feature
priority: normal
tags:
    - config
created_at: 2026-08-20T10:00:17Z
updated_at: 2026-09-24T12:49:16Z
parent: DVTD-72d9
---

**What:** A config that names one random other config as its peer: much better while you hold the peer, still worth something without it.

**Why:** Synergy that is never dead, and the decision happens in the shop: hunt the peer, or run warned.

## Done when
- [ ] The peer is rolled when it is drafted, and shown before you buy
- [ ] Holding the peer pays 48 KB on a gate clear; missing it pays 16 KB and shows a warning
- [ ] Losing the peer later brings the warning back
- [ ] The roll survives a reload

## Notes

npm-true synergy config (brainstorm 2026-08-19; survived two scrutiny rounds).

Declares ONE random roster config as its peer, rolled at draft (seeded, reload-
safe like OfflinePick) and visible in the shop tooltip BEFORE buying — you read
the peerDependencies field before installing. Peer installed: +48KB on gate
clear. Peer missing: +16KB and the rail shows a `WARN unmet peer dependency`
badge. Works exactly like npm: unmet warns and carries on, never blocks.

- Passes the synergy rule: never functional-dead (unmet still pays), better met.
- The shop moment is the decision: commit to hunting the peer, or run warned.
- Peeling/selling the peer later re-triggers the WARN mid-run.
- Player-chosen peers rejected: you'd pick what you own and the warning never fires.
- Open tuning: should shop drafts slightly favor the missing peer while WARN is
  live (the shop "suggesting" the npm install)? Touches draw-space — decide at build.
