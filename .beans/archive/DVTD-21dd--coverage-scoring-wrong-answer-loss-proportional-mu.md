---
# DVTD-21dd
title: 'Coverage scoring: wrong-answer loss + proportional multi-answer credit'
status: completed
type: feature
created_at: 2026-07-19T11:49:30Z
updated_at: 2026-07-19T11:49:30Z
parent: DVTD-u35m
---

Decided with Marciano 2026-07-19 (ADR-006 §11): wrong answers bleed WRONG_COVERAGE_LOSS (0.5) x reward multiplier, floored at 0, never gate-scaled; config effects amplify gains only; multi-answer polls earn coverage by share = (correct − wrong picks)/total correct, clamped 0..1 — gate math/streak/storage stay binary. Gate coverageGained tally stays gains-only. Engine: coverageShare + loss in run.model.ts, share param on coverageForAnswer, AnsweredPoll.coverageEarned persisted (viewmodel falls back for old snapshots).
