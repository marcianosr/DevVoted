---
# DVTD-q6xl
title: Enhance score block
status: completed
type: feature
priority: normal
created_at: 2026-05-01T08:14:23Z
updated_at: 2026-05-02T19:25:00Z
---

UI wise it can be improved to look more juiced and informative.

## Score Breakdown Concept

Show more of a breakdown, like:

SCORE PIPELINE
✗ Wrong answer
accessibility · easy  −7.5%
🔧 Config: Stack Overflow
wrong answer dampener  +2.3%
📋 Answer streak
3 answered in a row  +0.3%
⚡ Correct streak
broken  +0.0%
▶ Total  −4.9%

## Implementation Notes

Wrong answer edge case: breakdown.baseCoverage is 0 for wrong answers (it's baseCoverage × correctnessFactor, which is 0 when wrong). The penalty lives in earnedCoverage. The breakdown type may need a dedicated penalty field to display wrong answer breakdowns properly.

## Implementation Plan: Post-Answer Carousel

Replace SelectedOptionsSummary side-panel layout with a 3-step CSS carousel.

- [x] Create PostAnswerCarousel component with step state + slide transition
- [ ] Step 1: answers + explanation (extracted from SelectedOptionsSummary)
- [ ] Step 2: ScoreBlock + GateHealth (current side panel content)
- [ ] Step 3: Shop (move ShopPreview here)
- [ ] Poll form stays visible above carousel, options highlighted after answer
- [ ] Back/forward nav, always starts at Step 1

## Summary of Changes

- Created  component with a pipeline-style breakdown: base coverage row, modifiers section (per-config contributions + streak bonus), total row, and a stats strip (category coverage delta, best streak, polls answered)
- Two-path base score logic: correct answers use ; wrong answers derive base from  to surface the actual penalty
- Only configs that produce a non-zero coverage effect appear in the modifiers section (via  — not all active configs)
-  correctly separates additive and multiplicative config contributions
- Restructured  into a responsive side-panel layout: score in a sticky  aside, results in a flex-1 main column, leaderboard spanning full width outside the flex container
- Extended  type with  and 
- Threaded  through  →  →  →  → 
