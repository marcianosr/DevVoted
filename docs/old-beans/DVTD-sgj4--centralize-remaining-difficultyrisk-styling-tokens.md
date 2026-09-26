---
# DVTD-sgj4
title: Centralize remaining difficulty/risk styling tokens
status: todo
type: task
priority: low
created_at: 2026-06-05T10:29:38Z
updated_at: 2026-06-05T10:29:38Z
---

DIFFICULTY_CLASSES is now centralized in src/domains/runs/utils/difficultyStyles.ts. Audit other places (e.g. category metadata, badge components, status pills) where ad-hoc color tokens for risk/difficulty/severity may still be hardcoded, and route them through the shared map. Also consider whether the label-as-identity (slot.difficulty rendered directly) is sufficient or if a friendlier label map should live next to DIFFICULTY_CLASSES.
