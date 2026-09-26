# ADR-103: The community board seats twelve category leaders

## Status

Accepted — 2026-09-23 (Marciano, DVTD-zptd). Retires
[ADR-065](README.md#retired) and [ADR-067](README.md#retired); collapses
[ADR-100](100-a-category-has-a-living-record.md) decisions 2 and 4. ADR-100's
other four decisions stand and are why the read is unchanged.

## Context

ADR-100 gave a category a living record and put it under the poll byline. It
reads well for the category being played and says nothing about the other
eleven — a player can see the bar in front of them but not the board they are
on.

Meanwhile the community board still leads with standouts. ADR-065 shipped six
climb-shaped awards, ADR-067 accepted four plain standings in their place and
was never built, and the section has been out of step with its own ADR for
twelve days. The board has two problems and they cancel: one section nobody
could agree on, and one record with nowhere to live at full size.

## Decision 1: the board is twelve seats, one per category

Every category draws a row whether or not anybody leads it. The roster is
`CATEGORY_CODES`, so it cannot fall out of step with the game's categories, and
held seats sort to the top by their run.

The alternative — listing only the categories somebody leads — makes the board
shrink as the game gets younger, which is exactly backwards. A new game would
show an almost empty panel and read as broken.

## Decision 2: an open seat states what claims it

Below `MIN_LEADER_STREAK`, the row reads `unranked · 3 in a row claims it`.

This is the one place the game states a threshold the player can act on
immediately. ADR-100 Decision 5 already refused to hide an unclaimed record;
this goes one step further and prints the number, because "unclaimed" tells a
player nothing about what to do next.

## Decision 3: the row carries no title

ADR-100 Decision 4 derived `JavaScript Maintainer` from the category. It is
dropped: the row already says the category and the word `leader`, so the title
was the same fact a third time, and on a twelve-row board it was twelve
repetitions of it.

## Decision 4: the poll screen states the leader, not your best

ADR-100 Decision 2 pushed `your best 4` to the end of the row. It is dropped
with the caption, leaving one line: category, `leader`, the handle, the figure.

The argument for it still holds — a personal best is a target and a live streak
is a distraction — and nothing here reinstates a live figure. What changed is
the cost: on a one-line row beneath a byline, a second figure in a second
register is the thing that makes the line need reading rather than glancing. The
target survives as the leader's figure, which is the number worth beating
anyway.

## Decision 5: standouts are retired, code and all

`standouts.model.ts`, `fetchActiveRunStats` and the six awards are deleted, and
`DVTD-j6t1` is scrapped rather than done.

ADR-067's reasoning against the six stands and is not being reversed: they need
the climb's vocabulary on the screen a player meets before their first poll. Its
own replacement roster is dropped for a plainer reason — four standings that
each rank a different thing are four things to learn, and a seat per category is
one thing repeated twelve times.

## Decision 6: categories stay colourless

The seats wear the neutral badge tone, not twelve hues.

[ADR-020](020-gate-theme-replaces-category-colors.md) Decision 1 gave the
palette to the gates so that a colour on screen means one thing. A twelve-row
board is the strongest case yet for category colour and still not strong enough:
the rows are already distinguished by their labels, and paying for that with an
ambiguous palette would cost every other screen.

## Consequences

- **The read is one statement, not twelve.** `fetchCategoryLeaders` ranks with
  `row_number() over (partition by category_code ...)`; the island fold is the
  expensive part and running it per category would pay for it twelve times. The
  gaps-and-islands cut is untouched — it still mirrors `nextStreak` (ADR-100
  Decision 3), and it still scans (ADR-100's accepted debt).
- **`fetchCategoryLeader` lost its second read.** With `your best` gone, the
  account-filtered query has nothing to answer.
- **One presenter owns the row.** `categoryLeaderRowFor` is stated once and used
  by both surfaces, so the figure and the floor cannot drift between the poll
  screen and the board (ADR-102).
- **The board's footer had to be rewritten, not translated.** The mock read *"A
  seat opens the moment its holder misses"*, which describes a live streak. The
  figure is an all-time best: missing never costs the holder their seat, only
  somebody going further does.
- **`RunState.configsLost` keeps being written and loses its only reader.** It
  stays for the same reason ADR-067 Decision 3 kept it — a run statistic worth
  counting whether or not anything reads it.
- **The Dex press on the community board is gone.** It lived in the standouts
  panel header and was only ever supplied by the fixture, never by the live
  presenter, so nothing loses a route.
