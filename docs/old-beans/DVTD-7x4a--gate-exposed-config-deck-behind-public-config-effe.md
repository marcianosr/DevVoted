---
# DVTD-7x4a
title: Gate exposed config deck behind public-config effect
status: in-progress
type: bug
created_at: 2026-07-02T15:00:16Z
updated_at: 2026-07-02T15:00:16Z
---

Community route shows the exposed config deck to everyone. It should only appear when the viewer's active configs produce exposeConfigDeck:true (i.e. they hold public-config). Mirror the shop.tsx applyEffects gating pattern. Also remove leftover console.logs.
