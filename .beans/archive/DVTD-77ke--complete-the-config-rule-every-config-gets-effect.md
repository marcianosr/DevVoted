---
# DVTD-77ke
title: 'Complete the Config Rule: every config gets Effect + Check'
status: completed
type: feature
priority: normal
created_at: 2026-07-31T09:54:58Z
updated_at: 2026-07-31T11:02:20Z
---

Implement wiki §4.1/§4.3 for the shipped roster: every config = Effect (benefit) + Check (requirement); a gate fails if any active check fails. Copilot stays the only checkless config; only Unit Tests escalates.

Scope: shipped roster only. No debt cards (follow-up bean). Unit Tests → flat +32KB on clear, not upgradable.

Plan: /Users/marciano/.claude-work/plans/i-want-you-to-mellow-patterson.md

## Todos

- [x] config.model.ts: CheckKind union, storageOnClear/openerCoverageMultiplier, isUpgradable focus-only, drop upgradeCost
- [x] effect.model.ts: benefitOf/checkOf split, six check builders, AnswerContext, GateWindow extensions
- [x] configRoster.model.ts: data deltas + new descriptions
- [x] pipeline.model.ts: AnswerContext signatures, storageOnClearFor
- [x] gate.model.ts: baseline reads checkAmount
- [x] rules.model.ts: FAUCET_CAP_KB = 320
- [x] run.model.ts: lint recording, miss streak, per-category gained, faucet cap, +32KB on clear, upgrade tightening
- [x] runSnapshot.model.ts: refreshConfig roster-authoritative hydration
- [x] runView.viewmodel.ts + configRole.model.ts + gateReward.model.ts
- [x] Presentation: ShopScreen, stories
- [x] Docs: ADR-016, ADR-006 amendments, CHANGELOG

## Summary of Changes

- `effectOf` split into `benefitOf` + `checkOf` (orthogonal derivations); CheckKind grew min-correct / no-double-miss / breadth / lint-correct.
- All 5 checkless configs wired (ESLint, Stylelint, IndexedDB, Code Coverage, Intellisense); Coverage/Cold Start/Intellisense effects reconciled with wiki §4.3; config checks no longer escalate (baseline only).
- Unit Tests: flat +32KB on clear (storageOnClear), not upgradable; upgradeCost removed.
- GateWindow gained missStreak/maxMissStreak, lintedByConfig, per-category gained; RunState gained faucetEarnedKb/faucetThisGateKb (FAUCET_CAP_KB=320).
- hydrateRunState refreshes embedded configs from the roster (level preserved) so in-flight runs pick up the new rules.
- gateReward rows: status from check, value/kind from benefit; roleOf treats lint-correct as conditional.
- Docs: ADR-016, ⚠ amendments in ADR-006 (D3/D4/D5), CHANGELOG entries, wiki appendix FAUCET_CAP_KB row.
- Verified: 974 tests pass (106 files), oxlint + dependency-cruiser clean, tsc build clean. Two RunHud specs + one RewardScreen spec were already failing on HEAD (stale after bf64bab) and were realigned with the shipped UI.

Not committed — diff awaiting review.
