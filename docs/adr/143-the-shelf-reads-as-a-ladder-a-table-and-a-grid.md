# ADR-143: The shelf reads as a ladder, a table and a grid

## Status

Accepted, 2026-09-29 (Marciano, DVTD-dxei). Amends
[ADR-140](140-the-shelf-holds-the-rank-ladder.md) Decisions 2 and 3.

## Context

The title shelf was one list of forty-odd rows, one per title, each with a wear
press. It did not say which titles were near, and what you wore was only readable
from the buttons.

## Decision 1: worn titles lead

Three slots head the shelf, one per title you can wear. A filled slot takes its
title off in place; an empty one is dashed.

## Decision 2: each group gets the shape of its bars

- **Poll count** is a ladder. Rungs sit on a log scale of polls answered, because
  on a linear scale thirteen of fourteen rungs crowd the last third. The next rung
  is ringed and a callout states its threshold and how many polls are left. Earned
  rungs are worn from a row of chips under it.
- **Category** is a table: one row per category, its answered and correct title
  side by side. Earned rows lead, then the furthest along. Eight show; the rest sit
  behind one press.
- **Special** is a grid of cards.

## Decision 3: "other" is renamed "special", and hides its names

An unearned special title shows `???` and still states its condition. The name is
the reveal; the condition stays readable so the title can still be chased. A
category title stays named, because its name is the subject you aim at.

## Decision 4: three filters

**all**, **earned** (drops unearned categories and special cards), and
**closest**: the five unearned titles already started, ranked by share done. The
ladder offers only its next rung there, since every later rung is further away.
