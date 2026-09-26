---
# DVTD-mq0g
title: Mario Kart-style gates minimap for in-run players
status: completed
type: feature
priority: normal
created_at: 2026-06-01T12:13:38Z
updated_at: 2026-06-01T12:30:23Z
---

Show players currently in a run as portraits positioned along a horizontal track by their current gate. Proportional spacing (leader's gate = right edge). Replaces the existing flat avatar row in PostAnswerCarousel.

## Todos

- [x] Add ActiveRunPlayer type with currentGate
- [x] Update query to join polls_responses + compute currentGate per active run
- [x] Widen UserAvatar prop type
- [x] Create GatesMinimap component scaffold (position function awaiting user contribution)
- [x] Replace flat avatar row in PostAnswerCarousel
- [x] Verify build + types

## Summary of Changes

- Replaced the flat avatar row in PostAnswerCarousel with a new `GatesMinimap` component that positions player portraits proportionally along a horizontal track by their current gate (Mario Kart minimap style).
- Modified `getCommunityStatsForDailyPoll` in `communityStats.queries.ts` to aggregate poll count + pipeline_slots per active run via a single `LEFT JOIN polls_responses` + `GROUP BY`, then compute `currentGate` using existing `getWindowSize` helper.
- Added `ActiveRunPlayer` type (User & { currentGate }) — `playersInActiveRun` now carries gate info.
- Widened `UserAvatar` prop type from `CommunityStatsUser` to a structural `AvatarUser` shape ({ id, displayName?, photoUrl?, timeTakenMs? }), since it only ever uses those 4 fields. No breaking changes to existing callers.
- Position formula: linear interpolation `((gate - 1) / max(leaderGate - 1, 1)) * 90 + 5`, scaling within 5%–95% to avoid avatar clipping at container edges.
- Multiple players at the same gate stack vertically above the track.

## Notes
- Used a single `as PipelineSlot[]` cast in the new query because Drizzle's schema declares `pipeline_slots.$type<>` more narrowly than the real PipelineSlot type. Clean fix is updating the schema annotation but that crosses database→domain layering — deferred.

## Post-merge fix

Initial query used `GROUP BY runsTable.pipeline_slots` which is invalid Postgres — `json` type has no equality operator (only `jsonb` does). This caused the entire `getCommunityStatsForDailyPoll` to throw, making all community stats render as `undefined` in the UI.

Fixed by grouping by primary keys only: `groupBy(usersTable.id, runsTable.id)`. Postgres's functional-dependency rule then allows selecting `pipeline_slots` and other columns without listing them.
