---
# DVTD-0gww
title: 'Kanto Typography: three heading rungs, and a themed prose rung for modals'
status: completed
type: task
priority: normal
created_at: 2026-09-10T08:45:28Z
updated_at: 2026-09-10T08:50:17Z
---

`display` (22px) and `headline` (20px) sat 2px apart and neither name said what it
was for. `headline` was never used outside stories; `display` carried the poll
question. Collapse to headline / title / subtitle.

Second: `paragraph` (16px, near-white) is right for a Choice row, too loud for a
modal's explanatory prose. The modal body wants smaller and hue-carrying.

- [x] Delete `display`; `headline` takes text-display, base tracking, h1
- [x] `caption` becomes the themed prose rung: text-sm + text-theme-soft
- [x] Question, Uninstall, Modal + stories follow
- [x] Typography.spec covers the 3-rung ladder and the new caption tone
- [x] lint, typecheck, tests

## Summary of Changes

**Heading ladder 4 rungs -> 3.** `display` deleted, `headline` took its style (`text-display font-extrabold`, h1, base tracking). The two sat 22px vs 20px apart and usage settled it: `display` carried the poll question, `headline` appeared in no `.ui.tsx`. `tracking-wide` now belongs to `title` alone, because the question wraps and widened tracking there costs a line. Sizes are 22 / 16 / 14 / 12.

**`caption` is now the prose rung that explains.** Tone moved `text-theme-faint` -> `text-theme-soft`. `paragraph` (16px, near-white) stays the line the player reads (a Choice row); `caption` (14px, hue-carrying) is the line that explains (a modal body). Tag stays `span` because `Author` nests it in one, so prose call sites pass `as=p`. `ConfigInfo` description moved to `text-theme-soft` by hand: its prose is a flex-wrap container for inline `Figures` badges and Typography takes no className.

Files: `Typography.{ui,spec,stories}`, `Question.ui`, `Uninstall.ui`, `ConfigInfo.ui`, `Choice.stories`, `Trail.stories`, `Modal.stories`.

New guard: `Typography.spec` asserts "offers three heading rungs and no more".

Verified: 3860 tests pass (220 files), oxlint + depcruise clean, `tsc --noEmit` clean, stories-inclusive typecheck reports only the 30 pre-existing errors.
