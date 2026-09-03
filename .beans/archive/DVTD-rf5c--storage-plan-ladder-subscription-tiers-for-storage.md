---
# DVTD-rf5c
title: 'Storage plan ladder: subscription tiers for storage cap'
status: completed
type: feature
priority: normal
created_at: 2026-08-09T09:14:47Z
updated_at: 2026-08-09T09:37:22Z
---

Replaces the scrapped storage-configs system (DVTD-xmu7). Storage capacity becomes a subscription: Tier 1 free (512 KB cap), Tier 2 640 KB at 8 KB/gate, Tier 3 768 KB at 16 KB/gate. Bill charged every closed window pass or fail; insolvency auto-downgrades to tier 1; switching in shop only, both directions, voluntary downgrade clamps immediately. Ladder is the only slot-free economy item; earners (IndexedDB) stay pipeline configs under the Config Rule.

## Todo
- [x] rules.model.ts: STORAGE_PLANS constants
- [x] run.model.ts + spec: storagePlan state, billing in closeWindow (pass+fail), insolvency auto-downgrade, change-plan action, finishReward clamps to plan cap
- [x] validation schema for change-plan
- [x] runView.viewmodel + factory: tier, dynamic storageCap, bill preview, tier options
- [x] ShopScreen.ui + spec: plan ladder section; wired RunShop.component + proto-run + stories
- [x] GateStakeReceipt bill line (receipt owns the stake copy, not GateStakeSummary); PrepScreen prop + spec + story
- [x] Reward + Strip screens: bill receipt line and unpaid-downgrade notice
- [x] ADR-023 (022 left reserved: code already cites an unwritten ADR-022 for the lint pledge)
- [x] wiki §5 + glossary + Numbers Reference + CHANGELOG; stale overflow ⚠ in §5.1 fixed
- [x] lint clean, build clean, tests: no new failures (5 pre-existing reds at HEAD, 2 of which — stale cap-clamp expectations — updated to the DVTD-0h4n behavior and now green; lint-pledge red remains, flagged)

## Summary of Changes

Storage plan ladder shipped end-to-end (ADR-023): STORAGE_PLANS in rules.model.ts (512 free / 640@8 / 768@16); chargeStorageBill first in closeWindow (bills pass or fail, insolvency auto-downgrades to free, no partial collection); change-plan shop-only action with instant clamp on downgrade; finishReward clamps to the plan cap. View exposes storagePlans/storageBillKb/gateBillPaidKb/planDowngraded + dynamic storageCap. UI: plan ladder section in ShopScreen (burn tooltip on downgrades), bill line in GateStakeReceipt via PrepScreen, bill receipt + unpaid-downgrade notice on Reward and Strip screens. Wired in RunShop/RunPrep/RunReward/RunStrip and proto-run. Docs: ADR-023 (022 reserved for the cited-but-unwritten lint-pledge ADR), ADR-015 marker, wiki §5.1/§5.2/glossary/appendix (+ fixed stale overflow ⚠), CHANGELOG entry.

Verification: build clean, lint clean, tests 1309 passed with zero new failures (5 reds pre-exist at HEAD; 2 stale cap-clamp expectations updated to DVTD-0h4n behavior and now green). Browser verify was started and cut short at Marciano's request — not run.

Known pre-existing red left untouched: run.model.spec 'fails the gate when a lintable poll is answered without linting' — lintState returns 'skipped' when offers were declined; the ADR-022 declined-pledge fail-state is unbuilt.
