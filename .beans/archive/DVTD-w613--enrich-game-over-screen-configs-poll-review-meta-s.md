---
# DVTD-w613
title: 'Enrich game-over screen: configs, poll review, meta-storage bar'
status: completed
type: feature
created_at: 2026-07-24T14:00:54Z
updated_at: 2026-07-24T14:00:54Z
---

Extend the end-of-run RunSummary with: installed configs beside the gate ladder, a whole-run poll review, and a "stored in meta storage" archived-KB bar (Image #3).

## Todo
- [x] Engine: add run-wide `allAnswered` accumulator to RunState (append per answer, never reset per gate); guard old snapshots
- [x] View: expose `allAnswered` on RunView via toRunView (`?? []`)
- [x] Tier-1 `src/ui/runs/MetaStorageBar.ui.tsx` (carried/lost/percent from storageCreditRate) + story + spec
- [x] RunSummary: configs ConfigChip row, ReviewAnswers, MetaStorageBar; derive carriedKb
- [x] Wire configs + allAnswered in RunGame + proto-run; trim redundant archived-storage copy
- [x] Update RunSummary spec + story; verify tests/tsc/lint

## Summary of Changes

- **Engine**: `RunState.allAnswered?` accumulates every `AnsweredPoll` across the whole run (the answer reducer appends to both `answeredThisGate` and `allAnswered`; `finishReward`/`resumeClimb` only reset the per-gate list). Auto-persisted (snapshot is `Omit<polls>`); optional field + `?? []` guards legacy snapshots. Refactored the answer object into a single `answeredPoll` const (no duplication).
- **View**: `RunView.allAnswered` = `state.allAnswered ?? []`.
- **MetaStorageBar** (Tier-1): amber bar, "{carried}KB carried · {pct}% of {total}KB" + "{lost}KB lost". Percent/lost derived from `carried` + `total`.
- **RunSummary**: added optional `configs` (ConfigChip row, "Configs installed") + `answered` (ReviewAnswers fold-out); `carriedKb = storage × storageCreditRate(won?"victory":"dead", gatesCleared)` feeds the meta bar. Marciano then restyled the banner: dropped the colored `outcomeBanner` box, made the Title a green gradient.
- Wired both call sites; trimmed RunGame's archived-storage sentence to "A fresh seed drops tomorrow." (meta bar now shows the share).

Verify: new/updated specs green (RunSummary, MetaStorageBar, gateLadder, run.model, runView, runSnapshot — 85+ across affected suites), tsc clean on touched files, oxlint + dependency-cruiser clean. Pre-existing unrelated failures unchanged: RunHud.spec ×2, RewardScreen.spec ×1.
