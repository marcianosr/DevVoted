---
# DVTD-aflk
title: 'Shop: adopt the configure screen''s layout and preview'
status: completed
type: feature
priority: high
created_at: 2026-08-06T14:42:08Z
updated_at: 2026-08-06T14:48:21Z
---

The shop and configure screens solve the same problem (pick configs into a pipeline) with different layouts, and the shop's is worse. Offers render as full-width `PipelineReportRow` disclosure rows, three stacked above an equally tall load-out list, so the screen reads stretched.

Configure already solves this: `Columns` (compact chip aside + pipeline main) plus hover-preview showing old -> new gate modifier deltas via `statPair`/`StatBadge`.

That preview matters MORE in the shop: configure picks are free and reversible, shop picks spend scarce storage permanently. Today the shop answers 'what does this do to my modifiers' with a static sentence at the bottom that ignores what you're considering.

`RoleList`'s existing `preview` prop already renders a full `PipelineReportRow` (description, gives, needs, costs), so compacting offers to chips loses no information — the detail moves into the preview row.

## Todo
- [x] Extract the gate-modifier strip both screens need into one component (removes the duplicated statPair/multiplierTone/coverageValue helpers)
- [x] Extend `SlotPreview` with hint + blocked so the shop can price the preview row and refuse unaffordable installs
- [x] Rebuild ShopScreen on `Columns` + priced `ConfigChip` offers + hover preview
- [x] Fix the label: button reads 'Reroll offers' while every prop behind it is rebuild*
- [x] Update ShopScreen spec + stories
- [x] Run lint, typecheck, tests

## Summary of Changes

New `GateModifierStrip.ui.tsx` owns the old -> new delta strip; `statPair`, `multiplierTone` and `coverageValue` moved out of `ConfiguringScreen` into it, so both screens price a previewed config identically.

`SlotPreview` gained `hint` and `blocked`. `RoleList` already rendered the preview as a full `PipelineReportRow`, so compacting offers to chips lost no detail: description, gives, needs and costs all moved into the preview row.

`ShopScreen` is now `Columns` (priced `ConfigChip` offers plus Rebuild in the aside, load-out plus modifier strip in the main column). Offers install by clicking the chip, matching the configure bench. Hovering an offer previews it in the pipeline with one of three hints: click-to-install with price, `need NKB`, or `no free slot`.

Label fixed: the button read Reroll offers while every prop behind it was `rebuild*`.

20 ShopScreen tests pass (4 new, covering the preview and both blocked hints). Lint and typecheck clean.

Not done: the offer-count ramp (blocked on roster growth, see DVTD-ohfc) and bonus/pack slots in the aside, which now has an obvious home for them.
