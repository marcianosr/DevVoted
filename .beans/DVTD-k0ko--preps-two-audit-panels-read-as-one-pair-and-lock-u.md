---
# DVTD-k0ko
title: Prep's two audit panels read as one pair, and lock until gate 3
status: completed
type: feature
priority: normal
created_at: 2026-09-24T07:39:16Z
updated_at: 2026-09-24T07:59:45Z
---

Prep draws both halves of the audit loop but neither states its direction, and the floor is one-sided.

## Decisions (Marciano, 2026-09-24)

- Keep ADR-099 D4: the server still draws the payload. Expanding a rival reveals the 1 (HEALTHY) or 2 (PERFECT) rolled payloads, not a free pick of the pool.
- Unlock at gate 3, not 2: `auditCapacityFor(gatesCleared) > 0`. You may fire only from a gate that could carry an audit.
- Titles stay existing words: "Audits" and "Your audit". No inbound/outbound.
- "respond" is a shortcut that opens the sender's row in Your audit, not a new mechanic.

## Corrections to the mock

- 96 KB per peer: storage is hidden by ADR-101 D2. Use weight (`publicWeightOf`).
- "One request a gate, 32 KB": one audit a RUN, and 32 KB is the survivor's reward.
- "peers within one gate of you": the rule is at your gate or ahead.
- Effect lines come from `auditAt(id, gate).description`, never re-authored.

## Todo

- [x] `AUDITS_FROM_GATE` derived from `AUDIT_TIERS`
- [x] `canFireFrom` + gate `eligibleRivals` on it (server enforces, not just the screen)
- [x] `AttackOfferView` gains `userId`; weight is derived in the presenter
- [x] `targetedConfigOf` names the config a level-edge payload hits
- [x] `AuditView.sentBy` keeps the sender id
- [x] `attackPanelFor` takes the gate and branches to a locked state
- [x] prep audits panel locked branch
- [x] `AuditsPanel.ui.tsx` extracted from PrepScreen with sender face + respond
- [x] `AttackPanel.ui.tsx` rows: face, gate swatch, weight, inspect/close, payload rows
- [x] `PrepView` owns the open-rival state, threads onInspect/onRespond
- [x] fixtures, stories, specs
- [x] ADR-105 for the symmetric floor
- [x] wiki + CHANGELOG

## Summary of Changes

**Domain.** `AUDITS_FROM_GATE` is derived from `AUDIT_TIERS` (gate 3). `canFireFrom(attacker)` is `auditCapacityFor(gatesCleared) > 0`, and `eligibleRivals` returns `[]` below it — the one choke point both `offersForAttacker` and `fireAudit`'s `aim` pass through, so the server enforces the floor rather than the screen hiding the press. ADR-105 records it.

**Viewmodel.** `AttackOfferView` carries `userId`; `PayloadView` carries the roster `effect`. `targetedConfigOf` names the config a payload takes out, but only for `highest-level` / `lowest-level` and only when one config sits at that edge — the seeded picks need a poll window no rival exposes. `attackPanelFor` takes the gate first and branches to a locked state. `gateLabelOf(gate)` moved to `swatchTrack.viewmodel` now two surfaces state it, which retired the dead `gateName` field on both view types.

**UI.** New `AuditsPanel.ui.tsx`, lifted out of `PrepScreen`: each row names its sender with a `Climber` face, falls back to a dashed "no sender" for a schedule dealt before rivals filled it, and carries the `respond` press. `AttackPanel` rows became people — face, gate swatch, `N weight` (never storage, ADR-101 D2), the build always visible, and an `inspect`/`close` toggle that reveals the rolled payloads with a `hits <config>` badge and lights that chip in the build. `PrepView` owns the open-rival state; Tier 1 holds none.

**Not built, deliberately:** the mock's free pick of four payloads (ADR-099 D4 refuses it), the `96 KB` per peer (ADR-101 D2 hides storage), and "One request a gate, 32 KB" (one audit a *run*; 32 KB is the survivor's reward).

**Verified:** `npm run lint` clean (4 pre-existing warnings, no new), `npm run build` + `tsc --noEmit` clean, `npm test` 187 files / 3613 tests passing. No browser check, per the standing preference.
