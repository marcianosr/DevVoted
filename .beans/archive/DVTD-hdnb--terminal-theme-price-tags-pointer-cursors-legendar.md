---
# DVTD-hdnb
title: 'Terminal theme: price tags, pointer cursors, legendary upgrade button'
status: completed
type: task
created_at: 2026-09-01T12:45:10Z
updated_at: 2026-09-01T12:45:10Z
---

Round 6 (images 130-132).

- [x] cursor: pointer on every enabled button (app.css base layer)
- [x] Upgrade icon button keeps the legendary rainbow ring
- [x] PriceTag primitive: pay / short / armed / recurring / receive, notch on the side the money moves
- [x] Tags wired into shop build rows, offers, buy-slot, storage plan, poll use fee
- [x] Offers buy through an icon button; locked offers dim the tag and disable the button
- [x] ConfirmLine: fact left, armed tag right ("confirm 64 KB" / "confirm sale")
- [x] lint + tsc + story typecheck + tests

## Summary of Changes

`src/styles/app.css` base layer: `button:not(:disabled), [role="button"]:not(:disabled) { cursor: pointer }`. Tailwind v4 dropped preflight's pointer cursor, so this restores it app-wide (modern-theme and legacy screens included); `disabled:cursor-not-allowed` utilities still win over the base layer.

`PriceTag.ui` (new): one money token with five variants. The notch (a dot) sits left when money leaves you (pay / short / armed / recurring) and right when it comes back (receive). Renders a span by default and a button when given `onUse`, which is what the armed confirm and the buy-slot price use.

`IconButton.ui` gained a `legendary` tone wearing the existing `.legendary-ring` gradient, used by the upgrade button. The ring is static per the 2026-08-04 decision, not animated.

Shop: one money tag per row (upgrade price at rest, sale value when the row has no upgrade or is armed for removal), offers buy through a `⤓` icon button with the price as a tag (dim + disabled when locked), storage plan rates render as recurring tags, buy-slot price is a pressable tag.

Poll: the use fee is a pay tag next to the lightning button.

`ConfirmLine` simplified: one muted fact on the left, the armed tag on the right; `Button`'s short-lived `confirm` variant removed.

Verified: lint + depcruise clean, tsc clean, story typecheck 0 terminal-theme errors, vitest 2622 passed / 3 pre-existing modern-theme failures. Nothing committed.
