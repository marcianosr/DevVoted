---
# DVTD-94w7
title: Lift the top bar out of the route file
status: completed
type: task
priority: normal
created_at: 2026-09-27T17:46:11Z
updated_at: 2026-09-27T18:17:13Z
---

**What:** Move the top bar's markup out of the route file and into a presentation component, so the route only wires data.

**Why:** The route currently holds its own markup and styling, which the two-tier rule forbids, and it reaches for raw greys instead of the palette.

## Done when

- [x] The route file holds no markup or styling for the top bar
- [x] The bar's colours come from the palette rather than raw shades
- [x] The bar behaves as it does today at every width

## Notes

Found while adding the logo to the left edge of the bar. That change deliberately added one
link and left the rest alone, because a full extraction is wider than the logo task was.

The bar mixes a disclosure for narrow widths, plain links for wide ones, and an avatar
menu pushed to the right, so the extraction needs to keep all three behaviours and the
breakpoint that switches between the first two.

## Summary of Changes

Done as part of DVTD-ql06, which redesigned the bar rather than lifting it unchanged. The bar is now `src/ui/kanto-theme/AppNav.ui.tsx` with a Story and a spec, wired by `src/components/Nav.component.tsx`; the route mounts it and states nothing. Every raw grey is gone in favour of the surface, edge and theme tokens.

The narrow-width behaviour is kept but rebuilt: the hamburger is deleted, and the two links it held are rows in the account menu instead, so there is one disclosure at every width rather than two.
