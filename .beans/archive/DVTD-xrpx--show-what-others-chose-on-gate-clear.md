---
# DVTD-xrpx
title: Show what others chose on gate clear
status: completed
type: feature
priority: normal
created_at: 2026-07-13T08:23:53Z
updated_at: 2026-07-18T08:13:22Z
parent: DVTD-u35m
---

On gate clear / reward summary, show how other players answered each poll (distribution). Overlaps with DVTD-b9sp (reward summary: other players' answers) — dedupe/merge. Needs BE aggregate response data.

Decisions (2026-07-18, Marciano): standalone NEW ROUTE (not gate-clear panel), design = 'How you compared' mock: outcome tiles per consumed poll (correct/partial/wrong/missed), expanded detail with agreement bar + who-picked-what avatar clusters, 'top X% this gate' percentile. ADR-011 guard: missed (linted) polls reveal NO correct answer/distribution — the poll may reappear in a later seed.

## Summary of Changes

- New route /run/community (run_.community.tsx, un-nested from /run) → RunCommunity.component (Tier 2, TanStack Query, sessionRunQueryKeys.community) → RunCommunityBoard (Tier 1, plain props, Story with 3 states).
- Backend: community.queries.ts (consumed-polls-for-day, all session answers for the day, polls+options) + community.handlers.ts (pure composition: outcome mirroring engine partial semantics, agreed%/got-it-right%, voter clusters, day percentile).
- Redaction rules: polls at/beyond currentIndex never appear; linted (missed) polls are disabled tiles with NO detail (may reappear in later seeds); payload contains no raw "correct": flags (spec'd).
- Avatars: initials chips, full row, untruncated (Marciano: small player base).
- 6 handler tests; 771 total green; lint+arch+build clean. CHANGELOG updated (persistent runs + community page).
