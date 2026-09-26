---
# DVTD-sw63
title: Cap StoragePlan section width in the shop
status: completed
type: task
created_at: 2026-09-02T20:38:45Z
updated_at: 2026-09-02T20:38:45Z
---

Playtest: full-width meter on a wide panel is mostly empty bar. ShopScreen now renders StoragePlan with max-w-2xl (672px, matches the approved mock's proportions); the divider above still spans the panel so the layout keeps its structure. Component stays width-agnostic — the cap lives at the call site. Mobile unaffected.

## Summary of Changes
One line in terminal ShopScreen.ui.tsx: className=max-w-2xl on the StoragePlan render.
