---
# DVTD-fi2u
title: Config chips overhang their column and overlap the shelf
status: completed
type: bug
priority: high
created_at: 2026-09-10T09:05:38Z
updated_at: 2026-09-10T09:05:38Z
---

In the shop, a chip wider than its column ran straight into the column beside
it. Both `Build` (column layout) and `Shelf` pass `width="full"`, so the fix was
supposed to be in place already.

`WRAP`, the span a chip gets when it has a panel behind the (i), was
`inline-flex w-fit` at every width. `w-full` on the chip then resolved against a
shrink-to-fit box, so every chip rendered at max-content and no name ever
truncated. Every chip in the shop has an (i), so every chip was wrapped.

- [x] `WRAP` takes the width the chip was given
- [x] `fit` gains `max-w-full`, so a content-width chip cannot overhang either
- [x] The name truncates at every width, not only `fixed`/`full`
- [x] Specs for all three widths, plus a `TooNarrowForTheName` story
- [x] lint, typecheck, tests

## Summary of Changes

`ConfigChip.ui.tsx`: `WRAP` drops `w-fit` and takes `clsx(WRAP, WIDTH[width])`;
`FIT_WIDTH` becomes `w-fit max-w-full`; `TRUNCATED` renamed `NAME_LIMIT` and
applied unconditionally.

The name is the only part that gives. `TRAILING` stays `shrink-0` on purpose: a
press the player cannot read is worse than a name they cannot read in full, and
the panel behind the (i) carries the whole name anyway. `truncate`'s
overflow-hidden is also what zeroes the flex item's automatic minimum size, so
the name can shrink below its longest word.

Why the existing width specs missed it: all three rendered a chip with no `info`
and no `upgrades`, which is the only path that skips the wrapper.

Verified: 3865 tests pass, lint + depcruise clean, tsc clean, stories typecheck
at the 30 pre-existing errors.
