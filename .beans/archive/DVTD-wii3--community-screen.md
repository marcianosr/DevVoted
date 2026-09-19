---
# DVTD-wii3
title: Community screen
status: completed
type: feature
priority: high
created_at: 2026-07-13T08:23:53Z
updated_at: 2026-09-06T19:03:41Z
parent: DVTD-h175
---

A social/community screen — leaderboards, friends, shared results, or global stats. Scope TBD; likely needs BE.

## Launch-needed (2026-08-04)

Marciano: 2.0 launch needs the community page. Bring back **profile borders** and **top committers** (top committers awards tracked in DVTD-smye).

## Summary of Changes (2026-09-06, terminal reskin + six standouts)

Shipped the terminal-theme community screen per Marciano's three mocks (ADR-065):

- **Standouts are six** (grid order): deepest, against the room, clean sweep,
  widest build, travelling light, comeback. Timed trio + most-{category} +
  streak + coverage retired (`answer_time_ms` capture kept). New cumulative
  `RunState.configsLost` (strip peel, decay delete, subscription lapse) feeds
  comeback; old snapshots read 0.
- **Profile borders are back on every community chip** (the DVTD-95k3
  deferral): all community reads resolve `users.equipped_border_id` via
  `borderUrlOf` (border catalog) — climbers, run stats, fallen, voters.
- **New terminal primitives**: `Fieldset` (legend box), `AvatarChip`
  (2-letter initials/photo + border overlay + you-ring), `ResultRow`
  (distribution bar row), `ClimbTrack` (numbered swatch blocks, avatar stacks
  underneath, +N overflow, fallen lane, pb marker, uncharted edge,
  scroll-centres on you). `Tabs` gained `disabled`.
- **`CommunityScreen.ui.tsx`** (+6 stories +spec) with poll-selector chips
  (sealed/unreached disabled), one poll at a time with bars/✓/"you".
- **Live swap**: `RunCommunity.component` now renders
  `CommunityView.component` (adapter with exported helpers: pollChipsFor,
  pollDetailFor, ladderFor, standoutEntriesFor, defaultChipId). Modern
  Standouts.ui/ClimbToday.ui/RunCommunity.ui stay for proto-run + stories.
- Docs: ADR-065, wiki §7.1/§7.3 rewritten, CHANGELOG Unreleased entry.

Left open here: leaderboards (DVTD-1q2y), builds/configs/storage on the map,
"you took N of 6" haul summary (dropped with the reskin), border shop
migration out of src/domains.
