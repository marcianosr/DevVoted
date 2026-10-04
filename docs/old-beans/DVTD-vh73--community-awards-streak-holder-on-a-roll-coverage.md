---
# DVTD-vh73
title: 'Community awards: Streak Holder, On a Roll, Coverage Hero'
status: todo
type: feature
priority: normal
created_at: 2026-06-04T14:55:07Z
updated_at: 2026-06-04T14:55:07Z
---

Add three new daily community awards alongside the existing First to answer / Fastest responder / First good tiles. Goal: diversify the *axes* the social-proof widget rewards so the same speed-advantaged player doesn't sweep every day.

## Why
The current three awards all measure variants of "fast + correct" — same player typically wins all three. Adding awards on different axes (persistence, recent activity, learning gain) gives more players a chance to be celebrated and reinforces different kinds of engagement.

## Awards

### 1. Streak Holder
- **What**: highest *active* daily-answer streak among today's respondents
- **Display**: `"Marciano — 14-day streak"`
- **Tie-break**: oldest streak (started earlier) wins
- **Rules**: strict — missed day = reset to 1. No grace days.
- **Schema**: `users.current_streak int`, `users.longest_streak int`, `users.last_streak_increment_date date`
- **Maintenance**: on first daily-poll answer per UTC day, if `last_streak_increment_date === yesterday`, increment; else reset to 1.

### 2. On a Roll (most active, recent)
- **What**: most polls answered in the last 14 days, among today's respondents
- **Display**: `"Marciano — 12 polls in 14 days"`
- **Framing rationale**: rewards currently-engaged players, not just longest-tenured. Trophy rotates naturally as people drift in and out.
- **Schema**: no new column — query `polls_responses` grouped by user_id with `created_at >= now() - 14 days`.

### 3. Coverage Hero (revised — no badge)
- **What**: highest coverage gain from today's poll, among today's respondents
- **Display**: `"Marciano — +12% coverage today · personal best: +15%"`
- **No PB badge** — just the two numbers side-by-side. Player can see if they're approaching/passing their own PB without UI fanfare.
- **Schema**: `users.best_single_poll_coverage_gain numeric` (or compute lazily from history — decide during impl).
- **Data plumbing**: per-response coverage delta is already computed in the run-completion flow; needs surfacing on the response or derivation from `run_category_coverage` snapshots.

## Display rules (apply to all three)
- **Today-only**: award winner must have *answered today*. Otherwise we'd celebrate someone not in today's session, which dilutes the social-presence vibe.
- **Awards are non-exclusive**: same player can win multiple. Diversification comes from different *axes*, not forced rotation.
- **Position**: alongside the existing 3 tiles in `PostAnswerCarousel.component.tsx`. May want to wrap to two rows on small screens.

## Touchpoints
- `src/database/schema.ts` + migration (new columns: current_streak, longest_streak, last_streak_increment_date, best_single_poll_coverage_gain)
- `src/domains/polls/api/communityStats.queries.ts` — add three new fields to `CommunityStats`
- `src/domains/polls/components/PostAnswerCarousel.component.tsx` — render 3 new tiles
- Streak/PB maintenance: hook into wherever the poll-response insert lives. Idempotent.
- Possible new util: `getPersonalBestCoverageGain(userId)` (lazy compute alternative to a stored column)

## Open questions
- Should streak count *any* poll answered that day, or specifically the daily poll?
- Coverage hero: stored PB column vs. derived on each render? Stored is faster (every render hits this) but adds a write path. Derived is simpler.
- Coverage hero PB scope: per-category or overall? Probably overall (single number) for simpler UI.

## Todo
- [ ] Decide: any-poll or daily-only for streak
- [ ] Decide: stored PB column vs derived
- [ ] Schema migration
- [ ] Streak maintenance hook
- [ ] Query layer extensions for all three
- [ ] Three new tiles in PostAnswerCarousel
- [ ] Mobile layout (6 tiles total — probably 3+3 wrap)
