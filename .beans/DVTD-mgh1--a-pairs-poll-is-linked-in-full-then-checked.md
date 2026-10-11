---
# DVTD-mgh1
title: A pairs poll is linked in full, then checked
status: completed
type: feature
priority: normal
created_at: 2026-10-11T11:17:46Z
updated_at: 2026-10-11T11:35:17Z
---

**What:** A player draws all four links between the two columns, can redraw or clear them, and presses Check to have every link marked at once.

**Why:** Drawing the links lets a player think the whole set through before committing, and the numbered, coloured connectors show at a glance which tile goes with which.

## Done when
- [x] A tap on each side draws a numbered, coloured link; tapping a linked tile redraws it, and clear removes every link
- [x] Check stays shut until all four pairs are linked, then marks every link green or red together
- [x] Each right link still pays a third, capped at three, so a full set pays the whole share at double credit
- [x] The server grades the four links itself and never tells the client which tiles pair up
- [x] The answer view on a poll's page draws each pair joined by its line

## Notes
Follows DVTD-dcfz. Supersedes ADR-192 Decision 2 (a miss burns the pair you started from) and Decision 3 (the last pair locks itself): with a full matching, three right forces the fourth, so outcomes are 4, 2, 1 or 0 right and min(right, 3) / 3 pays 1, 2/3, 1/3, 0. The per-match action and the run's pairs progress go; one check action carries four left/right links. Design: mock screenshots of 2026-10-11 (numbered left keycaps, lettered right keycaps that take the link's number, a curved line per link, clear and Check).

## Summary of Changes

A pairs poll is linked in full, then checked. One check-pairs action carries four left-to-right links; the reducer grades them with checkedPairsOf and answers the poll, so the per-match action and the run's pairs progress are gone. MatchingPairs draws numbered left tiles, lettered right tiles that take their partner's number, a curved SVG line per link in one of four non-verdict colours, a waiting tile, verdict colours after Check, and a clear press. The poll screen selection stays a flat id list (links left tile first, a trailing waiting tile), Check reuses the lock press. The poll page answer view, the authoring preview and the debrief draw each pair as a line across. ADR-197 replaces ADR-192 Decisions 2 and 3; wiki and changelog updated.

Also: the gate review carries each answer's pairs and draws them as the debrief does, tallied as matched pairs; the community board folds a pairs poll's tiles into one row per pair, counting who matched it. Branch rebuilt directly on main; PR #134 closed, its code-in-tiles fix rides along here.
