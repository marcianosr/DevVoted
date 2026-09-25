---
# DVTD-y340
title: One sheet primitive for the kit's three popovers
status: todo
type: task
priority: low
created_at: 2026-09-24T13:03:29Z
updated_at: 2026-09-24T13:03:29Z
parent: DVTD-c2ha
---

Tooltip.ui, ConfigChip.ui and now WeightTrack.ui each carry the same 'fixed inset-x-4 bottom-4 ... sm:absolute' sheet classes and, in two cases, the same docblock word for word. Extract one primitive before a fourth copy appears.

Found while fixing the mobile popover bug (item 17 of DVTD-c2ha).
