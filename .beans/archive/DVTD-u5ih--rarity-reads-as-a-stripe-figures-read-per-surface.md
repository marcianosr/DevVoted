---
# DVTD-u5ih
title: Rarity reads as a stripe, figures read per surface
status: completed
type: feature
priority: normal
created_at: 2026-08-27T11:08:01Z
updated_at: 2026-08-27T11:21:56Z
---

Marciano's design (2026-08-27, mock: deal/rail/panel): rarity moves from coloured chip rings + the rarity word onto a vertical stripe (Dot shape=bar, the shape the Legend already keys) sitting between the row's status mark and the config name. Palette unchanged (DVTD-rjv4). Per-surface figure treatment: DEAL = plain values in a shared right column, no chips; RAIL = outlined chip means will pay, filled badge means did pay; PANEL = the equation's config chip is the same filled neutral chip as its siblings, keyed only by the stripe (no second accent colour).

- [x] RarityStripe.ui (bar + sr-only tier name, since the visible word goes away)
- [x] Entry + Pick lead their name with the stripe
- [x] Pick gains a right-aligned value slot (deal's shared figure column)
- [x] Chip's rarity variant: filled neutral + stripe, no ring
- [x] Figure gains plain mode + shared figureLabel (Pipeline drops its local rateLabel)
- [x] Drop the now-duplicate RarityWord from Start deal, Start pipeline, Prep
- [x] Specs + stories + CHANGELOG

## Summary of Changes

**Rarity is a stripe.** New `RarityStripe.ui` (+ spec, story): `Dot rarity shape="bar"` — the shape the rarity Legend already keyed — plus sr-only tier text, since the visible word goes away and `Dot` is aria-hidden. `Entry` and `Pick` now lead their name with it (grouped at `gap-2` so it grades the name rather than reading as a third column); `Chip`'s rarity variant dropped its coloured ring for the same filled `raised` chip as its siblings, keyed by the stripe. This reverses the row-rail half of the earlier "no spine down the row" decision — the stripe sits against the name, not down the row's edge — and the `rarity-is-a-word-not-a-dot` call: `RarityWord` is gone from every config row (Start deal, Start pipeline, Prep, shop shelf, shop pipeline column). The shop shelf gained the `RARITY_LEGEND` the deal already had, so the colours stay learnable where configs are bought.

**Figures read per surface.** `Figure` gained `plain` + exported `figureLabel` (Pipeline's local `rateLabel` deleted; "flat" suffix dropped — `+` vs `×` is the distinction). Deal and prep quote rates as plain text in a shared right column: `Pick` gained a `value` slot (`ml-auto`, clear of the trailing Lock press). The rail keeps chips for its will/did grammar.

**Flat adds stopped lying (Marciano's catch mid-build).** The rail badged Code Coverage `paid +0.5` while the panel called it `1.5` — my `(1 + a)` fold. Now `EquationFactor` carries `op: "times" | "plus"`: an add joins with `+` quoting its contribution straight from `configBonuses` (identical to the rail's badge, and correct on a partial answer where `share × add ≠ add`), and the base-plus-adds group is bracketed whenever multipliers follow, since they scale the sum. Verbatim, never re-rounded — the domain already rounds, and rounding twice is how the two surfaces drift a tenth apart.

Verification: lint + depcruise clean, tsc/build clean, 2470 tests pass (pre-existing red: RewardScreen ×3, DVTD-9dn0).
