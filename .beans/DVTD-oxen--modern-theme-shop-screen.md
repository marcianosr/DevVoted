---
# DVTD-oxen
title: 'Modern theme: shop screen'
status: completed
type: feature
priority: normal
created_at: 2026-08-22T19:12:04Z
updated_at: 2026-08-22T20:39:52Z
---

Reskin of the run shop in src/ui/modern-theme, Storybook only (Modern/Screens/Shop), beside the poll screen. Vocabulary and prices come from src/modules/run/shop/domain/draft.model.ts and wiki 5.2.

- [x] Action: label/cost independently optional, emphasis quiet|loud|prismatic
- [x] Entry: leading union (mark|leading), notes slot, actions array
- [x] Lock.ui.tsx: inline SVG padlock, unlocked/locked/unavailable
- [x] ShopHeader.ui.tsx: Shop + next up gate, free storage, overflow stub
- [x] screens/ShopScreen.ui.tsx: two columns, stacked below lg
- [x] specs + stories for each
- [x] PollScreen.stories: action -> actions

## Summary of Changes

Shop reskin at `Modern/Screens/Shop`, Storybook only, nothing wired to a route. Content, prices and rules read off `shop/domain/draft.model.ts` and wiki §5.2 rather than being invented.

**New**: `Lock.ui.tsx` (inline SVG padlock — the repo's first — with unlocked/locked/unavailable as a union, so only an unlocked lock quotes a price), `ShopHeader.ui.tsx`, `screens/ShopScreen.ui.tsx`.

**Generalised** `Entry`: `{mark} | {leading}`, a `notes` slot beside the name for badges and unmet requirements, and `action` → `actions` array (a pipeline row carries Upgrade *and* deinstall). Poll screen output unchanged.

**Extended** `Action`: `label`/`cost` independently optional via a union requiring at least one, plus `emphasis` quiet|loud|prismatic. Prismatic reuses the live shop's own word for a met requirement so the two surfaces do not coin separate ones.

The story enforces `MAX_LOCKED_OFFERS = 1` with real state: holding one offer releases the other.

## Deviations from the mock, each deliberate

- **Upgrade carries no price.** Per the recorded decision, not the mock's "Upgrade 64KB". Label only, prismatic ring for a met requirement.
- **No percent badge.** The mock has no percentage badge — `×1.25` is a multiplier and already green — so `Delta` gained no `percent` variant rather than a dead one. One line to add if a real use appears.
- **No middot between a control's verb and price** ("rebuild 4 KB", not "rebuild · 4 KB"). The cinnabar price already separates them, and the same button shape shipped without one on the poll screen.
- **`.vue`'s refund line merged into the explainer.** `Entry` has two text tiers (summary, explainer); the mock has three.
- **The storage figure uses `title` (text-lg)**, smaller than the mock. Adding a scale step for one caller would repeat the dead `label` step.
- **The `⋯` overflow is a stub** — labelled "Storage plans", no menu behaviour.

## Verification

tsc 0 · lint clean (688 modules) · 138/138 modern-theme tests (was 114) · stories typecheck clean · build confirms all 12 new classes emit, including `legendary-ring`, `border-dashed`, `size-3.5` and `pl-12`.

**Storybook restart required** — a dozen classes here are new to the codebase.

## Follow-up — button colour

- **Prices are no longer cinnabar.** `Action` rendered every cost red; the cost now takes the button's own colour and `quiet` sets `text-zinc-100`. So `32 KB`, `64 KB`, `rebuild 4 KB` all read white. Red was overstating an ordinary price: a shelf where every number is a warning has no way left to warn.
- **New `danger` emphasis**: `border-cinnabar text-cinnabar`, the whole button red. Used by `deinstall`, the one action that takes a config back out of the build. A price is not a warning; a removal is.
- `loud` gained `text-viridian` to match the mock's green `install` label (it was inheriting zinc).

Removed a superseded spec ("prices the action in the colour of a loss") rather than leaving two tests making opposite claims about the same element.

tsc 0 · lint clean (688 modules) · 138/138 tests · stories typecheck clean · build confirms `border-cinnabar`, `hover:bg-cinnabar/10` and `text-viridian` emit.

## Follow-up — price tags and two-tap install

**New `PriceTag.ui.tsx`** replaces the plain button in the draft's trailing slot. Left-notched tag shape via `clip-path` (which is why it is a fill, not a border — clip-path erases borders), with a punch-hole dot so it reads as a tag rather than an arrow.

States: `buyable` (dark, white, `free` in viridian at 0 KB), `owned` (struck through, disabled), `unaffordable` (cinnabar, disabled). Only a buyable tag turns green, and only while its row is open.

**Two-tap purchase, which is what wiki §5.2 always specified**: tap one opens the row and flips the tag to green `install · 128`; tap two spends. The label swap is pure CSS (`group-open/entry:hidden` against `hidden group-open/entry:inline`), so `Entry` keeps no state for it.

### Correction: a nested button swallows the summary's toggle

Earlier passes added `preventDefault()` to `Action` and `Lock` with comments saying it stopped a click from toggling the fold. **It never did.** Probed directly: a plain button inside a `<summary>`, with no handler at all, leaves `details.open` false — the button is the click's activation target, so the summary's activation behaviour never runs. The "does not toggle the fold" tests were passing on platform behaviour, not on that line.

Consequences: the comments in `Action` and `Lock` are corrected and `preventDefault` dropped (`stopPropagation` stays, for row handlers that are not summaries), and `PriceTag` has to set `row.open = true` by hand for its first tap — which is exactly why the first version of that test failed.

An owned offer also swaps its `Lock` for the pipeline's `Mark`: there is nothing left to hold once it is bought.

## Verification

tsc 0 · lint clean (691 modules) · 146/146 modern-theme tests · stories typecheck clean · build confirms the arbitrary `clip-path` utility emits along with all three `group-open/entry:` variants.

**Storybook restart required.**

## Follow-up — equal circles

Three diameters were in the leading column: `Mark` at 16px, `Lock` and the open-slot disc at 28px.

`Mark` gained `size?: "pip" | "badge"` — the same two words `Swatch` already uses rather than a third naming scheme. `pip` (size-4, text-xs) stays the default so the poll screen is untouched; `badge` (size-7, text-sm) is the shop's, matching the lock button's diameter.

The shop's pipeline rows now pass the mark through `leading` rather than `mark`. Two reasons: it is the only way to specify the size, and it also picks up `FACTS_INDENT.leading` (`pl-12`), so an expanded row's body clears the 28px circle instead of the 16px one it was indented for.

The lock could not simply shrink to 16px instead — that is below a reliable tap target, and it is the only pressable circle of the three.

tsc 0 · lint clean (691 modules) · 148/148 tests · stories typecheck clean.

## Follow-up — circles match the poll page

Reversed the previous pass. Everything in the leading column is 16px, the size the poll page uses: `Mark` (unchanged default), `Lock` (was 28px), `SLOT_DISC` (was 28px), padlock SVG 10px.

Three things came back out because they only existed to support the larger size:
- `Mark`'s `size` variant, its two specs and its `BothSizes` story — dead again the moment the shop stopped asking for `badge`.
- `Entry.FACTS_INDENT`, back to a single `pl-9`: with every leading circle 16px there is nothing left for the two-value map to distinguish.
- The shop's pipeline rows are back on `mark="pass"` rather than `leading`.

The lock keeps a 28px hit area through `before:absolute before:-inset-1.5`, which costs no layout width. It is the only pressable circle of the three, and 16px alone is below a reliable tap target — so the look is exactly what was asked for and the target is not.

The only `size-7` left in the folder is ShopHeader's `⋯` overflow, which is not in that column.

tsc 0 · lint clean (691 modules) · 146/146 tests · stories typecheck clean · build confirms the `before:` trio emits.

## Follow-up — button padding

`Action` went from `px-2 py-0.5` to `px-3 py-1.5`. Affects every button built on it: Upgrade, deinstall, and the three shelf controls (rebuild / extend / git tag).

`PriceTag` left alone — it already sat at `py-1.5 pr-3 pl-5` and is a different shape.

Not changed, worth a look: the mock's corner radius reads larger than the `rounded-md` (6px) in use, and it will look proportionally tighter now the button is taller.

tsc 0 · lint clean (691 modules) · 146/146 tests · build confirms `px-3` and `py-1.5` emit.

## Follow-up — empty slot rows and the shelf's own controls

### Empty slots are rows now

New `Slot.ui.tsx`: one row per slot, dashed disc plus `empty`, or `opens at gate 4` (dimmed) for one the run does not own. `ShopScreen.openSlots` is deleted — a "slots 4–6 open · slot 7 at gate 4" sentence has to be counted, a column of six is read. The empty-pipeline story now shows six empty rows instead of a void.

### The draft column's controls, per the second mock

- `Fold` gained `action` (a control on the whole section — the reroll, beside the offer count) and `note` (the section's state, under the summary). The note lives inside the `<details>`, so a shut fold stops explaining itself.
- `Action` gained an `icon` slot, for the reroll's ⟳.
- New `Glyph.ui.tsx`: `reroll`, `extend`, `tag` as hand-written SVGs. Three shapes do not earn an icon dependency, and `Lock`'s padlock already set the precedent.
- New `Control.ui.tsx`: the extend and git-tag cards. `frame="dashed"` reads the same as an empty `Slot` (a shape the run does not have yet); `solid` is something it can simply buy. Optional `title`/`note`/`footnote` so one component covers both the one-liner and the four-line git tag.
- `PriceTag` gained a `ready` state: shows `extend · 48` from the start and spends on a single tap. Outside a disclosure row there is no first tap to reveal anything, so the two-tap guard would just be a dead click.

## Verification

tsc 0 · lint clean (700 modules) · 164/164 modern-theme tests (was 146) · stories typecheck clean · build confirms the new classes emit.

**Storybook restart required.**

## Follow-up — spacing, naming, header

- **Rows are consistent and roomier.** `Slot` was already a `Row`, but at `tight` — the same as `Entry`, so they matched and were both cramped. Every `Row` in the folder is now `compact` (`px-3 py-2`): `Fold`, `Entry`, `Slot`. `Entry.FACTS` follows to `pl-10`, since the indent is derived from the row's own padding.
- **`Slot`'s text dropped to `meta`.** A slot is a gap in the list, not an item competing with the configs that are really there.
- **"reroll" is gone; the word is "rebuild"** — `draft.model.ts`'s `rebuildCost` and wiki §5.2 both say rebuild, so the mock's word was the odd one out. Renamed in the button, the note, the `Glyph` name, and every prop doc.
- **"reroll 4 4 KB" was my bug**: the count was in the label and the price after it. The button is `rebuild` + `4 KB` now, priced once.
- **The shop wears the gate's name.** `ShopHeader` gained `title` ("Lavender shop"), and `nextGate` shrank to "gate 4" — with the shop named for the gate, "next up · Lavender gate 4" said Lavender twice.
- **The header reuses `Storage`** (plan, used/cap, meter) instead of a hand-written "216 / 512 stored". `usedKb`/`capKb` gave way to one `storage: StorageProps`.
- **New `dim` tone (`text-zinc-400`)** for `Control`'s body text. Not a new grey: zinc-400 was already used raw in `Trail` and `ShopHeader`, so this gives it a name in `MODERN_TONE` rather than adding a fourth loose class. The git-tag body now sits between its white title and its zinc-500 footnote.

tsc 0 · lint clean (700 modules) · 165/165 tests · stories typecheck clean · build confirms `text-zinc-400` and `pl-10` emit.

## Follow-up — header trimmed, git tag folds

- **The header's `296 KB free` figure and `⋯` overflow are gone.** `freeKb` and `onOpenPlans` deleted with them, so the header now only reports: name, next gate, storage plan with its bar, and the cap warning. It offers no controls at all, which its spec now asserts.
  - Consequence worth knowing: **spendable storage is no longer stated anywhere.** It is derivable from the bar (cap minus used) but not written down, and it is the number every price on the screen is read against.
- **`Control` folds when it has a title.** git tag's four lines sit behind its name; extend, which has no title, stays a one-liner — the rule is that a title is what remains visible when the body hides, so a control without one has nothing to fold behind.
  - The card carries `group/entry`, the same group name `Entry` uses, so a `PriceTag` inside behaves exactly as it does in an offer row: first tap reveals, second spends. git tag's tag reads `buy · 128` once open.
  - A `Caret` leads the summary so the fold is visible; the identifying glyph keeps its place beside it.

tsc 0 · lint clean (700 modules) · 165/165 tests · stories typecheck clean.

(Count reconciles: 163 literal `it(` blocks, one an `it.each` over 3 glyph names.)
