---
# DVTD-p5kx
title: 'Config: A/B Test'
status: completed
type: task
priority: normal
tags:
    - config
created_at: 2026-08-15T13:55:00Z
updated_at: 2026-09-03T13:18:30Z
parent: DVTD-72d9
---

Choose reward paths (coverage vs storage)

## Decisions (2026-09-03)

- Choice cadence: per shop visit, free, reversible — a ⇄ press on the shop build row (no arm/confirm; nothing is spent).
- Arms: A = all coverage ×1.25, B = +8KB per correct (shares the global faucet cap). Each at-or-below its 2-slot specialist (Coverage ×2, IndexedDB +8) — the buy is the optionality.
- 2 slots (64KB), economy family, default arm A.

## Summary of Changes

- `AbArm`, `AB_ARMS` payloads (fields + copy per arm), `switchArm`/`otherArmOf`/`abArmLabel` in config.model.ts. The switch rewrites the live config's coverageMultiplier/storagePerCorrect AND description/gives, so every surface (effects, faucet meter, headline figure, reveal attribution, row copy) reads the active arm with no new branches — the minify philosophy.
- Reducer: `switch-arm` action, rewarding-only, via `switchAbArm` in shopAction.model.ts.
- UI: optional `swap` press on ShopBuildRow (ShopScreen.ui, ⇄ glyph, single press), wired through ShopView's new `onSwitchArm` prop; proto-run dispatches it.
- Roster: **A/B Test** (ab-test), auto-surfaces in drafts.
- Wiki §4.3 row (count 31 → 32), CHANGELOG entry.
- Specs: switchArm round-trip + copy, reducer integration (arm A default ×1.25 / arm B faucet +8 / refused outside the shop), ShopView press fires in one click and absent on armless configs.

Post-completion fix: the switch-arm action also had to join runActionSchema in run.validation.ts — the type-level Assert (SchemaCoversEveryAction) failed tsc until it did. That schema is the server dispatch path, so the authed run's engine accepts the action too (its older shop screens just do not offer the press yet).

## Cadence changed (2026-09-03, ADR-053)

The shop-only, per-visit cadence recorded above is reversed: `switch-arm` is now accepted while `answering` too, and the switch scores the poll you are looking at (`switchArm` already rewrote the live effect fields, so no pending-arm state was needed). Playtest reason: a poll in the wrong category was answered on whichever arm you happened to leave the shop with, which is not a decision the player got to make. The UI press lives in the poll screen's build-row fold (`BuildList` `swap`), alongside the existing shop row press. The log line's "from the next gate" wording is gone with it.
