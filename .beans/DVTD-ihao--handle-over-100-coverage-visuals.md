---
# DVTD-ihao
title: Handle over 100% coverage visuals
status: todo
type: feature
priority: high
created_at: 2026-08-07T11:57:21Z
updated_at: 2026-09-12T12:57:33Z
parent: DVTD-u35m
---

Design and implement visual handling for coverage that exceeds 100% (overflow scenarios)

## Model change 2026-09-12 (DVTD-nd6r)

There is nothing to draw. ADR-073 decision 4 clamps coverage at 100%, and
ADR-070 decision 3 ruled specifically against inventing a zone above HEALTHY:
"over the goal" is the PERFECT band at exactly 100%, drawn as a fill state (the
bar turns blue), not as an overflow.

`asRatio` in `coverageRatio.model.ts` does the clamping, so no surface can ever
receive a value above 1.

Recommend scrapping. The live question that replaces it is what the PERFECT
band pays, which is undesigned (see DVTD-nljz).
