---
# DVTD-rcoj
title: The bar's press counts the polls left, then names the reset
status: completed
type: feature
priority: normal
created_at: 2026-09-27T19:01:10Z
updated_at: 2026-09-27T19:22:03Z
---

**What:** The top bar states the polls left and the reset clock, stops sticking to the top, and the community board loses a column while gaining faces.

**Why:** The press read `5 polls today`, which is the pool rather than what is left, and the reset clock was withheld on the hub, where the bar then read as failing to load. Two near-identical leader boards side by side wrapped every row for a comparison that is not there yet.

## Done when

- [x] The press badge counts the polls left, in every state where a count is honest
- [x] The badge names the arrival time instead of a count once the day is used up
- [x] The bar states the reset clock on every screen, the hub included
- [x] The bar scrolls away with the page and seats shorter than before
- [x] A screen that pins its own header hangs it from the viewport, not from the bar
- [x] The turnout row shows a face for everybody who answered today
- [x] One leader board shows at a time, chosen with a tab
- [x] A panel states its description on its own line, left aligned
- [x] The logo mark breaks twelve times round rather than four

## Notes

Reverses ADR-130 decision 1, which withheld the clock on `/run` and gave it to the hub's press. The press keeps stating it there, so the hub states it twice by choice; the bar itself never states it twice in its own width.

## Summary of Changes

**The bar.** `pollsBadgeFor` now takes the clock and counts `pollsPerGate - answeredThisGate.length`, falling back to `new in 3h 3m` when `pollsExhausted` and the day has not yet rolled over. `barClockFor` shares that one predicate, so the badge and the trailing clock cannot both claim the reset. `Nav.component.tsx` lost `isOnTheHub` and passes both. `AppNav` dropped `sticky top-0 z-30` and `min-h-[var(--nav-seat)]`, tightened to `py-1.5`, and shrank the bar avatar to `sm`: 72px down to about 52px. `--nav-seat` is deleted from `app.css` with the spec that read the stylesheet to prove it existed, and `Header` pins at `md:top-0`.

**The community board.** `RunCommunityView` carries `players`, derived from the same answers that produce `totalPlayers`, so the count and the faces cannot disagree; the turnout row draws ten and folds the rest behind `+n`. The two leader boards share one full-width column behind `Tabs`, state held in `CommunityScreen.ui.tsx`. `Panel.Header` gained a `summary` slot that takes its own line, left aligned, in place of stuffing the description into the right-aligned `meta`.

**The mark.** The dashed cell breaks twelve times round at 2:1 rather than four times at 6:1, in `Logo.ui.tsx`, `public/favicon.svg` and `public/brand/mark.svg`; the PNG icon set was regenerated.

**Docs.** ADR-130 decisions 1, 4 and 5 rewritten; ADR-131 gained decision 7. Wiki and CHANGELOG corrected where they still claimed side-by-side boards and a clock withheld on the hub.

Verified: `npm run lint` clean, `tsc --noEmit` clean, `npm test` 4388 passed across 225 files.
