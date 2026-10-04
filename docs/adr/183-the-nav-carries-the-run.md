# ADR-183: The nav carries the run, the page carries its title

## Status

Accepted — 2026-10-04 (Marciano, DVTD-k6ab). Supersedes ADR-132's pinned header
row and moves ADR-124's balance from the page header to the nav.

## Context

Every run screen but the hub opened on a pinned header row: a lead swatch, the
gate title ("#1 - Pewter Gate"), the swatch track, the run readout ("gate 0 of
12") and the balance. That row repeated, screen by screen, what belongs to the
run rather than to the page, and it left no room for the page to say what it is.

## Decision 1: the nav holds the run's swatch track and balance

The swatch track and the KB balance sit in the top nav, beside the links, on
every signed-in page while a run exists. A run screen publishes its own reading
to the nav (its track, its balance, and any preview such as "after install"), the
same way it publishes its theme through `PageThemeContext`. Off the run screens
the nav reads the run state itself. The balance keeps everything ADR-124 gave it:
the count, the tint and the pill.

Rejected: reading the balance straight from the run state everywhere. The shop
previews what a price would leave and the debrief holds its figure until the
reveal lands; both need the screen, not the server, to say what the figure is.

## Decision 2: each page states a title over one line of subtext

The header is a headline title and one line of subtext beneath it: Registry,
"Improve your build this run!"; New run, "Shades of your career await!"; the gate
name (Pewter Gate) on prep, "Look at what's at stake!". Gate titles drop their
number. No header draws a swatch before its title, so the debrief no longer rings
an earned swatch there; the Earned panel and the reveal still name it.

## Decision 3: the readout and the pinned row are gone

The run readout leaves the run screens (the hub keeps its own), and nothing pins:
with the track and balance in the nav, a sticky title row would only cover the
page. The shop's phone-only footer balance goes with it, since the nav states the
balance at every width.
