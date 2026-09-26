---
# DVTD-x75b
title: The dev rig can lock and unlock services
status: completed
type: task
created_at: 2026-09-26T15:20:51Z
updated_at: 2026-09-26T15:20:51Z
---

**What:** The dev rig renders the dex services panel and can lock or unlock each service.

**Why:** The rig passed every service id as unlocked, so the locked row — the `?` cap and the `unlock · condition` caption — could not be reached there at all.

## Done when

- [x] The rig holds its own unlocked-service list instead of the hardcoded full set
- [x] A toolbar row toggles each service, with lock-all and unlock-all
- [x] The dex services panel renders from that list, on the seafoam theme the dex tab uses
- [x] The shop's locked service rows are reachable from the same toggles

## Notes

The rig drives `toRunView` with the list, so one set of toggles moves both surfaces: the dex panel and the shop's own locked rows.
