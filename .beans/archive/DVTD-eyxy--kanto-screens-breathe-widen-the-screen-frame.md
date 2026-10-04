---
# DVTD-eyxy
title: 'Kanto screens breathe: widen the Screen frame'
status: completed
type: task
priority: low
created_at: 2026-09-13T20:03:10Z
updated_at: 2026-09-13T20:03:10Z
---

Every kanto screen sits in `Screen.ui`, whose body was `px-4 py-4` — 16px between
the panel edge and the first heading, against a 900px cap and a 24px internal
row gap. The frame read tighter than the rhythm inside it.

## Summary of Changes

`Screen.ui`'s body is now `p-4 sm:p-8`: 32px of frame once there is room for it,
16px kept on a phone where 32px a side would eat the content. One spec added,
alongside the existing ground/edge/width-cap assertions, so the frame is not
silently lost.

This is the shared chrome, so it widens prep, poll, shop, new run, community,
gate outcome and review alike.

## Verification

lint clean (976 modules, 0 depcruise violations), `npm run build` exit 0,
4256 tests pass (the same 4 pre-existing failures in PollScreen.spec and
gate.model.spec remain, both untouched).
