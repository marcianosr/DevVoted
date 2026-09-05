# ADR-047: A config's size is a number

## Status

Accepted (2026-08-30, Marciano, DVTD-811d).
**Supersedes [ADR-043](043-rarity-is-a-shape-not-a-hue.md)** and amends
[ADR-044](044-capacity-is-spots-money-is-kb.md) Decisions 1 and 7. Sizes and the price
rate live in `config.model.ts`.

## Context

`bit / crumb / nibble / byte` named six things at once: a grade, a colour, a glyph, a
draft price, a drop weight and a slot count. Only the slot count did any work — the
weights have never been rolled against (DVTD-5ljh) — and the reader had to learn a
four-word vocabulary to find out how much room a config takes.

## Decision 1: a config carries a size, and nothing else

> ⚠ **Amended by [ADR-055](055-config-hue-is-keyed-to-slot-size.md)**: the size now
> carries a hue as well as a number. "No grade colours" still holds, because grades
> stay deleted; the colour is keyed to the slot count itself.

`Config.slots` is one of **1, 2, 4, 8, 12 or 16**, defaulting to 1. There are no
grades, no grade colours, no glyph, and no drop weights. A row states its size in
words — "4 slots" — because a bare number beside a KB figure reads as money.

Twelve and sixteen are new and no roster config uses them yet. They exist so the
ladder has somewhere to go once a config is worth half a maxed build.

## Decision 2: the draft price is 32 KB a slot

`draftCost` is `32 × slots`, giving 32 / 64 / 128 / 256 / 384 / 512 KB. The first four
are exactly the prices ADR-044 set, so nothing on today's roster reprices; the rate
just extends to the two new sizes. A config can still override with its own
`draftCost` — WTFPL and Freemium do, and that is the escape hatch for a config whose
price is not its size.

## Consequences

Deleted: the `Rarity` type in both tiers, `rarityOf`, `RARITY_WEIGHT`, `RARITY_ODDS`,
`SPOTS_PER_GRADE`, `GRADES_BY_SIZE`, `shapeOf`, `RARITY_TONE`, `RarityGlyph.ui`,
`rarity.ts`, and the byte's legendary ring on the build track. `largestGradeFitting`
becomes `largestSizeFitting` and returns a number.

Added: `ConfigSize`, `CONFIG_SIZES`, `baseSlotsOf`, `DRAFT_COST_PER_SLOT_KB`, and
`SlotMark.ui` — the one place a size is drawn, used by both `Entry` and `Pick`.

The Dex's Configs tab groups by size rather than grade and prints the KB each size
costs. It no longer quotes odds, because there were never any odds to quote.

The shop's no-room refusal changes from "needs a byte" to "needs 8 slots", which says
the same thing without a vocabulary.
