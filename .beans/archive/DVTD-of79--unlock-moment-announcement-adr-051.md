---
# DVTD-of79
title: Unlock-moment announcement (ADR-051)
status: completed
type: feature
priority: low
created_at: 2026-09-03T07:10:05Z
updated_at: 2026-09-06T12:14:35Z
parent: DVTD-z2r2
blocked_by:
    - DVTD-clgs
---

The grant seam knows the newly granted config ids; surface the moment through dedicated state plus a badge/screen line, never the run log (it does not render in the live game). Store which path completed so the granted Dex card can print provenance ("Earned: cleared Marsh's Mirror audit without a miss"). DVTD-yl13 carries earlier notification/badge ideas worth mining.

## Decided (ADR-064, 2026-09-06)

Two beats: a saffron alert line on the screen where the grant fires (the audit-alert idiom, never the run log) + a NEW tag on the guaranteed seat's card at the next deal. Provenance reads `user_config_unlocks.via_metric`; rows with `via_metric` null (the free eight) read as starter configs, not earnings.

## Summary of Changes

Shipped 2026-09-06 with DVTD-clgs/DVTD-g6k0. Marciano widened the beat set: immediate + "What changed" + game-over.

- `unlockNotes.viewmodel.ts` (run/run/application): `unlockLinesFor` (run history → chip lines), `justFiredLines` (unlockedThisRun ∩ unlockedConfigIds), `unlockNotesFor` (plain strings for the terminal kit). Provenance text comes from `provenanceOf` — one copy source with the Dex.
- Terminal kit `Unlocks.ui.tsx`: the audit-alert idiom in saffron with an "unlocked" badge; renders null on empty.
- Immediate beat (terminal set): PollInfo renders `<Unlocks/>` under `<Audits/>`, threaded through PollLayout → PollScreen (peek grants) + RevealScreen (answer grants); terminal ShopScreen takes `unlocks` under its notice (sell/lock/switch grants).
- Gate-clear beat: unlocks ride GateClearScreen's `changed.rows` as ChangedRow `badge {unlocked, saffron}` — RewardView prepends `justFiredLines` (mid-gate grants had their reveal beat; provenance replaces describeConfig). Row key hardened to `name·badge` (deleted AND unlocked in one clear).
- Game-over beat: GameOverScreen gains optional `unlocked` section ("Unlocked this run", DexChip rows + saffron "new" badge); GameOverView maps `view.unlockedThisRun`.
- Live thin additions (die with DVTD-tduu): module RewardScreen.ui saffron "config unlocked · {provenance}" line (RunReward passes justFiredLines); RunSummary.ui "Configs unlocked" section (RunOver passes unlockLinesFor). Accepted gap: live AnsweringScreen/ShopScreen get no immediate beat — a mid-gate live grant surfaces at the next clear only if it fired there, then always at RunSummary and in the Dex.
- NEW-tag-at-next-deal (beat two's payoff) ships with DVTD-p9ah's guaranteed seat, not here.
