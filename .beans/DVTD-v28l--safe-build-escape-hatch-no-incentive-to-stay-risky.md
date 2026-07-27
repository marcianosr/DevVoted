---
# DVTD-v28l
title: 'Safe-build escape hatch: no incentive to stay risky after a fail'
status: todo
type: feature
priority: high
created_at: 2026-07-16T13:18:05Z
updated_at: 2026-07-27T14:16:47Z
parent: DVTD-kulw
---

Found during playtest (DVTD-8eij): once a build gets stripped down to a bare Defense+Economy config set (no Focus/Check/Risk), it becomes strictly dominant for the rest of the run -- gates 4-5 had zero conditions beyond the plain baseline number, no tension, coasted to summit.

This undercuts ADR-006's central pitch ("your build is as hard as you make it") -- there's currently no reward, multiplier, or victory condition that pulls a player back toward rebuilding a riskier stack after getting burned once.

Consider per game-designer input: escalate the baseline faster for minimal/bare builds specifically, or gate some reward tiers behind carrying at least one Focus/Check/Risk config. Needs a design decision, not just a bugfix -- loop in game-designer agent before implementing.
