---
# DVTD-2fmk
title: 'Kanto: pennant version tag, upgrade popover, uninstall modal'
status: completed
type: feature
priority: normal
created_at: 2026-09-09T16:58:53Z
updated_at: 2026-09-09T19:48:32Z
---

Next mock revision (373/374/376/377/378) on top of DVTD-cgls.

- 373: the upgrade button becomes a boxed glyph plus label, "↑ | v3 · 32 KB", with the price revealed only on hover.
- 374: every version tag becomes a left-pointing pennant (~20px tall, an 8px triangular notch, a leading dot, then vN). Replaces the plain vN in ConfigChip, ConfigInfo, the upgrade label and the popover ladder.
- 376: an upgrade popover on the upgrade button, distinct from the (i) panel (the mock shows both buttons, with the upgrade one lit). Name, description, then one row per version: pennant, effect, and either a check (owned), "yours" (held), a price (offered) or dim (future). Footer gives the cumulative cost and what a press buys.
- 377: an uninstall modal. Eyebrow, weight block plus name, prose, divider, a three-row figures table, then uninstall/cancel. Dismisses on an outside click.
- 378: the figures table's values are badges.

## Assumptions taken (flag if wrong)

- The eyebrow uses the existing Typography `hint` variant with an already-uppercase string, rather than adding an uppercase/tracking variant, since the ask was to reuse an existing one.
- Modal is a pure overlay with `role="dialog"`, not a native `<dialog>`: `showModal()` is imperative and Tier 1 takes no hooks. Focus trap and Esc stay Tier 2's.
- The hover-only price is also carried in the button's accessible name, because Tailwind gates `group-hover` behind `@media (hover: hover)` and a touch device would otherwise never see a price.

## Todos

- [x] Version.ui.tsx: the pennant, with its owned/offered/future states
- [x] Wire Version into ConfigChip and ConfigInfo, replacing every plain vN
- [x] Button: boxed leading glyph (cap) + a hover-revealed detail, plus a sm/md size axis
- [x] Upgrades.ui.tsx: the version-ladder popover
- [x] Modal.ui.tsx: pure overlay, outside-click dismiss
- [x] Uninstall content: eyebrow, weight + name, prose, badged figures table, two buttons
- [x] Stories + specs for each
- [x] lint + tests + build

## Open decision

Upgrades is built, specced and story-covered but NOT yet wired into ConfigChip. Mock 376 anchors the popover to the chip's left edge, the same place the (i) panel already occupies, and the chip currently hover-reveals that one panel from a single `group/info` wrapper. So wiring needs one answer: does the chip get a second independently-anchored panel, or one panel slot that shows either the info or the ladder? See the reply for the options.

## Verified

oxlint clean (one pre-existing Screen.stories warning), depcruise 0 violations over 900 modules, 3816 tests pass in 217 files, build clean, stories typecheck at the 30-error baseline with none in the touched files. Confirmed in the built CSS that all nine new utilities actually emit: w-82, w-100, the clip-path polygon, bg-surface-raised, group-hover/press, size-8, h-9, rounded-2xl, bg-black/70.

## Summary of Changes

- `Version.ui.tsx` (new): the pennant. A `clip-path` polygon rather than a border trick, so the notch costs no extra element. Three states, and only `offered` takes a colour (cerulean `badge-theme`); `owned` and `future` stay neutral, `future` at 60%. Now renders every `vN` in ConfigChip and ConfigInfo.
- `Button.ui.tsx`: gained a third shape arm (`cap`, a boxed leading glyph, reusing Choice's term) with a hover-revealed `detail`, plus an `sm`/`md` size axis. The detail is folded into the accessible name because `group-hover` never fires on touch.
- `Upgrades.ui.tsx` (new): the version ladder. Only the offered rung is pressable, since reaching v5 from v2 means buying v3 and v4 first.
- `Modal.ui.tsx` (new): pure overlay. The scrim is a real button rather than a div with a click handler, which gives dismiss keyboard reach and keeps the panel out of any stopPropagation arrangement.
- `Uninstall.ui.tsx` (new): eyebrow via Typography's existing `hint` (capitals in the string, not a text-transform), weight block + name, prose, a badged `dl` of figures, and two `md` actions.
- `ConfigChip.ui.tsx`: one panel slot, info XOR ladder. `ConfigChipUpgrade` deleted.
- `kantoPoll.factory.ts`: `upgradesFor` and `uninstallFor` derive from the real engine. Mock 376's 96/128/160 KB prices are exactly `upgradeStorageCost(2..4)` and its 384 KB total is their sum, so the ladder needed no hand-typed numbers at all.

## Decisions resolved mid-flight

ONE panel slot showing either the info or the ladder, and the upgrade press OPENS the ladder rather than buying (the buy is the offered rung inside it). That second choice removed `ConfigChipUpgrade` entirely: the button derives its version and price from the ladder's `offeredRungOf`, so the two cannot disagree.

## Verified

oxlint clean (one pre-existing Screen.stories warning), depcruise 0 violations over 900 modules, 3826 tests pass in 217 files, build clean, stories typecheck at the 30-error baseline with none in kanto-theme or src/test. Confirmed in the built CSS that every new arbitrary utility emits.

## Not done

Nothing wires these into a live route: `/run/*` still mounts the terminal-theme screens. Mock 373's dim upgrade button no longer has a meaning, since the press now opens rather than spends, and "can't afford" moved to the rung.
