---
# DVTD-ur53
title: The bar groups its destinations and counts what is left
status: completed
type: task
priority: normal
created_at: 2026-09-27T19:30:23Z
updated_at: 2026-09-27T19:39:16Z
parent: DVTD-lqtu
---

**What:** The top bar's three destinations share one shape with one filled, the polls left read as a bare figure that goes when the day does, and the player's mark sits outside the bar.

**Why:** The run press wore its filled shape on every screen, so being in the run looked the same as hovering over it, and three peer destinations were drawn three different ways in two clusters.

## Done when

- [x] The three destinations share one shape, and the one you are on is the only one filled
- [x] The polls left read as a figure, and nothing is stated once the day is used up
- [x] The player's mark sits beside the bar rather than inside it
- [x] The bar's quiet text is a true grey rather than a blue one
- [x] The count and the account lines are built from the kit rather than written by hand

## Notes

Reverses the reset clock outcome of the bar's previous pass, which put the clock on every screen. The bar drops it entirely: the hub press and the community badge still state it, so the bar navigates and the hub reports. A player whose day is used up, anywhere but the hub, is told nothing about the reset by the bar.

Narrow screens are unchanged: the community and suggestion links still drop and reappear in the account menu. The count now survives at every width, because one character costs what a sentence did not.

## Summary of Changes

**The switcher.** `AppNav` draws one `NavItem` for all three destinations under one rule: active is `bg-surface-raised` plus `ring-edge-strong`, inactive is `text-theme-muted` that fills on hover but never brightens to the active rung. `PRESS`/`PRESS_ACTIVE`/`LINK`/`LINK_ACTIVE`/`TRAILING` are gone. `suggest` became a `NavTarget` so `Nav.component.tsx` can mark `/polls/new`, since a group where one member can never be selected is not a group. The three sit in a `nav` inside the `header`; the label truncates and the badge does not, because every item being `shrink-0` let the group spill past the bar's border at 320px instead of clipping.

**The count.** `pollsBadgeFor` returns `number | undefined`, so the bar states a figure and never a sentence. Both silences stay in the viewmodel: the spent day, and the gate boundary where the count is honestly zero. `barClockFor` is deleted with the chip it fed, along with `NEW_IN` and `LEFT_WORD`. `Badge color="saffron"` replaces the hand-rolled sand chip, and the item carries `aria-label` `Daily Run · 3 polls left`, because a bare figure is not a sentence. The badge no longer hides below `sm`.

**The ground.** `data-screen-theme="pewter"` on the outer wrapper, not the bar, so the account menu wears the same grey as the links. It moves the muted and soft rungs only: `text-theme-faint` pins chroma at 0.05 whatever the hue, so the active label and the sign-in press stay a cool near-white by design. The mark's nested `vermillion` and the badge's `saffron` still win.

**The kit.** The account menu's two lines are `Typography` `subtitle` and `hint`, which match the hand-rolled strings exactly, so no pixel moved. `break-all` stayed on a wrapper around the name alone, since hoisting it to the shared parent would break the standing line mid-word.

**Docs.** ADR-130 D1 reversed, D2 and D4 rewritten, D8 and D9 added, two Consequences paragraphs corrected, README row rewritten. The CHANGELOG's existing bar entry was amended rather than a second one added, because the bar has never shipped.

**Known and left alone:** `useNextPollsCountdown` still ticks every ten seconds in the bar for nothing but `isOpen`, now that no figure is drawn from it. Written into ADR-130's consequences as the first thing to change if the chrome ever costs anything.

Verified: `npm run lint` clean, `npm run typecheck` clean, `npm run lint:dead` clean of anything this touched, `npm test` 4395 passed across 225 files, up from 4388.
