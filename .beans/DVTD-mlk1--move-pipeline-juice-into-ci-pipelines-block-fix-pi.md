---
# DVTD-mlk1
title: Move pipeline juice into CI Pipelines block + fix pipelines theme color
status: in-progress
type: feature
priority: normal
created_at: 2026-07-03T09:32:44Z
updated_at: 2026-07-03T11:48:03Z
---

Dedup the /pipelines score view: the animated per-slot bars currently live in a separate 'Applied to N pipeline checks' list inside PipelineScoreSummary, duplicating the CI Pipelines (CurrentPipeline) list. Move the animated progress bars into the CI Pipelines rows (proper Tier-1 UI extraction), shrink the score block to just the coverage equation. Also fix the pipelines screen theme defaulting to cerulean by threading the last-answered poll's categoryCode to Screen.

## Todo
- [x] Theme fix: getPipelineScoreHeaderFn returns categoryCode; route passes to Screen
- [x] Extract animated bar into PipelineProgressBar.ui + story
- [x] Create CurrentPipeline.ui (Tier-1) + story
- [x] Create CurrentPipeline.component (domain mapping)
- [x] Rewire pipelines.tsx, UpgradePipelineSection, pipeline-failure.tsx
- [x] Shrink PipelineScoreSummary.ui to equation-only + story
- [x] Update PipelineScoreSection.component (guard on equation)
- [x] Delete PipelineScoreStat + remove old CurrentPipeline/dead helpers
- [x] tests + tsc + lint

## Summary of Changes

**Dedup (juice moved to CI Pipelines):** The per-check animated bars used to live in a separate "Applied to N pipeline checks" list inside PipelineScoreSummary, duplicating the CI Pipelines list. Extracted the CI Pipelines block into a proper Tier-1 UI component (CurrentPipeline.ui + story) and a domain mapping component (CurrentPipeline.component), fixing the pre-existing tier violation. Each check row now carries an animated PipelineProgressBar (extracted from the deleted PipelineScoreStat) that tweens previous→current, with gain/loss pulse; static when no prior window state (upgrade/failure flows). PipelineScoreSummary shrank to just the coverage equation header.

**Theme fix:** getPipelineScoreHeaderFn now returns categoryCode; /pipelines route threads it to Screen as categoryCode, so the page themes to the last-answered poll category instead of falling back to the :root cerulean default.

**Files:** +PipelineProgressBar.ui/stories, +CurrentPipeline.ui/stories, +CurrentPipeline.component; simplified PipelineScoreSummary.ui/stories + PipelineScoreSection.component; rewired pipelines.tsx, UpgradePipelineSection.component, pipeline-failure.tsx; deleted PipelineScoreStat.ui/stories and old inline CurrentPipeline + dead helpers. tsc/lint/build clean, 516 tests pass.

## Follow-up: warn when a check can no longer pass

Bug: a cold-start check (first poll must be correct) showed as in-progress (yellow, 0/1 correct start) even after it was already impossible (player at poll 3, first poll wrong).

Added pure util `canCheckStillPass(req, ctx)` (+spec, 12 cases) mirroring evaluateSlot: returns false only when failure is locked in — cold-start streak frozen below target, correct-answers/short-window count unreachable given remaining polls, critical category-mastery already has a wrong appearance. Coverage-gain and numeric category-mastery stay possible (unpredictable future) to avoid false alarms.

CurrentPipeline.component now maps a live check that cannot pass to status "failed" + warning "This pipeline can no longer pass this gate" (red ✗ icon, red warning line replacing the progress bar). Graded gates unchanged. Added CheckCanNoLongerPass story. tsc/lint/build clean, 528 tests pass.

## Follow-up: side-by-side layout + score header

- New `Columns.ui` primitive: responsive 1/3 (aside) · 2/3 (main) grid, stacked below md, top-aligned; renders main full-width when aside is absent (pre-first-answer). pipelines route now uses it instead of Stack — score block left, CI Pipelines right.
- PipelineScoreSummary header changed from "How your last answer scored" to "Poll score for {categoryName}" (category in theme color).
- Removed the now-duplicate "Poll score for X" swatch line from CoverageEquation and dropped its leading border-t so it sits flush under the new header.
- tsc/lint/build clean, 528 tests pass.

## Follow-up: per-category polls answered

The score block streak line showed run-wide polls answered (newPollsAnswered = totalPollsAnswered+1 in orchestrateScoreCalculation) while the block is category-scoped and its streak/best are per-category. getPipelineScoreHeaderFn now overrides pollsAnswered with the per-category count from activeRun.categoryCoverage for the last poll's category. tsc/lint/build clean, 528 tests pass.

## Follow-up: page-level Pipeline status header

Added PipelineStatusHeader.ui (+story) — page title "Pipeline status", the active gate as a large themed accent beside it, and muted "N polls left until gate check" subline — plus PipelineStatusHeader.component mapping the window context. /pipelines route renders it above the Columns grid (wrapped with CurrentPipeline in a Stack). CurrentPipeline gained showWindowStatus (default true); /pipelines passes false so the gate + polls-left no longer duplicate in the CI Pipelines block. Upgrade/failure screens keep the block window status unchanged. tsc/lint/build clean, 528 tests pass.
