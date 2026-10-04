---
# DVTD-rdpg
title: The held gate leads with the catch and ends in the retry
status: completed
type: feature
priority: normal
created_at: 2026-10-02T16:00:17Z
updated_at: 2026-10-02T16:06:37Z
---

**What:** The held gate screen states the debt once, puts the retry press under the settlement, and on a caught gate puts dropping Try/Catch first, in its own section.

**Why:** The retry sat in the footer away from the debt that locks it, and a caught gate buried its only possible press among locked rows.

## Done when
- [x] The retry press sits at the foot of the settle panel and stays locked while anything is owed
- [x] A caught gate shows dropping the catch as its own first step, with everything below it locked until then
- [x] Storybook shows a caught gate before and after the catch is dropped
- [x] The wiki and changelog describe the new layout

## Notes
Follows ADR-177 (the catch is peeled by hand); the user mock showed the catch as already spent, which ADR-177 rejects. Follows DVTD-cx1p and DVTD-wot8.

## Summary of Changes

GateChoice gained a catch section and a retry press. The viewmodel lifts the caught config out of the drops into that section and tells the locked drops what they wait for. The screen seats the footer press inside the settle panel and puts the asides under the recap while settling. New fixtures kantoGateCaught and kantoGateCaughtDropped, stories Caught, CaughtPicking, CatchFirst and CatchDropped, and wiki, ADR-177 and changelog lines.
