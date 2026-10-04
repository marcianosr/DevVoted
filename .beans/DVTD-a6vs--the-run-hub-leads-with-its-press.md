---
# DVTD-a6vs
title: The run hub leads with its press
status: completed
type: feature
priority: high
created_at: 2026-09-27T16:46:23Z
updated_at: 2026-09-27T16:59:45Z
---

**What:** Rebuild `/run` so the primary press leads the screen as a wide bar, with the swatch ladder, a coverage readout and a community card standing under it, and a shop press beside the main one.

**Why:** The hub is a launcher, not a report. Today it buries the one thing the player came to do in a footer, behind two rows that each offer a second way to do it.

## Done when

- [x] The hub opens with one wide press that names the gate and states where the run stands
- [x] The press states the time until the next polls open, and is refused with that clock when the day is spent
- [x] The swatch ladder still stands on the hub
- [x] A shop press sits beside the main one, refused with a reason while the shop is shut
- [x] Coverage so far is stated as a dial with its band rungs beside it
- [x] The community card states how many answered today and opens the board

## Notes

Mockup supplied by Marciano. Plan at ~/.claude-work/plans/build-this-as-home-rustling-orbit.md

## Summary of Changes

ADR-128 records the shape: the hub is a launcher, so it draws the ADR-117 bar first rather than in a footer.

- `todayScreen.viewmodel.ts` grew from one export to seven — the press, the standing line, the coverage rungs, the room line and the shop state are all picked by run state, so ADR-102 puts them here. `RunStart.component.tsx` builds no copy at all now.
- `TodayScreen.ui.tsx` rewritten: `Action` + shop `Button` in a plate at the top, ladder and standing under it, then a coverage readout and a community card. `ScreenFooter` and both `TodayRow`s are gone.
- `CoverageRing.note` widened to `ReactNode` so the rungs can be badged through `Figures`. Call sites reading a percentage of the whole must pass `ceiling={100}` — its default fills the dial once coverage meets the rung.
- The part-answered expiry warning moved from the press to the standing line. It had become unreachable, and `docs/wiki.md` promises the hub states it.

Verified: 4264 tests pass, lint and dependency-cruiser clean, `npm run build` green. One unrelated failure in `Screen.spec.tsx` predates this work and comes from uncommitted `app.css` edits in the tree.

## Follow-up

The mockup put three coloured squares on the community card. The ladder went in the plate instead, so the card leads with the community icon. `RunCommunityView.polls[].outcome` is the honest source for a per-poll strip there if it is wanted.
