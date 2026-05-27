---
# DVTD-11zq
title: 'Player path overview: pipeline choices per gate level'
status: draft
type: feature
priority: normal
created_at: 2026-05-27T07:31:36Z
updated_at: 2026-05-27T07:31:36Z
parent: DVTD-1eqf
---

## Context

Recent community work (commits `fdde4fe feat: show comm. choices`, `23a0123 feat: community improvements`) surfaces what choices other players made. The next step is to show **each player's full path** of pipeline selections across the gates they reached in a run.

A "path" is the ordered sequence of pipeline picks a player made at each gate:

```
Gate 1: [Pipeline A picked]  →  Gate 2: [Pipeline C picked]  →  Gate 3: [Pipeline B picked]  →  ...
```

This lets a viewer see *strategy* — not just outcomes — and compare risk profiles, category preferences, and pivot moments between players.

## Why this matters

- Social/comparative loop: "what did others pick at the same gate I'm at?"
- Surfaces meta-strategy: which pipeline sequences tend to push players further
- Reinforces the roguelike narrative (the run as a *decision tree* the player traversed)

## Open question — viewing context

Two plausible surfaces; pick one (or both):

- [ ] **Community view** — list of recent/top players with their full path visible per row (extends current community choices view)
- [ ] **Single-player drill-in** — click a player to see their path as a vertical/horizontal timeline

## Acceptance criteria

- [ ] For a given player + run, render the ordered sequence of gate → pipeline picks they made
- [ ] Each step shows: gate number, pipeline name/icon, category, and outcome (won/lost/skipped)
- [ ] Path terminates visually at the gate where the run ended (failed/completed)
- [ ] Works on the existing run-history data; no schema migration unless explicitly justified
- [ ] Mobile-friendly layout (paths can get long — consider horizontal scroll or vertical stack)

## Implementation notes / unknowns

- Data already lives in `runs` + `run_category_coverage` + related pipeline tables; confirm a query exists (or can be added) that returns ordered `(gate_number, pipeline_id, outcome)` tuples per run
- Likely a new component under `src/domains/runs/components/` (or `src/domains/community/components/` if it lives in the community section)
- Decide: is "path" tied to a single run, or aggregated across all runs of that player?

## Todo

- [ ] Confirm viewing surface (community list vs. drill-in vs. both)
- [ ] Confirm "path = single run" vs. "aggregated"
- [ ] Verify or add the query returning ordered gate→pipeline picks per run
- [ ] Design the visual representation (timeline component)
- [ ] Build the component and wire it into the chosen surface
- [ ] Add tests for the path-building logic (edge cases: failed at gate 1, skipped pipelines, partial runs)
