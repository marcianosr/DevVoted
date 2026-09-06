---
# DVTD-cfyp
title: 'Config: git rebase -i reorders the gate''s polls'
status: in-progress
type: feature
priority: normal
tags:
    - config
created_at: 2026-09-05T17:45:50Z
updated_at: 2026-09-06T09:57:04Z
parent: DVTD-72d9
---

A config that sells poll ORDER — an axis nothing on the roster touches.

## Design

`git rebase -i` (uncommon). Reveals the gate's remaining polls by CATEGORY ONLY and lets you drag them into any order during prep. The order locks the moment you answer the first poll.

- gives: "Reorder this gate's polls before it starts"
- costs: "Locks when you answer — you commit before you see a question"

## Why this axis

Per count-the-axes: roster axes in use are coverage magnitude, storage, option elimination, information, audit suppression, shop economy. Sequence is on none of them. Order is load-bearing for four existing configs: Cold Start (x2 opener), Overclock (x4 opener / x0.5 tail), Cache (+25% per consecutive correct in a category), Dependabot (5-in-a-row). Rebase turns all four from luck into a decision.

## Reveal precision

Categories only. Prefetch stays strictly richer (option counts, answer types, next gate's categories), so rebase never obsoletes it and never NEEDS it — synergy, not dependency.

## Todos

- [x] Config field + roster entry
- [x] reorder domain model (pure, legality rule)
- [x] RunAction + zod schema + reducer wiring
- [x] viewmodel exposure (upcoming polls by category, prep-only)
- [x] Tier 1 .ui + Story
- [x] Tier 2 wiring on prep
- [x] wiki + CHANGELOG

## Open

- [x] `movedSlice`: splice-move (remove at from, insert at to). Swap is a one-line change if it feels wrong in play; only differs on non-adjacent moves, which the up/down UI never emits.
- Legacy `/run/prep` (src/modules/run/run/presentation/PrepScreen.ui.tsx) is NOT wired; only the terminal-theme PrepView (/proto-run) has the panel. Convergence is tracked elsewhere.
- Balance knob: 4 slots / 128 KB. Does nothing alone — only pays next to Cold Start, Overclock, Cache or Dependabot.
