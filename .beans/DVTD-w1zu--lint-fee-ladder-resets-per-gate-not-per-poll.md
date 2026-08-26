---
# DVTD-w1zu
title: Lint fee ladder resets per gate, not per poll
status: in-progress
type: task
created_at: 2026-08-26T13:00:11Z
updated_at: 2026-08-26T13:00:11Z
---

ESLint/Stylelint's cross-out stays unlimited — any poll in the gate, in the categories the linter covers — but the fee ladder (8, 16, 32, 64, 128, 256 KB) now runs for the whole gate and resets only at the clear, mirroring Telemetry's peek.

Reverses the per-poll reset the wiki justified as "stops lint-spam": a gate-scoped ladder stops spam harder, and by pricing it rather than by capping it.

- [ ] `GateWindow.linted` counter, reset by `EMPTY_WINDOW`/`freshWindow`
- [ ] Carry `linted` through the per-answer window rebuild in answer.model
- [ ] `lintFeeFor` reads the window, not `manualDisabled.length`
- [ ] Roster copy on ESLint + Stylelint says the reset
- [ ] Wiki 4.5 + roster table + glossary
- [ ] Specs
