---
# DVTD-xup9
title: Move score block to /pipeline as animated per-pipeline breakdown
status: completed
type: feature
priority: normal
created_at: 2026-07-03T08:16:42Z
updated_at: 2026-07-03T08:32:11Z
---

Move the review-screen score block onto /pipelines, reframed per pipeline check with prev→new animation (count-up, bars, pulse, stagger). Equation header kept as compact top summary. Remove block from review screen.

## Todo
- [x] Server: buildWindowContext helper + getWindowContextWithPreviousFn (runs.ts)
- [x] getSlotProgress util + spec
- [x] useCountUp hook (ui)
- [x] PipelineScoreStat.ui + story
- [x] CoverageEquation.ui + story (lifted from PollScoreSummary)
- [x] PipelineScoreSummary.ui + story
- [x] Wire via PipelineScoreSection.component (separate block, CurrentPipeline untouched)
- [x] getLastAnsweredPollInRun query + getPipelineScoreHeaderFn
- [x] /pipelines route loader: window+previous + equation data
- [x] Remove score block from PollResultScreen + PollResultsSection (+ dead score plumbing)
- [x] Delete PollScoreSummary.ui + stories
- [x] Tests (516 pass), tsc + lint clean

## Summary of Changes

- **Server**: extracted pure `buildWindowContext` in pipelineEvaluator.service; added `getWindowContextWithPreviousFn` (current + previous window state from one query, newest-first slice) and `getPipelineScoreHeaderFn` (equation from stored breakdown + applyEffects). New `getLastAnsweredPollInRun` query.
- **Per-slot progress**: pure `getSlotProgress` maps each requirement to numeric current/target/suffix/seen (+spec, 7 cases).
- **UI (Tier 1)**: `useCountUp` (rAF tween, reduced-motion aware), `PipelineScoreStat.ui` (count-up + bar slide + gain/loss pulse + stagger), `CoverageEquation.ui` (equation + animated coverage bar, lifted from deleted PollScoreSummary), `PipelineScoreSummary.ui` container. Added `Stack.ui` layout primitive. Stories for each.
- **Composition**: `PipelineScoreSection.component` maps slots via getSlotProgress; `/pipelines` route renders it above CurrentPipeline.
- **Review screen**: removed score block from PollResultScreen/PollResultsSection; deleted PollScoreSummary + stories; pruned now-dead score plumbing (DailyPollContainer submittedScore/getScoreBreakdown, daily-poll loader score fetch, orphaned getScoreBreakdownHandler).
