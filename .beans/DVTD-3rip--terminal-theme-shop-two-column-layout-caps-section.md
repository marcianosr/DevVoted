---
# DVTD-3rip
title: 'Terminal theme: shop two-column layout, caps section titles, price tag units'
status: completed
type: task
created_at: 2026-09-01T13:18:38Z
updated_at: 2026-09-01T13:18:38Z
---

Round 9 (images 139-140).

- [x] Build and Offers sit side by side, each its own container query scope
- [x] Slot track lifted into its own full-width Storage section
- [x] Section titles are uppercase and letterspaced
- [x] PriceTag dims the unit so the number reads first
- [x] lint + tsc + story typecheck + tests

## Summary of Changes

ShopScreen splits into `storage` (meta + slot track, full width) and `build` (meta + rows + buySlot), then puts Build and Offers in a two-column grid that stacks under `@max-md`. Each column is its own `@container`, so at ~380px the existing `@max-md:` rules fire inside them: descriptions drop below the config name and the action buttons collapse to icon-only circles - exactly the mock, with no new CSS.

`Section` labels render uppercase with wider tracking (already font-bold; the mono face has no heavier weight, so caps + tracking carry the extra prominence).

`PriceTag` splits KB/MB out of the label and renders the unit at 70% opacity with a hair more space, so "64" reads before "KB".

Left alone deliberately: the mock puts "rebuild offers" in the footer, but the standing instruction is that it belongs under the offers, so it stays at the foot of the Offers column; and buy-slot stays a button (round 8) rather than the row the mock shows.

Verified: lint + depcruise clean, tsc clean, story typecheck 0 terminal-theme errors, vitest 2622 passed / 3 pre-existing modern-theme failures. Nothing committed.
