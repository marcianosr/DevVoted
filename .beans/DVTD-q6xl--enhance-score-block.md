---
# DVTD-q6xl
title: Enhance score block
status: draft
type: feature
priority: normal
created_at: 2026-05-01T08:14:23Z
updated_at: 2026-05-01T08:38:13Z
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
