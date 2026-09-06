---
# DVTD-hmde
title: 'Config: Dockerfile images one config into the next run'
status: draft
type: feature
priority: normal
tags:
    - config
created_at: 2026-09-06T08:04:59Z
updated_at: 2026-09-06T09:57:04Z
parent: DVTD-72d9
---

## Design (2026-09-06 session)

- 4 slots. When the run ends by victory or death (never abandon, which banks nothing on every other channel too), pick one installed config; your next run's starting hand deals it as a guaranteed extra card.
- It is dealt, not installed: the hand still picks nothing for you (ADR-052/057 intact), so the image is an option, never a head start you did not choose.
- It cannot smuggle: you can only image what you owned, and you could only own what was granted, so ADR-050 (unlocks are achievement-only) holds by construction.
- Overlap to resolve first: DVTD-xbri already plans "config injections" as an archive spend. Same idea from two directions (earned in-run vs bought from archive). Fold into ONE design before building either.

## dotfiles as the upgrade path (folded from a separate pitch)

L2 could make the image standing: the imaged config appears in EVERY future run's hand, not just the next, until a run dies while it is installed (your setup was on the machine that burned). No seasons exist as a gameplay reset yet (the schema has the table, nothing resets on it), so the death-bound is the only available boundary for a standing effect. Revisit if seasons ever become a competitive reset.

## Todo

- [ ] Reconcile with DVTD-xbri's config injection
- [ ] Decide whether the image is a 6th card or replaces one of the seeded 5
- [ ] Decide the dotfiles upgrade path (standing image, death-bounded)
