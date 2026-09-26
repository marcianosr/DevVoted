---
# DVTD-ilfw
title: 'Kanto shop screen: Build column and Shelf offer list'
status: completed
type: feature
priority: normal
created_at: 2026-09-09T20:16:31Z
updated_at: 2026-09-09T20:27:14Z
---

Mock 384: the two-column shop screen. Left is Build (5 fixed-width config chips), right is Shelf (5 offers plus Rebuild/Extend controls).

## Reuse call

A Shelf offer row is structurally a ConfigChip: weight, name, optional version pennant, trailing badges and buttons. So Offer is NOT a new component. An affordable offer is a pressable Badge (cerulean, ringed) which is already exactly what Badge's Press arm draws; an unaffordable one is a dimmed row, which is already what `skipped` does. The `.ts` row offers an upgrade instead of an install, so it uses `upgrades`.

New work is therefore the two lists and the control rows, not the rows themselves.

## Also in this batch (mock 379/380/381/382/383)

- Weight and Version moved off the neutral zinc roles onto `badge-theme`: raw zinc-800 read as a cold grey island on a warm cinnabar panel.
- "of 5" dropped from ConfigInfo's title row; the upgrade ladder already shows how far the versions run.
- `w-fit` on Button and Version, so neither stretches when it is a flex-column child (Screen's body is a column, which is why the upgrade button went full-width).

## Todos

- [x] Button: `detailOn` hover|always, since the Shelf shows a price at rest and a build chip hides it
- [x] ChipWidth gains `full`, so each column sizes its own rows
- [x] Shelf.ui.tsx: header, offer list, control rows
- [x] ShelfControl.ui.tsx: cap glyph, title, subtitle, price (Rebuild / Extend)
- [x] Build.ui.tsx: column layout, and a BuildCount union so slots XOR paying/ready
- [x] ShopScreen.ui.tsx: the two columns, header XOR theme like Screen
- [x] Fixtures, stories, specs
- [ ] lint + tests + build

## Summary of Changes

**Mock 379/380/381/382/383 (the colour and fit corrections)**

- `Weight` and `Version` moved off the neutral zinc roles onto `badge-theme`. Measured the mocks first: both were painting raw `#27272A` (zinc-800) with pewter ink on a `#241612` cinnabar panel, i.e. cold grey islands on a warm ground. `badge-theme` carries the screen's hue at a third of its chroma and pairs fill with ink, so the contrast cannot be split apart. Version's clamped-rung ring followed from `ring-pewter` to `ring-theme-soft`, and its dot from `bg-surface` to `bg-theme-faint`.
- "of 5" dropped from ConfigInfo's title row; the upgrade ladder already shows how far the versions run. Removed the leftover `OF` const and a lone fragment.
- `w-fit` added to `Button` and `Version`. This was the real cause of the full-width upgrade button: Screen's body is `flex-col`, so any child without a width stretches to the cross axis. `Badge` already had `w-fit`, which is why it never showed the bug.

**Mock 384 (the shop screen)**

- `Shelf.ui.tsx` + `ShelfControl.ui.tsx` + `ShopScreen.ui.tsx`, with specs and stories.
- An offer is a `ConfigChip`, not a new row type. An affordable price is Badge's pressable arm (cerulean, ringed) which is already exactly what the mock draws; an unaffordable offer is a `skipped` chip, already dimmed; an offer raising a version already held carries the upgrade button. The shelf's only addition is `upgradePriceOn="always"`, because in a build chip the price hides until hover to keep the rail quiet but on the shelf the price *is* the offer.
- `Button` gained `detailOn: "hover" | "always"`. `ChipWidth` gained `full`, so each column sizes its own rows.
- `Build` gained a `layout` axis and a `BuildCount` union: `slots` XOR `paying`/`ready`, so the header cannot carry two different readings of the same build. The poll band counts what pays this poll; the shop column counts the room left.
- Fixtures derive from the engine again: the shelf's 32/64/128 KB prices are `draftCost` at 32 KB a slot, and the five build configs' slots sum to the 7 the mock's header reports.

## Verified

oxlint clean (one pre-existing Screen.stories warning), depcruise 0 violations over 909 modules, 3853 tests pass in 220 files, build clean, stories typecheck at the 30-error baseline with none in kanto-theme or src/test. Confirmed in the built CSS that badge-theme, w-fit, the clip-path, grid-cols-2, size-10, ring-theme-soft and w-100 all emit.

## Not done

Still Storybook-only; `/run/*` mounts the terminal-theme screens. Mock 384 shows the upgrade button dim on one chip and lit on two others, which the current model cannot express: the press now opens the ladder rather than spending, so affordability lives on the rung inside. Worth a decision on whether the button should also carry a dim "you cannot afford the next version" cue.
