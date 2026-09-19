---
# DVTD-vueu
title: Dex run rows should open their permalink
status: todo
type: task
priority: normal
created_at: 2026-09-16T10:44:43Z
updated_at: 2026-09-16T10:54:55Z
parent: DVTD-0x5c
blocked_by:
    - DVTD-t3lt
---

`/runs/$runId` renders a finished run read-only (DVTD-t3lt), but nothing links to it: `DexRuns` rows are plain `Panel.Row` divs.

Making a row openable is a kit change, not a wiring change. `Panel.Row` has no pressable mode, and the kanto convention for pressability is a ring (see the pressable badge), so the affordance has to be designed rather than bolted on.

- [ ] Decide the affordance: pressable `Panel.Row`, or a trailing press
- [ ] Add it to the Panel primitive with a story
- [ ] `DexRunRow` gains `onOpen`; `DexRuns` wires it
- [ ] `Dex.component` navigates to `/runs/$runId`
