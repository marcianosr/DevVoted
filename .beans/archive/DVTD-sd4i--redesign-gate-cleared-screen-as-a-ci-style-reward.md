---
# DVTD-sd4i
title: Redesign gate-cleared screen as a CI-style reward report
status: completed
type: feature
priority: normal
created_at: 2026-07-24T10:06:36Z
updated_at: 2026-07-24T10:50:58Z
---

Replace the gate-cleared Rewards box + Pipelines-status list with a test-runner/CI-style reward report (per Marciano's mockup).

## Summary of Changes
- New model `src/modules/run/gate/gateReward.model.ts`: `gateRewardRows()` attributes each pipeline config's gate contribution — coverage by summing `answered[].coverageBreakdown.configBonuses` per configId, storage as `storagePerCorrect × correctCount`, checks from `passedChecks[].progress` — plus a synthetic "Gate rewards" bonus row (= `gateReward`). `configCommand()` renders a CLI-styled effect (`coverage --mult 1.5 --scope css`, `storage --per-correct 8`, `needs: 1 correct`, `storage --gate-bonus`). `gateStorageGained()` = clear bonus + per-correct payouts. Ordered coverage → storage → check → bonus. + spec.
- New Tier-1 UI `src/modules/run/presentation/gate/GateRewardReport.ui.tsx`: compact borderless reporter — chevron + green `⊘` (red `✕` if failed) + ConfigChip/label + muted command + right-aligned tinted value (coverage green, storage amber), rows fold open into the per-config breakdown. + story.
- `RewardScreen.ui.tsx`: dropped the bordered Rewards section, RoleList, and per-category chips; now slim StatBadge totals (storage = gateStorageGained, coverage gained) + GateRewardReport + ReviewAnswers.
- Per Marciano: no "Set up gate" row; the bonus row is labelled "Gate rewards" (not "Post gate").
- Verified: 9 new/updated specs green, full run-module suite 275/276 (the 1 fail is pre-existing ConfiguringScreen.spec, fails on clean HEAD), tsc + oxlint + arch clean, Playwright screenshots match the mockup and the computed totals (+96KB storage, +5.8% coverage) are correct.

## Follow-up: per-row status + failed screen + top title

Extended the report per further mockups (#38 failed gate, #40 Steps summary, #42 header, + top title request):
- Per-row **passed/skipped/failed** status badge (green/gray/red). Focus configs judged from `answered` (skipped = category never showed; failed = showed but not enough correct → shows `needs N correct {cat}, got M` + net −coverage); checks from `CheckStatus.state`; coverage/storage default passed.
- **Steps summary** line (`Steps  N passed, N failed, N skipped`) via `gateStepsSummary`.
- Report now owns a **top title** ("Gate success!" gradient / "Gate failed!" cinnabar) with the compact `gate-N [cleared/failed]` line + totals (`+KB · +%`, cleared only) underneath. No `⊗` icon, no chevron/⊘, no run-stats.
- `gateRewardRows` takes `cleared`; bonus row = passed `+{gateReward}KB` when cleared, else skipped "gate not cleared".
- Wired into **both** RewardScreen (cleared) and StripScreen (failed, gateReward:0) — StripScreen's old "Gate failed!" header + failed-checks CheckList replaced by the report; repair/strip UI + review kept.
- Verified via Playwright: Cleared + Failed variants match the mockups. 19 gate/screen specs green; run-module 279/280 (1 pre-existing ConfiguringScreen.spec). tsc + lint clean. CoverageByCategory + StripScreen's CheckList usage now unused (CheckList still used by RunHud/RoleList/GateRequirementList).

## Follow-up: readability + one shared badge

- Rows now show each config's **roster `description` verbatim** (e.g. "All coverage ×2.") instead of the CLI-styled `configCommand` (removed) — skipped/failed focus rows keep their status message ("no css poll in this gate" / "needs 1 correct ts, got 0").
- **Dropped the "Gate rewards" bonus row** (read like a pipeline step; it's just the reward) — the clear bonus is folded into a **totals footer at the end**: `+{storage}KB storage · +{coverage}% coverage` (cleared only, labeled for clarity). `gateRewardRows` input simplified to `{answered, configs, checks}`.
- **Removed row expansion** (no `<details>`/breakdown) — rows are plain.
- **One shared test-runner badge**: new `src/ui/StatusBadge.ui` (pass/part/fail/skip → PASS/PART/FAIL/SKIP, solid uppercase) now used by BOTH the answer review (`AnswerResults`) and the gate report — fixes the passed/failed vs PASS/FAIL inconsistency.
- Verified via Playwright (cleared + failed match mockups). 36 targeted specs green; run-module 276/277 (1 pre-existing ConfiguringScreen.spec). tsc + lint clean.
