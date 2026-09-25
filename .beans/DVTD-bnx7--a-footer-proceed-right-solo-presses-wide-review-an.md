---
# DVTD-bnx7
title: 'A — Footer: proceed right, solo presses wide, Review answers in the bar'
status: completed
type: task
priority: normal
created_at: 2026-09-24T12:30:33Z
updated_at: 2026-09-24T12:37:33Z
parent: DVTD-c2ha
---

- [x] Item 2: ACTION gets ml-auto at every width; solo press full-width on a phone via a Button width prop
- [x] Item 10: ROW_NOTE right-aligned below sm; ACTION_ROW gap-x-3 gap-y-1
- [x] Item 13: move Review answers into footerOf asides, delete AnswersPanel REVIEW_ROW
- [x] Item 22: reproduce Retry-invisible at 375px, then fix clearance/height cap
- [x] Update ScreenFooter.spec, GateOutcomeScreen.spec, Button.spec

## Summary of Changes

**Button** gained a `width` prop. The display moved out of `BUTTON` and `w-fit` out of `FIGURES` into one `WIDTH` map, because `full` has to beat `inline-flex` and two utilities setting the same property cannot be resolved by class order. `full` spans on a phone, shrink-wraps from `sm`.

**ScreenFooter**: `ACTION` is `shrink-0 ml-auto` at every width, not `sm:ml-auto` — the proceed press is always rightmost, asides always lead. A lone press spans the row on a phone. `ACTION_ROW` went `gap-3` to `gap-x-3 gap-y-1` and the row note right-aligns below `sm`, so a wrapped note reads as a caption for the press above it.

**ScreenActions** now pins with `sticky bottom-0` instead of `fixed` plus a spacer. The spacer was a fixed `h-16` that a footer wrapping to two or three rows on a phone outgrew, so the bar covered the end of the page. A sticky bar carries its own space and cannot be outgrown by its own contents. Negative margins undo Screen's body padding at both pre-`md` widths.

**Review answers** moved out of the answers panel into the footer asides on every branch (the hold branch already had it). `GateOutcomeReview` and the `review` wiring in `GateOutcomeView.component` are gone.

Also took item 14 here since it is the same file: every `sm` press now stands `h-7`/`size-7`, matching the capped press. Badges stay 20px decoration; presses are 28px.

**Not confirmed:** item 22 was never reproduced. No containing-block culprit exists (no transform/filter/backdrop-filter ancestor) and `bg-theme-faint` is opaque, so the root cause of the invisible Retry press is still unknown. The sticky rewrite removes the whole class of fixed-bar/spacer bugs, but needs a look on a real phone.
