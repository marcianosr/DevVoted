---
# DVTD-22
title: 'IndexedDB config: show feedback when effect triggers and drains'
status: draft
type: feature
priority: normal
created_at: 2026-04-28T09:42:32Z
updated_at: 2026-05-09T08:10:15Z
parent: DVTD-3q23
---

The IndexedDB config gives KB over time but currently has no visible feedback. Inspired by Balatro's ice cream melt mechanic:

- Show a visual state for the config card while it is actively giving storage (e.g. melting, draining, filling)
- Indicate clearly when the effect is 'done' (fully drained/expired)
- Player should understand at a glance how much KB is left to be given
- Could be a progress bar, animation, or color drain on the config card itself
