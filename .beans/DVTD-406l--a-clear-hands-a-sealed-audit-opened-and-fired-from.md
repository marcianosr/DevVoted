---
# DVTD-406l
title: A clear hands a sealed audit, opened and fired from the shop (ADR-105)
status: in-progress
type: feature
priority: high
created_at: 2026-09-23T19:23:15Z
updated_at: 2026-09-23T19:23:15Z
parent: DVTD-h175
---

Review point 6 on the design: ADR-099 made audits rival-fired but the acquisition is a bare credit (`RunState.attack = { band }`), the payload is unknown until the prep picker deals rivals, there is no hold / discard / replace, and the picker sits on prep. The wiki jumps from "a HEALTHY clear arms one attack" to "three rivals are offered" — no item-acquired moment.

## Decided (2026-09-23, Marciano)

| Question | Decision |
| --- | --- |
| Rubber band | Every clear hands one **sealed audit**. OK opens two payloads and keeps one; HEALTHY one; PERFECT one and is offered **every** eligible rival instead of three. OK closers stay untargetable (ADR-099 D4). |
| Location | All in the shop: open, keep, pick a rival, fire. **Repackage** joins Rebuild / Extend / git tag. Prep drops the panel. |
| Vocabulary | sealed audit · open · keep · fire · Repackage. Never "package" or "attack" in player copy. |
| Hold | One in hand. A clear while holding **offers** a second for the shop visit: fire the held one and the offered slides in; Take swaps; leaving keeps the held one. |
| Repackage | `REPACKAGE_KB` 32 flat, once a shop, opened audits only, refused under 405. Never sells an audit. |
| Open draw | From the pool of the lowest gate the audit can land on: `poolForGate(max(gatesCleared + 1, FIRST_AUDITED_GATE))`; family/deny rules still bite at lock time. Seed stamped server-side (`withSeed`) — `Build.id` is the constant "build". |
| Renames | attack → heldAudit, Attack → HeldAudit, attackEarned → auditHanded, AttackPanel → HeldAudit.ui. `fire-audit`, `Attacker`, the `incident` module keep their names. |

## Build slices

- [ ] 1 Rename attack → heldAudit; hydrate legacy `attack` snapshots; UI half of the rename in the same commit
- [ ] 2 Every clear hands a sealed audit; a second is offered; `closedStrong` decoupled from the band predicate
- [ ] 3 open-audit / keep-payload / take-audit / repackage / fire-audit in the shop (rule-table entries, `withSeed`, `REPACKAGE_KB`, `FIRST_AUDITED_GATE`, ShopControls)
- [ ] 4 Rivals are dealt, not payloads (`RivalOffer`, `admitsPayload`, `offerCountFor`, `rivalsFor`)
- [ ] 5 Services, seed stamping, hooks (`rivals.service`, `useRivals`, fire refusals, `getRivals` server fn)
- [ ] 6 Kit: `HeldAudit.ui` (+ spec + stories) replaces `AttackPanel`, `Audit.lockedLabel`, fixtures
- [ ] 7 Presenter `heldAuditPanelFor`, `ShopScreen.heldAudit`, `ShopView` / `RunShop` wiring, Repackage control row
- [ ] 8 Prep removal, debrief chip "sealed audit handed"
- [ ] 9 proto-run: panel moves to the shop step, rig seed, "Hand a sealed audit" dev button
- [ ] 10 Docs: ADR-105, ADR-099 D3/D4 pointers, ADR-101 D1 amendment, README, rejected.md, wiki §2.3 §5.2 §7.4 §9 §10, CONTEXT.md, CHANGELOG (edit the unreleased ADR-099 entry in place)

## Related

DVTD-87ql (ADR-099, D3/D4 superseded here), DVTD-rawb (ADR-101 builds are open), DVTD-trc0 (the other non-config shop section), DVTD-g1p0 (the summit decision, ADR-106, same review).
