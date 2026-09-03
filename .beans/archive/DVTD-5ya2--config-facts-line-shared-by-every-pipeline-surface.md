---
# DVTD-5ya2
title: Config facts line, shared by every pipeline surface
status: completed
type: task
created_at: 2026-08-27T11:37:31Z
updated_at: 2026-08-27T11:37:31Z
---

Marciano's mock: an unfolded config reads its description, then a muted facts line 'common · level 1 · ×1.25 · sells for 16 KB' with the grade in its rarity colour. Asked for it on ALL pipeline surfaces.

- [x] DisclosureBody: description before facts (the sentence is why the row was opened)
- [x] Entry + Pick: detail block ruled and indented under its row
- [x] RarityWord: dropped its own middot, now just the coloured word (it sits in a punctuated list)
- [x] ConfigFacts.ui (new, + spec): one line shared by deal, shop, prep, rail
- [x] levelFact: base level 1 when the config has a ladder, silent when it has none
- [x] Refund is the build's own (sellRefundIn), absent in the deal
- [x] Widened summary to ReactNode on PipelineRow, DealtConfig, PrepConfig
- [x] CHANGELOG + wiki §8

## Summary of Changes

`ConfigFacts.ui` (modules/run/config/presentation) is the one facts line: grade via `RarityWord` (now separator-free, since the caller punctuates), level via `levelFact`, rate via `figureLabel`, refund passed in by the caller, plus an optional trailing note (the rail's paid-action shortfall). Wired into PollView/RevealView (rail, with `sellRefundIn(view.configs, config)`), StartView (deal, no refund), PrepView, and ShopView (offers without refund — their price is on the tag; owned with). Each surface's own thin `v{level}` summary deleted. `DisclosureBody` now reads description-then-facts, and Entry/Pick rule the detail block.

Known redundancy, left deliberately: on the deal and prep the rate shows twice — once in the shared right-hand column you scan, once inside the facts line you read. Flag for Marciano.

Verification: lint + depcruise clean, tsc/build clean, 2480 tests pass (pre-existing red: RewardScreen ×3, DVTD-9dn0).
