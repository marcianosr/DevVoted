---
# DVTD-y1ec
title: Click death mark to see why a player died
status: in-progress
type: feature
priority: normal
created_at: 2026-06-01T14:29:15Z
updated_at: 2026-06-01T14:31:31Z
---

On the GatesMinimap, fallen avatars currently show a tooltip with name/gate/time. Make them clickable so they open a modal that surfaces the parsed completion_reason (pipeline_failure with failed slots, manual_break_off, unknown). Reuse and extract parseCompletionReason from game-over.tsx so both surfaces stay in sync.

## Plan

- [x] Extract `parseCompletionReason` + `ParsedCompletion` from `src/routes/_authed/game-over.tsx` into a shared util under `src/domains/runs/utils/`
- [x] Update `game-over.tsx` to import the extracted util (no behaviour change)
- [x] Create `FallenPlayerModal.component.tsx` rendering player name + gate + finishedAt + death reason details
- [x] Make `FallenAvatar` in `GatesMinimap.component.tsx` a real `<button>` with onClick
- [x] Hold selected fallen player + open state in `GatesMinimap`
- [ ] User writes the per-reason copy/rendering inside the modal (learning-mode contribution)
- [ ] Run `yarn lint` + `yarn tsc -noEmit`
