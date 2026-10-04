---
# DVTD-l9q4
title: 'Shop offer tooltip: hover hints, click opens actions; delock the lock button'
status: completed
type: task
priority: normal
created_at: 2026-08-11T19:15:48Z
updated_at: 2026-08-11T19:25:42Z
---

Offer chips currently show the full interactive tooltip (description + install/lock buttons) on hover. Change: hover shows a compact 'Click to install' hint; clicking the chip pins the full tooltip open (dismiss via outside click/Escape). Also drop the padlock glyph from the lock button and label it 'Lock config'.

- [x] Tooltip.component: support parent-controlled pin (pinned/onDismiss), ignore taps on the panel itself
- [x] ConfigChip.ui: hint-vs-pinned tooltip modes
- [x] ShopScreen.ui: wire selection to pinned tooltip; lock button copy
- [x] Update specs, run lint/typecheck/tests

## Summary of Changes

- Tooltip.component: optional parent-controlled pin (pinned + onDismiss); outside taps/Escape report through onDismiss; taps on the panel itself no longer count as outside (a pointerdown on a panel button used to hide the button before its click landed).
- ConfigChip.ui: new tooltipHint/tooltipPinned/onTooltipDismiss props — compact hover caption until the parent pins the full rarity panel.
- ShopScreen.ui: offer selection (selectedId, the celadon ring) now IS the open tooltip; chip click toggles it, outside click/Escape clears both. Hover shows Click to install. Lock button reads Lock config (glyph dropped from the button; the held-offer corner badge keeps the padlock).
- Specs updated (hover tests became click tests), 1 new toggle test, 4 new Tooltip controlled-pin tests. CHANGELOG Unreleased entries amended.
- Verified: Tooltip/ShopScreen/ConfigChip specs 67/67 green; lint + build (tsc) pass. 22 full-suite failures are pre-existing epic WIP in files this change does not touch.
