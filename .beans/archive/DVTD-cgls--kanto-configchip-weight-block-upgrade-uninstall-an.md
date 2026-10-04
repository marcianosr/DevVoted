---
# DVTD-cgls
title: 'Kanto ConfigChip: weight block, upgrade, uninstall, and a Button primitive'
status: completed
type: feature
priority: normal
created_at: 2026-09-09T15:10:32Z
updated_at: 2026-09-09T16:58:53Z
---

Mocks 367/368/369/371/372 extend the kanto ConfigChip into the chip the build band needs: a leading weight block whose LENGTH carries the slot count, an upgrade button, an uninstall button, and an opt-in fixed-width variant so a column of chips aligns. kanto-theme has no Button yet, so the three trailing controls get one.

Plan: ~/.claude-work/plans/extend-the-chips-federated-sketch.md

Design decisions (settled with Marciano):
- Weight is neutral at every size; the size-hue axis is retired on the chip.
- Weight length is 12px + 4px x slots, capped at 8 slots (16/20/28/44/44/44), ring on the clamped rungs 12 and 16. The numeral stays exact.
- One Button, tones ambient/action/danger; upgrade, info and uninstall all route through it.
- Uninstall fires on the first press; confirmation is Tier 2's business.
- Fixed width is opt-in (width="fit"|"fixed", default "fit"); Build unchanged.
- Weight becomes the bare block; the "weight ... slots" prose moves into ConfigInfo's footer.

Measured acceptance targets (mocks at 2x, halved): fixed chip ~328px, first badge 172px from the chip's left edge, uninstall at 309px, glyph buttons 20x20 rounded-md, label button ~47x20, weight block 20px tall.

## Todos

- [x] weights.ts: the slot->width ladder + the clamped-rung rule
- [x] Button.ui.tsx + stories + spec (tones ambient/action/danger, glyph and label shapes)
- [x] Weight.ui.tsx: rewrite as the bare filled block; prose moves to ConfigInfo's footer
- [x] ConfigChip.ui.tsx: weight block, upgrade, uninstall, width variant; delete the inlined INFO strings
- [x] kantoPoll.factory: slots + upgrade on the fixtures
- [x] ConfigChip.stories: FixedWidth, WithUpgrade, UpgradeUnaffordable, WithUninstall, EveryWeight
- [x] Specs: ladder rungs, neutral weight, uninstall, disabled upgrade, locked withholds; retarget the info-button ring test
- [x] lint + tests + build (incl. a scratchpad tsconfig for the stories)

## Summary of Changes

- `src/ui/kanto-theme/weights.ts`: the slot->width ladder (12px + 4px x slots, capped at 8) plus `isWeightClamped`. Literal Tailwind classes in a table because Tailwind 4 cannot see a template-built class name.
- `Weight.ui.tsx`: rewritten as the bare filled block (`bg-surface-raised` / `text-pewter`, neutral by token so it never shifts hue with the screen), ringed on the clamped rungs. The `weight ... slots` prose moved into `ConfigInfo`'s footer.
- `Button.ui.tsx` (new): the kit's first Button. Tones ambient/action/danger map to `data-screen-theme`; glyph and label shapes both 20px tall; `ring-inset` so a control never grows the row. `onPress` optional so the info button stays focusable with no handler (the panel's focus-visible reveal needs that).
- `ConfigChip.ui.tsx`: leading weight block, upgrade button, uninstall button, `width="fit"|"fixed"`. The three inlined `<button>` class strings are gone.
- `kantoPoll.factory.ts`: new `chipFor(config)` derives slots, version and upgrade from one config, so a chip cannot disagree with the panel its (i) opens. Upgradability is `isUpgradable`, not `version < maxVersion` — a config can sit below its max level with no axis to upgrade along. Removed the duplicated `version: N` / `level: N` pairs on four fixtures.
- Specs: Weight rewritten for the ladder (rungs, cap, ring, the off-ladder 0 and 6 a minified config produces); Button spec generalises the app.css guard by extracting every `*-theme-*` class the component emits and asserting each is declared; ConfigChip gained weight/upgrade/uninstall/fixed-width blocks.
- Boy-scout: split the mislabelled `describe("ConfigChip when locked")`, and made three panel tests select the panel by class rather than by being the first `[aria-hidden]` node (the info glyph is aria-hidden too now). Corrected a Build spec DOM walk to `closest`.

Verified: oxlint clean (one pre-existing Screen.stories warning), depcruise 0 violations over 888 modules, 3771 tests pass in 213 files, `npm run build` clean, and a scratchpad tsconfig typechecks the stories at the known 30-error baseline with none in the touched files.

## Follow-up

Superseded in part by the next mock revision (373/374/376/377/378): a boxed-glyph upgrade button with a hover-revealed price, a pennant version tag replacing every `vN`, an upgrade popover, and an uninstall modal.
