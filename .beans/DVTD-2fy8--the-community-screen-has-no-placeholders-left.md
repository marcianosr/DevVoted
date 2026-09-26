---
# DVTD-2fy8
title: The community screen has no placeholders left
status: todo
type: feature
priority: normal
created_at: 2026-09-25T17:51:14Z
updated_at: 2026-09-26T08:42:45Z
parent: DVTD-u35m
---

**What:** Finish the community screen's two unfinished sections, the turnout split and the climb map.

**Why:** The screen the day opens on states one made-up turnout figure and draws a placeholder where everyone's position should be.

## Done when
- [ ] Turnout states the real all-right, most-right and held-back split, with the faces in each band
- [x] The map draws where every climber stands, the fallen included, and marks where you are (DVTD-4nkm, 2026-09-26)
- [ ] No section of the screen is a placeholder or a stand-in figure
- [ ] Both reads are covered by specs

## Notes

`/run/community` is live and renders the kanto `CommunityScreen` through
`CommunityView.component.tsx`. Five of its seven sections are real. Two are not.

### Turnout

`communityScreenPropsFor` builds exactly one band:

```ts
bands: [{ label: "answered today", count: String(view.totalPlayers), color: "cerulean", climbers: [] }]
```

One band, carrying a count the screen already states elsewhere, and an empty
`climbers` array so no faces draw. The real all-right / most-right / held-back split
is derivable from `polls_responses` + `polls_response_options` — no new table. It
needs a query, a `turnout` field on `RunCommunityView`, and the adapter mapping each
band's voters through `climberOf`.

### Climb map

`CommunityScreen.ui.tsx` renders `COPY.mapPlaceholder` — the literal string "The
climb map lands here" — under a real `Panel.Header`, with `map.summary` ("3 on the
ladder · 1 fell today", from `ladderSummaryFor`) above it.

The data layer is done. `ladderFor` / `trackBuildFor` live in
`climbLadder.viewmodel.ts` with module-owned `LadderGate` / `LadderClimber` /
`LadderConfig` types, and seven behaviours are covered by
`climbLadder.viewmodel.spec.ts`. `climbMap.model.ts` owns the geometry
(`trackPosition`, `TRACK_LENGTH` = 65, `positionPercent`).

The render to port was deleted with `src/ui/old-theme/`. Recover it from:

    git show 3df71fde:src/ui/terminal-theme/ClimbTrack.ui.tsx

What it owes: a `ClimbMap.ui.tsx` in `kanto-theme` on plain props, built from
`Climber` / `ClimberStack` and `Swatch` for the gate rung, marking the viewer's own
gate and the edge past which the ladder is uncharted, with a Story, a spec and a
fixture in `kantoCommunity.factory.ts`. A `.ui.tsx` may import the ladder types
type-only and stay within `ui-stays-presentational`.

### Not in scope

The conversation feed is deliberately gone — deleted from the ui, the factory,
proto-run and the spec in DVTD-zul6, because it mocked a feed nobody is building.
Do not bring it back with the turnout query.

### Supersedes

This bean replaces DVTD-6poh (turnout and a comments feed) and DVTD-4km2 (the climb
map component), both scrapped in favour of it.
