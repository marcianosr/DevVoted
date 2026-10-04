---
# DVTD-wjfj
title: Registry control title, shop always under a gate, thinner info prose
status: completed
type: task
created_at: 2026-09-10T10:07:27Z
updated_at: 2026-09-10T10:07:27Z
---

Three follow-ups off the rendered kit.

## Summary of Changes

**A registry-control title.** `Registry.ui.tsx` renders `Registry control` above
the rebuild/extend rows, as `Typography variant="title" as="h3"`. `h3` is new in
`TypographyTag`: the group sits inside the section that already owns the `h2`, and
no variant defaults to it, because depth is the call site's to know while the same
rung can be an `h2` or an `h3` depending on what encloses it.

I wrote `variant="label"` (12px) and covered it; the file came back from disk at
`variant="title"` with a later mtime than any write of mine, so the test now
follows the file. `title` matches the "Registry" heading above it in weight.

**The shop has no default any more.** `ShopScreenProps` was
`{ header } | { theme }`, and the headerless branch modelled a screen the run
cannot reach: a shop is always the shop of a gate. `header` is now required,
`theme` is gone, and the component always reads its colour off
`header.swatch.theme`. Stories: `Default` and `UnderAGate` collapse into one
`UnderAGate`, and `NothingBuiltYet` spreads the same props.

The factory's shop header now takes `balance: SHOP_BALANCE_KB` (96), not the poll
band's 1843. It is the number `offerFor` dims a row against, so the old fixture
had a header claiming 1843 KB beside offers refused at 128 KB.

**ConfigInfo's description is smaller and thinner.** `text-sm` → `text-xs`, plus
an explicit `font-normal`: `body` is pinned to bold, so prose with no weight of
its own was rendering at 700, which is what made it shout. 400 is as thin as the
kit goes, since app.css loads no lighter face. The note line follows, or it would
have shouted over the description it annotates.

No new Typography variant, answering the question in the ask: the panel's prose
is raw classes because the line is a flex-wrap row laying out inline `Figures`
badges and Typography takes no className. Nothing outside this panel moved, and
`caption` (14px/400) is untouched.

Verified: 3889 tests pass (220 files), lint + depcruise clean, tsc clean, prettier
clean, stories typecheck at the 30 pre-existing errors.
