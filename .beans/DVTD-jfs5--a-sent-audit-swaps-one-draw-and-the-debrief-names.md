---
# DVTD-jfs5
title: A sent audit swaps one draw, and the debrief names the audits you faced
status: in-progress
type: bug
priority: normal
created_at: 2026-10-03T18:03:16Z
updated_at: 2026-10-03T18:09:36Z
---

**What:** An audit a rival sends swaps out exactly one of the gate's drawn audits, filing works anywhere before the gate, a refused filing says why, and the gate debrief names the audits that gate actually ran.

**Why:** The 2026-10-03 playtest found sending one audit reshuffled the whole gate, the debrief listed the next gate's audits as fired, and a refused filing showed nothing.

## Done when

- [x] A sent audit changes one drawn audit at most; the rest of the day's draw stays
- [ ] An audit can be filed in the shop, in prep, and on the build screen alike
- [x] A refused filing tells the player why
- [x] The gate debrief names the audits that gate ran, not the next gate's
- [x] Wiki states the replacement rule as built

## Notes

Playtest rig and findings: the session of 2026-10-03 (headless, Agatha → Lance 507 at gate 5, Blue at gate 8).
- Reshuffle cause: `drawPayloads` shuffles `eligibleFor(pool, taken)`, so removing the incident's family changes the shuffled list. Fix: shuffle the whole pool once, walk it and skip what clashes.
- Status mismatch: `fireAuditService` accepts `isPrepPhase` (configuring | rewarding), the reducer only `rewarding`. Prep after a shop is already `rewarding`; only the build screen failed.
- `useFireAudit` only commits on success; the error envelope is dropped.
- `gateOutcome.viewmodel.ts` builds `auditIds` from `view.gateStake`, which after a close is the next gate's stake (since 7ca5e345).
- Deferred, separate beans offered: a filing that duplicates the target gate's own draw is wasted; PERFECT ring in the gate's hue reads as the rival ring; no confirmation after filing; 451 seals render blank instead of ?????.

- Build-screen filing: reducer now uses isPrepPhase; its spec (runAction.model.spec) cannot run until accuracyBonusAfter in coverageRatio.model.ts is written (another session's stub). Tick the box once it passes.
