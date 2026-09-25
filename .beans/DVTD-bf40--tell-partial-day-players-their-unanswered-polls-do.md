---
# DVTD-bf40
title: Tell partial-day players their unanswered polls do not carry
status: completed
type: feature
priority: normal
created_at: 2026-09-24T13:45:22Z
updated_at: 2026-09-24T13:51:35Z
---

A gate is 5 *answers*, not "today's 5 polls". A player who answers 1-2 and stops is never
locked (`isAwaitingTomorrow` is derived from `currentIndex >= polls.length`), and at the
next request after midnight `rollSegmentForward` **deletes** the unplayed tail and appends
today's fresh five. Nothing is failed and the half-filled window carries (ADR-014 s4) --
but the forfeited polls are gone and nothing in the product says so.

The `/run` hub note is hardcoded to the 5-a-day cadence: `today's 5 polls are ready`,
said whether five are left or one (`RunStart.component.tsx`).

Scope here is the hub note only. The poll-screen badge is split out -- those files are
mid-rewrite in a parallel session.

## The number

`polls.length - currentIndex` is exactly "today's polls not yet answered" at every point:
a new run copies today's 5 at positions 0-4; mid-day the tail is today's unanswered; after
rollover the tail was deleted and replaced by today's segment. `pollsExhausted` is already
this expression compared to zero.

## Todo

- [x] `runView.viewmodel.ts`: add `pollsLeftToday`, derive `pollsExhausted` from it
- [x] New `todayScreen.viewmodel.ts` owning `pollsNoteFor` (ADR-102 s1: choosing it reads run state)
- [x] Co-located spec: ready / partial-day / spent / short stub segment
- [x] `RunStart.component.tsx` calls it, drops the inline string
- [x] `runView.factory.ts` fixture gets `pollsLeftToday`
- [x] `TodayScreen.stories.tsx` partial-day case
- [x] wiki s2.1: name where the player reads the drop
- [x] lint + test + build

## Summary of Changes

`RunView` gained `pollsLeftToday` (`polls.length - currentIndex`, clamped at 0) and
`pollsExhausted` is now derived from it rather than restating the same comparison --
two expressions meaning one thing is how they drift apart later.

New `todayScreen.viewmodel.ts` owns `pollsNoteFor(view, countdownLabel)`. The countdown
wins whenever the caller has one, so the timer stays in the component and the function
stays pure. Otherwise: a full day reads `today's 5 polls are ready` (unchanged), and a
part-answered day reads `3 of today's 5 left - they do not carry to tomorrow`.

`RunStart.component.tsx` calls it and drops its inline string. A `FRESH_DAY` fallback was
written and then removed as dead: `pollsNote` is only read inside the `view ?` guard, so
the row is now built as one `todayRun` local.

A restarted run's short stub segment needs no special case -- the player really did answer
those polls today, just in the run they abandoned -- and there is a spec pinning that.

Verified: `tsc --noEmit` clean (0 errors), 189 files / 3649 tests pass, oxlint + depcruise
(699 modules) clean, `docs:check` in sync, prettier clean.

The poll-screen half is DVTD-gbgp, split out because those four files were mid-rewrite in
a parallel session.
