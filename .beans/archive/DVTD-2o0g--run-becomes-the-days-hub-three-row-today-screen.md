---
# DVTD-2o0g
title: '/run becomes the day''s hub: three-row Today screen'
status: completed
type: feature
priority: normal
created_at: 2026-08-26T11:48:12Z
updated_at: 2026-08-26T11:53:07Z
---

The `/run` landing page was a title, a blurb and a Start button. It is now the day's hub: what your climb is doing, the day's shared question, and how many others are out there — one row each, one press each.

- [x] `TodayScreen.ui.tsx` rebuilt as three rows + 7 stories + 13-case spec
- [x] `/run` exempted from the route sync so a live run can stand on it
- [x] `resumeTarget` extracted, shared with `returnFromCommunity`
- [x] Two glyphs added to the kit: `calendar`, `players`
- [x] `SwatchTrack` gained `counting: "none"`
- [x] Verify: tsc, story tsc, lint, tests

## Summary of Changes

**The row states.** Live run + segment open → `Resume →`. Live run + segment spent → the same press carries the countdown, disabled. No live run → the row reads as history ("Your last run reached Lavender") and the press starts today's climb. Never climbed → the row introduces the game instead.

**`/run` is now a hub, not a step.** `syncTarget` used to yank a live run off `/run` to its status screen, which made the hub's own Resume row unreachable — the state could never render. It now returns null for `/run` whatever the status, including `awaitingTomorrow`, where the hub is the one screen with something to say about the wait. `/run` stays in `RUN_ROUTES` because it is still a legitimate *target*: a day with no run has nowhere else to send anyone. The exemption is about the path you are ON, never the target.

**Three figures have no source and are drawn as optional**, so a row without its count still names itself and still opens rather than printing a zero:
- `days` — nothing on `RunView` counts how long a climb has been going
- daily poll's `answeredBy` — the feature lives in the unmigrated `src/domains/polls/` slice (CLAUDE.md says ask before adding to it)
- `runsLive` — nothing reports how many runs are live today

Per Marciano: "you hold 2 of 9 standouts" is dropped from the community row.

Verification: tsc clean, no story type errors, lint + dependency-cruiser clean (766 modules), 2397 tests pass. The 3 `RewardScreen.spec.tsx` failures are pre-existing on this branch.

## Follow-ups worth beans

- A `days` counter on the run, so the hub can say "day 6"
- Migrate the daily-poll slice out of `src/domains/polls/`, or expose just its answered-count
- A live-runs-today count for the community row

## Wired to the app (2026-08-26)

Copy: the shared-set row now counts the day's questions (`5 questions, shared by everyone`) instead of claiming one, and its title pluralised to "Today's polls" to match. `questions` is a prop, wired to `SLICE_WINDOW`.

**`answeredBy` is now real** — `useRunCommunity().view.totalPlayers`, distinct answerers of today's set, which is exactly what the board's own header calls "N players answered".

**`runsLive` stays unsourced on purpose.** `totalPlayers` is the only count available, and spending it on both rows would print one number twice under two labels, as if they were two facts. The row keeps its name and its press and drops the figure.

**"Answer it" leads into the run.** Discovered while wiring: nothing in the app consumes the daily poll — `src/domains/polls` has the handlers, no UI reads them, and `/` only redirects to `/run`. Today's questions are answered inside a run and nowhere else, so the press starts one or resumes it.

That means rows 1 and 2 currently converge on the same destination. Row 2 earns its own place when there is a way to answer the day's questions outside a run, or when the daily poll gets a screen — worth deciding before this ships.

Verification: tsc clean, no story type errors, lint + dependency-cruiser clean, 2398 tests pass (14 on the screen).
