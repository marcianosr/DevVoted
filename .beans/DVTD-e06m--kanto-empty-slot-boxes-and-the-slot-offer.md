---
# DVTD-e06m
title: Kanto empty slot boxes and the slot offer
status: completed
type: feature
priority: normal
created_at: 2026-09-10T12:50:15Z
updated_at: 2026-09-10T13:06:01Z
---

The kanto Build column draws chips and nothing else, so the room a build has left
and the room it could buy are both invisible. Port the old kit's two drawings
into the kanto kit: a dashed `empty slot` box per unfilled slot, and a hatched
stub offering the next slot for sale.

Plan: ~/.claude-work/plans/create-empty-slot-boxes-sparkling-karp.md

Marciano's calls: `24 KB short` for the refusal, price green when affordable and
red only when refused, arm-then-buy on both presses. Refund reads viridian
because a refund pays KB.

- [x] `bg-hatched-theme` sibling utility in app.css (never re-point `bg-hatched`)
- [x] `SlotBox.ui.tsx` + spec + stories
- [x] `SlotOffer.ui.tsx` + spec + stories
- [x] `slotDealsAt` in kantoPoll.factory, the one place the shortfall subtracts
- [x] Compose into Build's `slots` union arm; extend Build + ShopScreen specs
- [x] Wiki: amend the refusal copy law
- [x] lint, typecheck, tests, stories typecheck

## Summary of Changes

Two Tier-1 components, composed into `Build`'s shop reading.

**`SlotBox.ui.tsx`** — one slot standing open. `cash` is what turns it into a
press, so a refund cannot appear on a slot that is not open: `canCashSlot` held
as a shape rather than a rule. No `disabled` flag, because "no refund" is the
`cash === undefined` arm. The inert arm is `aria-hidden`, since the band's own
"7 of 10 slots" already carries that count and three boxes need not read
themselves out three times. Refund badge is viridian: a refund pays KB.

**`SlotOffer.ui.tsx`** — the hatched stub. `slot` is the slot the purchase MAKES
and stays a number, so the component fattens it without parsing a sentence.
Always a press, never inert: room is on sale whether or not you can pay, so
refused is a disabled button. Price is viridian when affordable, cinnabar when
refused. The refusal is ink rather than a second bubble, in the price's own red.

**`bg-hatched-theme`** — a sibling utility in app.css, never a re-point of
`bg-hatched`: the two older slot tracks sit on unthemed grounds where
`--theme-color` falls back to cerulean, so re-pointing would put a blue hatch on
a zinc track. The stripe takes `border-theme-soft`'s exact value, because the
hatch is the box's own edge repeated. Two specs pin this: one asserts the new
utility reads `--theme-color`, the other asserts the original still reads
`--color-edge-strong`.

**`Build.ui.tsx`** — the `slots` arm of `BuildCount` gained `cash` and `offer`,
so the union *is* the guard: a poll band cannot be handed a slot offer, at
compile time. A private `Vacancy` draws `Math.max(0, capacity - used)` boxes
(a build can sit over capacity, and a negative length throws in `Array.from`),
hangs `cash` on the LAST box only, then the stub. No screen changes needed.

**`slotDealsAt(capacity, balance)`** in `kantoPoll.factory` is the only place a
shortfall subtracts, which is what makes `NaN` unreachable from any UI file.
Both mock frames reproduce exactly from the ladder: capacity 10 gives
`buy slot 11 · 120 KB · 24 KB short` with `+96 KB` to cash, capacity 11 gives
`buy slot 12 · 160 KB · 64 KB short`. Past the ceiling there is no offer; on the
free four there is nothing to cash. Promoted `SHOP_BALANCE_KB`,
`SHOP_CAPACITY_SLOTS` and `usedSlotsOf` to exports, and re-exported
`baseSlots`/`maxSlots` because `ui-stays-presentational` bars specs from
importing `rules.model` at runtime.

Wiki: the refusal copy law now names the slot offer as its one exception, since
room is the thing being bought so price is all that can refuse it.

Verified: 3935 tests pass (222 files, +49), oxlint + depcruise clean, tsc clean,
prettier clean, stories typecheck at the 30 pre-existing errors and none in the
new files. `bg-hatched` byte-identical; both older tracks still hatch in zinc.

## Follow-up: the hatch was ugly

The first cut copied `bg-hatched`'s 1px-in-4 geometry, which reads as moire on a
row 40px tall rather than as hatching. Measured both screenshots by decoding the
PNGs: the shipped version was **1.06px lit in a 3.89px perpendicular period at a
luminance delta of 81**; Marciano's reference is **12.02px lit in a 24.04px
period at a delta of 8.3**. Six times the period, a tenth of the contrast.

**Geometry**: `transparent 0 12px, … 12px 24px` — half and half, matching the
reference exactly.

**Contrast**: dropped the `/ 0.5` alpha for an opaque ground step,
`oklch(from var(--theme-color) 0.16 max(c * var(--theme-ground-chroma), var(--theme-ground-floor)) h)`.
An alpha was the wrong instrument: at the `/0.05` that lands on the reference
contrast for pewter, viridian's delta is 2.2 and pallet's is 10.5, a five-fold
spread, because an alpha over the raw theme colour makes loudness follow that
theme's own lightness. The ground-chroma construction holds all twelve hues
between 6.5 and 10.9 (1.7x) and, being opaque, composites the same over any
fill. L 0.16 is what `body[data-gate-theme]` already paints at with this exact
clamp, and it puts the hatch midway between the faint ground it lies on (0.1)
and a tile you own (0.22) — which is the reading.

Two new specs pin it: broad bands (`12px 24px` present, `3px 4px` absent) and
opaque (`--theme-ground-chroma` present, no `/ 0.` alpha).

**Snag worth remembering**: `npx prettier --write src/styles/app.css` reformatted
the whole file, because the repo's prettier glob is `**/*.{ts,tsx,json,md}` and
has never included CSS. It rewrote `max(c * var(…))` to `max(c* var(…))` in
`bg-theme-faint` and `bg-theme-raised`, which broke a `Screen.spec` assertion
pinning that exact string. Restored both. Do not run prettier on app.css.

Verified: 3937 tests pass (222 files), lint + depcruise clean, tsc clean,
prettier clean over the configured glob.
