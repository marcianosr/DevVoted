---
# DVTD-iam1
title: 'Kanto: Stake becomes ScreenFooter, and the prep window is titled by its gate'
status: completed
type: task
priority: normal
created_at: 2026-09-10T20:19:28Z
updated_at: 2026-09-10T20:32:00Z
---

Follow-up to DVTD-di1o, same screen.

`Stake.ui.tsx` was named after its contents rather than its job. It is the screen
footer; the things in it are the stakes. And prep's window panel was titled "The
five polls", which names the content but not the gate the content belongs to.

## Summary of Changes

**`Stake.ui.tsx` → `ScreenFooter.ui.tsx`** (plus spec and stories)

| Was | Now |
|---|---|
| `Stake` | `ScreenFooter` |
| `StakeProps` | `ScreenFooterProps` |
| `StakeReading` | `Stake` — the contents are the stakes |
| `StakeAction` | `FooterAction` |
| `readings` | `stakes` |
| `StakeFigure` | unchanged: a figure of a stake |
| `NewRunScreenProps.stake` / `PrepScreenProps.stake` | `.footer` |
| `kantoGateZeroStake()` | `kantoGateZeroFooter()` |

All comments removed from the file.

**The prep window names its gate.** `Ledger` gained
`heading?: "section" | "gate"`. The `gate` arm sets the title in caps behind the
kit's dashed mark (`aria-hidden`: the header's swatch and the title already say
which gate it is). `uppercase tracking-widest` sits on a child span, not the
heading, because `title` already sets tracking and with no tailwind-merge two
letter-spacings on one element would be settled by emit order.

The factory now builds the title as `${swatch.gateName} gate`, so gate 4 reads
**LAVENDER GATE** and gate 12 reads **CHAMPION GATE**. `PREP_TITLES` collapsed to
one `AUDITS_TITLE` constant. Audits keeps its own mixed-case section heading, so
the two headings in that column read differently on purpose.

**Verified**: 234 test files / 4182 tests pass; `npm run lint` clean (one
pre-existing warning in `Screen.stories.tsx`); `npm run build` green; stories-only
typecheck still 30 pre-existing errors, 0 in `src/ui/kanto-theme/`.

## Follow-up polish (same session)

Three notes off the rendered screen:

1. **The gate mark was invisible.** `border-theme-faint` is a 20% alpha hairline,
   which disappears on the crushed ground. It now reads at the theme's full
   colour and matches `Swatch`'s weight: `border-2 border-dashed border-theme`,
   `rounded-xs`, `size-3.5`.
2. **The stakes stand over the press, not beside it.** `ScreenFooter` is two rows
   now: stakes right-aligned on top (`justify-end`), then the action row with the
   aside at the left and the press at the right. `NewRunScreen`'s gate-0 footer
   gets the same treatment, which suits its one long stake line.
3. **`Swatch state="current"` is dashed.** An unearned swatch is room still to
   fill, per app.css's dashed law — it keeps the gate's colour, because which
   gate it is and whether you hold it are different readings. **Knock-on:** the
   prep header's lead swatch and the current pip in every `SwatchTrack` are
   dashed too, since they are the same state.
4. **The sealed note is gone.** `PREP_SEALED_NOTE` ("Prefetch would name every
   poll's category…") is deleted; the withheld `???` and `?` tokens say it.

`Ledger.note` now has no caller either, alongside `meter`, `total` and `detail`.

**Verified**: 234 test files / 4182 tests; lint clean bar the pre-existing
`Screen.stories.tsx` warning; build green; prettier clean; stories typecheck 30
pre-existing errors, 0 in `src/ui/kanto-theme/`.

5. **The audit cue reads flush left.** A flex line breaks on the item's max-content size, so a long cue always wraps to its own line in a single column — and `ml-auto` then stranded it mid-row. Dropped the auto margin and `text-right`: the cue flows after the name and breaks to the left margin.
