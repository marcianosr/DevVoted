---
# DVTD-ek7k
title: Show per-option voter breakdown in Community section
status: in-progress
type: feature
priority: normal
created_at: 2026-05-20T11:27:57Z
updated_at: 2026-05-20T11:31:20Z
---

Group today's poll voters by which option(s) they picked, render below existing Community highlights in PostAnswerCarousel. Sort by correct-first, show zero-pick rows greyed out. Multi-select aware (a user appears in multiple rows). User implements the sort comparator as a Learning Mode handback.

## Todo

- [x] Add `optionBreakdown` to `CommunityStats` type
- [x] Extend `getCommunityStatsForDailyPoll` query to populate it
- [x] Scaffold `sortCommunityOptions` util with TODO (Learning Mode handback)
- [x] Render breakdown in `PostAnswerCarousel.component.tsx` Community section
- [x] Style: vertical stacking, correct ✓ marker, zero-pick rows greyed
- [x] Run typecheck + lint (clean; pre-existing warning in economy/handlers.ts unrelated)

- [ ] **User to implement**: `sortCommunityOptions` comparator in `src/domains/polls/utils/sortCommunityOptions.ts` (correct-first + tie-breaker of your choice)
