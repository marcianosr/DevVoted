# ADR-180: The profile is a trophy page the owner sees too

## Status

Accepted — 2026-10-03 (Marciano, DVTD-i4x3). Supersedes
[ADR-129](129-a-visitor-reads-the-record-not-the-collection.md) D1 (four equal
bands) and D5 (your own page does not change). Keeps 129 D2–D4: depth and
swatches are stated once each, the line is still knowledge, and only the two
climbing figures carry the viewer's own.

## Context

The page had no lead. A thin card sat over four panels of the same weight
(record, run history, climbing now, collection), so nothing on it said what this
player is proudest of. The player who most wants that answer is the owner, and
their own page showed none of it: ADR-129 D5 gave them the card and the Dex
tabs, so the record existed only for visitors.

## Decision 1: one hero leads

The card becomes a hero on this page only. The face is drawn larger, the name is
the page's heading, and under them stand three trophies: **deepest gate** and
**swatches** against their ceiling (`9 / 13`), and **runs won** (Champion
clears). The whole gate ladder follows as the swatch track, with one line stating
what mints a swatch. `ProfileCard` stays as it is for bylines, hover cards and the
board, so the hero only has to work on one page.

## Decision 2: highlights, then sections

Under the hero, a two-column grid holds what is worth bragging about. The **best
run** is the deepest finished run, with ties going to the higher coverage, read
from every run rather than the five listed. **Climbing now** is drawn only while a
run is open, and without the build, which the hover card already draws. The
**category seats** panel is drawn only when a seat is held: an empty brag is
noise. On a visitor's page the run history and the collection counts follow.

## Decision 3: the owner sees the same showcase

Your page draws the hero and the highlights that a visitor sees, then the Dex
tabs. It leaves out the run history and the collection counts, because the
`runs` tab and the Dex already state them. The comparison is never drawn on your
own page.

## Consequences

- `ProfileRecord` gains `runsWon` and `bestRun`, both folded in the service from
  every finished run. `ProfileRecord.ui` is deleted, and its figures, track and
  seats now live in the hero and the seats panel.
- `Standing` takes `withBuild`, and `Climber` gains an `xl` size.
- The Dex heading becomes an `h2`, because the player's name is the page's `h1`.
- The run history counts every finished run, not just the ones it lists.
- The swatch line reads "a gate taken at 100% coverage". The old record note
  ("without a wrong answer") predated ADR-170.

## Amendment 2026-10-03: the page is the hero (DVTD-5ld4)

Marciano found the stacked page ugly: "the appearance is most important". Decision 2
is withdrawn. The page draws the hero only:
- **Own page:** the hero, then the tabs, opening on Appearance.
- **Visitor:** the hero, nothing under it.

The record moves to the hover card, which players actually read:
- **The swatch track:** all 13 gates, the minted ones filled.
- **The poll count line:** every player states their polls answered, and an author
  leads it with their role, polls published and the answers those drew.
- **The open run's standing,** which the card already carried.

Best run, seats, run history and the collection counts are no longer rendered. Their
components and viewmodel functions stay in the tree for now: they are uncommitted
work from the session that built this ADR, and deleting untracked files cannot be
undone. Removing them is a follow-up.

## Amendment 2026-10-04: the hero draws no swatch track

The hero's swatch track and its "a gate taken at 100% coverage" line are gone. The
swatches trophy already states the count, and the Appearance tab shows every swatch
by name (Pallet, Pewter, …, no "Swatch" suffix) under one line on what wearing one
does: "Tap to change your theme on your profile and dev card".
