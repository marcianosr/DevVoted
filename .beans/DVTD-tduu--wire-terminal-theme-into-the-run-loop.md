---
# DVTD-tduu
title: Wire terminal-theme into the run loop
status: scrapped
type: epic
priority: high
created_at: 2026-09-01T20:02:48Z
updated_at: 2026-09-13T07:29:19Z
parent: DVTD-u35m
---

Converge /proto-run and /_authed/run/* on one screen set: src/ui/terminal-theme/, behind the shared *View.component.tsx adapter layer. Plan: ~/.claude-work/plans/i-want-to-wire-hazy-cosmos.md

Today the run loop has two parallel screen sets: /proto-run runs 8 *View adapters into modern-theme, /run/* runs older module-local *Screen.ui files. Four screen names collide across the two sets with incompatible props.

Decisions: converge on shared adapters; full poll parity (multi-select, submit, cross-out, peek split, code blocks); /proto-run first then /run; delete legacy module screens as they die.

## Reasons for Scrapping

Superseded by DVTD-53bp. The run loop converges on the **kanto** kit, not terminal-theme. /proto-run now renders kanto screens through the same *View.component.tsx adapter layer this epic established, and the nine terminal run screens (plus ~18 atoms that only they reached) are deleted. terminal-theme survives only as the live /run/community screen and the storybook-only Dex/Home cluster.

The adapter-layer decision this epic made was right and is what made the kanto swap cheap; only the target kit changed.
