---
# DVTD-yddr
title: A config that both multiplies and adds loses its add in the reveal
status: todo
type: bug
priority: low
created_at: 2026-09-15T08:50:16Z
updated_at: 2026-09-15T08:50:16Z
---

`coverageBreakdownForAnswer` (build.model.ts) branches on `cover.mult !== 1` and only reaches the add branch otherwise, so a config carrying both a multiplier and a flat unit add would have its add dropped from the per-config attribution. The earn itself is correct; only the reveal's breakdown is short.

Latent, not live: no config in the roster does both. Noted in ADR-083's consequences.
