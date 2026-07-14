---
# DVTD-b9sp
title: 'Reward summary: show other players'' answers (needs BE)'
status: draft
type: feature
priority: deferred
created_at: 2026-07-12T19:32:23Z
updated_at: 2026-07-12T19:32:23Z
parent: DVTD-5jpw
---

On the post-gate reward summary (RewardScreen), alongside the player's own answers, show how other people answered each poll (distribution / % who picked each option). Parked until the backend exists — needs aggregate response data per poll (polls_responses). The player's own answers + passed pipelines already ship (answeredThisGate + clearedChecks in SessionState → view.answeredThisGate / view.passedChecks).
