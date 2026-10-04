---
# DVTD-ec6z
title: 'Terminal theme: install/uninstall copy, buy-as-button, arm reveals the delta'
status: completed
type: task
created_at: 2026-09-01T12:57:17Z
updated_at: 2026-09-01T12:57:17Z
---

Round 8 (images 136-138 + mid-turn notes).

- [x] Copy: buy -> Install, remove -> Uninstall
- [x] Rebuild offers and Buy slot are buttons (icon + label + saffron price), not rows
- [x] git tag is one line: explanation + button
- [x] Upgrade/uninstall deltas appear only once armed
- [x] Armed button becomes the confirm; a cinnabar X cancels
- [x] lint + tsc + story typecheck + tests

## Summary of Changes

`Button` gained `icon` (ReactNode) and `price` (rendered saffron bold inside the button). `BuyRow` (this session's row-shaped purchase) became `BuyLine`: an optional muted explanation on the left, the button on the right. All three shop purchases use it - Buy slot 13 under the build, Rebuild offers under the offers, Git tag above the footer - and NewRun's buy-slot follows.

Arming is now the only thing that reveals a projection. At rest a build row is: name, version badge, description, one price tag, an upgrade button and an Uninstall button. Armed, the row tints, the description swaps for the consequence ("Leaves you 32 KB"), the projected changes appear, and the acted-on button becomes a lit "confirm 64 KB" / "confirm sale" with a cinnabar X beside it as the way out. `ConfirmLine` deleted: the second line was carrying what the row can hold itself.

Not built as a tooltip: tooltips are dead on touch (DVTD-aiyp) and this island folds to phone width, so the projection stays inline.

Verified: lint + depcruise clean, tsc clean, story typecheck 0 terminal-theme errors, vitest 2622 passed / 3 pre-existing modern-theme failures. Nothing committed.
