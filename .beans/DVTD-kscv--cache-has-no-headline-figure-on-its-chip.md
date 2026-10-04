---
# DVTD-kscv
title: Cache has no headline figure on its chip
status: todo
type: bug
priority: low
created_at: 2026-09-15T08:50:16Z
updated_at: 2026-09-15T08:50:16Z
---

`headlineFigureOf` (config.model.ts) has no branch for `cacheHitStep`, so Cache falls through every check and `figureLabel` returns an empty string. Its chip shows no figure at all.

This mattered less when Cache's effect was a contextual multiplier. Under ADR-083 it pays a flat +0.25 units a cached hit, capped at one unit, which is a statable figure. Give it a `{ kind: "coverage" }` branch.

Related: DVTD-rftc added the missing `kind: "coverage"` branch to `figureLabel` itself.
