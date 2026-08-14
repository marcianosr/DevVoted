---
# DVTD-wbwz
title: Consolidate text grays to pewter, remove faint tone
status: scrapped
type: task
priority: normal
created_at: 2026-08-12T19:56:39Z
updated_at: 2026-08-13T08:24:10Z
---

Replace all text-zinc-xxx with text-pewter equivalents. Remove 'faint' tone references from design system and consolidate to single gray color (pewter #8B8D98).

## Reasons for Scrapping

Folded into DVTD-8ksp (Marciano, 2026-08-13): the text grays and the surface grays live in the same ~42 files, so doing them as two sweeps would touch every file twice.

Not just a merge, though. As written this bean is under-specified: **pewter is also Boulder's gate theme colour** (`--theme-color: var(--color-pewter)` in app.css), so making all body text pewter would make it match one gate's accent. And there is no dark-surface neutral token at all to migrate the surfaces onto. DVTD-8ksp designs the token set first.
