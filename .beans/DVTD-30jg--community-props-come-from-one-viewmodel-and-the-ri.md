---
# DVTD-30jg
title: Community props come from one viewmodel and the rig uses it
status: todo
type: task
priority: normal
created_at: 2026-09-25T19:45:49Z
updated_at: 2026-09-25T19:45:49Z
parent: DVTD-y3vn
---

**What:** The community screen's props are built by one application function that the app, the test fixture and the dev rig all call.

**Why:** Today the props are assembled three separate times with the same words in three files, so a copy or rule change is made three times and the rig drifts.

## Done when
- [ ] A community viewmodel owns the props builder and its helpers, with the helper tests moved there
- [ ] The map title exists in one place
- [ ] The dev rig renders the real community view from a fixture and its hand-built simulation is gone
- [ ] The rig's four step states are one, driven by the same status-to-screen rule the router uses
- [ ] The rig uses the reducer hook instead of its hand-rolled equivalent

## Notes
Plan section "Slice 5" (5b). New `community/application/communityScreen.viewmodel.ts`. "Where everyone is" → `COPY.mapTitle` in `CommunityScreen.ui.tsx`; drop `map.title` from the prop. `kantoCommunity.factory.ts` builds a `RunCommunityView` and calls the viewmodel. `proto-run.tsx`: delete `simulateCommunityScreen` (dropped inventions: three turnout bands, `header.shop`, the climbers/deepest/balance stats, 1-based index, `share`, the seed subtitle; delete the unused `header.shop` on `CommunityHeader`); one `step` state from `routesForStatus`. Absorbs DVTD-zlpr.
