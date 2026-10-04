---
# DVTD-vse6
title: Extract a Panel from Modal and adopt it across the kanto kit
status: completed
type: task
priority: normal
created_at: 2026-09-10T13:38:15Z
updated_at: 2026-09-10T13:44:42Z
---

The kanto kit defines its panel chrome four separate times: `Modal.ui.tsx`
(rounded-2xl / bg-theme-faint / p-6), and `Upgrades`, `ConfigInfo` and
`CodeBlock` each repeating rounded-lg / bg-theme-raised / p-4. Four call sites, two rungs, no shared definition.

Marciano's call: one `Panel`, wearing Modal's EXACT chrome (bg-theme-faint, the
screen's own ground, so a panel is delineated by its edge and not by a lighter
fill), and Modal reuses it rather than keeping a private copy.

Plan: ~/.claude-work/plans/can-you-reuse-the-whimsical-toucan.md

- [x] `Panel.ui.tsx` exporting `PANEL_SURFACE` + `Panel`
- [x] `Panel.spec.tsx` + `Panel.stories.tsx`
- [x] `Modal.ui.tsx` composes `PANEL_SURFACE`
- [x] `Upgrades.ui.tsx`, `ConfigInfo.ui.tsx`, `CodeBlock.ui.tsx` adopt `Panel`
- [x] Rewrite the two specs whose CLAIM changes (ConfigInfo, CodeBlock)
- [x] lint, typecheck, tests, stories typecheck, prettier

## Summary of Changes

**`Panel.ui.tsx`** — two exports on purpose. `PANEL_SURFACE` is the class
string; `Panel` is the box that wears it. Modal's panel element carries
`role="dialog"`, `aria-modal` and `aria-label`, and threading those through
`Panel` would put dialog semantics on a presentational box, so Modal composes
the string while everything else composes the component. Precedent for a
non-component export from a `.ui.tsx`: `versionAccentOf`, `offeredRungOf`.

`className` is documented as non-conflicting utilities only (width, overflow,
text size). There is no tailwind-merge here, so `gap-3` against the chrome's
`gap-4` would lose to source order: a panel's padding and gap are the kit's.

**The ground moved a rung down.** `Upgrades`, `ConfigInfo` and `CodeBlock` were
on `bg-theme-raised` (L 0.22) and are now on `bg-theme-faint` (L 0.1), which is
the `Screen`'s own ground. A panel is delineated by its edge, not by a lighter
fill. Two spec names asserted the old reading and were rewritten rather than
re-pointed: ConfigInfo's "sits on a raised ground so it reads above the chip it
belongs to" is no longer true (z-index does that job now), and CodeBlock's
"wears the raised theme surface".

**`Upgrades` needed `max-w-112`.** The shared `p-6` costs 16px against the old
`p-4`, leaving 352px of content in `max-w-100`. The footer's cumulative figure
is the panel's widest line at 12px JetBrains Mono: `all the way to v5 costs 384
KB · press to buy v3` is 345.6px, so it fitted with 6px to spare, but a
four-digit price (`1024 KB`, which the storage ladder reaches) wrapped it. No
test would have caught this — the fixture is the one that fits. Widened the cap
rather than giving Upgrades private padding back.

Out of scope, deliberately: `RegistryControl` (a row, `p-3`), `Audit` (an alert
bar with no fill that sets its own theme), `SlotBox`/`SlotOffer`/`ConfigChip`
(chips and boxes), `Screen` (the page frame, owns a min-height and width table).

Verified: lint + depcruise clean (918 modules, one pre-existing warning in
`Screen.stories.tsx`), `tsc --noEmit` clean, 223 test files / 3942 tests pass,
stories typecheck at the 30-error baseline with none in the touched files.

Not verified in a browser, per the repo's gate. Two things worth a look at
`npm run storybook`: `ConfigInfo` and `Upgrades` are floating popovers that now
land on the same colour as the screen behind them, separated only by a faint
border, and there is no shadow anywhere in the kit to fall back on.
