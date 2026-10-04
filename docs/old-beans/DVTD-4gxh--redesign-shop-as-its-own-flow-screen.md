---
# DVTD-4gxh
title: Redesign Shop as its own flow screen
status: completed
type: feature
priority: high
created_at: 2026-07-02T10:57:03Z
updated_at: 2026-07-05T13:18:39Z
---

The 3-step post-answer carousel was removed (Phase 2). The Shop (ShopContainer) was carousel step 2; it's still reachable via the /progress route but no longer in the poll flow. Next concern: give the Shop its own redesigned screen in the flow, matching the DevVoted Flow design (ShopScreen). Data (offeredConfigs, nextOfferedConfigs, reductionCost, storageBonus) is still plumbed to DailyPollContainer, currently unused.
