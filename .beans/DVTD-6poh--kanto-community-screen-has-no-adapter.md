---
# DVTD-6poh
title: Kanto community screen has no adapter
status: todo
type: feature
priority: critical
created_at: 2026-09-15T14:14:14Z
updated_at: 2026-09-15T14:14:14Z
parent: DVTD-0x5c
---

`/run/community` serves real data (`getRunCommunity`) into the terminal-theme screen. proto-run renders the kanto `CommunityScreen` off simulated trainers.

`RunCommunityView` already carries `totalPlayers`, `topPercent`, `standouts`, `polls` and `climb`. Two sections have no source:

- `turnout` (all right / most right / held back): derivable from `polls_responses` + `polls_response_options`, no new table
- `conversation` ("What people said"): nothing exists, needs a table

- [ ] New table for comments (user, date, gate, body, created_at)
- [ ] `turnout` query and field on `RunCommunityView`
- [ ] `conversation` field on `RunCommunityView`
- [ ] Adapter from `RunCommunityView` to kanto `CommunityScreenProps`
- [ ] Point `/run/community` at it, delete the simulation in proto-run
