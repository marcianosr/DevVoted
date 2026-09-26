---
# DVTD-6poh
title: 'Community screen: real turnout numbers and a comments feed'
status: scrapped
type: feature
priority: critical
created_at: 2026-09-15T14:14:14Z
updated_at: 2026-09-25T17:51:22Z
parent: DVTD-0x5c
---

**What:** Feed the community screen the real turnout split, and give it a comments feed.

**Why:** Turnout draws one placeholder band and comments have no data behind them at all.

## Done when
- [ ] Turnout shows the real all-right / most-right / held-back split
- [ ] Comments have a table, and the screen draws them
- [ ] Specs cover both reads

## Notes

`/run/community` serves real data (`getRunCommunity`) into the terminal-theme screen. proto-run renders the kanto `CommunityScreen` off simulated trainers.

`RunCommunityView` already carries `totalPlayers`, `topPercent`, `standouts`, `polls` and `climb`. Two sections have no source:

- `turnout` (all right / most right / held back): derivable from `polls_responses` + `polls_response_options`, no new table
- `conversation` ("What people said"): nothing exists, needs a table

- New table for comments (user, date, gate, body, created_at)
- `turnout` query and field on `RunCommunityView`
- `conversation` field on `RunCommunityView`
- Adapter from `RunCommunityView` to kanto `CommunityScreenProps`
- Point `/run/community` at it, delete the simulation in proto-run

## Adapter landed (DVTD-6crx, 2026-09-23)

`/run/community` now renders the kanto `CommunityScreen` through `CommunityView.component.tsx`; the terminal screen is deleted. `back` maps to `header.prep` and `aside` to `header.shop` — the kanto screen has no footer.

Still owed, and still needing new data:
- `turnout` renders one band carrying the real `totalPlayers` and an empty ClimberStack. The all-right / most-right / held-back split needs the `polls_responses` query.
- `conversation` has no field and no table; the kanto screen does not draw one.
- The climb map is `map.summary` over the parked placeholder — see DVTD-4km2.

## Reasons for Scrapping

Absorbed into DVTD-2fy8, which carries both unfinished community sections in one bean.

Half of this bean was already dead: the comments feed it asks for was deleted from the ui, the factory, proto-run and the spec in DVTD-zul6, because it mocked a feed nobody is building. What survived is the turnout split, and that moved across verbatim.
