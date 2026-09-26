---
# DVTD-doyv
title: Proto-run showed the whole roster in the shop
status: completed
type: bug
created_at: 2026-09-04T06:46:43Z
updated_at: 2026-09-04T06:46:43Z
---

- [x] Polls row counts answered / total
- [x] proto-run rolls the engine's shelf instead of the full catalogue

## Reasons / Summary of Changes

The 20-30 offers were NOT WTFPL. `/proto-run` carried `withFullCatalog`, a dev shortcut wrapping every dispatch: it replaced draftOptions with CONFIG_LIST minus owned, so the shelf was 33 minus whatever the build held (30 early, 20 once thirteen were owned). Removed the helper and its three call sites; the route now dispatches straight through the reducer, so the shelf is DRAFT_SIZE 5 plus extensions and locks, same as /run.

Verified the engine path first with a scratch sim: createRun + starting hand + a cleared window gives exactly 5 offers.
