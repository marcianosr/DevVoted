---
# DVTD-510f
title: A byte's bar wears the legendary ring
status: completed
type: task
created_at: 2026-08-28T11:18:39Z
updated_at: 2026-08-28T11:18:39Z
---

Marciano, on the shop's pipeline track: give the byte the same glow as the prismatic upgrade press, since it is the tier that used to be called legendary.

- [x] SpotTrack: a byte's bar gets border-transparent + legendary-ring
- [x] A minified byte keeps the dotted edge, since the ring paints over it
- [x] Specs, ADR-043 amendment, CHANGELOG, wiki

## Summary of Changes

- `SpotTrack`'s `barTone` split out a `barShape`: minified wins first (dotted), then a byte takes `A_BYTE_BAR` (`border-transparent legendary-ring bg-zinc-800/80`), everything else keeps `INSTALLED`'s `border-current`. The grade tone still colours the label, so a byte reads gold inside the ring.
- The minified carve-out is deliberate: the ring paints a masked `::before` over the border, and the dotted border is the only thing that says minified. Room taken outranks finish.
- ADR-043's first amendment (DVTD-voxv, same day) had reserved `.legendary-*` for things that are NOT config rarity, so this needed a real amendment rather than a silent edit. Added one, which also records the shop shelf dropping the grade word (DVTD-il1e) — that reversed a bullet in the same amendment and I had not marked it.
- Verified: lint clean, tsc clean, tests green.

## Note

The ring now means two things on one screen: "upgrade requirement met" on a press, "top grade" on a bar. Flagged to Marciano rather than resolved.
