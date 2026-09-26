---
# DVTD-tr8j
title: 'Locked run: continue button counts down to tomorrow''s polls'
status: completed
type: feature
priority: normal
created_at: 2026-08-05T08:09:58Z
updated_at: 2026-08-05T08:10:40Z
---

While a run awaits tomorrows segment the community board is the waiting room (DVTD-zfuv), but its Climb on button silently bounced. While locked it now shows a disabled countdown (New polls in 7h 23m, minute resolution) pinned to the next local midnight, flipping back to a working Climb on when the day rolls over.

## Summary of Changes

- `nextLocalMidnight` extracted in lib/dateUtils (getMsUntilNextPoll now derives from it); new `formatCompactDuration` (7h 23m / 2h / 45m / <1m, minute resolution) with specs.
- New `useNextPollsCountdown.hook.ts` (presentation/community): deadline PINNED at mount — recomputing next-midnight per tick would leap to ~24h at rollover and never open (the legacy useCountdownToNextPoll has exactly that latent bug, left as is, noted on the day-boundary bean). Coarse 10s tick, minute-resolution copy.
- RunCommunity.component: reads useTodaysRun; while `awaitingTomorrow && !isOpen` the Climb on action renders disabled with the countdown label, flipping back to a working Climb on at midnight. No Tier 1 changes (ScreenAction already supports disabled) — no new Story needed.
- Routed RunLayout spec asserts the disabled countdown button after the locked-run redirect; hook spec covers mount copy, tick-down, flip-at-midnight, stays-open regression.
- CHANGELOG bullet (The wait wears a clock) + wiki §7.2 clause.

Verified: vitest 1053 passed / 111 files, oxlint + depcruise clean (7 pre-existing seedCommunity no-console warnings), tsc clean.

Follow-up: day-boundary TZ drift bean (client-local midnight vs server-local seed date).
