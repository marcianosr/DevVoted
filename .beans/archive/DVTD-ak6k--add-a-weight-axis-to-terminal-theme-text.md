---
# DVTD-ak6k
title: Add a weight axis to terminal-theme Text
status: completed
type: task
priority: normal
created_at: 2026-09-05T13:40:55Z
updated_at: 2026-09-05T13:46:17Z
---

Add a `weight` prop to terminal-theme `Text` (thin -> font-normal), route every raw muted span in the kit through `Text`, forward `aria-hidden`, and remove the misapplied `aria-hidden`s.

## Todo
- [x] Text.ui.tsx: weight axis (no default), aria-hidden forwarding
- [x] Text.spec.tsx: new, class-level coverage
- [x] Raw spans -> Text (PollScreen, Equation, Trail, Section, BuildList x2)
- [x] Facts line labels get weight=thin
- [x] Delete 5 semantic aria-hidden attributes
- [x] Row.ui.tsx + Version.ui.tsx className weights
- [x] Text.stories.tsx: Thin + Weights
- [x] ADR 059
- [x] lint + typecheck + tests
