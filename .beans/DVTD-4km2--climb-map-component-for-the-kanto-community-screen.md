---
# DVTD-4km2
title: Climb map component for the kanto community screen
status: todo
type: task
created_at: 2026-09-11T11:12:07Z
updated_at: 2026-09-11T11:12:07Z
blocked_by:
    - DVTD-agt2
---

`CommunityScreen.ui.tsx` parks 'Where everyone is' behind a placeholder div. Build the real thing: the 0-12 gate ladder with climber chips stacked above their position, fallen runs dimmed in their own lane, and the personal-best ghost.

The data already exists — `ladderFor()` in `CommunityView.component.tsx` builds exactly this shape, and `climbMap.model.ts` owns the geometry (`trackPosition`, `TRACK_LENGTH` = 65, `positionPercent`). `src/ui/terminal-theme/ClimbTrack.ui.tsx` is the existing render to port.

- [ ] `ClimbMap.ui.tsx` in kanto-theme, plain props
- [ ] Uses `Climber`/`ClimberStack` and `Swatch` for the gate rung
- [ ] Marks the viewer's own gate, and the edge past which the ladder is uncharted
- [ ] Story + spec, fixture in `kantoCommunity.factory.ts`
- [ ] Swap the placeholder out of `CommunityScreen.ui.tsx`
