---
# DVTD-mgy7
title: 'Terminal theme: rebuild under offers, git tag unfolded, per-gate bills'
status: completed
type: task
created_at: 2026-09-01T12:52:10Z
updated_at: 2026-09-01T12:52:10Z
---

Round 7 (images 133-135).

- [x] Rebuild moved out of the footer to the last row of Offers, with a rotate icon
- [x] git tag unfolded into a single row with icon, explanation and price
- [x] BuySlotRow generalised to BuyRow (icon prop) and reused for slot / rebuild / git tag
- [x] PriceTag gains a "bill" variant (cinnabar, notch left)
- [x] Prep gains an optional Bills section (per-charge rows + total)
- [x] Freemium wired into the Elite prep build so a config-driven bill has a source
- [x] lint + tsc + story typecheck + tests

## Summary of Changes

`BuySlotRow.ui` became `BuyRow.ui` with an optional `icon` node (defaults to a celadon `+`) and an optional price. Three purchases now share one row shape: buy a slot (last row of Build), rebuild the offers (last row of Offers, rotate icon), and the git tag (standalone row above the footer, inline git-branch SVG). The shop footer is just Continue.

`gitTag` is no longer a collapsed Section: it is a `BuyRowProps` with a one-line explanation and a price tag, and drops to an informational row (no tag) once the run is already tagged.

`PriceTag` gained a `bill` variant (cinnabar, notch on the left since the money leaves you). PrepScreen gained an optional `bills` section: one row per recurring charge with an optional note, then a bold total row. Wired in BeforeElite as Storage plan −128 KB and Freemium −128 KB ("doubles next gate"), total −256 KB with "−32 KB a wrong answer" tying back to the Volcano Burn audit; Freemium was added to that build (12 of 12 slots) so the bill has a visible source.

Verified: lint + depcruise clean, tsc clean, story typecheck 0 terminal-theme errors, vitest 2622 passed / 3 pre-existing modern-theme failures. Nothing committed.
