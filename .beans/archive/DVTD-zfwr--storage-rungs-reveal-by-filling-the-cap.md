---
# DVTD-zfwr
title: Storage rungs reveal by filling the cap
status: completed
type: feature
priority: normal
created_at: 2026-09-05T16:46:16Z
updated_at: 2026-09-05T17:03:23Z
parent: DVTD-cb52
---

The `????` storage rungs open by filling the cap below them, not by selecting the rung below them.

Today the masking is one line of Tier-2 logic (`ShopView.component.tsx`, `option.tier <= heldIndex + 1`), so renting 2 MB is what reveals 3 MB. It moves into the domain as an earned reveal off a KB watermark.

Decided while planning: **reveal only** (affordability stays the purchase rule per ADR-046's amendment, so no rung becomes unreachable), and **per account** (a Reveal in ADR-050's vocabulary: account scope, no balance impact).

Rule: `revealed(tier) = tier <= 1 || peakKb >= capOf(tier - 1)`, where `peakKb` is `max(account watermark, this run's peak)`.

Plan: ~/.claude-work/plans/add-a-high-prio-mossy-treehouse.md

- [x] `revealsPlanTier` + `RunState.peakStorageKb`, set once in `runReducer`
- [x] Viewmodel: `revealed` + the requirement cap on `StoragePlanOption`
- [x] `users.peak_storage_kb` + high-water write at gate clear + migration
- [x] Wire the account read through `run.service.ts` (live `/run` passes no account data today)
- [x] `ShopView`: drop the `heldIndex + 1` rule
- [x] `StoragePlan.ui`: masked card names its requirement instead of a second `????`
- [x] Specs, story variant
- [x] ADR-046 amendment, wiki, CHANGELOG
- [x] Verify: lint, build, stories tsconfig, tests

## Summary of Changes

Shipped. The reveal rule moved out of Tier 2 and into the domain.

- `revealsPlanTier(tier, peakKb)` in `rules.model.ts`: `tier <= 1 || peakKb >= storageCapFor(tier - 1)`. The free rung and 512 KB are always shelved so a fresh account never opens on one card and six masks.
- `RunState.peakStorageKb`, taken once around the reducer (`runReducer` wraps `reduce` and applies `withPeakStorage`), so no earner can forget to record its own peak. A refused action returns the same object, identity included, which an existing spec asserts.
- `users.peak_storage_kb` (KB, unlike `archived_storage` in bytes), raised with `GREATEST` inside the dispatch transaction after the state row, so a run that later dies keeps the mark it reached. Migration `20260905120000_add_peak_storage_kb.sql`, pushed locally.
- `run.service.ts` now reads the watermark on all three view paths; the live `/run` passed no account data at all before this.
- `ShopView` lost its `heldIndex + 1` line and composes the caption; `StoragePlan.ui`'s masked card prints the requirement instead of a second `????`.
- Docs: ADR-046 amendment (2026-09-05), wiki 5.1, CHANGELOG.

Decisions: reveal only (affordability still decides what sells, so no rung closes), account-scoped (a Reveal in ADR-050's vocabulary). Requiring a filled cap to *rent* would have been ~5x the current bill-based requirement at every rung and would have shut the 5 MB and 10 MB rungs, which already bill more than a perfect gate-12 clear pays.

Verification: lint clean (905 modules), `npm run build` clean, stories typecheck clean over the touched files, tests 3378 passed / 3 failed — the three pre-existing modern-theme RewardScreen copy failures, untouched by this work.

Note: I ran a `git stash` mid-session to check whether those RewardScreen failures predated the work, which swept the working tree. Restored immediately with `pop --index`; the tree and the stash list are back as they were.
