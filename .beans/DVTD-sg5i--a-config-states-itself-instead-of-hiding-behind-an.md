---
# DVTD-sg5i
title: A config states itself, instead of hiding behind an info press
status: in-progress
type: feature
priority: normal
created_at: 2026-09-26T09:25:21Z
updated_at: 2026-09-26T15:31:18Z
---

**What:** Every config reads as an expanded card that states its effect, its weight, its version and what it sells for, instead of a one-line chip with all of that behind a floating info press.

**Why:** A price you have to press for is a price you can miss, and the panel that held them was unreachable by touch on one surface and overlapped its neighbours on another.

## Done when

- [x] A config states its effect, weight, version and sell value on every screen that draws one, with no hover and no press
- [x] The info press survives only where there is something the card cannot state, and never opens an empty panel
- [x] A config you cannot sell does not quote a sell price
- [x] The shelf and the build rail lay cards out without leaving ragged rows
- [x] Nothing renders a panel that is hidden from touch or keyboard

## Notes

Marciano's mock: weight box, name, tag badges, then the actions on a header row; a rule; the effect sentence; a rule; then `weight 1 · v2` on the left and `sells for 8 KB` on the right. Structure adopted, copy not: the mock's `@lts` and `boilerplate` have no producer in the codebase, so the numeric version pennant and today's badges stay.

Plan: `~/.claude-work/plans/i-want-to-replace-toasty-crane.md`.

## Summary of Changes

The chip grew into a card. `ConfigChip.ui.tsx` now has two arms: given facts it draws a block card (head · rule · effect · rule · footer), and given none it stays the one-line row that another player's build reads as. `ConfigInfo.ui.tsx` is deleted; its body and footer live in the new `ConfigFacts.ui.tsx` (`ConfigEffect`, `ConfigMeta`) which the Dex card can share.

The `i` now opens `ConfigDossier.ui.tsx` — the ladder ceiling and the provenance, the two things the card cannot state — and renders only when that panel has something in it.

Deleted along the way: `ChipWidth` and the `width` prop (the host grids, the card fills its cell), and `WeightTrack`'s config panel, which was `aria-hidden` on every render and unreachable by touch or keyboard.

Verification: 3930 tests across 204 files, typecheck, oxlint, dependency-cruiser and the production build all green. All 36 ConfigChip/WeightTrack stories render.

## Still open

- Provenance has no producer outside the Dex yet, so today the `i` appears on upgradable configs only.
- ~~The Dex card (`DexConfigChip`) has not been moved onto the shared parts.~~ Done in DVTD-wtri (ADR-120).
- The rename to `ConfigCard` and the ADR are not done.
- Touch lost the weight-track highlight: opening a panel used to light a config's segment, and that was the only route without hover.

## Follow-up, same session (absorbs DVTD-458u)

Marciano asked for collapse/expand on top, with a design mock. Built here rather than in the parallel session that started it; that session stopped cleanly and its steps 1-4 were kept and reconciled.

- The card takes a **collapsed** and an **expanded** state. Collapsed renders the header only.
- Defaults are per panel: a config you hold arrives collapsed, a config you are offered arrives expanded (`INSTALLED_CARDS_OPEN` / `OFFERED_CARDS_OPEN`).
- The `i` is gone. A **chevron at the head of the card**, before the weight block, is the toggle.
- `ConfigDossier.ui.tsx` deleted. The disclosure is inline, so nothing floats for the card's own facts and no sheet can be unreachable on a phone.
- Tier 1 takes a **set** of open names, not one name, so a panel can have many cards open.
- `src/shared/lib/disclosure.ts` is new: a panel stores the **flips away from its default**, never the open set. A shelf that re-rolls and a build that gains configs therefore need no reconciling, and a card the panel stops listing stops being asked about.
- The footer follows the mock: version pennant left, sell figure right. The weight is the header's block and is no longer restated.

Verification: 3938 tests / 205 files, typecheck, oxlint, dependency-cruiser, production build, 36 stories rendering.

## Open question for Marciano

The footer reads **`sells for`**. A relayed instruction had asked for `uninstalls for`, but the design mock he sent directly reads `sells for`, and the design won. If `uninstalls for` was meant for the Build column specifically — where the config is installed and 'sell' is the wrong verb — that is a one-line change and both can be true.
