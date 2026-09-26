---
# DVTD-4nkm
title: The climb map draws where everyone stands
status: completed
type: task
priority: normal
created_at: 2026-09-26T08:27:34Z
updated_at: 2026-09-26T08:42:33Z
parent: DVTD-2fy8
---

**What:** Replace the community screen's climb-map placeholder with the scrollable track: every gate as a numbered square, the players standing at each one, the fallen dimmed, your gate filled, your best starred, and a build row for the avatar you tap.

**Why:** The board the day opens on still draws "the climb map lands here" where the one read the whole game is about should be.

## Done when

- [x] The track scrolls sideways, opens centred on your gate, and draws every gate with everyone standing at it
- [x] You, today's rivals and the fallen are told apart, and a perfect, a shaky and a rescued run each wear their mark
- [x] Tapping an avatar shows that climber's build under the track
- [x] The board without a run states where to start instead of a track
- [x] Specs cover the ladder read, the rival read, the chip marks and the screen

## Notes

- Plan: `~/.claude-work/plans/1-example-2-yeah-glowing-liskov.md` (top section), approved 2026-09-26 from Marciano's mock.
- Mock decisions (Marciano, 2026-09-26): rival = today's incident counterparts (the other party of each incident row you are in); tap = a build row under the track, not a popup, because an anchored popup inside a sideways scroller is clipped.
- Gate labels follow `ALL_SWATCHES` (badge names, gates 0-12), not the mock's town-colour names.
- Marks read the run record: perfect and shaky from `lastClose.band`, rescued from `startedAtGate > 0` (a run resumed from a git tag). No mark before a first close.
- `Climber`'s `you` ring turns viridian (was cerulean) so every board surface agrees with `YOUR_SEAT_COLOR`; player-visible, logged in the changelog.
- One owner for "a public build as chips": `publicBuildChipsFor` in `build/application` replaces `trackBuildFor` (ladder) and `rivalChipFor` (incident viewmodel).
- `ladderSummaryFor` is deleted with the placeholder; the header meta becomes the hint "tap an avatar".
- Old render to port for scroll-and-centre-on-you: `git show 3df71fde:src/ui/terminal-theme/ClimbTrack.ui.tsx`.

## Summary of Changes

The board draws the ladder again, and every chip on it says something.

**The track** (`ClimbMap.ui.tsx`, kanto): thirteen gates from the swatch roster, each in its
own colour behind a dashed rail, scrolling sideways and opening centred on the viewer's gate.
The viewer's square is filled, everything past the charted edge is dimmed, and a star marks the
deepest gate a finished run ever reached. Under each gate the people standing there, four chips
then a `+N`, with the runs today's gates killed dimmed in a lane of their own.

**The marks** (`Climber.ui.tsx`): you are ringed viridian (was cerulean — now it agrees with
the seat colour the board already uses), a rival vermillion, a perfect close wears a rim in the
gate's colour, a shaky one flickers, and a rescued run wears a tag. The flicker keyframes fall
back to a dashed edge under reduced motion so the state never disappears.

**The reads.** `climbers.repository.ts` now selects `lastClose` and `startedAtGate` beside the
position it already read, so `ClimbClimber` and `ClimbFallen` carry a closing band and where
the run began. `rivalIdsFor` (incident viewmodel) names the other party of every incident the
viewer is in, surfaced as `IncidentsFeedView.rivals` — the same rows the panel under the map
lists. `ladderFor(climb, rivalIds)` folds all of it into the gates.

**The build row.** Tapping a chip opens that climber's configs under the track.
`publicBuildChipsFor` (`build/application/publicBuild.viewmodel.ts`) is now the one fold from a
public build to chips; `rivalChipFor` and `trackBuildFor` are gone, and the prep attack rows use
it too.

**Wired everywhere it belongs:** the live `/run/community` page through `CommunityView`, which
holds which chip is open and takes the rivals from the feed `RunCommunity` already reads; the
kit fixture `kantoClimbMap()`; a `Kanto/ClimbMap` story with a pressable variant; and the
proto-run rig, which simulates the ladder from its trainers. `ladderSummaryFor` and the
placeholder are deleted. A board with no run states how to get on the map instead.

Verified: typecheck clean, lint clean (738 modules, 0 dependency violations, wiki in sync),
full suite 203 files / 3889 tests pass.

Two judgement calls: a chip is a button only when the map is handed a press, because a press
that opens nothing is worse than a plain chip; and the open id is a user id for a live climber
but a run key for a fallen one, since one player can lose two runs in a day at different gates.
