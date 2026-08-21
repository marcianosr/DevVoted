---
# DVTD-9aks
title: 'Subscriptions panel: one place for every recurring KB cost'
status: completed
type: feature
priority: high
tags:
    - config
created_at: 2026-08-20T18:16:39Z
updated_at: 2026-08-20T19:22:38Z
parent: DVTD-72d9
---

Recurring KB costs exist in two unrelated systems and are only ever shown after they are charged:

- the storage plan bill (`chargeStorageBill`, `gateBillKb`, `planDowngraded`, ADR-023)
- config subscriptions (`billSubscriptionsOnClear`, `subscriptionBillKb`, `lapsedConfigs`, e.g. Freemium at 8KB doubling per gate)

Today both only surface on RewardScreen, as separate scattered lines after the clear has settled. Nothing answers "what do I owe at the next gate, and can I cover it?"

One panel, listing every line that bills KB, with the total and whether the balance covers it.

- [x] Domain: one function returning the whole bill (plan line + each subscribed config), so the panel does no arithmetic
- [x] Tier-1 panel listing each line, its KB, the total, and a cannot-cover state
- [x] Mount where the decision is made (prep/shop, before the gate), not only after
- [x] Specs + story

## Summary of Changes

Landed as a **Subscriptions** section inside `GateStakeReceipt`, not a standalone panel: the receipt already renders on prep, configuring and shop, so one section reaches all three pre-gate surfaces and there is nothing to duplicate.

- `billLedger` in `subscription.model.ts` composes the plan line and every subscribed config into one `BillLedger` (lines, `totalKb`, `onMissKb`, `shortfallKb`). Takes the plan as primitives (`planBillKb`, `planTier`) rather than the run aggregate's `StoragePlan`, so the config aggregate keeps no upward dependency.
- `GateStake.subscriptions` on the viewmodel, built in `toRunView`. Tier 1 does no arithmetic.
- `SubscriptionRows` in `GateStakeReceipt.ui.tsx`, following that file's own local-section pattern (`RewardsList`, `AuditRows`, `MissCost`). Mounted on both `GateStakeReceipt` and `GateStakeRewards`.
- The old single "Storage bill" `RewardRow` is deleted; the section supersedes it. The existing PrepScreen spec that asserted it was retargeted, not dropped.
- Each row names its own billing trigger. The plan bills pass or fail (`chargeStorageBill` runs before the verdict, ADR-035), a config bills on clears only (`billSubscriptionsOnClear`), so `onMissKb` is quoted separately. Flattening them would have told the player a miss costs more than it does.

Specs: 6 on `billLedger`, 5 on the section, 1 on the viewmodel ledger. Stories: `PaidStoragePlan` (rewritten), `PlanAndConfigSubscriptions`, `SubscriptionsUnaffordable`.

Verified: 1687 tests pass (126 files), `tsc --noEmit` clean, oxlint + dependency-cruiser clean (559 modules). Wiki §5.1 and CHANGELOG updated. Not clicked through in the browser.

## Follow-up

`shortfallKb` warns on the total but does not predict *which* line lapses. `billSubscriptionsOnClear` settles in roster order against a running balance, so the answer is knowable and could be shown per row.
