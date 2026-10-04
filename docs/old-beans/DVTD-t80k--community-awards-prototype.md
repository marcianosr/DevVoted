---
# DVTD-t80k
title: Community Awards Prototype
status: completed
type: feature
priority: normal
created_at: 2026-05-11T10:23:26Z
updated_at: 2026-05-11T10:27:53Z
---

Add living category awards to the community section of PostAnswerCarousel. Each daily poll's category shows the current award holder (e.g. CSS Connoisseur for css category), derived from the existing leaderboard data. No DB changes.

## Summary of Changes

- Created `src/domains/awards/` domain with models, API, and components
- `award.ts`: CategoryAward and AwardHolder types + award name registry (11 categories)
- `awards.queries.ts`: getCategoryAwardHolder query — finds current leaderboard leader for a category, includes photoUrl
- `CategoryAwardDisplay.component.tsx`: renders award name + holder avatar/name/coverage
- Wired getCategoryAward server function + useQuery into DailyPollContainer
- CategoryAward prop flows through PollResultsSection → PostAnswerCarousel
- Award renders in community section below first/fastest/firstGood stats
