---
# DVTD-4ob5
title: The answer receipt's column looks like a sum that does not add
status: completed
type: task
priority: normal
created_at: 2026-09-21T18:52:03Z
updated_at: 2026-09-22T06:42:11Z
parent: DVTD-cb52
---

`what this answer paid` renders `1`, `+0.1`, `×1.25`, `1.35` in one right-aligned
numeric column closing on a bold total — the visual grammar of addition, over
numbers that do not add. Read down you get (1 + 0.1) × 1.25 = 1.375, not 1.35.
The figures are also flung to the far panel edge by `PanelTable`'s bleed, so the
label and its number sit ~1000px apart on a wide screen.

ADR-084 D2 chose this ("a row reads in the form its config is sold in"), trading
away that ADR's own purpose: a figure you can check teaches more than one you are
asked to trust. The trade is not forced — `CoverageConfigBonus` already carries
both `value` (the units the config added) and `factor` (the form it was sold in).

## Decision

The figure column states units and sums. The sold form drops back to a tag beside
the config name. The block is capped narrow, with one rule above the total.

## Todo

- [x] `pollBreakdownFor`: contribution as the figure, sold form as a tag
- [x] `LedgerRows`: `tabular-nums` on quiet figures, new `rules="total"` prop
- [x] `PollScreen`: the region is deleted outright — the receipt moved onto the chip
- [x] ADR-095, ADR-084 D1+D2 collapse to pointers, README index row
- [x] CHANGELOG entry (amended the unreleased receipt entry) + wiki
- [x] Specs and stories

## Summary of Changes

Mid-task the shape changed: rather than fixing the standalone region's layout, the
receipt moved onto the chip that states the figure. The region is gone.

- `pollScreen.viewmodel.ts` — `receiptUnits` (2 fixed decimals) and
  `contributionWord`; `bonusRowFor` states `bonus.value` as the figure and
  `×factor` as a tag, adders untagged; `paidOf(view, poll)` builds a receipt per
  answered poll, so `pollPaidFor` AND `runPaidFor` (the debrief) both carry them.
- `PollScores.ui.tsx` — `PollPaid.receipt`; `PaidChip` wraps the badge in a
  `Tooltip`; the track drops `aria-hidden` when its chips are real buttons.
- `Tooltip.ui.tsx` — `side="top"`, `align="center"`, `bare` (no dotted underline
  under a badge trigger).
- `LedgerRows.ui.tsx` — `rules: "each" | "total"` (default unchanged), and
  `tabular-nums` on quiet figures so a column of them aligns on the decimal point.
- `PollScreen.ui.tsx` / `PollView.component.tsx` — `PollCoverage.breakdown` and
  the third region deleted.
- ADR-095 written; ADR-084 D1 and D2 collapsed to pointers; README index row;
  wiki passages at the scoring example and the poll-screen anatomy; the unreleased
  CHANGELOG receipt entry amended rather than contradicted.

Also fixed en route, unrelated to the design: `/run/poll` threw
`mine[0]?.lastAnsweredAt?.toISOString is not a function`. `fetchPollStats`
declared a raw `sql` fragment as `sql<Date | null>`, but a raw fragment carries no
column mapper so postgres-js hands back a string. Normalised through an `isoOf`
helper and guarded by a new `pollStats.repository.spec.ts`; `drizzleMock.factory`
gained `as` to its chain methods.

Verified: `npm test` 216 files / 3923 passed / 0 failed; `npm run lint` clean
(2 pre-existing story warnings); `npm run build` clean; `tsc --noEmit` 0 errors and
no TS2304 in the story sweep.

## Deferred

`src/domains/polls/api/pollResponse.queries.ts:243` has the same lie
(`sql<Date | null>` on `MAX(last_seen_at)`). It does not crash because nothing calls
a Date method on the result, but the declared type is wrong. Legacy `src/domains/`,
left alone.
