---
# DVTD-rjq3
title: 'Reward screen: storage ledger with per-config attribution'
status: completed
type: task
priority: normal
created_at: 2026-08-14T15:45:49Z
updated_at: 2026-08-14T17:21:37Z
parent: DVTD-9ib5
---

Marciano's mockup puts a storage ledger back on the cleared-gate screen: base reward, one `+` row per config that paid KB, a ruled total that equals the headline number. The unlock section reuses the same panel shell as the ledger.

This partially reverses ADR-026 §3 ("the gate clear is a payoff, not a report"). The reversal is narrow: what comes back is the KB math behind the one headline number, not the per-config pass/fail pipeline report that ADR-026 rejected.

## Todo
- [x] Domain: `gateStorageBreakdown` in gateReward.model.ts (base derived by subtraction so total == headline)
- [x] Expose `interestThisGateKb` + new `extraPickThisGateKb` on the run view
- [x] RewardScreen: ledger panel + matching unlock panel, per mockup spacing
- [x] StorageGauge `layout` variant so the gauge can run full-width here
- [x] Specs for the breakdown model and the screen
- [x] Amend ADR-026 §3
- [x] Run lint, typecheck, tests

## Summary of Changes

- `gateReward.model.ts`: `gateStorageBreakdown` returns `{ baseKb, rows, totalKb }`. Base is derived by subtraction so the column always sums to the headline; a config row is the sum of all four storage sources it drew on (on-clear, faucet, interest, extra-pick), each taken as that config rate share of the pot the reducer already priced.
- `run.model.ts` / `runView.viewmodel.ts` / `runView.factory.ts`: new `extraPickThisGateKb` on state, and both it and `interestThisGateKb` exposed on `RunView` — neither is recoverable from the loadout alone.
- `RewardScreen.ui.tsx`: `StorageLedger` + matching unlock panel share one `PANEL` shell; new local `Eyebrow` dedups the three letter-spaced caps labels. Column is `max-w-md`, centred.
- `StorageGauge.ui.tsx`: `layout` prop (`compact` = HUD default, `wide` = reward screen).
- ADR-026 §3 amended: the payoff itemizes its own storage; the pipeline report stays rejected.

Verified: oxlint + dependency-cruiser clean, `tsc --noEmit` clean, 120 test files / 1586 passed.

## Iteration 2 (same day, second mockup)

Marciano's follow-up mockup reversed two things from the first pass:

- **Config rows are `ConfigChip`s, not `+ label` text.** The row now carries the whole `Config` (`StorageBreakdownRow.config`, was `.label`) so the chip renders with its own rarity border/tint — a config is recognisable here by the shape it already wears in the shop and the pipeline.
- **The unlock is an inline line, not a panel.** Reverses "keep the unlock section the same as the reward section" from the first message: it is now `✓ unlocked <SwatchLabel> [cosmetic]`, centred, no shell. The shared `PANEL` const is gone; only the ledger is a panel.
- Ledger rows are separated by `divide-y divide-edge` rather than a single rule above the total.
- New `Badge` tone `muted` (`bg-surface-raised text-pewter`) for the `cosmetic` tag — the other three tones all raise their voice, this one lowers it.

Body font is already JetBrains Mono app-wide, so the mockup's monospace look needed no work.
