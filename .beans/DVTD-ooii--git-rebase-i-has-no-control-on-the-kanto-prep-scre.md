---
# DVTD-ooii
title: git rebase -i has no control on the kanto prep screen
status: todo
type: bug
priority: normal
created_at: 2026-09-13T09:52:22Z
updated_at: 2026-09-13T09:52:22Z
---

`reordersGatePolls` is live in the reducer and `RunView.rebaseSlots` is populated, but `PrepViewProps` is only { view, onStart, onBackToShop } so kanto draws nothing for it. Same for `estimate`/`estimatedCorrect` (Planning Poker), which PrepView also drops.

Recorded in memory as 'dropped on purpose' during the kanto migration (DVTD-53bp). Filing so it is tracked rather than assumed.

Stories `Kanto/Configs/git rebase -i` and `Kanto/Configs/Planning Poker` render the prep state the reducer still produces, which is why those pages currently look inert.
