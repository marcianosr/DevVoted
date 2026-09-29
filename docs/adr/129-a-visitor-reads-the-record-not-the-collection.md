# ADR-129: A visitor reads the record, not the collection

## Status

Accepted — 2026-09-27 (Marciano, DVTD-e8rm). Narrows
[ADR-125](125-a-player-has-one-page-and-one-card.md) D4, which gave a visitor
the card and four counts and nothing else. Built the same day.

## Context

ADR-125 D4 refused a visitor everything under the card because "a visitor
reading somebody's unanswered polls would be reading ahead". That is true of the
poll collection. It was applied to the whole page.

The result is a page you reach by pressing somebody's face — on a poll byline, a
category seat, the climb map, a rival in the attack panel — asking who they are
and how they compare to you, which answers `41 of 96 polls` on one muted line.

Meanwhile [ADR-101](101-builds-are-open.md) §2, narrowed 2026-09-26, already
rules that a run's standing is public: where it is, how its last gate closed,
the coverage it has banked, its streak, its storage, and the build it carries.
`ClimberCard` already draws all of it. It is reachable only by pressing a chip
on the community board, and it is gone as soon as you navigate away.

So the game already discloses more about a player in a popover than on the page
that is supposed to be about them.

## Decision

### 1. The page carries four bands

Identity, then the record, then the open run, then the collection.

- **Identity** — the card, unchanged.
- **The record** — how deep they have ever been, the gates they swept, how many
  runs they have finished, and the category seats they hold.
- **The open run** — the standing and build ADR-101 §2 already makes public,
  drawn as a panel rather than a popover, and always drawn: a player with no run
  open says so rather than dropping the section.
- **The collection** — polls, configs and titles as counts, with the archive on
  the heading.

### 2. Depth and swatches are two readings, and the page states each once

`run_states.gates_cleared` is how far a run got. A swatch is minted by a
flawless window (ADR-080), so a player who reached gate 9 sloppily owns none.
The record states both and the collection states neither, so no figure on the
page is spoken twice. An open run counts towards depth: it is still the
deepest they have been.

### 3. The line is still knowledge

Private: which polls they have seen, the questions behind them, their answers,
their unanswered polls, and everything ADR-101 §2 lists. A visitor's run rows
carry no permalink, because a run's page states its answers.

Nothing new crosses the wire that was not already public somewhere else: the
standing and build go to the community board, the seats to the leaders section,
the run outcomes to the owner's own collection tab.

### 4. Two headline figures state the viewer's own beside them

Deepest gate and swatches carry a faint `you 6 of 13`. The run count and the
collection counts do not. A figure with no scale is not a reading, and a page
where every figure is doubled is a spreadsheet.

### 5. Your own page does not change

It is still the card and the eight tabs ADR-125 D5 decided. The collection tabs
are a record of what the game has shown *you*, and that is not a visitor's
reading of it.

## Consequences

- `getPublicProfile` returns four halves rather than two: `identity`, `record`,
  `standing`, `totals`. `standing` is `null` when no session run is open.
- The read reaches across contexts, which the dependency rule already allows:
  `fetchGateRunsByUser` and the config and poll counts from `collection`,
  `fetchCategoryLeaders` from `run/run`, and a new `fetchActiveClimberFor`
  beside `fetchActiveClimbers` in `run/community`.
- `ProfileScreen` takes a `sections` slot instead of a `totals` string list. A
  visitor's render still has no `tablist` element at all.
- `ClimberCard`'s body became `Standing`, which the profile draws without the
  identity head. The card composes it, so the community board is unchanged.
- `DexRunRow.href` is optional, which is how a visitor's run rows refuse to
  open.
- `ProfileTotals` drops `gatesCleared`/`gatesTotal` and gains
  `titlesOwned`/`titlesTotal`. The titles denominator is `visibleTitles`, not
  the whole roster: a granted title is invisible outside its cohort (ADR-111)
  and a raw denominator would leak that it exists.
- `IN_A_ROW` moved to `~/shared/lib/copy.ts`, now that the seats are stated on
  two surfaces.

## Rejected

- **Leading with the open run.** Rivalry-shaped, and wrong for a page that is
  mostly read when nobody is climbing. The record is what a profile is for.
- **Giving a visitor the collection tabs.** ADR-125 D4's reasoning holds for
  exactly this: it would be reading ahead.
- **A second endpoint for the viewer's own figures.** The page reads
  `getPublicProfile` twice, once per player, and the viewer's half is already
  cached under `userQueryKeys.profile`.
- **Comparing every figure.** See D4.
