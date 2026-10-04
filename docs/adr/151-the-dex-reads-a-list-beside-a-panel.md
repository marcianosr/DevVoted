# ADR-151: The Dex reads a list beside a panel

## Status

Accepted, 2026-09-29 (Marciano, DVTD-rge1). Replaces
[ADR-120](120-the-dex-draws-the-one-config-card.md) decisions 1, 5 and 6 and the
weight grouping of [ADR-108](108-the-dex-reads-configs-as-chip-rows.md).
ADR-120 decisions 2, 3 and 4 stand: the redaction split, the dashed locked edge
and the guarded footer are what make the panel work.

## Context

The six tabs were six shapes. Configs was a grid of full cards under weight-group
headings, polls a list folded by category, services and audits flat rows, swatches
a grid. Each tab stated everything it had at once, so the first thing a player met
was forty-six cards or ninety-six rows, and reading one entry meant expanding it in
place and losing the shape of the list around it.

Marciano mocked a two-pane configs tab and asked for it everywhere: a complete list
on the left, the entry you picked drawn in full on the right.

## Decision 1: one shape, six tabs

`DexBrowser` is the tab chrome. The left pane is the existing `DexPanel` — label,
count badge, meta, footer note — with an optional filter row above its rows. The
right pane is a `Panel` headed by the entry it is reading. Below `lg` the panes
stack, list first.

## Decision 2: nothing is truncated

A tab lists every entry it holds. There is no cap, no "N more" footer and no
pagination. A collection that hides part of itself cannot be read as a collection.

## Decision 3: the grouping axis becomes an exclusive filter

Each tab's axis is a `Segmented` radiogroup: configs by weight, polls by category,
services by scope, audits by gate. An `all` chip leads and is checked on arrival,
so the complete list is what you meet and narrowing is a choice. Each chip counts
its own held against its own total; the `all` chip does not, because the panel
header already states that count.

`SegmentedItem` gained a `mark`, a leading badge, so a chip reads `[1] 5 of 19`.
The weight block, the category name, the scope word and the gate number all sit
there.

An audit fires across a span of gates and so appears under each of them. That is
correct for a filter and is why grouping could not do this job.

## Decision 4: the panel is headed by the thing's own name

No number is invented. Where an entry already carries an identity, that identity
leads: a poll is headed `#001` (`formatDexNumber`, written for the polldex and
until now never rendered), an audit by its HTTP code, a run by the day it ended, a
swatch and a service by their name. A config has no id worth showing, so its name
heads the panel, and `???` when it is not yours.

## Decision 5: an entry you do not hold states how to get it

This is what the panel is for. A locked config states its weight and both unlock
paths with their live progress. A locked service states its unlock caption. An
unmet audit states the gates it can still catch you at. An unearned swatch states
that answering all five polls of its gate is what mints it.

Where that sentence is the same for every entry on a tab, it stays in the footer
instead of being repeated per entry: a poll enters the dex when it is dealt to
you, and printing that under all ninety-six unseen polls would say nothing.

## Decision 6: a row is a press, and the permalink moves to the panel

`Panel.Row` gained a third arm beside its div and its anchor: given `onPress` it
renders a button, and `picked` marks it `aria-current` and rings it.

A run row used to be an anchor to `/runs/$runId`, and a row cannot be both a
permalink and a selection. The row selects; the panel carries the link. The
reasoning for `href` over a callback still holds for permalinks — it is why the
link survived rather than becoming an `onOpen`.

## Decision 7: the panel replaces card disclosure

The chevron, the `DiscloseAll` press and the per-card open set are gone from both
Dex tabs. A card in the panel is rendered with no `onToggleInfo`, which draws it
open (ADR-119). `DEX_CARDS_OPEN` and `DEX_GROUPS_OPEN` are deleted; `DiscloseAll`
stays for the shop and the new-run registry.

## Consequences

- Selection and filter are controlled props, held per tab in `Dex.component.tsx`
  as two `Partial<Record<DexTabId, string>>`. Every row id is a string, including
  a poll's and a run's, so one record serves six tabs.
- A selection that survives a filter change is kept; one that does not falls back
  to the first row shown. No effect resets it, and the panel is never empty while
  the list has rows.
- The viewmodel takes the filter and the selection and returns the rows, the
  chips, the picked id and the panel's contents. Tier 1 derives nothing.
- DVTD-7900's category folding, one day old, is replaced by category chips.
- The mock's `installed ×4` and `first seen Pallet shop` are not built. Neither
  has a producer: no install count is recorded, and the reveal ledger is DVTD-s5vo.
  Configs stay binary, granted or locked.
