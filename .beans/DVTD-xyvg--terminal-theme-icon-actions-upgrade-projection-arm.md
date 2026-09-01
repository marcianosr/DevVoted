---
# DVTD-xyvg
title: 'Terminal theme: icon actions, upgrade projection, arm-and-confirm'
status: completed
type: task
priority: normal
created_at: 2026-09-01T12:24:13Z
updated_at: 2026-09-01T12:28:46Z
---

Feedback round 5 on the terminal-theme island (images 123-129).

- [x] IconButton primitive: icon + label wide, icon only under @max-md
- [x] Price gets its own column at rest
- [x] Version badge shows the current version; v2+ reads viridian
- [x] Change gains a projected (dashed) target for upgrade previews
- [x] Arm-and-confirm: upgrade armed shows v1 -> v2 + confirm line
- [x] Remove armed lights the X and shows the sell value
- [x] Poll "use" becomes an icon button with its fee in the price column
- [x] Stories: rest, upgrade armed, remove armed, mobile, one live shelf
- [x] lint + tsc + story typecheck + tests

## Summary of Changes

`IconButton.ui` (new): rounded icon+label button, label hidden under `@max-md` so it collapses to a circle on phones, `aria-label` always carries the verb. Tones viridian/cinnabar/cerulean, plus an `armed` lit state (`aria-pressed`).

`ConfirmLine.ui` (new): the second line of an armed row — one confirm pill plus one muted fact. No cancel link: the armed icon button toggles off, which is the way out (Marciano, mid-turn).

`Change.ui`: `projected` renders the target badge dashed, so a preview never reads as a fact. `Version.ui`: v1 is muted, v2+ viridian. `Button.ui`: new `confirm` variant (viridian mirror of `danger`).

ShopScreen: build rows now carry `upgrade: { version, changes, price, label, onArm }`, `remove: { label, onArm }` and `armed: { action, confirmLabel, note, onConfirm }`. At rest a row shows its current version badge, the projected change, the price in its own right-aligned column, then the two icon buttons. Armed for upgrade: tag becomes `v1 → v2`, price moves into the confirm pill, the remove button hides. Armed for remove: only the lit X remains, confirm reads `remove · sells for N`.

PollScreen: `press` became `use: { label, price, onUse }` — fee in the price column, cerulean lightning icon button.

Stories: Shop gains `UpgradeArmed`, `UpgradeArmedMobile`, `RemoveArmed` (IndexedDB already at v2) and `ArmingIsLive` (useState shelf where arming and disarming actually work).

Verified: lint + depcruise clean, tsc clean, story typecheck 0 terminal-theme errors, vitest 2622 passed (3 pre-existing modern-theme failures). Nothing committed.
