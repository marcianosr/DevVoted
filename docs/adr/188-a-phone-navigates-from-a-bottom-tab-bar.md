# ADR-188: A phone navigates from a bottom tab bar

## Status

Accepted — 2026-10-04 (Marciano, DVTD-m3n6). Amends ADR-183 (the nav carries the
run) below the `md` breakpoint.

## Context

On a phone the nav hid Community and Suggest a poll in the avatar menu, and the
Daily Run item, squeezed by the run balance, collapsed to an empty pill beside the
logo. The start presses on the new run and prep screens scrolled away with the
page.

## Decision 1: three tabs at the bottom of a phone

Below `md` the bar's destinations are hidden and a tab bar is fixed to the bottom
of the screen for a signed-in player: **Daily Run** (with its polls-left count),
**Community**, **Profile**. Suggest a poll stays in the avatar menu. A wide screen
is unchanged.

## Decision 2: the start press sits on the tab bar

The root sets `--tab-bar` (3.75rem on a phone, 0 from `md`) and pads `main` by it.
`ScreenActions` sticks at `bottom: var(--tab-bar)`, so the press that moves you on
stays in view just above the tabs. The new run screen makes its press cell the
sticky item (a sticky child of a press-sized cell cannot move), and prep uses
`ScreenActions`, with its right column `display: contents` on a phone so the press
sticks across the whole page.
